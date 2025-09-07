import { ErrorHandlerClass } from "../utils/index.js";

const reqKeys = ["body", "headers", "query", "params", "file", "files"];

export const validation = (schema) => {
  return (req, res, next) => {
    const validationErrors = [];
    for (const key of reqKeys) {
      if (schema[key]) {
        // Check if schema[key] exists before validating
        const validationResult = schema[key].validate(req[key], {
          abortEarly: false,
        });
        if (validationResult?.error) {
          validationErrors.push(...validationResult.error.details);
        }
      }
    }
    if (validationErrors.length) {
      return next(
        new ErrorHandlerClass("Validation Error", 400, validationErrors)
      );
    }
    next();
  };
};
