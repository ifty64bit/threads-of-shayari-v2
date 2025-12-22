import { neon } from "@neondatabase/serverless";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { users } from "./schema";

// Load environment variables
config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	throw new Error("DATABASE_URL is not defined");
}

const client = neon(DATABASE_URL);
const db = drizzle(client, { schema });

// Create a standalone auth instance for seeding
const auth = betterAuth({
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
	],
	advanced: {
		database: {
			generateId: false,
		},
	},
});

async function seedAdmin() {
	const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
	if (!ADMIN_PASSWORD) {
		throw new Error("ADMIN_PASSWORD environment variable is not defined");
	}

	const adminData = {
		username: "overloard",
		email: "404@gmail.com",
		password: ADMIN_PASSWORD,
		name: "Admin",
	};

	console.log("🌱 Seeding admin user...");

	try {
		// Check if user already exists
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, adminData.email))
			.limit(1);

		if (existingUser.length > 0) {
			console.log("❌ Admin user already exists!");
			return;
		}

		// Use Better Auth's API to create the user with proper password hashing
		const result = await auth.api.signUpEmail({
			body: {
				name: adminData.name,
				email: adminData.email,
				password: adminData.password,
				username: adminData.username,
			},
		});

		if (!result.user) {
			throw new Error("Failed to create user");
		}

		console.log(`✅ User created with ID: ${result.user.id}`);

		// Update the user to set isAdmin = true
		await db
			.update(users)
			.set({ isAdmin: true })
			.where(eq(users.id, Number(result.user.id)));

		console.log("✅ Admin privileges granted!");
		console.log("✅ Admin account created successfully!");
		console.log(`   Username: ${adminData.username}`);
		console.log(`   Email: ${adminData.email}`);
	} catch (error) {
		console.error("❌ Error seeding admin:", error);
		throw error;
	}
}

seedAdmin()
	.then(() => {
		console.log("🎉 Seeding complete!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("Failed to seed:", error);
		process.exit(1);
	});
