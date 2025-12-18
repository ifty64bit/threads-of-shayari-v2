import { Cloudinary } from "@cloudinary/url-gen";
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

export const getCloudinaryUrl = (publicId?: string | null) => {
	if (publicId) {
		const cld = new Cloudinary({
			cloud: {
				cloudName: CLOUDINARY_CLOUD_NAME,
			},
		});
		return cld.image(publicId).toURL();
	} else {
		return `https://placehold.co/40x40.png?text=Avatar`;
	}
};
