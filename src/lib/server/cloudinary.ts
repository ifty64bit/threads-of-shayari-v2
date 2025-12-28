import { v2 as cloudinary } from "cloudinary";
import { config } from "../config";
import { serverConfig } from "../server-config";

export { cloudinary };

export function getSignature(folder: string = "threads_of_shayari") {
	// Configure Cloudinary with server-side secret
	cloudinary.config({
		cloud_name: config.CLOUDINARY_CLOUD_NAME,
		api_key: config.CLOUDINARY_API_KEY,
		api_secret: serverConfig.CLOUDINARY_API_SECRET,
	});

	const paramsToSign = {
		timestamp: Math.floor(Date.now() / 1000),
		folder: folder,
	};

	const signature = cloudinary.utils.api_sign_request(
		paramsToSign,
		serverConfig.CLOUDINARY_API_SECRET,
	);

	return {
		signature,
		apiKey: config.CLOUDINARY_API_KEY,
		cloudName: config.CLOUDINARY_CLOUD_NAME,
		timestamp: paramsToSign.timestamp,
		folder: paramsToSign.folder,
	};
}

/**
 * Upload a base64 image to Cloudinary from server
 * Returns the public_id (with folder) for storage efficiency
 */
export async function uploadBase64Image(
	base64Data: string,
	publicId: string,
	folder: string = "og_images",
): Promise<string> {
	// Configure Cloudinary with server-side secret
	cloudinary.config({
		cloud_name: config.CLOUDINARY_CLOUD_NAME,
		api_key: config.CLOUDINARY_API_KEY,
		api_secret: serverConfig.CLOUDINARY_API_SECRET,
	});

	await cloudinary.uploader.upload(base64Data, {
		public_id: publicId,
		folder: folder,
		overwrite: true,
		resource_type: "image",
	});
	// Return folder/publicId for storage efficiency
	return `${folder}/${publicId}`;
}
