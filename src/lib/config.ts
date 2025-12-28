// Centralized configuration for app branding and settings
// Client-side config (uses import.meta.env)

export const config = {
	APP_NAME: import.meta.env.VITE_APP_NAME,
	BRAND_NAME: import.meta.env.VITE_BRAND_NAME,
	CLOUDINARY_CLOUD_NAME: "dx39kajoq",
	CLOUDINARY_API_KEY: "536579426252666",
} as const;
