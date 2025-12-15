import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema.ts";

config();

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not defined");
}

const client = neon(process.env.DATABASE_URL);

export const db = drizzle(client, { schema });
