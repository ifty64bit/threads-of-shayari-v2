import { Hono } from "hono";
import authRoute from "./routes/auth.route";
import { type LibSQLDatabase } from "drizzle-orm/libsql";
import postRoute from "./routes/post.route";

export type Bindings = {
    TURSO_DATABASE_URL: string;
    TURSO_AUTH_TOKEN: string;
    JWT_SECRET: string;
};

export type Variables = {
    db: LibSQLDatabase;
    user?: { email: string; id: number };
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()
    .basePath("/api")
    .get("/", (c) => {
        return c.text("Hello Hono!");
    })
    .get("/health", (c) => {
        return c.json({ status: "ok" });
    })
    .route("/", authRoute)
    .route("/posts", postRoute);

export default app;
export type APIType = typeof app;
