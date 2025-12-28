import cloudinary from "./clouldnary.config";

interface UploadMetadata {
  description: string;
  crop: string; // e.g. "Sugarcane"
  diagnosis?: string; // e.g. "Rust"
  district?: string; // e.g. "Kolhapur"
  userId: string;
}

export const uploadImage = async (
  imageBase64: string,
  publicId: string,
  meta: UploadMetadata,
) => {
  // We filter out undefined values so we don't get "undefined" tags
  const tags = [
    "cropia_scan", // Global tag for all app images
    meta.crop, // "Sugarcane"
    meta.diagnosis, // "Rust" (if exists)
    meta.district, // "Kolhapur" (if exists)
  ].filter(Boolean) as string[];

  // 2. Upload
  const result = await cloudinary.uploader.upload(imageBase64, {
    folder: "cropia-scans",
    public_id: publicId,

    // A. TAGS: Allow you to search "Show me Sugarcane in Kolhapur" in Cloudinary UI
    tags: tags,

    // B. CONTEXT: Key-Value pairs for specific details
    // Note: This often acts as a "Backup Database" attached to the image
    context: {
      description: meta.description,
      uploader_id: meta.userId,
      alt: `Cropia Scan of ${meta.crop} - ${meta.diagnosis || "Pending"}`,
    },
  });

  return result;
};

export const uploadProfileImage = async (
  imageBase64: string,
  userId: string,
) => {
  const result = await cloudinary.uploader.upload(imageBase64, {
    folder: "user-profiles",
    public_id: `profile_${userId}`,
    tags: ["user_profile"],
    context: {
      uploader_id: userId,
    },
  });
  console.log("result from uploadImage", result);
  return result;
};
