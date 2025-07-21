import { createMiddleware } from "hono/factory";
import getDB from "../db";
import { type Bindings, type Variables } from "..";

const dbMiddleware = createMiddleware<{
    Bindings: Bindings;
    Variables: Variables;
}>(async (c, next) => {
    if (!c.var.db) {
        const db = getDB({
            url: c.env.TURSO_DATABASE_URL,
            authToken: c.env.TURSO_AUTH_TOKEN,
        });
        c.set("db", db);
    }

    await next();
});

export default dbMiddleware;
