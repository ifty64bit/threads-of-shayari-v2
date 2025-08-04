import {
    commentTable,
    postTable,
    reactionTable,
    usersTable,
} from "../db/schemas";
import authMiddleware from "@/middlewares/auth";
import dbMiddleware from "@/middlewares/db";
import { type Variables, type Bindings } from "..";
import { zValidator } from "@hono/zod-validator";
import { desc, eq, sql, and } from "drizzle-orm";
import { Hono } from "hono";
import z from "zod/v4";
import { createPostSchema, REACTION_TYPES } from "shared";
import { sendNotification } from "@/services/notification.service";

const postRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>()
    .use(authMiddleware)
    .use(dbMiddleware)
    .post("/", zValidator("json", createPostSchema), async c => {
        const { content } = c.req.valid("json");
        const { db } = c.var;
        const post = await db
            .insert(postTable)
            .values({
                content,
                authorId: c.get("user").id,
            })
            .returning();
        return c.json({ message: "Post created", data: post[0] }, 201);
    })
    .get(
        "/",
        zValidator(
            "query",
            z.object({
                offset: z.coerce.number().min(0).optional().default(0),
                limit: z.coerce.number().min(1).max(100).optional().default(10),
            })
        ),
        async c => {
            const { offset, limit } = c.req.valid("query");
            const { db } = c.var;

            const posts = await db
                .select({
                    id: postTable.id,
                    content: postTable.content,
                    author_id: postTable.authorId,
                    created_at: postTable.createdAt,
                    updated_at: postTable.updatedAt,
                    author: {
                        id: usersTable.id,
                        username: usersTable.username,
                        avatar: usersTable.profilePicture,
                        email: usersTable.email,
                    },
                    reactions: sql<
                        {
                            id: number;
                            userId: number;
                            type: (typeof REACTION_TYPES)[number];
                            createdAt: Date;
                            user: {
                                id: number;
                                username: string;
                                avatar: string | null;
                            };
                        }[]
                    >`
                        COALESCE(
                            (
                                SELECT array_agg(
                                    json_build_object(
                                        'id', r.id,
                                        'userId', r.user_id,
                                        'type', r.type,
                                        'createdAt', r.created_at,
                                        'user', json_build_object(
                                            'id', ru.id,
                                            'username', ru.username,
                                            'avatar', ru.profile_picture
                                        )
                                    ) ORDER BY r.created_at DESC
                                )
                                FROM reactions r
                                JOIN users ru ON r.user_id = ru.id
                                WHERE r.post_id = ${postTable.id}
                            ),
                            ARRAY[]::json[]
                        )
                    `.as("reactions"),
                    comment_count: sql<number>`
                        COUNT(DISTINCT ${commentTable.id})
                    `.as("comment_count"),
                })
                .from(postTable)
                .innerJoin(usersTable, eq(postTable.authorId, usersTable.id))
                .leftJoin(commentTable, eq(postTable.id, commentTable.postId))
                .groupBy(postTable.id, usersTable.id)
                .orderBy(desc(postTable.createdAt))
                .offset(offset)
                .limit(limit);

            return c.json({ message: "Success", data: posts }, 200);
        }
    )
    .get(
        "/:id",
        zValidator(
            "param",
            z.object({ id: z.string().transform(val => parseInt(val, 10)) })
        ),
        async c => {
            const id = c.req.valid("param").id;
            const { db } = c.var;
            const post = await db
                .select({
                    id: postTable.id,
                    content: postTable.content,
                    author: {
                        id: usersTable.id,
                        username: usersTable.username,
                        avatar: usersTable.profilePicture,
                        email: usersTable.email,
                    },
                    reactions: sql<
                        {
                            id: number;
                            userId: number;
                            type: (typeof REACTION_TYPES)[number];
                            createdAt: Date;
                            user: {
                                id: number;
                                username: string;
                                avatar: string | null;
                            };
                        }[]
                    >`
                        COALESCE(
                            ARRAY_AGG(
                                CASE 
                                    WHEN ${reactionTable.id} IS NOT NULL 
                                    THEN json_build_object(
                                        'id', ${reactionTable.id},
                                        'userId', ${reactionTable.userId},
                                        'type', ${reactionTable.type},
                                        'createdAt', ${reactionTable.createdAt},
                                        'user', json_build_object(
                                            'id', ${usersTable.id},
                                            'username', ${usersTable.username},
                                            'avatar', ${usersTable.profilePicture}
                                        )
                                    )
                                    ELSE NULL
                                END
                                ORDER BY ${reactionTable.createdAt} DESC
                            ) FILTER (WHERE ${reactionTable.id} IS NOT NULL),
                            ARRAY[]::json[]
                        )
                    `.as("reactions"),
                    created_at: postTable.createdAt,
                    updated_at: postTable.updatedAt,
                })
                .from(postTable)
                .innerJoin(usersTable, eq(postTable.authorId, usersTable.id))
                .leftJoin(reactionTable, eq(postTable.id, reactionTable.postId))
                .groupBy(postTable.id, usersTable.id)
                .where(eq(postTable.id, id));

            return c.json({
                message: `Post details for id: ${id}`,
                data: post[0] || null,
            });
        }
    )
    .put(
        "/:id",
        zValidator(
            "param",
            z.object({ id: z.string().transform(val => parseInt(val, 10)) })
        ),
        zValidator("json", z.object({ content: z.string().min(1) })),
        async c => {
            const id = c.req.valid("param").id;
            const { content } = c.req.valid("json");
            const { db } = c.var;
            const post = await db
                .update(postTable)
                .set({ content, updatedAt: new Date() })
                .where(eq(postTable.id, id))
                .returning();

            return c.json({
                message: `Post updated for id: ${id}`,
                data: post[0],
            });
        }
    )
    .delete(
        "/:id",
        zValidator(
            "param",
            z.object({ id: z.string().transform(val => parseInt(val, 10)) })
        ),
        async c => {
            const id = c.req.valid("param").id;
            const { db } = c.var;
            const userId = c.get("user").id;

            const result = await db.transaction(async tx => {
                const [user] = await tx
                    .select({
                        id: usersTable.id,
                        username: usersTable.username,
                    })
                    .from(usersTable)
                    .where(eq(usersTable.id, userId))
                    .limit(1);

                if (user?.id === userId) {
                    await tx
                        .delete(reactionTable)
                        .where(eq(reactionTable.postId, id));
                    await tx
                        .delete(commentTable)
                        .where(eq(commentTable.postId, id));
                    await tx.delete(postTable).where(eq(postTable.id, id));
                    return true;
                } else {
                    return false;
                }
            });

            if (!result) {
                return c.json(
                    { message: "You are not authorized to delete this post" },
                    403
                );
            }
            return c.json(
                {
                    message: `Post deleted for id: ${id}`,
                    data: null,
                },
                202
            );
        }
    )
    .post(
        "/:id/reactions",
        zValidator(
            "param",
            z.object({ id: z.string().transform(val => parseInt(val, 10)) })
        ),
        zValidator("json", z.object({ reaction: z.enum(REACTION_TYPES) })),
        async c => {
            const id = c.req.valid("param").id;
            const { reaction } = c.req.valid("json");
            const { db } = c.var;
            const userId = c.get("user").id;

            try {
                const result = await db.transaction(async tx => {
                    let STATE: "INSERTED" | "UPDATED" = "INSERTED";

                    const [existingReaction] = await tx
                        .select({
                            id: reactionTable.id,
                            type: reactionTable.type,
                        })
                        .from(reactionTable)
                        .where(
                            and(
                                eq(reactionTable.postId, id),
                                eq(reactionTable.userId, userId)
                            )
                        )
                        .limit(1);

                    if (existingReaction) {
                        if (existingReaction.type === reaction) {
                            // User is removing their reaction
                            await tx
                                .delete(reactionTable)
                                .where(
                                    eq(reactionTable.id, existingReaction.id)
                                );
                        } else {
                            // User is changing their reaction
                            await tx
                                .update(reactionTable)
                                .set({ type: reaction })
                                .where(
                                    eq(reactionTable.id, existingReaction.id)
                                );
                        }
                        STATE = "UPDATED";
                    } else {
                        // User is adding a new reaction
                        await tx.insert(reactionTable).values({
                            postId: id,
                            userId: userId,
                            type: reaction,
                        });

                        STATE = "INSERTED";
                    }

                    const [post_author] = await tx
                        .select({
                            id: postTable.id,
                            content: postTable.content,
                            author: {
                                id: usersTable.id,
                                username: usersTable.username,
                                avatar: usersTable.profilePicture,
                            },
                        })
                        .from(postTable)
                        .leftJoin(
                            usersTable,
                            eq(postTable.authorId, usersTable.id)
                        )
                        .where(eq(postTable.id, id))
                        .limit(1);

                    const [reactor] = await tx
                        .select({
                            id: usersTable.id,
                            username: usersTable.username,
                            profilePicture: usersTable.profilePicture,
                        })
                        .from(usersTable)
                        .where(eq(usersTable.id, userId))
                        .limit(1);

                    return {
                        post: post_author,
                        reactor,
                        reaction: {
                            type: reaction,
                            state: STATE,
                        },
                    };
                });

                if (result.reactor) {
                    await sendNotification({
                        INSTANCE_ID: c.env.PUSHER_INSTANCE_ID,
                        SECRET_KEY: c.env.PUSHER_SECRET_KEY,

                        payload: {
                            interests: [`user-${result.post?.author?.id}`],
                            web: {
                                notification: {
                                    title: `New reaction on your post`,
                                    body: `${result.reactor.username} reacted with ${result.reaction.type} to your post ${result.post?.content.slice(0, 10)}...`,
                                },
                            },
                        },
                    });
                }

                return c.json(result, 201);
            } catch (error) {
                // Handle potential transaction errors
                console.error("Transaction failed:", error);
                return c.json({ message: "An error occurred" }, 500);
            }
        }
    )
    .get(
        "/:id/comments",
        zValidator(
            "param",
            z.object({ id: z.string().transform(val => parseInt(val, 10)) })
        ),
        zValidator(
            "query",
            z.object({
                offset: z.coerce.number().min(0).optional().default(0),
                limit: z.coerce.number().min(1).max(100).optional().default(10),
            })
        ),
        async c => {
            const { id } = c.req.valid("param");
            const { db } = c.var;
            const comments = await db
                .select({
                    id: commentTable.id,
                    content: commentTable.content,
                    author: {
                        id: usersTable.id,
                        username: usersTable.username,
                        avatar: usersTable.profilePicture,
                    },
                    createdAt: commentTable.createdAt,
                    updatedAt: commentTable.updatedAt,
                })
                .from(commentTable)
                .innerJoin(usersTable, eq(commentTable.userId, usersTable.id))
                .where(eq(commentTable.postId, id));

            return c.json({
                message: `Comments for post id: ${id}`,
                data: comments,
            });
        }
    )
    .post(
        "/:postId/comments",
        zValidator(
            "param",
            z.object({ postId: z.string().transform(val => parseInt(val, 10)) })
        ),
        zValidator("json", z.object({ content: z.string().min(1) })),
        async c => {
            const { postId } = c.req.valid("param");
            const { content } = c.req.valid("json");
            const { db } = c.var;
            const userId = c.get("user").id;
            const { PUSHER_INSTANCE_ID, PUSHER_SECRET_KEY } = c.env;

            console.log("Adding comment to post:", postId, "by user:", userId);

            try {
                const result = await db.transaction(async tx => {
                    const [comment] = await tx
                        .insert(commentTable)
                        .values({
                            content,
                            postId,
                            userId,
                        })
                        .returning();

                    const [post] = await tx
                        .select({
                            id: postTable.id,
                            content: postTable.content,
                            author: {
                                id: usersTable.id,
                                username: usersTable.username,
                                avatar: usersTable.profilePicture,
                            },
                            createdAt: postTable.createdAt,
                            updatedAt: postTable.updatedAt,
                        })
                        .from(postTable)
                        .leftJoin(
                            usersTable,
                            eq(postTable.authorId, usersTable.id)
                        )
                        .where(eq(postTable.id, postId))
                        .limit(1);

                    const [commentAuthor] = await tx
                        .select({
                            id: usersTable.id,
                            username: usersTable.username,
                            avatar: usersTable.profilePicture,
                        })
                        .from(usersTable)
                        .where(eq(usersTable.id, c.get("user").id))
                        .limit(1);

                    return {
                        comment: comment,
                        post: post,
                        comment_author: commentAuthor,
                    };
                });

                if (result.comment_author) {
                    await sendNotification({
                        INSTANCE_ID: PUSHER_INSTANCE_ID,
                        SECRET_KEY: PUSHER_SECRET_KEY,

                        payload: {
                            interests: [`user-${result.post?.author?.id}`],
                            web: {
                                notification: {
                                    title: `New comment on your post`,
                                    body: `${result.comment_author.username} commented on your post.`,
                                },
                            },
                        },
                    });
                }

                return c.json(
                    { message: "Comment added", data: result.comment },
                    201
                );
            } catch (error) {
                console.error("Error adding comment:", error);

                return c.json({ message: "Error adding comment", error }, 500);
            }
        }
    );
export default postRoute;
