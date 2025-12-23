import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { AudioLines, LayoutDashboard, Users } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenuButton,
	SidebarMenuItem,
} from "./ui/sidebar";

const links = [
	{
		label: "Dashboard",
		icon: LayoutDashboard,
		path: "/dashboard",
	},
	{
		label: "Users",
		icon: Users,
		path: "/users",
	},
	{
		label: "Audio Presets",
		icon: AudioLines,
		path: "/audio-presets",
	},
];

function AppSidebar() {
	const router = useRouter();
	const { signOut } = authClient;
	const queryClient = useQueryClient();

	return (
		<Sidebar>
			<SidebarHeader>Lara Choda</SidebarHeader>
			<SidebarContent className="ml-2">
				{links.map((link) => (
					<SidebarMenuItem key={link.path}>
						<SidebarMenuButton asChild>
							<Link to={link.path}>
								<link.icon /> {link.label}
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarContent>
			<SidebarFooter>
				<Button
					variant="ghost"
					className="w-full mb-4"
					onClick={async () => {
						queryClient.clear();
						router.invalidate();
						await signOut();
					}}
				>
					Logout
				</Button>
			</SidebarFooter>
		</Sidebar>
	);
}

export default AppSidebar;
