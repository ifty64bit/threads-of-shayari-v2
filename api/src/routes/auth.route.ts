import { Hono } from "hono";
import jwt from "jsonwebtoken";
import dbMiddleware from "../middlewares/db";
import { zValidator } from "@hono/zod-validator";
import { usersTable } from "../db/schemas";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { type Bindings, type Variables } from "..";
import { registerSchema, loginSchema } from "shared";

const authRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>()
    .use(dbMiddleware)
    .post("/login", zValidator("json", loginSchema), async c => {
        const { email, password } = c.req.valid("json");

        const [user] = await c.var.db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);

        if (!user) {
            return c.json({ message: "Invalid email or password" }, 401);
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return c.json({ message: "Invalid email or password" }, 401);
        }

        const token = jwt.sign(
            { email, id: user.id },
            process.env.JWT_SECRET || c.env.JWT_SECRET!
        );
        return c.json({
            message: "Login successful",
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    profile_picture: user.profilePicture,
                },
                token,
            },
        });
    })
    .post("/register", zValidator("json", registerSchema), async c => {
        const { username, email, password } = c.req.valid("json");

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await c.var.db
            .insert(usersTable)
            .values({
                username,
                email,
                password: hashedPassword,
            })
            .returning();

        return c.json({
            message: "Registration successful",
            data: result[0],
        });
    });

export default authRoute;
