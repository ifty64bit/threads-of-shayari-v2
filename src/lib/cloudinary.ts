import { Cloudinary } from "@cloudinary/url-gen";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CLOUDINARY_CLOUD_NAME } from "./env";
import { getSignature } from "./server/cloudinary";

export const getCloudinarySignature = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			folder: z.string().default("threads_of_shayari_posts"),
		}),
	)
	.handler(({ data }) => {
		return getSignature(data.folder);
	});

export const getCloudinaryUrl = (
	publicId?: string | null,
	options?: { width?: number; height?: number },
) => {
	if (publicId) {
		const cld = new Cloudinary({
			cloud: {
				cloudName: CLOUDINARY_CLOUD_NAME,
			},
		});
		const image = cld.image(publicId);
		if (options?.width || options?.height) {
			const transforms: string[] = [];
			if (options.width) transforms.push(`w_${options.width}`);
			if (options.height) transforms.push(`h_${options.height}`);
			transforms.push("c_lfill", "f_auto");
			return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transforms.join(",")}/${publicId}`;
		}
		return image.toURL();
	} else {
		return `https://placehold.co/40x40.png?text=Avatar`;
	}
};

export const uploadImages = async (files: File[]) => {
	if (files.length === 0) return [];

	const signature = await getCloudinarySignature({
		data: {
			folder: "threads_of_shayari_posts",
		},
	});

	const uploadPromises = files.map(async (image) => {
		const formData = new FormData();
		formData.append("file", image);
		formData.append("api_key", signature.apiKey as string);
		formData.append("timestamp", signature.timestamp.toString());
		formData.append("folder", signature.folder);
		formData.append("signature", signature.signature);

		const res = await fetch(
			`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
			{
				method: "POST",
				body: formData,
			},
		);

		if (!res.ok) {
			throw new Error("Failed to upload image");
		}

		const data = await res.json();
		return data.public_id as string;
	});

	return Promise.all(uploadPromises);
};
