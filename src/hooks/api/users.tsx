import { queryOptions } from "@tanstack/react-query";
import { getCurrentUser } from "@/functions/users";

export const getCurrentUserOptions = queryOptions({
	queryKey: ["current-user"],
	queryFn: () => getCurrentUser(),
});
