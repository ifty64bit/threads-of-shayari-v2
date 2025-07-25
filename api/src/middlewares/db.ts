import { createMiddleware } from "hono/factory";
import getDB from "../db";
import { type Bindings, type Variables } from "..";

const dbMiddleware = createMiddleware<{
    Bindings: Bindings;
    Variables: Variables;
}>(async (c, next) => {
    if (!c.var.db) {
        const db = getDB(c.env.NEON_DATABASE_URL);
        c.set("db", db);
    }
    await next();
});

export default dbMiddleware;
