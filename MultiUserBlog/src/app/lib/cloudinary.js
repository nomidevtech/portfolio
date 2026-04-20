import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryUpload = async (buffer) => {
    if (!buffer) {
        throw new Error("No file provided for upload");
    }

    try {


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
            ok: true,
            url: result.secure_url,
            publicId: result.public_id,
        };

    } catch (error) {
        console.log(error);
        return { ok: false, message: `Cloudinary upload error: ${error.message ? error.message : 'some error while uploading to cloudinary'}` };
    }
};

export const cloudinaryDeleteSingle = async (publicId) => {
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
        return { ok: false, message: `Cloudinary delete error: ${error.message ? error.message : 'some error while deleting from cloudinary'}` };
    }
};

export const cloudinaryDeleteMultiple = async (publicIdsArr = []) => {
    if (!publicIdsArr || publicIdsArr.length === 0) {
        throw new Error("publicIds is required to delete multiple images");
    }

    try {
        const result = await cloudinary.api.delete_resources(publicIdsArr);

        if (!result.deleted) {
            throw new Error("Cloudinary delete failed");
        }

        return result;

    } catch (error) {
        return { ok: false, message: `Cloudinary delete error: ${error.message ? error.message : 'some error while deleting from cloudinary'}` };
    }
};

export { cloudinary };