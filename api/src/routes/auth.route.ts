import { Hono } from "hono";
import dbMiddleware from "../middlewares/db";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod/v4";
import { usersTable } from "../db/schemas";
import bcrypt from "bcryptjs";

// ================ Validation Schemas ================
const registerSchema = z.object({
    name: z.string().min(3, "Name is required"),
    username: z.string().min(3, "Username is required"),
    email: z
        .email({ message: "Invalid email address" })
        .min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

const loginSchema = z.object({
    email: z
        .email({ message: "Invalid email address" })
        .min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

// ================ Auth Routes ================
const authRoute = new Hono()
    .use(dbMiddleware)
    .post("/login", zValidator("json", loginSchema), async (c) => {
        const { email } = await c.req.json();

        return c.json({
            message: "Login successful",
            data: {
                email,
                // Normally you would return a token or user info here
            },
        });
    })
    .post("/register", zValidator("json", registerSchema), async (c) => {
        const { name, username, email, password } = c.req.valid("json");

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await c.var.db
            .insert(usersTable)
            .values({
                name,
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
