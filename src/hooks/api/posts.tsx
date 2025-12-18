import {
	type InfiniteData,
	infiniteQueryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { createPost, deletePost, getPosts } from "@/functions/posts";
import { uploadImages } from "@/lib/cloudinary";

export function createPostMutation() {
	const queryClient = useQueryClient();

	return useMutation<
		Awaited<ReturnType<typeof createPost>>,
		Error,
		{ data: { content: string; images?: File[] } }
	>({
		mutationFn: async ({ data }) => {
			let imageUrls: string[] = [];
			if (data.images && data.images.length > 0) {
				imageUrls = await uploadImages(data.images);
			}
			return await createPost({
				data: { content: data.content.trim(), images: imageUrls },
			});
		},
		onSuccess: (data) => {
			// Optimistic update for infinite query
			queryClient.setQueryData<
				InfiniteData<Awaited<ReturnType<typeof getPosts>>, number | undefined>
			>(postsQueryOptions.queryKey, (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page, index) => {
						if (index === 0) {
							return {
								...page,
								data: [data, ...page.data],
							};
						}
						return page;
					}),
				};
			});
			queryClient.invalidateQueries({
				queryKey: postsQueryOptions.queryKey,
			});
			toast.success("Posted");
		},
		onError: () => {
			toast.error("Failed to post");
		},
	});
}

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

export function useDeletePostMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId }: { postId: number }) =>
			deletePost({ data: { postId } }),
		onMutate: async ({ postId }) => {
			queryClient.setQueryData(postsQueryOptions.queryKey, (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page, index) => {
						if (index === 0) {
							return {
								...page,
								data: page.data.filter((post) => post.id !== postId),
							};
						}
						return page;
					}),
				};
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: postsQueryOptions.queryKey,
			});
			toast.success("Post deleted");
		},
		onError: () => {
			toast.error("Failed to delete post");
		},
	});
}
