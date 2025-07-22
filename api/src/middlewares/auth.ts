import { createMiddleware } from "hono/factory";
import { type Variables, type Bindings } from "..";
import jwt from "jsonwebtoken";

const authMiddleware = createMiddleware<{
    Bindings: Bindings;
    Variables: Variables;
}>(async (c, next) => {
    const header = c.req.header("Authorization");
    if (!header) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    const token = header.split(" ")[1];
    if (!token) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    try {
        const decoded = jwt.verify(
            token,
            c.env.JWT_SECRET || process.env.JWT_SECRET!
        ) as { email: string; id: number };
        c.set("user", decoded);
    } catch {
        return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
});

export default authMiddleware;
