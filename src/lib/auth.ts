import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		usePlural: true,
		schema,
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [
		username({
			usernameNormalization: false,
			schema: {
				user: {
					fields: {
						displayUsername: "username",
					},
				},
			},
		}),
		tanstackStartCookies(),
	],
	advanced: {
		database: {
			generateId: false,
		},
	},
});
