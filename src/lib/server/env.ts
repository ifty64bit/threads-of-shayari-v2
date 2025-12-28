import { createServerOnlyFn } from "@tanstack/react-start";

export const getEnv = (key: string) => {
	return createServerOnlyFn(() => {
		const value = process.env[key];
		if (!value) {
			throw new Error(`${key} is not defined`);
		}
		return value;
	})();
};
