import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/data/db";
import { postReactions } from "@/data/db/schema";
import { REACTIONS } from "@/lib/reactions";
import { sendNotificationToUser } from "@/lib/server/notifications";
import { authMiddleware } from "@/middleware/auth";

const toggleReactionSchema = z.object({
	postId: z.number(),
	reaction: z.enum(Object.keys(REACTIONS) as [string, ...string[]]),
});

export const toggleReaction = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(toggleReactionSchema)
	.handler(async ({ data, context }) => {
		const existingReaction = await db.query.postReactions.findFirst({
			where: (reactions, { and, eq }) =>
				and(
					eq(reactions.postId, data.postId),
					eq(reactions.userId, context.userId),
				),
		});

		if (existingReaction) {
			if (existingReaction.reaction === data.reaction) {
				// Same reaction clicked - remove it
				await db
					.delete(postReactions)
					.where(
						and(
							eq(postReactions.postId, data.postId),
							eq(postReactions.userId, context.userId),
						),
					);
				return { action: "removed" as const, postId: data.postId };
			}
			// Different reaction - update it
			await db
				.update(postReactions)
				.set({ reaction: data.reaction })
				.where(
					and(
						eq(postReactions.postId, data.postId),
						eq(postReactions.userId, context.userId),
					),
				);
			return { action: "updated" as const, postId: data.postId };
		}

		// Add new reaction
		await db.insert(postReactions).values({
			postId: data.postId,
			userId: context.userId,
			reaction: data.reaction,
		});

		// Send notification to post author (if not self-reaction)
		const post = await db.query.posts.findFirst({
			where: (p, { eq }) => eq(p.id, data.postId),
			with: {
				author: {
					columns: { id: true, name: true },
				},
			},
		});

		if (post && post.authorId !== context.userId) {
			// Get the reactor's name
			const reactor = await db.query.users.findFirst({
				where: (u, { eq }) => eq(u.id, context.userId),
				columns: { name: true },
			});

			const reactionEmoji =
				REACTIONS[data.reaction as keyof typeof REACTIONS] || data.reaction;

			sendNotificationToUser(post.authorId, {
				title: "New Reaction",
				body: `${reactor?.name || "Someone"} reacted ${reactionEmoji} to your post`,
				data: { postId: data.postId.toString() },
			}).catch(console.error); // Fire and forget
		}

		return { action: "added" as const, postId: data.postId };
	});
