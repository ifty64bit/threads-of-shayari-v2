import { createServerFn } from "@tanstack/react-start";
import { z } from "zod/v3";
import { getSignature } from "./server/cloudinary";

export const getCloudinarySignature = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			folder: z.string().optional(),
		}),
	)
	.handler(({ data }) => {
		return getSignature(data.folder);
	});

export const getCloudinaryUrl = (publicId: string) => {
	return `https://res.cloudinary.com/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
};
