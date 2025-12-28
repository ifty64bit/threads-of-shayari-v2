import { useQueryClient } from "@tanstack/react-query";
import {
	ClientOnly,
	createFileRoute,
	Link,
	Navigate,
	Outlet,
	useRouter,
} from "@tanstack/react-router";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { config } from "@/lib/config";
import { authMiddleware } from "@/middleware/auth";

export const Route = createFileRoute("/_portal")({
	component: RouteComponent,
	server: {
		middleware: [authMiddleware],
	},
});

function RouteComponent() {
	const queryClient = useQueryClient();
	const router = useRouter();

	const { isPending, data: session } = authClient.useSession();

	if (!isPending && !session) {
		return <Navigate to="/login" />;
	}

	return (
		<main className="max-w-md mx-auto min-h-dvh mb-16">
			<section className="sticky top-0 glass flex justify-between items-center py-3 px-4 z-50 depth-3 rounded-b-2xl">
				<Link to="/feed" className="depth-transition hover:opacity-80">
					<h4 className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
						{config.BRAND_NAME}
					</h4>
				</Link>
				<ClientOnly
					fallback={<div className="w-10 h-10 rounded-full bg-gray-400" />}
				>
					<div>
						<DropdownMenu>
							<DropdownMenuTrigger title={session?.user?.name}>
								<img
									src={getCloudinaryUrl(session?.user?.image)}
									alt="Threads Logo"
									className="rounded-full w-10 h-10 object-cover"
								/>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem asChild>
									<Link to="/profile">Profile</Link>
								</DropdownMenuItem>
								<DropdownMenuItem
									variant="destructive"
									onClick={async () => {
										queryClient.clear();
										router.invalidate();
										await authClient.signOut();
									}}
								>
									Logout
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</ClientOnly>
			</section>

			<Outlet />

			<footer className="glass fixed bottom-0 left-0 right-0 h-16 flex flex-col items-center justify-center py-2 depth-4">
				<p className="text-sm text-muted-foreground">
					© 2025 {config.BRAND_NAME}. All rights reserved.
				</p>
				<div className="flex gap-2 text-xs">
					<p className="text-muted-foreground">Developed by Cumrunddin Ifty.</p>
					<p className="text-destructive font-medium">
						Not Developed By Faruk Bhai
					</p>
				</div>
			</footer>
		</main>
	);
}
