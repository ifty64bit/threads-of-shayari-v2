import { createFileRoute } from "@tanstack/react-router";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/feed/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="max-w-md mx-auto h-dvh pt-2">
			<section className="flex justify-between items-center border-b pb-2 px-4">
				<h4>Feed</h4>
				<div>
					<DropdownMenu>
						<DropdownMenuTrigger>
							<img
								src="https://placehold.co/40x40.png?text=Avatar"
								alt="Threads Logo"
								className="rounded-full"
							/>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem
								variant="destructive"
								onClick={() => {
									authClient.signOut();
								}}
							>
								Logout
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</section>
		</main>
	);
}
