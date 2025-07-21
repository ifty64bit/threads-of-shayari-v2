import { sql } from "drizzle-orm";
import { int, sqliteTable, text, unique, index } from "drizzle-orm/sqlite-core";

const REACTION_TYPES = ["Like", "Love", "Haha", "Wow", "Sad", "Angry"] as const;

export const usersTable = sqliteTable("users", {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    username: text().notNull().unique(),
    intro: text(),
    profilePicture: text(),
    coverPicture: text(),
    password: text().notNull(),
    email: text().notNull().unique(),
    createdAt: text()
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text()
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
});

export const postTable = sqliteTable(
    "posts",
    {
        id: int().primaryKey({ autoIncrement: true }),
        content: text().notNull(),
        authorId: int()
            .notNull()
            .references(() => usersTable.id, { onDelete: "cascade" }),
        createdAt: text()
            .notNull()
            .default(sql`CURRENT_TIMESTAMP`),
        updatedAt: text()
            .notNull()
            .default(sql`CURRENT_TIMESTAMP`),
    },
    (table) => ({
        // Index for querying posts by author
        authorIdIdx: index("post_author_id_idx").on(table.authorId),
        // Index for querying posts by creation date
        createdAtIdx: index("post_created_at_idx").on(table.createdAt),
    })
);

export const reactionTable = sqliteTable(
    "reactions",
    {
        id: int().primaryKey({ autoIncrement: true }),
        type: text().notNull().$type<(typeof REACTION_TYPES)[number]>(),
        postId: int().references(() => postTable.id, { onDelete: "cascade" }),
        commentId: int().references(() => commentTable.id, {
            onDelete: "cascade",
        }),
        userId: int()
            .notNull()
            .references(() => usersTable.id, { onDelete: "cascade" }),
        createdAt: text()
            .notNull()
            .default(sql`CURRENT_TIMESTAMP`),
    },
    (table) => ({
        // Ensure user can only react once per post
        uniqueUserPost: unique().on(table.userId, table.postId),
        // Ensure user can only react once per comment
        uniqueUserComment: unique().on(table.userId, table.commentId),
        // Index for faster queries
        userIdIdx: index("reaction_user_id_idx").on(table.userId),
        postIdIdx: index("reaction_post_id_idx").on(table.postId),
        commentIdIdx: index("reaction_comment_id_idx").on(table.commentId),
    })
);

export const commentTable = sqliteTable("comments", {
    id: int().primaryKey({ autoIncrement: true }),
    content: text().notNull(),
    postId: int()
        .notNull()
        .references(() => postTable.id, { onDelete: "cascade" }),
    userId: int()
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: text()
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text()
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
});
