import z from "zod";

export const newAudioPresetSchema = z.object({
	displayName: z.string().min(3, "Display name must be at least 3 characters"),
	audio: z.union([z.string().min(3), z.instanceof(File)], {
		required_error: "Please select an audio file",
	}),
	isPublic: z.boolean(),
});

export type NewAudioPresetSchema = z.infer<typeof newAudioPresetSchema>;
