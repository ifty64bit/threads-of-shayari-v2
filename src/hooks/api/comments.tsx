import {
	infiniteQueryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
	adminDeleteComment,
	getCommentsByPostId,
	postComment,
} from "@/data/functions/comments";
import { postsQueryOptions } from "./posts";

export function useCommentMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			postId,
			comment,
			audioPresetId,
		}: {
			postId: number;
			comment?: string;
			audioPresetId?: number;
		}) => postComment({ data: { postId, comment, audioPresetId } }),
		onSuccess: (_data, { postId }) => {
			queryClient.invalidateQueries({
				queryKey: postsQueryOptions.queryKey,
			});
			queryClient.invalidateQueries({
				queryKey: ["comments", postId],
			});
			toast.success("Commented");
		},
		onError: () => {
			toast.error("Failed to comment");
		},
	});
}

export function getCommentsByPostIdInfiniteQuery(postId: number) {
	return infiniteQueryOptions({
		queryKey: ["comments", postId],
		queryFn: ({ pageParam }) =>
			getCommentsByPostId({ data: { postId, cursor: pageParam } }),
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		initialPageParam: 1,
		refetchInterval: 30 * 1000, // Refetch every 30 seconds to get latest comments
	});
}

export function useAdminDeleteCommentMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ commentId }: { commentId: number }) =>
			adminDeleteComment({ data: { commentId } }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["admin-user-detail"],
			});
			queryClient.invalidateQueries({
				queryKey: ["comments"],
			});
			toast.success("Comment deleted");
		},
		onError: () => {
			toast.error("Failed to delete comment");
		},
	});
}
