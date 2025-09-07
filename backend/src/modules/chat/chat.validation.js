import Joi from "joi";

export const sendMessageSchema = {
  body: Joi.object({
    messages: Joi.array()
      .items(Joi.string().required())
      .min(1)
      .required()
      .messages({
        "array.min": "At least one message is required",
        "any.required": "Messages array is required",
      }),
    reasoning: Joi.boolean().default(false),
    chat_id: Joi.string().optional().allow(null, ""),
  }).required(),
};

export const uploadFileSchema = {
  file: Joi.any().required(), // File validation is handled by multer
};
