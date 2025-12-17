import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { DATABASE_URL } from "@/lib/server/env.ts";
import * as schema from "./schema.ts";

config();

const client = neon(DATABASE_URL);

export const db = drizzle(client, { schema });
