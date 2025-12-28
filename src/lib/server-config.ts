// Centralized configuration for server-side branding and settings
// Server-side config (uses process.env)

import { getEnv } from "./server/env";

export const serverConfig = {
	APP_NAME: process.env.VITE_APP_NAME,
	BRAND_NAME: process.env.VITE_BRAND_NAME,
	DATABASE_URL: getEnv("DATABASE_URL"),
	CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),
    FIREBASE_SERVICE_ACCOUNT_JSON: getEnv("FIREBASE_SERVICE_ACCOUNT_JSON"),
} as const;
