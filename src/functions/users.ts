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

export const getUserById = createServerFn({ method: "GET" })
	.inputValidator(z.object({ userId: z.number() }))
	.middleware([authMiddleware])
	.handler(async ({ data }) => {
		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, data.userId),
			columns: {
				id: true,
				name: true,
				username: true,
				image: true,
				createdAt: true,
			},
		});
		return user;
	});

export const getAdminUserDetail = createServerFn({ method: "GET" })
	.inputValidator(z.object({ userId: z.number() }))
	.middleware([adminMiddleware])
	.handler(async ({ data }) => {
		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, data.userId),
			columns: {
				id: true,
				name: true,
				username: true,
				email: true,
				image: true,
				emailVerified: true,
				isAdmin: true,
				createdAt: true,
				updatedAt: true,
			},
			with: {
				posts: {
					columns: {
						id: true,
						content: true,
						createdAt: true,
					},
					orderBy: (posts, { desc }) => [desc(posts.createdAt)],
					limit: 20,
				},
				comments: {
					columns: {
						id: true,
						content: true,
						createdAt: true,
					},
					with: {
						post: {
							columns: {
								id: true,
								content: true,
							},
						},
					},
					orderBy: (comments, { desc }) => [desc(comments.createdAt)],
					limit: 20,
				},
			},
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

const profileSchema = z.object({
	image: z.union([z.string(), z.null()]).optional(),
	name: z.string().optional(),
	username: z.string().optional(),
});

export const updateUser = createServerFn({ method: "POST" })
	.inputValidator(profileSchema)
	.middleware([authMiddleware])
	.handler(async ({ data, context }) => {
		if (typeof data.image !== "string") {
			throw new Error("Invalid image");
		}

		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, context.userId),
		});
		if (!user) {
			throw new Error("User not found");
		}
		await db
			.update(users)
			.set({
				name: data.name,
				username: data.username,
				image: data.image,
			})
			.where(eq(users.id, context.userId));
		return true;
	});

const adminUpdateUserSchema = z.object({
	userId: z.number(),
	name: z.string().optional(),
	username: z.string().optional(),
	email: z.string().email().optional(),
	emailVerified: z.boolean().optional(),
});

export const adminUpdateUser = createServerFn({ method: "POST" })
	.inputValidator(adminUpdateUserSchema)
	.middleware([adminMiddleware])
	.handler(async ({ data }) => {
		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, data.userId),
		});
		if (!user) {
			throw new Error("User not found");
		}
		await db
			.update(users)
			.set({
				name: data.name,
				username: data.username,
				email: data.email,
				emailVerified: data.emailVerified,
			})
			.where(eq(users.id, data.userId));
		return true;
	});
