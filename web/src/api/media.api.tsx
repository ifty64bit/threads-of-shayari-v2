import api from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useGetUploadSignature() {
    return useMutation({
        mutationKey: ["uploadSignature"],
        mutationFn: async () => {
            const response = await api.media.signature.$get();

            if (!response.ok) {
                throw new Error("Failed to get upload signature");
            }

            return await response.json();
        },
    });
}
