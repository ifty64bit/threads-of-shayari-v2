import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { userSchema } from "@/lib/schemas/user";
import { auth } from "@/lib/server/auth";

export const getUserSession = createServerFn({ method: "GET" }).handler(
	async () => {
		const request = getRequest();
		return await auth.api.getSession({
			headers: request.headers,
		});
	},
);

export const signupFn = createServerFn({ method: "POST" })
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
