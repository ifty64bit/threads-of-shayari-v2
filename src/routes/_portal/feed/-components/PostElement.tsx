import { ClientOnly, Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { getPosts } from "@/functions/posts";
import { useDeletePostMutation } from "@/hooks/api/posts";
import { authClient } from "@/lib/auth-client";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import {
	FeedCommentForm,
	FeedCommentProvider,
	FeedCommentTrigger,
} from "./FeedComment";
import Reactions from "./Reactions";

type PostElementProps = {
	post: Awaited<ReturnType<typeof getPosts>>["data"][number];
};

function PostElement({ post }: PostElementProps) {
	const deletePostMutation = useDeletePostMutation();
	const { data: session } = authClient.useSession();

	return (
		<div key={post.id} className="card-elevated mx-2 my-3 pb-2 overflow-hidden">
			<div className="flex justify-between items-center bg-muted/50 px-4 pt-4 pb-2 shadow-sm">
				<Link
					to={
						Number(session?.user?.id) === post.author.id
							? "/profile"
							: "/profile/$userId"
					}
					params={{ userId: post.author.id.toString() }}
					className="flex flex-1 items-center gap-3 mb-2"
				>
					<ClientOnly
						fallback={<Skeleton className="w-10 h-10 rounded-full" />}
					>
						<img
							src={getCloudinaryUrl(post.author.image)}
							alt={post.author.name}
							className="rounded-full w-10 h-10 object-cover ring-2 ring-background depth-2"
						/>
					</ClientOnly>
					<div>
						<h6 className="font-semibold text-sm">{post.author.name}</h6>
						<p className="text-muted-foreground text-xs">
							@{post.author.username}
						</p>
					</div>
				</Link>
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
			<div className="px-4 pt-2">
				<Link to="/posts/$postId" params={{ postId: post.id.toString() }}>
					<p className="whitespace-pre-wrap">{post.content}</p>
				</Link>
				{post.images && post.images.length > 0 && (
					<div className="mt-3 flex gap-2 overflow-x-auto">
						{post.images.map((img) => (
							<ClientOnly
								fallback={
									<Skeleton className="w-full aspect-video rounded-lg" />
								}
								key={img.id}
							>
								<Image
									layout="constrained"
									width={600}
									height={338}
									src={getCloudinaryUrl(img.url) ?? ""}
									alt="Post attachment"
									className="rounded-xl max-h-60 mx-auto w-full object-cover image-depth"
								/>
							</ClientOnly>
						))}
					</div>
				)}
				<ClientOnly fallback={<Skeleton className="h-10 w-full rounded-lg" />}>
					<FeedCommentProvider>
						{/* Top row: Reactions + Comment icon + count */}
						<div className="flex items-center gap-2">
							<Reactions post={post} />
							<FeedCommentTrigger
								postId={post.id}
								commentCount={post.comments.length}
							/>
						</div>
						{/* Bottom row: Comment form (full width) */}
						<FeedCommentForm postId={post.id} />
					</FeedCommentProvider>
				</ClientOnly>
			</div>
		</div>
	);
}

export default PostElement;
