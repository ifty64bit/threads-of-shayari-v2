import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/get-approval")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = Route.useNavigate();
	const { data: session, refetch, isRefetching } = authClient.useSession();

	async function recheck() {
		await refetch();
		if (session) {
			if (session.user.emailVerified) {
				navigate({ to: "/feed" });
			}
		}
	}
	return (
		<div className="flex flex-col items-center justify-center h-dvh">
			<h1 className="mb-2">Get Approval!</h1>
			<p>Thank you for signing up! Please wait for approval.</p>
			<p>
				Until then, you can explore our{" "}
				<span className="text-red-500">Lara's ass.</span>
			</p>
			<Button
				className="mt-4"
				onClick={recheck}
				disabled={isRefetching}
				isLoading={isRefetching}
			>
				Recheck
			</Button>
			<Button
				className="mt-4"
				onClick={async () => {
					await authClient.signOut();
					navigate({ to: "/login" });
				}}
				variant={"destructive"}
			>
				Logout
			</Button>
		</div>
	);
}
