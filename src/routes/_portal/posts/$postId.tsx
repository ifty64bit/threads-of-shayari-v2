import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import dayjs from "dayjs";
import { MoreHorizontal, Send } from "lucide-react";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	getCommentsByPostIdInfiniteQuery,
	useCommentMutation,
} from "@/hooks/api/comments";
import { getPostByIdOptions, useDeletePostMutation } from "@/hooks/api/posts";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import Reactions from "@/routes/_portal/feed/-components/Reactions";

export const Route = createFileRoute("/_portal/posts/$postId")({
	component: RouteComponent,
	loader: async ({ params, context }) => {
		const post = await context.queryClient.ensureQueryData(
			getPostByIdOptions(Number(params.postId)),
		);
		return { post };
	},
});

function RouteComponent() {
	const { post } = Route.useLoaderData();
	const deletePostMutation = useDeletePostMutation();

	return (
		<div className="p-4">
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-2 mb-2">
					<img
						src={getCloudinaryUrl(post.author.image)}
						alt={post.author.name}
						className="rounded-full"
					/>
					<div>
						<h6 className="font-semibold text-sm">{post.author.name}</h6>
						<p className="text-gray-500 text-xs">@{post.author.username}</p>
					</div>
				</div>
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
			</div>

			<p className="whitespace-pre-wrap">{post.content}</p>

			{post.images && post.images.length > 0 && (
				<div className="mt-2 flex gap-2 overflow-x-auto">
					{post.images.map((img) => (
						<ClientOnly fallback={null} key={img.id}>
							<Image
								cdn="cloudinary"
								layout="constrained"
								width={600}
								height={338}
								src={getCloudinaryUrl(img.url)}
								alt="Post attachment"
								className="rounded-lg max-h-60 mx-auto w-full object-cover"
							/>
						</ClientOnly>
					))}
				</div>
			)}

			<div className="flex items-center justify-between gap-2 border-t pt-2 mt-2">
				<Reactions post={post as Parameters<typeof Reactions>[0]["post"]} />
				<span className="flex items-center gap-2 text-sm font-light text-gray-500 py-2">
					{post.comments.length} comments
				</span>
			</div>

			<Suspense fallback={<div>Loading comments...</div>}>
				<Comments />
			</Suspense>
		</div>
	);
}

function Comments() {
	const { postId } = Route.useParams();
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

	const { data: commentsData } = useSuspenseInfiniteQuery(
		getCommentsByPostIdInfiniteQuery(Number(Route.useParams().postId)),
	);

	const comments = commentsData.pages.flatMap((page) => page.data);

	function handleComment({ comment }: { comment: string }) {
		postComment.mutate(
			{ postId: Number(postId), comment },
			{
				onSuccess: () => {
					form.reset();
				},
			},
		);
	}

	return (
		<section className="space-y-4 border-t pt-4">
			<div className="flex items-center gap-2">
				<h6>Comments</h6>
			</div>
			<div>
				<form
					onSubmit={form.handleSubmit(handleComment)}
					className="flex items-end gap-2"
				>
					<textarea
						id="comment-input"
						className="w-full min-h-6  px-4 py-2 outline-none bg-transparent resize-none overflow-y-auto border rounded-md placeholder:text-sm"
						placeholder="Write a comment..."
						rows={4}
						{...form.register("comment")}
					/>
					<Button
						type="submit"
						size={"sm"}
						variant={"ghost"}
						isLoading={postComment.isPending}
					>
						<Send />
					</Button>
				</form>
			</div>
			<div className="space-y-2">
				{comments.map((comment) => (
					<div key={comment.id} className="flex justify-start gap-2">
						<ClientOnly fallback={null}>
							<Image
								cdn="cloudinary"
								layout="constrained"
								width={30}
								height={30}
								src={getCloudinaryUrl(comment.user.image)}
								alt="Post attachment"
								className="rounded-full max-h-60 mx-auto w-full object-cover "
							/>
						</ClientOnly>
						<div className="w-full bg-gray-100 p-2 rounded-lg">
							<div>
								<h6 className="text-sm">{comment.user.name}</h6>
							</div>
							<p className="whitespace-pre-wrap text-xs">{comment.content}</p>
							<span className="text-right text-xs text-gray-500 block">
								{dayjs(comment.createdAt).format("D MMM YYYY h:mmA")}
							</span>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
