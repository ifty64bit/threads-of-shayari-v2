import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { signupFn } from "@/data/functions/auth";

export function useSignup() {
	return useMutation({
		mutationKey: ["signup"],
		mutationFn: signupFn,
		onMutate: () => {
			const toastId = toast.loading("Signing up...");
			return { toastId };
		},
		onSuccess: () => {
			toast.success("Account created successfully!");
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Signup failed");
		},
		onSettled: () => {
			toast.dismiss();
		},
	});
}
