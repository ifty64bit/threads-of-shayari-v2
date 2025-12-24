import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { adminMiddleware } from "@/middleware/auth";

export const Route = createFileRoute("/_admin")({
	component: RouteComponent,
	server: {
		middleware: [adminMiddleware],
	},
});

function RouteComponent() {
	const { isPending, data: session } = authClient.useSession();

	if (!isPending && !session) {
		return <Navigate to="/login" />;
	}
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="flex-1 overflow-auto px-4">
				<SidebarTrigger />
				<Outlet />
			</main>
		</SidebarProvider>
	);
}
