import { Cloudinary } from "@cloudinary/url-gen";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { config } from "./config";
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

type CloudinaryResourceType = "image" | "video" | "audio";

export const getCloudinaryUrl = (
	publicId?: string | null,
	options?: {
		type?: CloudinaryResourceType;
		width?: number;
		height?: number;
	},
) => {
	const { type = "image", width, height } = options ?? {};

	if (!publicId) {
		return type === "image"
			? "https://placehold.co/40x40.png?text=Avatar"
			: undefined;
	}

	const cld = new Cloudinary({
		cloud: {
			cloudName: config.CLOUDINARY_CLOUD_NAME,
		},
	});

	// Audio uses the video resource type in Cloudinary
	if (type === "audio" || type === "video") {
		const video = cld.video(publicId);
		return video.toURL();
	}

	// Image with optional transformations
	if (width || height) {
		const transforms: string[] = [];
		if (width) transforms.push(`w_${width}`);
		if (height) transforms.push(`h_${height}`);
		transforms.push("c_lfill", "f_auto");
		return `https://res.cloudinary.com/${config.CLOUDINARY_CLOUD_NAME}/image/upload/${transforms.join(",")}/${publicId}`;
	}

	const image = cld.image(publicId);
	return image.toURL();
};

export type UploadType = "image" | "video" | "audio";

export const uploadToCDN = async (
	files: File[],
	options: { type?: UploadType } = {},
) => {
	const { type = "image" } = options;
	if (files.length === 0) return [];

	// Audio files use "video" endpoint in Cloudinary
	const endpoint = type === "image" ? "image" : "video";
	const folder =
		type === "image" ? "threads_of_shayari_posts" : "threads_of_shayari_audio";

	const signature = await getCloudinarySignature({
		data: { folder },
	});

	const uploadPromises = files.map(async (file) => {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("api_key", signature.apiKey as string);
		formData.append("timestamp", signature.timestamp.toString());
		formData.append("folder", signature.folder);
		formData.append("signature", signature.signature);

		if (type !== "image") {
			formData.append("resource_type", "video");
		}

		const res = await fetch(
			`https://api.cloudinary.com/v1_1/${signature.cloudName}/${endpoint}/upload`,
			{
				method: "POST",
				body: formData,
			},
		);

		if (!res.ok) {
			const errorData = await res.json();
			console.error("Cloudinary upload error:", errorData);
			throw new Error(`Failed to upload ${type}`);
		}

		const data = await res.json();
		return data.public_id as string;
	});

	return Promise.all(uploadPromises);
};
