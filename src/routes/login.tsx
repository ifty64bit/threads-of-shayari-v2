import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

const loginSchema = z.object({
	username: z.string(),
	password: z.string().min(4),
});

function LoginPage() {
	const navigate = Route.useNavigate();

	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const handleSubmit = async (payload: z.infer<typeof loginSchema>) => {
		toast.promise(
			async () => {
				const { error } = await authClient.signIn.username(payload);
				if (error) {
					throw new Error(error.message);
				}
				// Get the session to access custom fields like isAdmin
				const { data: session } = await authClient.getSession();
				return session;
			},
			{
				loading: "Logging in...",
				success: (session) => {
					// Redirect based on user type
					if (session?.user?.isAdmin) {
						navigate({ to: "/dashboard" });
					} else {
						navigate({ to: "/feed" });
					}
					return "Logged in successfully!";
				},
				error: (err) => (err instanceof Error ? err.message : "Login failed"),
			},
		);
	};

	return (
		<main className="p-4 max-w-md mx-auto h-dvh flex flex-col justify-center gap-4">
			<div className="text-center">
				<h1 className="text-2xl font-bold">Welcome back</h1>
				<p className="opacity-50">Enter your credentials to log in</p>
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input type="password" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full ">
						Login
					</Button>
				</form>
			</Form>

			<div>
				<p className="text-center">
					Don't have an account?{" "}
					<Link to="/signup" className="font-semibold">
						Signup
					</Link>
				</p>
			</div>
		</main>
	);
}
