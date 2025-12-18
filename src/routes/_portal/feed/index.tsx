import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getPosts } from "@/functions/posts";
import PostElement from "./-components/PostElement";
import PostInput from "./-components/PostInput";

const postsQueryOptions = queryOptions({
	queryKey: ["posts"],
	queryFn: () => getPosts(),
});

export const Route = createFileRoute("/_portal/feed/")({
	component: RouteComponent,
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(postsQueryOptions),
});

function RouteComponent() {
	const { data: posts } = useSuspenseQuery(postsQueryOptions);

	return (
		<>
			<PostInput />

			<section className="flex flex-col">
				{posts.map((post) => (
					<PostElement key={post.id} post={post} />
				))}
			</section>
		</>
	);
}
