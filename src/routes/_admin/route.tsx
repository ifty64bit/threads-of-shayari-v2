import { createFileRoute, Outlet } from "@tanstack/react-router";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { adminMiddleware } from "@/middleware/auth";

export const Route = createFileRoute("/_admin")({
	component: RouteComponent,
	server: {
		middleware: [adminMiddleware],
	},
});

function RouteComponent() {
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
