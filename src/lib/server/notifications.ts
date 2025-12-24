import { db } from "@/db";
import { fcmTokens } from "@/db/schema";
import { getMessaging } from "./firebase-admin";

type NotificationPayload = {
	title: string;
	body: string;
	data?: Record<string, string>;
};

/**
 * Send a push notification to a specific user on all their registered devices
 */
export async function sendNotificationToUser(
	userId: number,
	notification: NotificationPayload,
) {
	const messaging = getMessaging();
	if (!messaging) {
		console.log("Firebase messaging not available, skipping notification");
		return { success: false, reason: "messaging_not_configured" };
	}

	try {
		// Get all FCM tokens for this user
		const tokens = await db.query.fcmTokens.findMany({
			where: (t, { eq }) => eq(t.userId, userId),
		});

		if (tokens.length === 0) {
			return { success: false, reason: "no_tokens" };
		}

		// Send notification to all devices
		const messages = tokens.map((t) => ({
			token: t.token,
			notification: {
				title: notification.title,
				body: notification.body,
			},
			data: notification.data,
			webpush: {
				fcmOptions: {
					link: notification.data?.url || "/",
				},
			},
		}));

		const response = await messaging.sendEach(messages);

		// Clean up any invalid tokens
		const tokensToRemove: string[] = [];
		response.responses.forEach((resp, idx) => {
			if (
				!resp.success &&
				resp.error?.code === "messaging/invalid-registration-token"
			) {
				tokensToRemove.push(tokens[idx].token);
			}
		});

		if (tokensToRemove.length > 0) {
			// Remove invalid tokens from database
			await db.delete(fcmTokens).where(
				// biome-ignore lint/suspicious/noExplicitAny: Drizzle ORM typing limitation
				(fcmTokens as any).token.in(tokensToRemove),
			);
		}

		return {
			success: true,
			sent: response.successCount,
			failed: response.failureCount,
		};
	} catch (error) {
		console.error("Failed to send notification:", error);
		return { success: false, reason: "send_error", error };
	}
}
