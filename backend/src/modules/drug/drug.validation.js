import Joi from "joi";

// Validation schema for search drugs endpoint
export const searchDrugsSchema = {
  query: Joi.object({
    query: Joi.string().trim().min(1).max(100).required().messages({
      "string.base": "Search query must be a string",
      "string.empty": "Search query cannot be empty",
      "string.min": "Search query must be at least 1 character long",
      "string.max": "Search query must not exceed 100 characters",
      "any.required": "Search query is required",
    }),
  }),
};