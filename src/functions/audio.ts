import { createServerFn } from "@tanstack/react-start";
import { count, desc, eq, ilike } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { audioPresets } from "@/db/schema";
import { newAudioPresetSchema } from "@/lib/schemas/audio";
import { adminMiddleware, authMiddleware } from "@/middleware/auth";

export const addNewAudioPreset = createServerFn({ method: "POST" })
	.middleware([adminMiddleware])
	.inputValidator(newAudioPresetSchema)
	.handler(async ({ data }) => {
		if (data.audio instanceof File) {
			throw new Error("Audio is not a string");
		}

		await db.insert(audioPresets).values({
			displayName: data.displayName,
			isPublic: data.isPublic,
			url: data.audio,
		});
		return true;
	});

export const getAudioPresetsforUsers = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			search: z.string().optional(),
			cursor: z.number().optional(),
			limit: z.number().optional().default(10),
		}),
	)
	.handler(async ({ data }) => {
		const presets = await db.query.audioPresets.findMany({
			columns: {
				id: true,
				displayName: true,
				url: true,
			},
			where: (fields, { and, ilike, lt, eq }) =>
				and(
					data.search
						? ilike(fields.displayName, `%${data.search}%`)
						: undefined,
					eq(fields.isPublic, true),
					data.cursor ? lt(fields.id, data.cursor) : undefined,
				),
			orderBy: (fields, { desc }) => [desc(fields.id)],
			limit: data.limit + 1,
		});

		let nextCursor: number | null = null;
		if (presets.length > data.limit) {
			const nextItem = presets.pop();
			if (nextItem) {
				nextCursor = nextItem.id;
			}
		}

		return {
			data: presets,
			nextCursor,
		};
	});

export const getAudioPresetsforAdmin = createServerFn({ method: "GET" })
	.middleware([adminMiddleware])
	.inputValidator(
		z.object({
			limit: z.number().optional().default(10),
			offset: z.number().optional().default(0),
			search: z.string().optional(),
		}),
	)
	.handler(async ({ data }) => {
		const whereClause = data.search
			? ilike(audioPresets.displayName, `%${data.search}%`)
			: undefined;

		const [presets, totalResult] = await Promise.all([
			db
				.select()
				.from(audioPresets)
				.limit(data.limit)
				.offset(data.offset)
				.where(whereClause)
				.orderBy(desc(audioPresets.createdAt)),
			db.select({ count: count() }).from(audioPresets).where(whereClause),
		]);

		return {
			presets,
			total: totalResult[0]?.count ?? 0,
		};
	});

export const updateAudioPreset = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			id: z.number(),
			data: z.object({
				displayName: z.string().optional(),
				isPublic: z.boolean().optional(),
			}),
		}),
	)
	.middleware([adminMiddleware])
	.handler(async ({ data }) => {
		const result = await db
			.update(audioPresets)
			.set(data.data)
			.where(eq(audioPresets.id, data.id))
			.returning();
		return result[0];
	});
