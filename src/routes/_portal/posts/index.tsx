import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_portal/posts/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Navigate to="/feed" replace />;
}
