import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod/v4";
import { db } from "@/db";
import { postImages, posts } from "@/db/schema";
import { auth } from "@/lib/auth";

const createPostSchema = z.object({
	content: z.string().min(1).max(280),
	images: z.array(z.string()).optional(),
});

export const createPost = createServerFn({ method: "POST" })
	.inputValidator(createPostSchema)
	.handler(async ({ data }) => {
		const session = await auth.api.getSession({
			headers: getRequest().headers,
		});
		if (!session?.user) {
			throw new Error("Unauthorized");
		}

		const [post] = await db
			.insert(posts)
			.values({
				content: data.content,
				authorId: parseInt(session.user.id, 10),
			})
			.returning();

		if (data.images && data.images.length > 0) {
			await db.insert(postImages).values(
				data.images.map((url) => ({
					url,
					postId: post.id,
				})),
			);
		}

		return post;
	});

export const getPosts = createServerFn({ method: "GET" }).handler(async () => {
	const posts = await db.query.posts.findMany({
		orderBy: (posts, { desc }) => [desc(posts.createdAt)],
		with: {
			images: true,
			author: true,
		},
	});
	return posts;
});
