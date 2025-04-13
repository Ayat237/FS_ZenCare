import cloudinaryConfig from "../config/cloudinary.config.js";
import { ErrorHandlerCalss } from "./index.js";

export const uploadFile = async ({ file, folder = "general", publicId }) => {
  if (!file) {
    return next(
      new ErrorHandlerCalss(
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

  const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
    file,
    options
  );
  return { secure_url, public_id };
};
