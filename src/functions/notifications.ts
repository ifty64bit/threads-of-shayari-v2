import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { fcmTokens } from "@/db/schema";
import { authMiddleware } from "@/middleware/auth";

/**
 * Register an FCM token for the authenticated user
 */
export const registerFCMToken = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			token: z.string().min(1),
			deviceInfo: z.string().optional(),
		}),
	)
	.handler(async ({ data, context }) => {
		// Upsert the token - update if exists, insert if not
		await db
			.insert(fcmTokens)
			.values({
				userId: context.userId,
				token: data.token,
				deviceInfo: data.deviceInfo,
			})
			.onConflictDoUpdate({
				target: [fcmTokens.userId, fcmTokens.token],
				set: {
					deviceInfo: data.deviceInfo,
					updatedAt: new Date(),
				},
			});

		return { success: true };
	});

/**
 * Remove an FCM token (e.g., on logout)
 */
export const removeFCMToken = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			token: z.string().min(1),
		}),
	)
	.handler(async ({ data }) => {
		await db.delete(fcmTokens).where(eq(fcmTokens.token, data.token));

		return { success: true };
	});
