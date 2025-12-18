import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPosts } from "@/functions/posts";
import { authClient } from "@/lib/auth-client";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import PostInput from "./-components/PostInput";

const postsQueryOptions = queryOptions({
	queryKey: ["posts"],
	queryFn: () => getPosts(),
});

export const Route = createFileRoute("/feed/")({
	component: RouteComponent,
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(postsQueryOptions),
});

function RouteComponent() {
	const { data: posts } = useSuspenseQuery(postsQueryOptions);

	return (
		<main className="max-w-md mx-auto h-dvh pt-2">
			<section className="flex justify-between items-center border-b pb-2 px-4">
				<h4>NostaGram</h4>
				<div>
					<DropdownMenu>
						<DropdownMenuTrigger>
							<img
								src="https://placehold.co/40x40.png?text=Avatar"
								alt="Threads Logo"
								className="rounded-full"
							/>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem
								variant="destructive"
								onClick={() => {
									authClient.signOut();
								}}
							>
								Logout
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</section>

			<PostInput />

			<div className="flex flex-col">
				{posts.map((post) => (
					<div key={post.id} className="p-4 border-b">
                        <div className="flex items-center gap-2 mb-2">
                            <img src={getCloudinaryUrl(post.author.image)} alt={post.author.name} className="rounded-full" />
                            <div>
                                <h6 className="font-semibold">{post.author.name}</h6>
							    <p className="text-gray-500 text-sm font-light">
								    @{post.author.username}
							    </p>
                            </div>
						</div>
						<p className="whitespace-pre-wrap">{post.content}</p>
						{post.images && post.images.length > 0 && (
							<div className="mt-2 flex gap-2 overflow-x-auto">
								{post.images.map((img) => (
									<img
										key={img.id}
										src={getCloudinaryUrl(img.url)}
										alt="Post attachment"
										className="rounded-lg max-h-60 object-cover"
									/>
								))}
							</div>
						)}
					</div>
				))}
			</div>
		</main>
	);
}
