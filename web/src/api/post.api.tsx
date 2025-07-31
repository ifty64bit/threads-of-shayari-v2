import api from "@/lib/api";
import {
    infiniteQueryOptions,
    queryOptions,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { REACTION_TYPES } from "shared";

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

export function getPostById(postId: string) {
    return queryOptions({
        queryKey: ["posts", postId],
        queryFn: async () => {
            const postBuffer = await api.posts[":id"].$get({
                param: { id: postId },
            });

            if (!postBuffer.ok) {
                throw new Error("Failed to fetch post");
            }

            return postBuffer.json();
        },
    });
}

export function getCommentsByPostId(postId: string) {
    return infiniteQueryOptions({
        queryKey: ["comments", postId],
        queryFn: async () => {
            const commentsBuffer = await api.posts[":id"].comments.$get({
                param: { id: postId },
                query: {
                    limit: String(10),
                    offset: String(0),
                },
            });

            if (!commentsBuffer.ok) {
                throw new Error("Failed to fetch comments");
            }

            const comments = await commentsBuffer.json();

            return comments;
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

export function useCreateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["createComment"],
        mutationFn: async (data: { postId: string; content: string }) => {
            const response = await api.posts[":postId"].comments.$post({
                param: { postId: data.postId },
                json: { content: data.content },
            });

            if (!response.ok) {
                throw new Error("Failed to create comment");
            }

            return response.json();
        },
        onMutate() {
            const toastId = toast.loading("Creating comment...");
            return { toastId };
        },
        onSuccess(_, { postId }, context) {
            toast.success("Comment created successfully", {
                id: context.toastId,
            });
            queryClient.invalidateQueries({
                queryKey: ["comments", postId],
            });
        },
        onError(error, __, context) {
            toast.error(`Error creating comment: ${error.message}`, {
                id: context?.toastId,
            });
        },
    });
}

export function useDeletePost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["deletePost"],
        mutationFn: async (postId: string) => {
            const response = await api.posts[":id"].$delete({
                param: { id: postId },
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(`Failed to delete post: ${err.message}`);
            }

            return response.json();
        },
        onMutate() {
            const toastId = toast.loading("Deleting post...");
            return { toastId };
        },
        onSuccess(_, postId, context) {
            toast.success("Post deleted successfully", {
                id: context.toastId,
            });
            // Invalidate queries to refresh the posts list
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            // Optionally, you can also invalidate comments for the deleted post
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        },
        onError(error, __, context) {
            toast.error(`Error deleting post: ${error.message}`, {
                id: context?.toastId,
            });
        },
    });
}

export function getPostsByUsername(
    username: string,
    { limit = 10, offset = 0 }
) {
    return infiniteQueryOptions({
        queryKey: ["posts", "user", username, { limit, offset }],
        queryFn: async () => {
            const res = await api.users[":username"].posts.$get({
                param: { username },
                query: {
                    limit: String(limit),
                    offset: String(offset),
                },
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(
                    `Failed to fetch posts for user ${username}: ${err.message}`
                );
            }
            const posts = await res.json();
            return posts;
        },
        getNextPageParam: lastPage => {
            const nextOffset = lastPage.data.length;
            return nextOffset < 100 ? undefined : nextOffset;
        },
        initialPageParam: 1,
    });
}
