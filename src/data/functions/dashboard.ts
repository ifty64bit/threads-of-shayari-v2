import { createServerFn } from "@tanstack/react-start";
import { count, sql } from "drizzle-orm";
import { db } from "@/data/db";
import {
	audioPresets,
	comments,
	postReactions,
	posts,
	users,
} from "@/data/db/schema";
import { adminMiddleware } from "@/middleware/auth";

export const getDashboardStats = createServerFn({ method: "GET" })
	.middleware([adminMiddleware])
	.handler(async () => {
		const [
			usersCount,
			postsCount,
			commentsCount,
			audioPresetsCount,
			reactionsCount,
			recentUsers,
		] = await Promise.all([
			db
				.select({ count: count() })
				.from(users)
				.where(sql`${users.isAdmin} = false`),
			db.select({ count: count() }).from(posts),
			db.select({ count: count() }).from(comments),
			db.select({ count: count() }).from(audioPresets),
			db.select({ count: count() }).from(postReactions),
			db.query.users.findMany({
				where: (users, { eq }) => eq(users.isAdmin, false),
				columns: {
					id: true,
					name: true,
					username: true,
					image: true,
					createdAt: true,
				},
				orderBy: (users, { desc }) => [desc(users.createdAt)],
				limit: 5,
			}),
		]);

		return {
			totalUsers: usersCount[0]?.count ?? 0,
			totalPosts: postsCount[0]?.count ?? 0,
			totalComments: commentsCount[0]?.count ?? 0,
			totalAudioPresets: audioPresetsCount[0]?.count ?? 0,
			totalReactions: reactionsCount[0]?.count ?? 0,
			recentUsers,
		};
	});
