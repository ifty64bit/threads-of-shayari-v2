import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Users } from "lucide-react";
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
];

function AppSidebar() {
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
			<SidebarFooter />
		</Sidebar>
	);
}

export default AppSidebar;
