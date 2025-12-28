import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { serverConfig } from "@/lib/server-config.ts";
import * as schema from "./schema.ts";

config();

const client = neon(serverConfig.DATABASE_URL);

export const db = drizzle(client, { schema });
