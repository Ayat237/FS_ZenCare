import cloudinaryConfig from "../config/cloudinary.config.js";
import { ErrorHandlerClass } from "./index.js";

export const uploadFile = async ({
  file,
  folder = "general",
  publicId,
  resource_type = "auto",
}) => {
  if (!file) {
    return next(
      new ErrorHandlerClass(
        "Image is required",
        400,
        "Cloudinary error",
        "Error in upload file in Cloudinary"
      )
    );
  }

  let options = { folder };
  if (publicId) {
    options.public_id = publicId;
  }

  // Detect if it's PDF or not
  const isPdf =
    (typeof file === "string" && file.endsWith(".pdf")) ||
    file?.mimetype === "application/pdf" ||
    file?.originalname?.toLowerCase().endsWith(".pdf");

  options.resource_type = resource_type;
  const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
    file,
    options
  );
  return { secure_url, public_id };
};

export const uploadToCloudinary = async (filePath, publicId) => {
  try {
    const result = await cloudinaryConfig().uploader.upload(filePath, {
      folder: "chat_attachments",
      public_id: publicId,
      resource_type: "auto", // Automatically detect file type
    });
    return result;
  } catch (error) {
    throw new ErrorHandlerClass(
      "Failed to upload to Cloudinary",
      500,
      "Cloudinary error",
      error.message
    );
  }
};
