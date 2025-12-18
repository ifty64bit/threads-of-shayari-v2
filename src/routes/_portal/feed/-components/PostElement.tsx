import { Image } from "@unpic/react";
import type { getPosts } from "@/functions/posts";
import { getCloudinaryUrl } from "@/lib/cloudinary";

type PostElementProps = {
	post: Awaited<ReturnType<typeof getPosts>>["data"][number];
};

function PostElement({ post }: PostElementProps) {
	return (
		<div key={post.id} className="p-4 border-b">
			<div className="flex items-center gap-2 mb-2">
				<img
					src={getCloudinaryUrl(post.author.image)}
					alt={post.author.name}
					className="rounded-full"
				/>
				<div>
					<h6 className="font-semibold">{post.author.name}</h6>
					<p className="text-gray-500 text-xs">@{post.author.username}</p>
				</div>
			</div>
			<p className="whitespace-pre-wrap">{post.content}</p>
			{post.images && post.images.length > 0 && (
				<div className="mt-2 flex gap-2 overflow-x-auto">
					{post.images.map((img) => (
						<Image
							layout="constrained"
							key={img.id}
							width={600}
							height={338}
							src={getCloudinaryUrl(img.url)}
							alt="Post attachment"
							className="rounded-lg max-h-60 mx-auto w-full object-cover"
						/>
					))}
				</div>
			)}
		</div>
	);
}

export default PostElement;
