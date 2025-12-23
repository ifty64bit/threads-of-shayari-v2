import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
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
import { auth } from "@/lib/server/auth";

export const Route = createFileRoute("/signup")({
	component: SignupPage,
});

const userSchema = z.object({
	name: z.string(),
	username: z.string(),
	email: z.string().email(),
	password: z.string().min(4),
});

const signupSchema = userSchema
	.extend({
		confirm_password: z.string().min(4),
		acceptTerms: z.boolean().refine((val) => val === true, {
			message: "বোকাচোদাদের খেলায় নেই না!",
		}),
	})
	.refine((data) => data.password === data.confirm_password, {
		message: "Passwords do not match",
		path: ["confirm_password"],
	});

const signupFn = createServerFn({ method: "POST" })
	.inputValidator(userSchema)
	.handler(async ({ data }) => {
		const res = await auth.api.signUpEmail({
			body: {
				email: data.email,
				password: data.password,
				name: data.name,
				username: data.username,
			},
			asResponse: true,
		});

		if (!res.ok) {
			let errorMessage = "Signup failed";
			try {
				const error = await res.json();
				errorMessage = error.message || errorMessage;
			} catch {
				// ignore json parse error
			}
			throw new Error(errorMessage);
		}

		return { success: true };
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
	});

	return (
		<main className="p-4 max-w-md mx-auto h-dvh flex flex-col justify-center gap-4">
			<div className="text-center">
				<h1 className="text-2xl font-bold">Create your account</h1>
				<p className="opacity-50">Enter your details to get started</p>
			</div>
			<Form {...form}>
				<form
					className="space-y-4"
					onSubmit={form.handleSubmit(async (data) => {
						try {
							await signupFn({ data });
							navigate({ to: "/" });
						} catch (error) {
							console.error(error);
							alert(error instanceof Error ? error.message : "Signup failed");
						}
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
										আমি স্বীকার করছ যে আমি সার্টিফাইড বোকাচোদা না!
									</FormLabel>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full">
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
