import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";
import { timestamps } from "./columns.helpers";

//======================= Auth Tables =======================
export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	username: text("username").notNull().unique(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	coverImage: text("cover_image"),
	...timestamps,
});

export const usersRelations = relations(users, ({ many }) => ({
	posts: many(posts),
}));

export const sessions = pgTable("sessions", {
	id: serial("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	ipAddress: text("ip_address").notNull(),
	userAgent: text("user_agent").notNull(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	...timestamps,
});

export const accounts = pgTable("accounts", {
	id: serial("id").primaryKey(),
	accountId: text("account_id").notNull().unique(),
	providerId: text("provider_id").notNull(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	...timestamps,
});

export const verifications = pgTable("verifications", {
	id: serial("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	...timestamps,
});

//======================= Posts Tables =======================
export const posts = pgTable("posts", (t) => ({
	id: t.serial("id").primaryKey(),
	content: t.text("content").notNull(),
	authorId: t
		.integer("author_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	...timestamps,
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
	author: one(users, {
		fields: [posts.authorId],
		references: [users.id],
	}),
	images: many(postImages),
	reactions: many(postReactions),
	comments: many(comments),
}));

//======================= Post Images Tables =======================
export const postImages = pgTable("post_images", (t) => ({
	id: t.serial("id").primaryKey(),
	url: t.text("url").notNull(),
	altText: t.text("alt_text"),
	postId: t
		.integer("post_id")
		.notNull()
		.references(() => posts.id, { onDelete: "cascade" }),
	...timestamps,
}));

export const postImagesRelations = relations(postImages, ({ one }) => ({
	post: one(posts, {
		fields: [postImages.postId],
		references: [posts.id],
	}),
}));

//======================= Post Reactions Tables =======================
export const postReactions = pgTable(
	"post_reactions",
	(t) => ({
		id: t.serial("id").primaryKey(),
		postId: t
			.integer("post_id")
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		userId: t
			.integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		reaction: t.text("reaction").notNull(),
		...timestamps,
	}),
	(table) => [
		unique("unique_user_post_reaction").on(table.userId, table.postId),
	],
);

export const postReactionsRelations = relations(postReactions, ({ one }) => ({
	post: one(posts, {
		fields: [postReactions.postId],
		references: [posts.id],
	}),
	user: one(users, {
		fields: [postReactions.userId],
		references: [users.id],
	}),
}));

//======================= Comments Tables =======================
export const comments = pgTable("comments", (t) => ({
	id: t.serial("id").primaryKey(),
	content: t.text("content").notNull(),
	postId: t
		.integer("post_id")
		.notNull()
		.references(() => posts.id, { onDelete: "cascade" }),
	userId: t
		.integer("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	...timestamps,
}));

export const commentsRelations = relations(comments, ({ one }) => ({
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id],
	}),
	user: one(users, {
		fields: [comments.userId],
		references: [users.id],
	}),
}));
