import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import config from "./config";

type CloudinaryUploadResponse = {
    asset_id: string;
    public_id: string;
    version: number;
    version_id: string;
    signature: string;
    width: number;
    height: number;
    format: "png" | "jpg" | "jpeg" | "gif" | "webp";
    resource_type: "image";
    created_at: string;
    tags: string[];
    pages: number;
    bytes: number;
    type: "upload";
    etag: string;
    placeholder: false;
    url: string;
    secure_url: string;
    asset_folder: string;
    display_name: string;
    original_filename: string;
    api_key: string;
};

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export async function uploadFileToCloudinary(
    file: File,
    signature: { timestamp: number; signature: string }
) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("timestamp", signature.timestamp.toString());
    formData.append("signature", signature.signature);
    formData.append("upload_preset", "threads-of-shayari");
    formData.append("api_key", config.CLOUDINARY_API_KEY);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${config.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    const data = (await response.json()) as CloudinaryUploadResponse;
    return data;
}
