import { Hono } from "hono";
import authRoute from "./routes/auth.route";

import postRoute from "./routes/post.route";
import getDB from "./db";
import userRoute from "./routes/user.route";
import mediaRoute from "./routes/media.route";

export type Bindings = {
    NEON_DATABASE_URL: string;
    JWT_SECRET: string;
    PUSHER_INSTANCE_ID: string;
    PUSHER_SECRET_KEY: string;
    PUSHER_PUBLIC_KEY: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
};

export type Variables = {
    db: ReturnType<typeof getDB>;
    user: { email: string; id: number };
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()
    .basePath("/api")
    .get("/", c => {
        return c.text("Hello Hono!");
    })
    .get("/health", c => {
        return c.json({ status: "ok" });
    })
    .route("/", authRoute)
    .route("/posts", postRoute)
    .route("/users", userRoute)
    .route("/media", mediaRoute);

export default app;
export type APIType = typeof app;
