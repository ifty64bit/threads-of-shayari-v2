import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { MessageCircle, Music, Send, Volume2, X } from "lucide-react";
import { createContext, useContext, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import type { getAudioPresetsforUsers } from "@/functions/audio";
import { useCommentMutation } from "@/hooks/api/comments";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import AudioPresetSelector from "@/routes/_portal/posts/-components/AudioPresetSelector";

type FeedCommentContextType = {
	showComment: boolean;
	setShowComment: (show: boolean) => void;
	textareaRef: React.RefObject<HTMLTextAreaElement | null>;
	buttonRef: React.RefObject<HTMLButtonElement | null>;
};

const FeedCommentContext = createContext<FeedCommentContextType | null>(null);

function useFeedComment() {
	const context = useContext(FeedCommentContext);
	if (!context) {
		throw new Error("useFeedComment must be used within FeedCommentProvider");
	}
	return context;
}

type FeedCommentProviderProps = {
	children: React.ReactNode;
};

function FeedCommentProvider({ children }: FeedCommentProviderProps) {
	const [showComment, setShowComment] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	return (
		<FeedCommentContext.Provider
			value={{ showComment, setShowComment, textareaRef, buttonRef }}
		>
			{children}
		</FeedCommentContext.Provider>
	);
}

type FeedCommentTriggerProps = {
	commentCount: number;
	postId: number;
};

function FeedCommentTrigger({ commentCount, postId }: FeedCommentTriggerProps) {
	const { showComment, setShowComment, textareaRef, buttonRef } =
		useFeedComment();

	return (
		<div className="flex items-center gap-1">
			<Button
				ref={buttonRef}
				variant="ghost"
				size="icon"
				onClick={(e) => {
					e.preventDefault();
					setShowComment(!showComment);
					if (!showComment) {
						setTimeout(() => {
							textareaRef.current?.focus();
						}, 100);
					}
				}}
			>
				<MessageCircle />
			</Button>

			<Link to="/posts/$postId" params={{ postId: postId.toString() }}>
				<span className="flex items-center gap-2 text-sm font-light text-gray-500 py-2">
					{commentCount} comments
				</span>
			</Link>
		</div>
	);
}

type AudioType = Awaited<
	ReturnType<typeof getAudioPresetsforUsers>
>["data"][number];

type FeedCommentFormProps = {
	postId: number;
};

function FeedCommentForm({ postId }: FeedCommentFormProps) {
	const { showComment, setShowComment, textareaRef, buttonRef } =
		useFeedComment();
	const postComment = useCommentMutation();
	const [audio, setAudio] = useState<AudioType | null>(null);

	const form = useForm({
		resolver: zodResolver(
			z
				.object({
					comment: z.string().max(280).optional(),
					audioPresetId: z.number().optional(),
				})
				.refine((data) => data.comment?.trim() || data.audioPresetId, {
					message: "Please add a comment or select an audio",
				}),
		),
		defaultValues: {
			comment: "",
		},
	});

	function handleComment(data: { comment?: string; audioPresetId?: number }) {
		postComment.mutate(
			{
				postId: postId,
				comment: data.comment,
				audioPresetId: data.audioPresetId,
			},
			{
				onSuccess: () => {
					setShowComment(false);
					form.reset();
					setAudio(null);
				},
			},
		);
	}

	return (
		<div
			className={`w-full grid transition-all duration-300 ease-in-out ${
				showComment
					? "grid-rows-[1fr] opacity-100"
					: "grid-rows-[0fr] opacity-0"
			}`}
		>
			<div className="overflow-hidden">
				<form
					onSubmit={form.handleSubmit(handleComment)}
					className="space-y-3 pt-2"
				>
					{/* Comment Input Area */}
					<div className="relative">
						<textarea
							id={`comment-input-${postId}`}
							className="w-full min-h-24 px-4 py-3 outline-none bg-muted/50 resize-none overflow-y-auto border rounded-xl placeholder:text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
							placeholder="Write a comment..."
							rows={3}
							{...form.register("comment", {
								onBlur: (e) => {
									if (buttonRef.current?.contains(e.relatedTarget as Node)) {
										return;
									}
									if (!e.currentTarget.value.trim() && !audio) {
										setShowComment(false);
									}
								},
							})}
							ref={(e) => {
								form.register("comment").ref(e);
								textareaRef.current = e;
							}}
						/>
					</div>

					{/* Audio Preview Card */}
					{audio?.url && (
						<div className="relative bg-linear-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
							<div className="flex items-center gap-3">
								<div className="shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
									<Music className="h-5 w-5 text-primary" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">
										{audio.displayName}
									</p>
									<audio
										src={getCloudinaryUrl(audio.url, { type: "audio" })}
										controls
										className="w-full h-8 mt-1 [&::-webkit-media-controls-panel]:bg-transparent"
									/>
								</div>
								<button
									type="button"
									onClick={() => {
										setAudio(null);
										form.setValue("audioPresetId", undefined);
									}}
									className="shrink-0 p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
									title="Remove audio"
								>
									<X className="h-4 w-4" />
								</button>
							</div>
						</div>
					)}

					{/* Actions Row */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1">
							<AudioPresetSelector
								value={form.watch("audioPresetId")}
								onChange={(value) => {
									form.setValue("audioPresetId", value.id);
									setAudio(value);
								}}
							>
								<div
									className={`flex items-center gap-1.5 ${audio ? "text-primary" : "text-muted-foreground"}`}
								>
									<Volume2 className="h-4 w-4" />
									<span className="text-xs">Add audio</span>
								</div>
							</AudioPresetSelector>
						</div>

						<Button
							type="submit"
							size="sm"
							isLoading={postComment.isPending}
							disabled={
								!form.watch("comment")?.trim() && !form.watch("audioPresetId")
							}
							className="rounded-full px-4"
						>
							<Send className="h-4 w-4 mr-1.5" />
							Comment
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

export { FeedCommentProvider, FeedCommentTrigger, FeedCommentForm };
