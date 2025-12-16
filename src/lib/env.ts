import { createServerOnlyFn } from "@tanstack/react-start";

export const DATABASE_URL = createServerOnlyFn(() => {
	const url = process.env.DATABASE_URL;
	if (!url) {
		throw new Error("DATABASE_URL is not defined");
	}
	return url;
})();
