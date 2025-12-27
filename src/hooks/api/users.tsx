import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getCurrentUser,
	getUserById,
	getUsers,
	updateUser,
	updateUserVerification,
} from "@/functions/users";
import { uploadToCDN } from "@/lib/cloudinary";

export const getCurrentUserOptions = queryOptions({
	queryKey: ["current-user"],
	queryFn: () => getCurrentUser(),
});

export function getUserByIdOptions(userId: number) {
	return queryOptions({
		queryKey: ["user", userId],
		queryFn: () => getUserById({ data: { userId } }),
	});
}

export function getUsersOptions(data: { offset: number; limit: number }) {
	return queryOptions({
		queryKey: ["users", data.offset, data.limit],
		queryFn: () => getUsers({ data }),
	});
}

export function useUpdateUserVerification() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["update-user-verification"],
		mutationFn: updateUserVerification,
		onMutate: () => {
			const toastId = toast.loading("Updating user verification...");
			return { toastId };
		},
		onSuccess: (_, __, ctx) => {
			toast.success("User verification updated successfully", {
				id: ctx.toastId,
			});
			queryClient.invalidateQueries({
				queryKey: ["users"],
			});
		},
		onError: (_, __, ctx) => {
			toast.error("Failed to update user verification", {
				id: ctx?.toastId,
			});
		},
	});
}

export function useUpdateCurrentUserImage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["update-current-user-image"],
		mutationFn: async (file: File) => {
			const img = await uploadToCDN([file]);
			const data = await updateUser({
				data: {
					image: img[0],
				},
			});
			return data;
		},
		onMutate: () => {
			const toastId = toast.loading("Updating user image...");
			return { toastId };
		},
		onSuccess: (_, __, ctx) => {
			toast.success("User image updated successfully", {
				id: ctx.toastId,
			});
			queryClient.invalidateQueries({
				queryKey: ["current-user"],
			});
		},
		onError: (_, __, ctx) => {
			toast.error("Failed to update user image", {
				id: ctx?.toastId,
			});
		},
	});
}
