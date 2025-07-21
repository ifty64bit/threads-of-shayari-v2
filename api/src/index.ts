import { Hono } from "hono";

const app = new Hono()
    .basePath("/api")
    .get("/health", (c) => {
        return c.json({ status: "ok" });
    })
    .get("/", (c) => {
        return c.text("Hello Hono!");
    });

export default app;
export type APIType = typeof app;
