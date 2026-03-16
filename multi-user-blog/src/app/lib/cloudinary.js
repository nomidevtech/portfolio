import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryUpload = async (file) => {
    if (!file) {
        throw new Error("No file provided for upload");
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());

        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    { folder: "Blog-Imgs" },
                    (error, response) => {
                        if (error) reject(error);
                        else resolve(response);
                    }
                )
                .end(buffer);
        });

        if (!result?.secure_url || !result?.public_id) {
            throw new Error("Cloudinary upload failed");
        }

        return {
            url: result.secure_url,
            publicId: result.public_id,
        };

    } catch (error) {
        throw new Error(`Cloudinary upload error: ${error.message}`);
    }
};

export const cloudinaryDelete = async (publicId) => {
    if (!publicId) {
        throw new Error("publicId is required to delete an image");
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result !== "ok") {
            throw new Error("Cloudinary delete failed");
        }

        return result;

    } catch (error) {
        throw new Error(`Cloudinary delete error: ${error.message}`);
    }
};

export { cloudinary };