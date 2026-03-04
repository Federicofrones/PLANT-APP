import imageCompression from "browser-image-compression";

export const processImage = async (file: File) => {
    const optionsFull = {
        maxSizeMB: 0.8, // Slightly higher for Cloudinary as it handles optimization
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: "image/webp",
    };

    try {
        const fullFile = await imageCompression(file, optionsFull);
        return { fullFile };
    } catch (error) {
        console.error("Image compression error:", error);
        throw error;
    }
};

/**
 * Uploads an image to Cloudinary using the Unsigned Upload API.
 */
export const uploadPlantImage = async (uid: string, plantId: string, file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary configuration missing in .env.local");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", `greenglass/users/${uid}/plants/${plantId}`);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Cloudinary upload failed");
        }

        const data = await response.json();

        // Cloudinary URL transformations for premium performance
        // q_auto: quality auto, f_auto: format auto (webp/avif), w_1400: width 1400
        const fullUrl = data.secure_url.replace("/upload/", "/upload/f_auto,q_auto,w_1400/");

        // Thumb version: Square crop, auto face/center, width 450
        const thumbUrl = data.secure_url.replace("/upload/", "/upload/f_auto,q_auto,w_450,c_fill,g_auto/");

        return { fullUrl, thumbUrl, publicId: data.public_id };
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
};

export const deletePlantImages = async (_uid: string, _plantId: string) => {
    // Client-side deletion in Cloudinary is not recommended without a backend/signing.
    // We leave this documented: To delete, you'd usually use a Server Action and Cloudinary's Admin API.
    console.log("Delete plant hook called. Manual Cloudinary cleanup required or use a Server Action.");
};
