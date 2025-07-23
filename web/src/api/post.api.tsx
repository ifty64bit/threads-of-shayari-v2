import api from "@/lib/api";
import {
    infiniteQueryOptions,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { REACTION_TYPES } from "../../../api/src/db/schemas";

export function getPosts() {
    return infiniteQueryOptions({
        queryKey: ["posts"],
        queryFn: async () => {
            const postsBuffer = await api.posts.$get({
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
        getNextPageParam: lastPage => {
            const nextOffset = lastPage.data.length;
            return nextOffset < 100 ? undefined : nextOffset;
        },
        initialPageParam: 1,
    });
}

export function useCreatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["createPost"],
        mutationFn: async (content: string) => {
            const response = await api.posts.$post({
                json: { content },
            });

            if (!response.ok) {
                throw new Error("Failed to create post");
            }

            return response.json();
        },
        onMutate() {
            const toastId = toast.loading("Creating post...");
            return { toastId };
        },
        onSuccess(_, __, context) {
            toast.success("Post created successfully", {
                id: context.toastId,
            });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError(error, __, context) {
            toast.error(`Error creating post: ${error.message}`, {
                id: context?.toastId,
            });
        },
    });
}

export function useReactToPost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["reactToPost"],
        mutationFn: async (data: {
            postId: string;
            reaction: (typeof REACTION_TYPES)[number];
        }) => {
            const response = await api.posts[":id"].reactions.$post({
                param: { id: data.postId },
                json: { reaction: data.reaction },
            });

            if (!response.ok) {
                throw new Error("Failed to react to post");
            }

            return response.json();
        },
        onMutate() {
            const toastId = toast.loading("Reacting to post...");
            return { toastId };
        },
        onSuccess(_, __, context) {
            toast.success("Reacted to post successfully", {
                id: context.toastId,
            });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError(error, __, context) {
            toast.error(`Error reacting to post: ${error.message}`, {
                id: context?.toastId,
            });
        },
    });
}
