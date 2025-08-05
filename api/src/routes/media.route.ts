import { Hono } from "hono";
import type { Bindings, Variables } from "..";
import authMiddleware from "../middlewares/auth";
import dbMiddleware from "../middlewares/db";
import { getCloudinarySignature } from "../services/media.service";

const mediaRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>()
    .use(authMiddleware)
    .use(dbMiddleware)
    .get("/signature", async c => {
        const { CLOUDINARY_API_SECRET } = c.env;
        const signature = await getCloudinarySignature({
            apiSecret: CLOUDINARY_API_SECRET,
        });

        return c.json(signature, 200);
    });

export default mediaRoute;
