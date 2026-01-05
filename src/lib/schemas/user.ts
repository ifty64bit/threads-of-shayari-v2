import z from "zod";

export const userSchema = z.object({
	name: z.string().min(1, "Name is required"),
	username: z.string().min(1, "Username is required"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(4, "Password must be at least 4 characters"),
});
