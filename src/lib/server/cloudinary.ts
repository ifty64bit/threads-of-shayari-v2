import { v2 as cloudinary } from "cloudinary";
import { config } from "../config";
import { serverConfig } from "../server-config";

cloudinary.config({
	cloud_name: config.CLOUDINARY_CLOUD_NAME,
	api_key: config.CLOUDINARY_API_KEY,
	api_secret: serverConfig.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export function getSignature(folder: string = "threads_of_shayari") {
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
