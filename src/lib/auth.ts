import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/db";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		usePlural: true,
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [username(), tanstackStartCookies()],
	user: {
		additionalFields: {
			username: { type: "string", required: true },
		},
	},
	advanced: {
		database: {
			generateId: false,
		},
	},
});
