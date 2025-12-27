import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { postImages, posts } from "@/db/schema";
import { adminMiddleware, authMiddleware } from "@/middleware/auth";

const createPostSchema = z.object({
	content: z.string().min(1).max(280),
	images: z.array(z.string()).optional(),
});

export const createPost = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(createPostSchema)
	.handler(async ({ data, context }) => {
		const [post] = await db
			.insert(posts)
			.values({
				content: data.content,
				authorId: context.userId,
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

		const newPost = await db.query.posts.findFirst({
			where: (posts, { eq }) => eq(posts.id, post.id),
			with: {
				images: true,
				author: true,
			},
		});

		if (!newPost) {
			throw new Error("Failed to create post");
		}

		return newPost;
	});

const getPostsSchema = z.object({
	cursor: z.number().optional(),
	limit: z.number().default(5),
});

export const getPosts = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(getPostsSchema)
	.handler(async ({ data }) => {
		const { cursor, limit } = data;

		const postsData = await db.query.posts.findMany({
			where: (posts, { lt }) => (cursor ? lt(posts.id, cursor) : undefined),
			orderBy: (posts, { desc }) => [desc(posts.id)],
			limit: limit + 1, // Fetch one extra to check for next page
			with: {
				images: true,
				author: true,
				reactions: true,
				comments: {
					columns: {
						id: true,
					},
				},
			},
		});

		let nextCursor: number | null = null;
		if (postsData.length > limit) {
			const nextItem = postsData.pop();
			if (nextItem) {
				nextCursor = nextItem.id;
			}
		}

		return {
			data: postsData,
			nextCursor,
		};
	});

export const getPostsByUserId = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			userId: z.number(),
			cursor: z.number().optional(),
			limit: z.number().default(5),
		}),
	)
	.handler(async ({ data }) => {
		const { userId, cursor, limit } = data;

		const postsData = await db.query.posts.findMany({
			where: (posts, { eq, lt, and }) =>
				cursor
					? and(eq(posts.authorId, userId), lt(posts.id, cursor))
					: eq(posts.authorId, userId),
			orderBy: (posts, { desc }) => [desc(posts.id)],
			limit: limit + 1,
			with: {
				images: true,
				author: true,
				reactions: true,
				comments: {
					columns: {
						id: true,
					},
				},
			},
		});

		let nextCursor: number | null = null;
		if (postsData.length > limit) {
			const nextItem = postsData.pop();
			if (nextItem) {
				nextCursor = nextItem.id;
			}
		}

		return {
			data: postsData,
			nextCursor,
		};
	});

export const getPostById = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ postId: z.number() }))
	.handler(async ({ data }) => {
		const post = await db.query.posts.findFirst({
			where: (posts, { eq }) => eq(posts.id, data.postId),
			with: {
				images: true,
				author: true,
				reactions: true,
				comments: {
					with: {
						user: {
							columns: {
								id: true,
								name: true,
								image: true,
								username: true,
							},
						},
					},
				},
			},
		});

		if (!post) {
			throw new Error("Post not found");
		}

		return post;
	});

export const deletePost = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ postId: z.number() }))
	.handler(async ({ data, context }) => {
		const post = await db.query.posts.findFirst({
			where: (posts, { eq }) => eq(posts.id, data.postId),
			with: {
				author: {
					columns: {
						id: true,
						name: true,
						image: true,
						username: true,
					},
				},
			},
		});

		if (!post) {
			throw new Error("Post not found");
		}

		if (post.author.id !== context.userId) {
			throw new Error("Unauthorized");
		}
		await db.delete(posts).where(eq(posts.id, data.postId));
		await db.delete(postImages).where(eq(postImages.postId, data.postId));
		return true;
	});

export const adminDeletePost = createServerFn({ method: "POST" })
	.middleware([adminMiddleware])
	.inputValidator(z.object({ postId: z.number() }))
	.handler(async ({ data }) => {
		const post = await db.query.posts.findFirst({
			where: (posts, { eq }) => eq(posts.id, data.postId),
		});

		if (!post) {
			throw new Error("Post not found");
		}

		await db.delete(posts).where(eq(posts.id, data.postId));
		await db.delete(postImages).where(eq(postImages.postId, data.postId));
		return true;
	});
