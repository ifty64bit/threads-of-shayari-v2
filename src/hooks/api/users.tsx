import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getCurrentUser,
	getUsers,
	updateUserVerification,
} from "@/functions/users";

export const getCurrentUserOptions = queryOptions({
	queryKey: ["current-user"],
	queryFn: () => getCurrentUser(),
});

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
