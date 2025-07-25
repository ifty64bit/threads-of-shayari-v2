import {
    postTable,
    REACTION_TYPES,
    reactionTable,
    usersTable,
} from "../db/schemas";
import authMiddleware from "../middlewares/auth";
import dbMiddleware from "../middlewares/db";
import { type Variables, type Bindings } from "..";
import { zValidator } from "@hono/zod-validator";
import { desc, eq, sql, inArray } from "drizzle-orm";
import { Hono } from "hono";
import z from "zod/v4";
import { createPostSchema } from "@shared";
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
                .leftJoin(usersTable, eq(postTable.authorId, usersTable.id))
                .leftJoin(reactionTable, eq(postTable.id, reactionTable.postId))
                .leftJoin(
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
                .select()
                .from(postTable)
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
    );

export default postRoute;
