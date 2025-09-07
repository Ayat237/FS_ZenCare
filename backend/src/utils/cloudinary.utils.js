import cloudinaryConfig from "../config/cloudinary.config.js";
import { ErrorHandlerClass } from "./index.js";

export const uploadFile = async ({ file, folder = "general", publicId, resource_type= "auto" }) => {
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
  const isPdf = (typeof file === "string" && file.endsWith(".pdf")) || 
                (file?.mimetype === "application/pdf") || 
                (file?.originalname?.toLowerCase().endsWith(".pdf"));

  options.resource_type = resource_type;
  const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
    file,
    options
  );
  return { secure_url, public_id };
};
