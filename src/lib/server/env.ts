import { createServerOnlyFn } from "@tanstack/react-start";

const getEnv = (key: string) => {
	return createServerOnlyFn(() => {
		const value = process.env[key];
		if (!value) {
			throw new Error(`${key} is not defined`);
		}
		return value;
	})();
};

const DATABASE_URL = getEnv("DATABASE_URL");
const CLOUDINARY_API_SECRET = getEnv("CLOUDINARY_API_SECRET");

export { DATABASE_URL, CLOUDINARY_API_SECRET };
