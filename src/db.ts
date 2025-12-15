import { neon } from "@neondatabase/serverless";

let client: ReturnType<typeof neon>;

export async function getClient() {
	if (!process.env.DATABASE_URL) {
		return undefined;
	}
	if (!client) {
		// neon() returns a tagged query function; no await needed
		client = neon(process.env.DATABASE_URL!);
	}
	return client;
}

// Re-export the Node/Postgres drizzle client for server-side use cases.
export { db } from "./db/index.ts";
