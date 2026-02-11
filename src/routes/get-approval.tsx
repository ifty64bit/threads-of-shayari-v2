import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/get-approval")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = Route.useNavigate();
	const [isChecking, setIsChecking] = useState(false);

	async function recheck() {
		setIsChecking(true);
		try {
			const { data: newSession } = await authClient.getSession();
			if (newSession?.user?.emailVerified) {
				navigate({ to: "/feed" });
			}
		} finally {
			setIsChecking(false);
		}
	}
	return (
		<div className="flex flex-col items-center justify-center h-dvh">
			<h1 className="mb-2">Get Approval!</h1>
			<p>Thank you for signing up! Please wait for approval.</p>
			<p>
				Until then, you can explore our{" "}
				<span className="text-primary font-medium">public posts.</span>
			</p>
			<Button
				className="mt-4"
				onClick={recheck}
				disabled={isChecking}
				isLoading={isChecking}
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
