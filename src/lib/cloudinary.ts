import { Cloudinary } from "@cloudinary/url-gen";
import { Resize } from "@cloudinary/url-gen/actions/resize";
import { getCloudinarySignature } from "@/functions/cloudinary";
import { config } from "./config";

type CloudinaryResourceType = "image" | "video" | "audio";

export const getCloudinaryUrl = (
	publicId?: string | null,
	options?: {
		type?: CloudinaryResourceType;
		width?: number;
		height?: number;
	},
) => {
	const { type = "image", width = 1920, height = 1080 } = options ?? {};

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
		if (width) {
			video.resize(Resize.scale().width(width));
		}
		if (height) {
			video.resize(Resize.scale().height(height));
		}
		return video.toURL();
	}

	const image = cld.image(publicId);
	if (width) {
		image.resize(Resize.scale().width(width));
	}
	if (height) {
		image.resize(Resize.scale().height(height));
	}
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
