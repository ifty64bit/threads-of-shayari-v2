import { api } from "@/lib/api";
import type { RegisterSchemaType } from "@shared";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useRegister() {
    return useMutation({
        mutationKey: ["register"],
        mutationFn: (data: RegisterSchemaType) =>
            api.api.register
                .$post({
                    json: data,
                })
                .then((response) => response.json()),
        onMutate: (data) => {
            toast.loading("Registering...", { id: data.email });
        },
        onSuccess: (_data, variables) => {
            toast.success(`Registration successful for ${variables.email}`, {
                id: variables.email,
            });
        },
        onError: (error, variables) => {
            toast.error(
                `Registration failed for ${variables.email}: ${error.message}`,
                {
                    id: variables.email,
                }
            );
        },
    });
}

export function useLogin() {
    return useMutation({
        mutationKey: ["login"],
        mutationFn: (data: { email: string; password: string }) =>
            api.api.login
                .$post({
                    json: data,
                })
                .then((response) => response.json()),
        onMutate: (data) => {
            toast.loading("Logging in...", { id: data.email });
        },
        onSuccess: (_data, variables) => {
            toast.success(`Login successful for ${variables.email}`, {
                id: variables.email,
            });
        },
        onError: (error, variables) => {
            toast.error(
                `Login failed for ${variables.email}: ${error.message}`,
                {
                    id: variables.email,
                }
            );
        },
    });
}
