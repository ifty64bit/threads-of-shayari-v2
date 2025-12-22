import { createFileRoute, Outlet } from "@tanstack/react-router";
import { adminMiddleware } from "@/middleware/auth";

export const Route = createFileRoute("/_admin")({
	component: RouteComponent,
	server: {
		middleware: [adminMiddleware],
	},
});

function RouteComponent() {
	return <Outlet />;
}
