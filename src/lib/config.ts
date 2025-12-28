// Centralized configuration for app branding and settings
// Client-side config (uses import.meta.env)

export const config = {
	APP_NAME: import.meta.env.VITE_APP_NAME,
	BRAND_NAME: import.meta.env.VITE_BRAND_NAME,
} as const;
