import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSignup } from "@/hooks/api/auth";
import { userSchema } from "@/lib/schemas/user";

export const Route = createFileRoute("/signup")({
	component: SignupPage,
});

const signupSchema = userSchema
	.extend({
		confirm_password: z
			.string()
			.min(6, "Confirm password must be at least 6 characters"),
		acceptTerms: z.boolean().refine((val) => val === true, {
			message: "You must accept the terms",
		}),
	})
	.refine((data) => data.password === data.confirm_password, {
		message: "Passwords do not match",
		path: ["confirm_password"],
	});

function SignupPage() {
	const navigate = Route.useNavigate();
	const form = useForm<z.infer<typeof signupSchema>>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			name: "",
			username: "",
			email: "",
			password: "",
			confirm_password: "",
			acceptTerms: false,
		},
		mode: "all",
	});

	const signup = useSignup();

	return (
		<main className="p-4 max-w-md mx-auto h-dvh flex flex-col justify-center gap-4">
			<div className="text-center">
				<h1 className="text-2xl font-bold">Create your account</h1>
				<p className="opacity-50">Enter your details to get started</p>
			</div>
			<Form {...form}>
				<form
					className="space-y-4"
					onSubmit={form.handleSubmit((data) => {
						signup.mutate(
							{ data },
							{
								onSuccess: () => navigate({ to: "/" }),
							},
						);
					})}
				>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

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
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type="email" {...field} />
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

					<FormField
						control={form.control}
						name="confirm_password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Confirm Password</FormLabel>
								<FormControl>
									<Input type="password" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="acceptTerms"
						render={({ field }) => (
							<FormItem>
								<div className="flex flex-row items-center gap-2 space-y-0">
									<FormControl>
										<Checkbox
											id="acceptTerms"
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>

									<FormLabel htmlFor="acceptTerms">
										I agree to the terms and conditions
									</FormLabel>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full" isLoading={signup.isPending}>
						Sign Up
					</Button>
				</form>
			</Form>
			<div>
				<p className="text-center">
					Already have an account?{" "}
					<Link to="/login" className="font-semibold">
						Login
					</Link>
				</p>
			</div>
		</main>
	);
}
