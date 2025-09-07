import Joi from "joi";

// Validation schema for creating slots
export const createSlotsSchema = {
  body: Joi.object({
    doctorId: Joi.string().required().messages({
      "string.empty": "Doctor ID is required",
      "any.required": "Doctor ID is required",
    }),
    date: Joi.date().required().messages({
      "date.base": "Date must be a valid date",
      "any.required": "Date is required",
    }),
    startTime: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        "string.pattern.base": "Start time must be in HH:MM format",
        "any.required": "Start time is required",
      }),
    endTime: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        "string.pattern.base": "End time must be in HH:MM format",
        "any.required": "End time is required",
      }),
    duration: Joi.number().integer().min(1).required().messages({
      "number.base": "Duration must be a number",
      "number.integer": "Duration must be an integer",
      "number.min": "Duration must be at least 1 minute",
      "any.required": "Duration is required",
    }),
    type: Joi.string().valid("telemedicine", "inperson").required().messages({
      "string.empty": "Type is required",
      "any.only": "Type must be either 'telemedicine' or 'inperson'",
      "any.required": "Type is required",
    }),
    price: Joi.number().positive().required().messages({
      "number.base": "Price must be a number",
      "number.positive": "Price must be a positive number",
      "any.required": "Price is required",
    }),
  }),
};

// Validation schema for query parameters when getting available slots
export const getAvailableSlotsSchema = {
  query: Joi.object({
    doctorId: Joi.string().required().messages({
      "string.empty": "Doctor ID is required",
      "any.required": "Doctor ID is required",
    }),
    date: Joi.date().required().messages({
      "date.base": "Date must be a valid date",
      "any.required": "Date is required",
    }),
    type: Joi.string().valid("telemedicine", "inperson").messages({
      "string.empty": "Type cannot be empty",
      "any.only": "Type must be either 'telemedicine' or 'inperson'",
    }),
  }),
};

// Validation schema for query parameters when getting all slots for a doctor
export const getDoctorSlotsSchema = {
  query: Joi.object({
    doctorId: Joi.string().required().messages({
      "string.empty": "Doctor ID is required",
      "any.required": "Doctor ID is required",
    }),
  }),
};
