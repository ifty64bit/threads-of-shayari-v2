import {
	boolean,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { timestamps } from "./columns.helpers";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	username: text("username").notNull().unique(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	...timestamps,
});

export const sessions = pgTable("sessions", {
	id: serial("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	ipAddress: text("ip_address").notNull(),
	userAgent: text("user_agent").notNull(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	...timestamps,
});

export const accounts = pgTable("accounts", {
	id: serial("id").primaryKey(),
	accountId: text("account_id").notNull().unique(),
	providerId: text("provider_id").notNull(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	accessToken: text("access_token").notNull(),
	refreshToken: text("refresh_token").notNull(),
	idToken: text("id_token").notNull(),
	accessTokenExpiresAt: timestamp("access_token_expires_at").notNull(),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at").notNull(),
	scope: text("scope"),
	password: text("password"),
	...timestamps,
});

export const verifications = pgTable("verifications", {
	id: serial("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	...timestamps,
});
