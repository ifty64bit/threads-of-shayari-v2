import { createServerFn } from "@tanstack/react-start";
import { count, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/data/db";
import { postImages, posts } from "@/data/db/schema";
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

/**
 * Get post by ID for public share page (no auth required)
 * Returns null if post doesn't exist or hasn't been shared (no ogImage)
 */
export const getPublicPostById = createServerFn({ method: "GET" })
	.inputValidator(z.object({ postId: z.number() }))
	.handler(async ({ data }) => {
		const post = await db.query.posts.findFirst({
			where: (posts, { eq }) => eq(posts.id, data.postId),
			with: {
				author: {
					columns: {
						id: true,
						name: true,
						username: true,
						image: true,
					},
				},
				images: true,
			},
		});

		// Only return if post exists AND has ogImage (was shared)
		if (!post || !post.ogImage) {
			return null;
		}

		return post;
	});

export const getPostsForAdmin = createServerFn({ method: "GET" })
	.middleware([adminMiddleware])
	.inputValidator(
		z.object({
			limit: z.number().optional().default(10),
			offset: z.number().optional().default(0),
			search: z.string().optional(),
		}),
	)
	.handler(async ({ data }) => {
		const whereClause = data.search
			? ilike(posts.content, `%${data.search}%`)
			: undefined;

		const [postsData, totalResult] = await Promise.all([
			db.query.posts.findMany({
				where: () => whereClause,
				orderBy: () => [desc(posts.createdAt)],
				limit: data.limit,
				offset: data.offset,
				with: {
					author: {
						columns: {
							id: true,
							name: true,
							username: true,
							image: true,
						},
					},
					images: true,
					comments: {
						columns: {
							id: true,
						},
					},
					reactions: {
						columns: {
							id: true,
						},
					},
				},
			}),
			db.select({ count: count() }).from(posts).where(whereClause),
		]);

		return {
			posts: postsData,
			total: totalResult[0]?.count ?? 0,
		};
	});
