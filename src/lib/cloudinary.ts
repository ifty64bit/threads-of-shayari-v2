import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CLOUDINARY_CLOUD_NAME } from "./env";
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

export const getCloudinaryUrl = (publicId?: string| null) => {
    if (publicId) {
        return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
    }
    else {
        return `https://placehold.co/40x40.png?text=Avatar`
    }
};
