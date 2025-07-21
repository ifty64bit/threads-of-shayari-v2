import { Hono } from "hono";
import authRoute from "./routes/auth.route";
import { type LibSQLDatabase } from "drizzle-orm/libsql";

export type Bindings = {
    TURSO_DATABASE_URL: string;
    TURSO_AUTH_TOKEN: string;
};

export type Variables = {
    db: LibSQLDatabase;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()
    .basePath("/api")
    .get("/health", (c) => {
        return c.json({ status: "ok" });
    })
    .route("/", authRoute)
    .get("/", (c) => {
        return c.text("Hello Hono!");
    });

export default app;
export type APIType = typeof app;
