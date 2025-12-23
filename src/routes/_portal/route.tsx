import { useQueryClient } from "@tanstack/react-query";
import {
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
		<main className="max-w-md mx-auto min-h-dvh">
			<section className="sticky top-0 backdrop-blur-lg flex justify-between items-center border-b py-2 px-4">
				<Link to="/feed">
					<h4>NostaGram</h4>
				</Link>
				<div>
					<DropdownMenu>
						<DropdownMenuTrigger title={session?.user?.name}>
							<img
								src={getCloudinaryUrl(session?.user?.image)}
								alt="Threads Logo"
								className="rounded-full"
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
			</section>

			<Outlet />
		</main>
	);
}
