// Centralized configuration for server-side branding and settings
// Server-side config (uses process.env)

export const serverConfig = {
	APP_NAME: process.env.VITE_APP_NAME,
	BRAND_NAME: process.env.VITE_BRAND_NAME,
} as const;
