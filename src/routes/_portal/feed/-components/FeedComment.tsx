import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import { useCommentMutation } from "@/hooks/api/comments";

type FeedCommentProps = {
	postId: number;
	commentCount: number;
};
function FeedComment({ postId, commentCount }: FeedCommentProps) {
	const [showComment, setShowComment] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const postComment = useCommentMutation();

	const form = useForm({
		resolver: zodResolver(
			z.object({
				comment: z.string().min(1).max(280),
			}),
		),
		defaultValues: {
			comment: "",
		},
	});

	function handleComment({ comment }: { comment: string }) {
		postComment.mutate(
			{ postId: postId, comment },
			{
				onSuccess: () => {
					setShowComment(false);
					form.reset();
				},
			},
		);
	}

	return (
		<div>
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

			<div
				className={`grid transition-all duration-300 ease-in-out ${
					showComment
						? "grid-rows-[2fr] opacity-100"
						: "grid-rows-[0fr] opacity-0"
				}`}
			>
				<form
					className="overflow-hidden"
					onSubmit={form.handleSubmit(handleComment)}
				>
					<textarea
						className="w-full min-h-6  px-4 py-2 outline-none bg-transparent resize-none overflow-y-auto border rounded-md placeholder:text-sm"
						placeholder="Write a comment..."
						rows={4}
						{...form.register("comment", {
							setValueAs: (v) => v,
							onBlur: (e) => {
								if (buttonRef.current?.contains(e.relatedTarget as Node)) {
									return;
								}
								if (!e.currentTarget.value.trim()) {
									setShowComment(false);
								}
							},
						})}
						ref={(e) => {
							form.register("comment").ref(e);
							textareaRef.current = e;
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								form.handleSubmit(handleComment)();
							}
						}}
					/>
				</form>
			</div>
		</div>
	);
}

export default FeedComment;
