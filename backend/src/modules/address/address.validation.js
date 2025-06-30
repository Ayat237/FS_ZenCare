import Joi from "joi";
import { generalRules, objectIdValidation } from "../../utils/index.js";

export const createAddressSchema = {
  body: Joi.object({
    patientId:Joi.custom(objectIdValidation).optional().messages({
      "any.invalid": "Patient ID must be a valid MongoDB ObjectId",
    }),
    doctorId: Joi.custom(objectIdValidation).optional().messages({
      "any.invalid": "Doctor ID must be a valid MongoDB ObjectId",
    }),
    street: Joi.string().min(3).max(100).required().messages({
      "string.min": "Street must be at least 3 characters long",
      "string.max": "Street cannot exceed 100 characters",
      "any.required": "Street is required",
    }),
    city: Joi.string().min(2).max(50).required().messages({
      "string.min": "City must be at least 2 characters long",
      "string.max": "City cannot exceed 50 characters",
      "any.required": "City is required",
    }),
    country: Joi.string().min(2).max(50).default("Egypt").messages({
      "string.min": "Country must be at least 2 characters long",
      "string.max": "Country cannot exceed 50 characters",
    }),
    buildingNumber: Joi.number().integer().min(1).optional().messages({
      "number.base": "Building number must be a number",
      "number.integer": "Building number must be an integer",
      "number.min": "Building number must be at least 1",
    }),
    buildingName: Joi.string().min(2).max(100).optional().messages({
      "string.min": "Building name must be at least 2 characters long",
      "string.max": "Building name cannot exceed 100 characters",
    }),
    neighborhood: Joi.string().min(2).max(100).optional().messages({
      "string.min": "Neighborhood must be at least 2 characters long",
      "string.max": "Neighborhood cannot exceed 100 characters",
    }),
    coordinates: Joi.object({
      longitude: Joi.number().min(-180).max(180).required().messages({
        "number.base": "Longitude must be a number",
        "number.min": "Longitude must be between -180 and 180",
        "number.max": "Longitude must be between -180 and 180",
        "any.required": "Longitude is required",
      }),
      latitude: Joi.number().min(-90).max(90).required().messages({
        "number.base": "Latitude must be a number",
        "number.min": "Latitude must be between -90 and 90",
        "number.max": "Latitude must be between -90 and 90",
        "any.required": "Latitude is required",
      }),
    }).required().messages({
      "any.required": "Coordinates are required",
    }),
  }).custom((value, helpers) => {
    // Custom validation to ensure either patientId or doctorId is provided, but not both
    if (!value.patientId && !value.doctorId) {
      return helpers.error("any.invalid", { 
        message: "Either patientId or doctorId is required" 
      });
    }
    if (value.patientId && value.doctorId) {
      return helpers.error("any.invalid", { 
        message: "Cannot specify both patientId and doctorId" 
      });
    }
    return value;
  }),
};

export const updateAddressSchema = {
  body: Joi.object({
    street: Joi.string().min(3).max(100).optional().messages({
      "string.min": "Street must be at least 3 characters long",
      "string.max": "Street cannot exceed 100 characters",
    }),
    city: Joi.string().min(2).max(50).optional().messages({
      "string.min": "City must be at least 2 characters long",
      "string.max": "City cannot exceed 50 characters",
    }),
    country: Joi.string().min(2).max(50).optional().messages({
      "string.min": "Country must be at least 2 characters long",
      "string.max": "Country cannot exceed 50 characters",
    }),
    buildingNumber: Joi.number().integer().min(1).optional().messages({
      "number.base": "Building number must be a number",
      "number.integer": "Building number must be an integer",
      "number.min": "Building number must be at least 1",
    }),
    buildingName: Joi.string().min(2).max(100).optional().messages({
      "string.min": "Building name must be at least 2 characters long",
      "string.max": "Building name cannot exceed 100 characters",
    }),
    neighborhood: Joi.string().min(2).max(100).optional().messages({
      "string.min": "Neighborhood must be at least 2 characters long",
      "string.max": "Neighborhood cannot exceed 100 characters",
    }),
    coordinates: Joi.object({
      longitude: Joi.number().min(-180).max(180).required().messages({
        "number.base": "Longitude must be a number",
        "number.min": "Longitude must be between -180 and 180",
        "number.max": "Longitude must be between -180 and 180",
        "any.required": "Longitude is required",
      }),
      latitude: Joi.number().min(-90).max(90).required().messages({
        "number.base": "Latitude must be a number",
        "number.min": "Latitude must be between -90 and 90",
        "number.max": "Latitude must be between -90 and 90",
        "any.required": "Latitude is required",
      }),
    }).optional(),
  }).min(1).messages({
    "object.min": "At least one field must be provided for update",
  }),
};

export const getAddressByUserSchema = {
  params: Joi.object({
    userId: Joi.string().hex().length(24).required().messages({
      "string.hex": "User ID must be a valid MongoDB ObjectId",
      "string.length": "User ID must be 24 characters long",
      "any.required": "User ID is required",
    }),
  }),
};

export const deleteAddressSchema = {
  params: Joi.object({
    userId: Joi.string().hex().length(24).required().messages({
      "string.hex": "User ID must be a valid MongoDB ObjectId",
      "string.length": "User ID must be 24 characters long",
      "any.required": "User ID is required",
    }),
  }),
};

export const findNearbyAddressesSchema = {
  query: Joi.object({
    longitude: Joi.number().min(-180).max(180).required().messages({
      "number.base": "Longitude must be a number",
      "number.min": "Longitude must be between -180 and 180",
      "number.max": "Longitude must be between -180 and 180",
      "any.required": "Longitude is required",
    }),
    latitude: Joi.number().min(-90).max(90).required().messages({
      "number.base": "Latitude must be a number",
      "number.min": "Latitude must be between -90 and 90",
      "number.max": "Latitude must be between -90 and 90",
      "any.required": "Latitude is required",
    }),
    radius: Joi.number().min(0.1).max(100).default(10).messages({
      "number.base": "Radius must be a number",
      "number.min": "Radius must be at least 0.1 km",
      "number.max": "Radius cannot exceed 100 km",
    }),
  }),
};

export const getAllAddressesSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.min": "Page must be at least 1",
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
    }),
    sortBy: Joi.string().valid("createdAt", "updatedAt", "city", "country").default("createdAt").messages({
      "any.only": "Sort by must be one of: createdAt, updatedAt, city, country",
    }),
    sortOrder: Joi.string().valid("asc", "desc").default("desc").messages({
      "any.only": "Sort order must be either 'asc' or 'desc'",
    }),
  }),
}; 