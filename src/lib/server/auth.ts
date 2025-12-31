import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession, username } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/data/db";
import * as schema from "@/data/db/schema";

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
		customSession(async ({ user, session }) => {
			const dbUser = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, Number(user.id)),
				columns: { isAdmin: true },
			});

			return {
				user: {
					...user,
					isAdmin: dbUser?.isAdmin ?? false,
				},
				session,
			};
		}),
	],
	user: {
		additionalFields: {
			isAdmin: {
				type: "boolean",
				defaultValue: false,
				input: false,
			},
		},
	},
	advanced: {
		database: {
			generateId: false,
		},
	},
});
