function toHex(buffer: ArrayBuffer): string {
    return [...new Uint8Array(buffer)]
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

export async function getCloudinarySignature({
    apiSecret,
}: {
    apiSecret: string;
}) {
    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `timestamp=${timestamp}&upload_preset=threads-of-shayari`;

    const encoder = new TextEncoder();
    const data = encoder.encode(stringToSign + apiSecret);

    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const signature = toHex(hashBuffer); // ✅ This gives the same hex result as Cloudinary
    return {
        timestamp,
        signature,
    };
}
