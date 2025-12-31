import { zodResolver } from "@hookform/resolvers/zod";
import {
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import dayjs from "dayjs";
import { MoreHorizontal, Music, Send, Share2, Volume2, X } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { getAudioPresetsforUsers } from "@/data/functions/audio";
import {
	getCommentsByPostIdInfiniteQuery,
	useCommentMutation,
} from "@/hooks/api/comments";
import { getPostByIdOptions, useDeletePostMutation } from "@/hooks/api/posts";
import { authClient } from "@/lib/auth-client";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import Reactions from "@/routes/_portal/feed/-components/Reactions";
import AudioPresetSelector from "./-components/AudioPresetSelector";
import { SharePostDialog } from "./-components/SharePostDialog";

export const Route = createFileRoute("/_portal/posts/$postId")({
	component: RouteComponent,
	loader: async ({ params, context }) => {
		const post = await context.queryClient.ensureQueryData(
			getPostByIdOptions(Number(params.postId)),
		);
		return { post };
	},
	head: ({ loaderData }) => {
		const post = loaderData?.post;
		const title = post
			? `${post.author.name} (@${post.author.username})`
			: "Post";
		const description = post?.content?.slice(0, 160) || "";
		// Generate full Cloudinary URL from publicId
		const ogImageUrl = post?.ogImage
			? getCloudinaryUrl(post.ogImage)
			: undefined;

		return {
			meta: [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:type", content: "article" },
				...(ogImageUrl ? [{ property: "og:image", content: ogImageUrl }] : []),
				{
					name: "twitter:card",
					content: ogImageUrl ? "summary_large_image" : "summary",
				},
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: description },
				...(ogImageUrl ? [{ name: "twitter:image", content: ogImageUrl }] : []),
			],
		};
	},
});

function RouteComponent() {
	const { postId } = Route.useParams();
	const { data: post } = useSuspenseQuery(getPostByIdOptions(Number(postId)));
	const deletePostMutation = useDeletePostMutation();
	const { data: session } = authClient.useSession();

	// Scroll to top when navigating to this page
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "instant" });
	}, []);

	return (
		<div className="pt-4">
			<div className="card-elevated overflow-hidden">
				{/* Post Header */}
				<div className="flex justify-between items-center bg-muted/50 px-4 pt-4 pb-3 shadow-sm">
					<div className="flex items-center gap-3">
						<ClientOnly
							fallback={<Skeleton className="size-12 rounded-full" />}
						>
							<img
								src={getCloudinaryUrl(post.author.image)}
								alt={post.author.name}
								className="rounded-full size-12 object-cover ring-2 ring-background depth-2"
							/>
						</ClientOnly>
						<div>
							<h6 className="font-semibold">{post.author.name}</h6>
							<p className="text-muted-foreground text-xs">
								@{post.author.username}
							</p>
						</div>
					</div>
					{Number(session?.user?.id) === post.author.id && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon">
									<MoreHorizontal />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem
									variant="destructive"
									onClick={() => deletePostMutation.mutate({ postId: post.id })}
								>
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>

				{/* Post Content */}
				<div className="px-4 py-4">
					<p className="whitespace-pre-wrap text-base leading-relaxed">
						{post.content}
					</p>

					{post.images && post.images.length > 0 && (
						<div className="mt-4 flex gap-2 overflow-x-auto">
							{post.images.map((img) => (
								<ClientOnly
									fallback={
										<Skeleton className="w-full aspect-video rounded-xl" />
									}
									key={img.id}
								>
									<Image
										cdn="cloudinary"
										layout="constrained"
										width={600}
										height={338}
										src={getCloudinaryUrl(img.url) ?? ""}
										alt="Post attachment"
										className="rounded-xl max-h-80 mx-auto w-full object-cover image-depth"
									/>
								</ClientOnly>
							))}
						</div>
					)}

					{/* Reactions Bar */}
					<div className="flex items-center justify-between gap-2 border-t border-border/50 pt-3 mt-4">
						<Reactions post={post as Parameters<typeof Reactions>[0]["post"]} />
						<SharePostDialog
							post={post}
							trigger={
								<Button variant="ghost" size="sm" className="gap-2">
									<Share2 className="h-4 w-4" />
									Share
								</Button>
							}
						/>
					</div>
				</div>
			</div>

			{/* Comments Section */}
			<section className="card-elevated mt-3 p-4 space-y-4">
				<h6 className="font-semibold">Comments</h6>

				<NewComment />
				<Suspense
					fallback={
						<div className="text-muted-foreground text-sm">
							Loading comments...
						</div>
					}
				>
					<Comments postAuthorId={post.author.id} />
				</Suspense>
			</section>
		</div>
	);
}

type AudioType = Awaited<
	ReturnType<typeof getAudioPresetsforUsers>
>["data"][number];

function NewComment() {
	const { postId } = Route.useParams();
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
				postId: Number(postId),
				comment: data.comment,
				audioPresetId: data.audioPresetId,
			},
			{
				onSuccess: () => {
					form.reset();
					setAudio(null);
				},
			},
		);
	}

	return (
		<div className="space-y-3">
			<form onSubmit={form.handleSubmit(handleComment)} className="space-y-3">
				{/* Comment Input Area */}
				<div className="relative">
					<textarea
						id="comment-input"
						className="w-full min-h-24 px-4 py-3 outline-none bg-muted/50 resize-none overflow-y-auto border rounded-xl placeholder:text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
						placeholder="Write a comment..."
						rows={3}
						{...form.register("comment")}
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
	);
}

function Comments({ postAuthorId }: { postAuthorId: number }) {
	const { data: commentsData } = useSuspenseInfiniteQuery(
		getCommentsByPostIdInfiniteQuery(Number(Route.useParams().postId)),
	);

	// De-duplicate comments by ID
	const comments = [
		...new Map(
			commentsData.pages.flatMap((page) => page.data).map((c) => [c.id, c]),
		).values(),
	];

	return (
		<div className="space-y-3">
			{comments.map((comment) => (
				<div key={comment.id} className="flex justify-start gap-2">
					<ClientOnly fallback={null}>
						<Image
							cdn="cloudinary"
							layout="constrained"
							width={30}
							height={30}
							src={getCloudinaryUrl(comment.user.image) ?? ""}
							alt="Comment author"
							className="rounded-full size-8 object-cover shrink-0"
						/>
					</ClientOnly>
					<div className="flex-1 bg-muted/50 p-3 rounded-xl">
						<div className="flex items-center gap-2">
							<h6 className="text-sm font-medium">{comment.user.name}</h6>
							{comment.user.id === postAuthorId && (
								<span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary rounded">
									OP
								</span>
							)}
						</div>

						{comment.content && (
							<p className="whitespace-pre-wrap text-sm mt-1">
								{comment.content}
							</p>
						)}

						{/* Audio Player */}
						{comment.audioPreset && (
							<div className="mt-2 bg-linear-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-2">
								<div className="flex items-center gap-2">
									<div className="shrink-0 w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
										<Music className="h-4 w-4 text-primary" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs font-medium truncate">
											{comment.audioPreset.displayName}
										</p>
										<audio
											src={getCloudinaryUrl(comment.audioPreset.url, {
												type: "audio",
											})}
											controls
											className="w-full h-7 mt-0.5 [&::-webkit-media-controls-panel]:bg-transparent"
										/>
									</div>
								</div>
							</div>
						)}

						<span className="text-right text-xs text-muted-foreground block mt-2">
							{dayjs(comment.createdAt).format("D MMM YYYY h:mmA")}
						</span>
					</div>
				</div>
			))}
		</div>
	);
}
