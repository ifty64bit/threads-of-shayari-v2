import { createServerFn } from "@tanstack/react-start";
import { and, count, desc, eq, ilike } from "drizzle-orm";
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
		}),
	)
	.handler(async ({ data }) => {
		const presets = await db
			.select({
				id: audioPresets.id,
				displayName: audioPresets.displayName,
				url: audioPresets.url,
			})
			.from(audioPresets)
			.where(
				and(
					data.search
						? ilike(audioPresets.displayName, `%${data.search}%`)
						: undefined,
					eq(audioPresets.isPublic, true),
				),
			)
			.orderBy(desc(audioPresets.createdAt));
		return presets;
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
