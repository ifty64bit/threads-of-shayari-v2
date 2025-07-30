import api from "@/lib/api";
import { queryOptions } from "@tanstack/react-query";

export function getUserByUsername(username: string) {
    return queryOptions({
        queryKey: ["user", username],
        queryFn: async () => {
            const response = await api.users[":username"].$get({
                param: { username },
            });

            if (!response.ok) {
                throw new Error("User not found");
            }

            const user = await response.json();
            return user;
        },
        select: data => data.data,
    });
}
