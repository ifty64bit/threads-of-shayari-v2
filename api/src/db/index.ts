import { drizzle } from "drizzle-orm/neon-serverless";

function getDB(NEON_DATABASE_URL: string) {
    return drizzle(NEON_DATABASE_URL);
}

export default getDB;
