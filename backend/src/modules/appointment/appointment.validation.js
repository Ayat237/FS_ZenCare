import Joi from "joi";
import { generalRules } from "../../utils/index.js";
import { AppointmentType } from "../../utils/enums.utils.js";

export const createAppointmentSchema = {
  body: Joi.object({
    doctorId: generalRules.id.required().messages({
      "string.pattern.base": "Doctor ID must be a valid MongoDB ObjectId",
      "any.required": "Doctor ID is required",
    }),
    patientId: generalRules.id.required().messages({
      "string.pattern.base": "Patient ID must be a valid MongoDB ObjectId",
      "any.required": "Patient ID is required",
    }),
    slotId: generalRules.id.required().messages({
      "string.pattern.base": "Slot ID must be a valid MongoDB ObjectId",
      "any.required": "Slot ID is required",
    }),
    type: Joi.string()
      .valid(...Object.values(AppointmentType))
      .required()
      .messages({
        "any.only": `Appointment type must be one of: ${Object.values(
          AppointmentType
        ).join(", ")}`,
        "any.required": "Appointment type is required",
      }),
    notes: Joi.string().max(500).optional(),
    price: Joi.number().positive().required().messages({
      "number.positive": "Price must be a positive number",
      "any.required": "Price is required",
    }),
    paymentIntentId: Joi.string().optional().messages({
      "string.base": "Payment intent ID must be a string",
    }),
  }),
};

export const getAppointmentSchema = {
  params: Joi.object({
    appointmentId: generalRules.id.required().messages({
      "string.pattern.base": "Appointment ID must be a valid MongoDB ObjectId",
      "any.required": "Appointment ID is required",
    }),
  }),
};

export const updateAppointmentSchema = {
  params: Joi.object({
    appointmentId: generalRules.id.required().messages({
      "string.pattern.base": "Appointment ID must be a valid MongoDB ObjectId",
      "any.required": "Appointment ID is required",
    }),
  }),
  body: Joi.object({
    notes: Joi.string().max(500).optional(),
    medicalHistoryShared: Joi.boolean().optional(),
    prescription: Joi.object({
      text: Joi.string().required(),
    }).optional(),
  }),
};
