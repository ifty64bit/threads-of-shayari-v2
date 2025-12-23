import { ClientOnly, Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Heart, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { getPosts } from "@/functions/posts";
import { useDeletePostMutation } from "@/hooks/api/posts";
import { authClient } from "@/lib/auth-client";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import FeedComment from "./FeedComment";
import Reactions from "./Reactions";

type PostElementProps = {
	post: Awaited<ReturnType<typeof getPosts>>["data"][number];
};

function PostElement({ post }: PostElementProps) {
	const deletePostMutation = useDeletePostMutation();
	const { data: session } = authClient.useSession();

	return (
		<div key={post.id} className="px-4 pt-4 pb-2 border-b">
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
			<Link to="/posts/$postId" params={{ postId: post.id.toString() }}>
				<p className="whitespace-pre-wrap">{post.content}</p>
			</Link>
			{post.images && post.images.length > 0 && (
				<div className="mt-2 flex gap-2 overflow-x-auto">
					{post.images.map((img) => (
						<ClientOnly fallback={null} key={img.id}>
							<Image
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

			<div className="flex items-center gap-2">
				<Reactions post={post} />
				<FeedComment postId={post.id} commentCount={post.comments.length} />
			</div>
		</div>
	);
}

export default PostElement;
