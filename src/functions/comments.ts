import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { comments } from "@/db/schema";
import { sendNotificationToUser } from "@/lib/server/notifications";
import { adminMiddleware, authMiddleware } from "@/middleware/auth";

export const getCommentsByPostId = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			postId: z.number(),
			cursor: z.number().optional(),
			limit: z.number().default(5),
		}),
	)
	.handler(async ({ data }) => {
		const comments = await db.query.comments.findMany({
			where: (comments, { eq }) => eq(comments.postId, data.postId),
			orderBy: (comments, { desc }) => [desc(comments.id)],
			limit: data.limit + 1,
			with: {
				user: {
					columns: {
						id: true,
						name: true,
						image: true,
						username: true,
					},
				},
				audioPreset: true,
			},
		});
		let nextCursor: number | null = null;
		if (comments.length > data.limit) {
			const nextItem = comments.pop();
			if (nextItem) {
				nextCursor = nextItem.id;
			}
		}
		return {
			data: comments,
			nextCursor,
		};
	});

export const postComment = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z
			.object({
				postId: z.number(),
				comment: z.string().max(280).optional(),
				audioPresetId: z.number().optional(),
			})
			.refine((data) => data.comment?.trim() || data.audioPresetId, {
				message: "Please add a comment or select an audio",
			}),
	)
	.handler(async ({ data, context }) => {
		const [comment] = await db
			.insert(comments)
			.values({
				content: data.comment || null,
				postId: data.postId,
				userId: context.userId,
				audioPresetId: data.audioPresetId,
			})
			.returning();

		// Send notification to post author (if not self-comment)
		const post = await db.query.posts.findFirst({
			where: (p, { eq }) => eq(p.id, data.postId),
			with: {
				author: {
					columns: { id: true, name: true },
				},
			},
		});

		if (post && post.authorId !== context.userId) {
			// Get the commenter's name
			const commenter = await db.query.users.findFirst({
				where: (u, { eq }) => eq(u.id, context.userId),
				columns: { name: true },
			});

			sendNotificationToUser(post.authorId, {
				title: "New Comment",
				body: `${commenter?.name || "Someone"} commented on your post`,
				data: { postId: data.postId.toString() },
			}).catch(console.error); // Fire and forget
		}

		return comment;
	});

export const adminDeleteComment = createServerFn({ method: "POST" })
	.middleware([adminMiddleware])
	.inputValidator(z.object({ commentId: z.number() }))
	.handler(async ({ data }) => {
		const comment = await db.query.comments.findFirst({
			where: (comments, { eq }) => eq(comments.id, data.commentId),
		});

		if (!comment) {
			throw new Error("Comment not found");
		}

		await db.delete(comments).where(eq(comments.id, data.commentId));
		return true;
	});
