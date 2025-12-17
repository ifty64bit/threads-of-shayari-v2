import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME } from "../env";
import { CLOUDINARY_API_SECRET } from "./env";

cloudinary.config({
	cloud_name: CLOUDINARY_CLOUD_NAME,
	api_key: CLOUDINARY_API_KEY,
	api_secret: CLOUDINARY_API_SECRET,
});

export { cloudinary };

export function getSignature(folder: string = "threads_of_shayari") {
	const paramsToSign = {
		timestamp: Math.floor(Date.now() / 1000),
		folder: folder,
	};

	const signature = cloudinary.utils.api_sign_request(
		paramsToSign,
		CLOUDINARY_API_SECRET,
	);

	return {
		signature,
		apiKey: CLOUDINARY_API_KEY,
		cloudName: CLOUDINARY_CLOUD_NAME,
		timestamp: paramsToSign.timestamp,
		folder: paramsToSign.folder,
	};
}
