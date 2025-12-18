import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { authMiddleware } from "@/middleware/auth";

export const getCurrentUser = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, context.userId),
		});
		return user;
	});
