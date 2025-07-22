import { api } from "@/lib/api";
import { infiniteQueryOptions } from "@tanstack/react-query";

export function getPosts() {
    return infiniteQueryOptions({
        queryKey: ["posts"],
        queryFn: async () => {
            const postsBuffer = await api.api.posts.$get({
                query: {
                    limit: String(10),
                    offset: String(0),
                },
            });

            if (!postsBuffer.ok) {
                throw new Error("Failed to fetch posts");
            }

            const posts = await postsBuffer.json();

            return posts;
        },
        getNextPageParam: (lastPage) => {
            const nextOffset = lastPage.data.length;
            return nextOffset < 100 ? undefined : nextOffset;
        },
        initialPageParam: 1,
    });
}
