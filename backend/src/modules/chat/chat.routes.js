import { Router } from "express";
import { multerHost } from "../../middlewares/multer.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import extensions from "../../utils/file-extenstions.utils.js";
import * as chatController from "./chat.controller.js";
import * as chatValidation from "./chat.validation.js";

const chatRouter = Router();

// Chat endpoint - send messages with optional attachments
chatRouter.post(
  "/",
  validation(chatValidation.sendMessageSchema),
  chatController.sendMessage
);

// Upload endpoint for chat attachments
chatRouter.post(
  "/upload",
  multerHost({
    allowedExtensions: [
      ...extensions.Images,
      ...extensions.Documents,
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/csv",
    ],
  }).single("file"),
  chatController.uploadFile
);

export { chatRouter };
