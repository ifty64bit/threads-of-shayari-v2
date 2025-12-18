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
import PostElement from "./-components/PostElement";
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
		<main className="max-w-md mx-auto min-h-dvh">
			<section className="sticky top-0 backdrop-blur-lg flex justify-between items-center border-b py-2 px-4">
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
					<PostElement key={post.id} post={post} />
				))}
			</div>
		</main>
	);
}
