import {
    commentTable,
    postTable,
    REACTION_TYPES,
    reactionTable,
    usersTable,
} from "../db/schemas";
import authMiddleware from "@/middlewares/auth";
import dbMiddleware from "@/middlewares/db";
import { type Variables, type Bindings } from "..";
import { zValidator } from "@hono/zod-validator";
import { desc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import z from "zod/v4";
import { createPostSchema } from "shared";
import { alias } from "drizzle-orm/pg-core";

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

            const reactionUsers = alias(usersTable, "reactionUsers");
            const posts = await db
                .select({
                    id: postTable.id,
                    content: postTable.content,
                    authorId: postTable.authorId,
                    createdAt: postTable.createdAt,
                    updatedAt: postTable.updatedAt,
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
                            array_agg(
                                CASE 
                                    WHEN ${reactionTable.id} IS NOT NULL 
                                    THEN json_build_object(
                                        'id', ${reactionTable.id},
                                        'userId', ${reactionTable.userId},
                                        'type', ${reactionTable.type},
                                        'createdAt', ${reactionTable.createdAt},
                                        'user', json_build_object(
                                            'id', ${reactionUsers.id},
                                            'username', ${reactionUsers.username},
                                            'avatar', ${reactionUsers.profilePicture}
                                        )
                                    )
                                    ELSE NULL
                                END
                                ORDER BY ${reactionTable.createdAt} DESC
                            ) FILTER (WHERE ${reactionTable.id} IS NOT NULL),
                            ARRAY[]::json[]
                        )
                    `.as("reactions"),
                })
                .from(postTable)
                .innerJoin(usersTable, eq(postTable.authorId, usersTable.id))
                .innerJoin(
                    reactionTable,
                    eq(postTable.id, reactionTable.postId)
                )
                .innerJoin(
                    reactionUsers,
                    eq(reactionTable.userId, reactionUsers.id)
                )
                .groupBy(postTable.id, reactionUsers.id, usersTable.id)
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
                    reactions: sql`
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
                    // comments: sql`
                    //     COALESCE(
                    //         ARRAY_AGG(
                    //             JSON_BUILD_OBJECT(
                    //                 'id', ${commentTable.id},
                    //                 'content', ${commentTable.content},
                    //                 'createdAt', ${commentTable.createdAt},
                    //                 'updatedAt', ${commentTable.updatedAt},
                    //                 'author', JSON_BUILD_OBJECT(
                    //                     'id', ${usersTable.id},
                    //                     'username', ${usersTable.username},
                    //                     'avatar', ${usersTable.profilePicture}
                    //                 )
                    //             )
                    //         ) FILTER (WHERE ${commentTable.id} IS NOT NULL),
                    //         ARRAY[]::json[]
                    //     )`,
                    createdAt: postTable.createdAt,
                    updatedAt: postTable.updatedAt,
                })
                .from(postTable)
                .innerJoin(usersTable, eq(postTable.authorId, usersTable.id))
                .innerJoin(
                    reactionTable,
                    eq(postTable.id, reactionTable.postId)
                )
                // .leftJoin(commentTable, eq(postTable.id, commentTable.postId))
                .limit(1)
                .where(eq(postTable.id, id))
                .groupBy(postTable.id, usersTable.id);
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
            await db.delete(postTable).where(eq(postTable.id, id));
            return c.json({
                message: `Post deleted for id: ${id}`,
                data: null,
            });
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
            const post = await db
                .insert(reactionTable)
                .values({
                    postId: id,
                    userId: c.get("user").id,
                    type: reaction,
                })
                .returning();
            return c.json({ message: "Reaction added", data: post[0] }, 201);
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
            const comment = await db
                .insert(commentTable)
                .values({
                    content,
                    postId,
                    userId: c.get("user").id,
                })
                .returning();
            return c.json({ message: "Comment added", data: comment[0] }, 201);
        }
    );
export default postRoute;
