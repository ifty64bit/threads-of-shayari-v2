import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type { getPostById, getPosts } from "@/functions/posts";
import { toggleReaction } from "@/functions/reactions";
import type { ReactionType } from "@/lib/reactions";
import { postsQueryOptions } from "./posts";

type PostsData = InfiniteData<
	Awaited<ReturnType<typeof getPosts>>,
	number | undefined
>;

export function useReactionMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			postId,
			reaction,
		}: {
			postId: number;
			userId: number;
			reaction: ReactionType;
		}) => toggleReaction({ data: { postId, reaction } }),
		onMutate: async ({ postId, userId, reaction }) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: postsQueryOptions.queryKey });

			// Snapshot the previous value
			const previousPosts = queryClient.getQueryData<PostsData>(
				postsQueryOptions.queryKey,
			);

			// Optimistically update
			queryClient.setQueryData<PostsData>(
				postsQueryOptions.queryKey,
				(oldData) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						pages: oldData.pages.map((page) => ({
							...page,
							data: page.data.map((post) => {
								if (post.id !== postId) return post;

								const existingReaction = post.reactions.find(
									(r) => r.userId === userId,
								);

								if (existingReaction) {
									if (existingReaction.reaction === reaction) {
										// Same reaction clicked - remove it
										return {
											...post,
											reactions: post.reactions.filter(
												(r) => r.userId !== userId,
											),
										};
									}
									// Different reaction - update it
									return {
										...post,
										reactions: post.reactions.map((r) =>
											r.userId === userId ? { ...r, reaction } : r,
										),
									};
								}
								// No existing reaction - add new one
								return {
									...post,
									reactions: [
										...post.reactions,
										{
											id: Date.now(), // Temporary ID
											postId,
											userId,
											reaction,
											createdAt: new Date(),
											updatedAt: new Date(),
										},
									],
								};
							}),
						})),
					};
				},
			);

			// Also optimistically update the single post query if it exists in cache
			type SinglePostData = Awaited<ReturnType<typeof getPostById>>;
			const previousSinglePost = queryClient.getQueryData<SinglePostData>([
				"post",
				postId,
			]);

			if (previousSinglePost) {
				queryClient.setQueryData<SinglePostData>(
					["post", postId],
					(oldPost) => {
						if (!oldPost) return oldPost;

						const existingReaction = oldPost.reactions.find(
							(r) => r.userId === userId,
						);

						if (existingReaction) {
							if (existingReaction.reaction === reaction) {
								// Same reaction clicked - remove it
								return {
									...oldPost,
									reactions: oldPost.reactions.filter(
										(r) => r.userId !== userId,
									),
								};
							}
							// Different reaction - update it
							return {
								...oldPost,
								reactions: oldPost.reactions.map((r) =>
									r.userId === userId ? { ...r, reaction } : r,
								),
							};
						}
						// No existing reaction - add new one
						return {
							...oldPost,
							reactions: [
								...oldPost.reactions,
								{
									id: Date.now(), // Temporary ID
									postId,
									userId,
									reaction,
									createdAt: new Date(),
									updatedAt: new Date(),
								},
							],
						};
					},
				);
			}

			return { previousPosts, previousSinglePost };
		},
		onError: (_err, { postId }, context) => {
			// Rollback on error
			if (context?.previousPosts) {
				queryClient.setQueryData(
					postsQueryOptions.queryKey,
					context.previousPosts,
				);
			}
			// Also rollback single post data
			if (context?.previousSinglePost) {
				queryClient.setQueryData(["post", postId], context.previousSinglePost);
			}
		},
		onSettled: (_data, _error, { postId }) => {
			// Refetch to ensure consistency
			queryClient.invalidateQueries({ queryKey: postsQueryOptions.queryKey });
			// Also invalidate single post query if it exists
			queryClient.invalidateQueries({ queryKey: ["post", postId] });
		},
	});
}
