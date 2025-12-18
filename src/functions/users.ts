import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { db } from "@/db";
import { auth } from "@/lib/server/auth";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await auth.api.getSession({
			headers: getRequest().headers,
		});
		if (session) {
			const user = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, Number(session.user.id)),
			});
			return user;
		}
		return null;
	},
);
