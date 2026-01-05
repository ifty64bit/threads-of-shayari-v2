import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { postsQueryOptions } from "@/hooks/api/posts";
import PostElement from "./-components/PostElement";
import PostInput from "./-components/PostInput";

export const Route = createFileRoute("/_portal/feed/")({
	component: RouteComponent,
	loader: ({ context }) =>
		context.queryClient.ensureInfiniteQueryData(postsQueryOptions),
});

function RouteComponent() {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery(postsQueryOptions);

	const posts = data.pages.flatMap((page) => page.data);

	return (
		<>
			<PostInput />
			<ClientOnly fallback={null}>
				<NotificationPrompt />
			</ClientOnly>

			<section className="flex flex-col">
				{posts.length === 0 ? (
					<p className="text-muted-foreground text-center">No posts yet</p>
				) : (
					posts.map((post) => <PostElement key={post.id} post={post} />)
				)}
			</section>

			{hasNextPage && (
				<button
					type="button"
					onClick={() => fetchNextPage()}
					disabled={isFetchingNextPage}
					className="mx-auto my-4 p-2 text-sm text-gray-500 hover:text-gray-900"
				>
					{isFetchingNextPage ? "Loading more..." : "Load more"}
				</button>
			)}
		</>
	);
}
