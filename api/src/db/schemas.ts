import {
    pgTable,
    serial,
    varchar,
    text,
    timestamp,
    integer,
    pgEnum,
    unique,
    index,
} from "drizzle-orm/pg-core";

export const REACTION_TYPES = ["dhon", "horny", "wet", "pussy", "cum"] as const;

// Create PostgreSQL enum for reaction types
export const reactionTypeEnum = pgEnum("reaction_type", REACTION_TYPES);

export const usersTable = pgTable(
    "users",
    {
        id: serial("id").primaryKey(),
        username: varchar("username", { length: 50 }).notNull().unique(),
        intro: text("intro"),
        profilePicture: varchar("profile_picture", { length: 500 }),
        coverPicture: varchar("cover_picture", { length: 500 }),
        password: varchar("password", { length: 255 }).notNull(),
        email: varchar("email", { length: 255 }).notNull().unique(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    table => [
        // Index for querying users by username
        index("users_username_idx").on(table.username),
        // Index for querying users by email
        index("users_email_idx").on(table.email),
    ]
);

export const postTable = pgTable(
    "posts",
    {
        id: serial("id").primaryKey(),
        content: text("content").notNull(),
        authorId: integer("author_id")
            .notNull()
            .references(() => usersTable.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    table => [
        // Index for querying posts by author
        index("posts_author_id_idx").on(table.authorId),
        // Index for querying posts by creation date (descending for recent posts first)
        index("posts_created_at_idx").on(table.createdAt.desc()),
        // Composite index for author posts by date
        index("posts_author_created_at_idx").on(
            table.authorId,
            table.createdAt.desc()
        ),
    ]
);

export const commentTable = pgTable(
    "comments",
    {
        id: serial("id").primaryKey(),
        content: text("content").notNull(),
        postId: integer("post_id")
            .notNull()
            .references(() => postTable.id, { onDelete: "cascade" }),
        userId: integer("user_id")
            .notNull()
            .references(() => usersTable.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    table => [
        // Index for getting comments by post
        index("comments_post_id_idx").on(table.postId),
        // Index for getting comments by user
        index("comments_user_id_idx").on(table.userId),
        // Composite index for post comments by date
        index("comments_post_created_at_idx").on(
            table.postId,
            table.createdAt.desc()
        ),
    ]
);

export const reactionTable = pgTable(
    "reactions",
    {
        id: serial("id").primaryKey(),
        type: reactionTypeEnum("type").notNull(),
        postId: integer("post_id").references(() => postTable.id, {
            onDelete: "cascade",
        }),
        commentId: integer("comment_id").references(() => commentTable.id, {
            onDelete: "cascade",
        }),
        userId: integer("user_id")
            .notNull()
            .references(() => usersTable.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    table => [
        // Ensure user can only react once per post
        unique("reactions_user_post_unique").on(table.userId, table.postId),
        // Ensure user can only react once per comment
        unique("reactions_user_comment_unique").on(
            table.userId,
            table.commentId
        ),
        // Indexes for faster queries
        index("reactions_user_id_idx").on(table.userId),
        index("reactions_post_id_idx").on(table.postId),
        index("reactions_comment_id_idx").on(table.commentId),
        // Composite indexes for better performance
        index("reactions_post_type_idx").on(table.postId, table.type),
        index("reactions_user_post_idx").on(table.userId, table.postId),
    ]
);
