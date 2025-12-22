import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { adminMiddleware, authMiddleware } from "@/middleware/auth";

export const getCurrentUser = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, context.userId),
		});
		return user;
	});

export const getUsers = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			offset: z.number().optional().default(0),
			limit: z.number().optional().default(10),
		}),
	)
	.middleware([adminMiddleware])
	.handler(async ({ data }) => {
		const users = await db.query.users.findMany({
			where: (users, { eq }) => eq(users.isAdmin, false),
			columns: {
				id: true,
				name: true,
				username: true,
				email: true,
				isAdmin: true,
				emailVerified: true,
				createdAt: true,
				updatedAt: true,
			},
			limit: data.limit,
			offset: data.offset,
			orderBy: (users, { desc }) => [desc(users.createdAt)],
		});
		return users;
	});

export const updateUserVerification = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			userId: z.string(),
			verified: z.boolean(),
		}),
	)
	.middleware([adminMiddleware])
	.handler(async ({ data }) => {
		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, Number(data.userId)),
		});
		if (!user) {
			throw new Error("User not found");
		}
		await db
			.update(users)
			.set({
				emailVerified: data.verified,
			})
			.where(eq(users.id, Number(data.userId)));
		return true;
	});
