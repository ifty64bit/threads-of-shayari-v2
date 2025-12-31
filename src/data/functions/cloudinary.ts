import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSignature } from "@/lib/server/cloudinary";

export const getCloudinarySignature = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			folder: z.string().default("threads_of_shayari_posts"),
		}),
	)
	.handler(({ data }) => {
		return getSignature(data.folder);
	});
