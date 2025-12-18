import { infiniteQueryOptions } from "@tanstack/react-query";
import { getPosts } from "@/functions/posts";

export const postsQueryOptions = infiniteQueryOptions({
	queryKey: ["posts"],
	queryFn: ({ pageParam }) =>
		getPosts({
			data: {
				cursor: pageParam,
			},
		}),
	initialPageParam: undefined as number | undefined,
	getNextPageParam: (lastPage) => lastPage.nextCursor,
});
