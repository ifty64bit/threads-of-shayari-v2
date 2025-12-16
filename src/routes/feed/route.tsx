import {
	createFileRoute,
	Navigate,
	Outlet,
} from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { authMiddleware } from "@/middleware/auth";

export const Route = createFileRoute("/feed")({
	component: RouteComponent,
	server: {
		middleware: [authMiddleware],
	},
});

function RouteComponent() {
	const { isPending, data: session } = authClient.useSession();

	if (!isPending && !session) {
		return <Navigate to="/login" />;
	}
	return <Outlet />;
}
