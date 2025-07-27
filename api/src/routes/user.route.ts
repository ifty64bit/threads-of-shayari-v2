import { usersTable } from "@/db/schemas";
import authMiddleware from "@/middlewares/auth";
import dbMiddleware from "@/middlewares/db";
import { type Bindings, type Variables } from "@api";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import z from "zod/v4";

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
            const user = await db
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

            if (user.length === 0) {
                return c.json({ message: "User not found" }, 404);
            }

            return c.json({ message: "User found", data: user[0] }, 200);
        }
    );

export default userRoute;
