import {
    postTable,
    REACTION_TYPES,
    reactionTable,
    usersTable,
} from "../db/schemas";
import authMiddleware from "@/middlewares/auth";
import dbMiddleware from "@/middlewares/db";
import { type Bindings, type Variables } from "..";
import { zValidator } from "@hono/zod-validator";
import { desc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import z from "zod/v4";
import { alias } from "drizzle-orm/pg-core";

const userRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>()
    .use(authMiddleware)
    .use(dbMiddleware)
    .get(
        "/:username",
        zValidator(
            "param",
            z.object({
                username: z.string().min(2).max(100),
            })
        ),
        async c => {
            const { username } = c.req.valid("param");
            const { db } = c.var;
            const [user] = await db
                .select({
                    id: usersTable.id,
                    username: usersTable.username,
                    email: usersTable.email,
                    profilePicture: usersTable.profilePicture,
                    coverPicture: usersTable.coverPicture,
                    createdAt: usersTable.createdAt,
                    updatedAt: usersTable.updatedAt,
                })
                .from(usersTable)
                .where(eq(usersTable.username, username))
                .limit(1);

            if (!user) {
                return c.json({ message: "User not found" }, 404);
            }

            return c.json({ message: "User found", data: user }, 200);
        }
    )
    .get(
        "/:username/posts",
        zValidator("param", z.object({ username: z.string().min(3).max(100) })),
        zValidator(
            "query",
            z.object({
                offset: z.coerce.number().min(0).optional().default(0),
                limit: z.coerce.number().min(1).max(100).optional().default(10),
            })
        ),
        async c => {
            const { db } = c.var;
            const { username } = c.req.valid("param");
            const { offset, limit } = c.req.valid("query");

            const reactionUsers = alias(usersTable, "reactionUsers");

            // # Todo: Implement transaction to ensure atomicity
            const [user] = await db
                .select({
                    id: usersTable.id,
                    username: usersTable.username,
                    profilePicture: usersTable.profilePicture,
                })
                .from(usersTable)
                .where(eq(usersTable.username, username))
                .limit(1);

            if (!user) {
                return c.json({ message: "User not found" }, 404);
            }

            const posts = await db
                .select({
                    id: postTable.id,
                    content: postTable.content,
                    createdAt: postTable.createdAt,
                    updatedAt: postTable.updatedAt,
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
                    >`COALESCE(
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
                                    'avatar', ${reactionUsers.profilePicture})
                                    )
                                ELSE NULL
                                    END
                                ORDER BY ${reactionTable.createdAt} DESC
                                ) FILTER (WHERE ${reactionTable.id} IS NOT NULL),
                                ARRAY[]::json[]
                                )`.as("reactions"),
                })
                .from(postTable)
                .where(eq(postTable.authorId, user.id))
                .innerJoin(
                    reactionTable,
                    eq(postTable.id, reactionTable.postId)
                )
                .innerJoin(
                    reactionUsers,
                    eq(reactionTable.userId, reactionUsers.id)
                )
                .groupBy(
                    postTable.id,
                    postTable.content,
                    postTable.createdAt,
                    postTable.updatedAt
                )
                .offset(offset)
                .limit(limit)
                .orderBy(desc(postTable.createdAt));

            return c.json(
                {
                    message: "User posts found",
                    data: posts,
                },
                200
            );
        }
    );

export default userRoute;
