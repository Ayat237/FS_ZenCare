import Joi from "joi";
import { generalRules } from "../../utils/index.js";
import { AppointmentType } from "../../utils/enums.utils.js";

export const initializePaymentSchema = {
  body: Joi.object({
    slotId: generalRules.id.required().messages({
      "string.pattern.base": "Slot ID must be a valid MongoDB ObjectId",
      "any.required": "Slot ID is required",
    }),
    doctorId: generalRules.id.required().messages({
      "string.pattern.base": "Doctor ID must be a valid MongoDB ObjectId",
      "any.required": "Doctor ID is required",
    }),
    appointmentType: Joi.string()
      .valid(...Object.values(AppointmentType))
      .required()
      .messages({
        "any.only": `Appointment type must be one of: ${Object.values(
          AppointmentType
        ).join(", ")}`,
        "any.required": "Appointment type is required",
      }),
    notes: Joi.string().max(500).optional(),
  }),
};

export const completeBookingSchema = {
  body: Joi.object({
    paymentIntentId: Joi.string().required().messages({
      "any.required": "Payment intent ID is required",
    }),
    slotId: generalRules.id.required().messages({
      "string.pattern.base": "Slot ID must be a valid MongoDB ObjectId",
      "any.required": "Slot ID is required",
    }),
    doctorId: generalRules.id.required().messages({
      "string.pattern.base": "Doctor ID must be a valid MongoDB ObjectId",
      "any.required": "Doctor ID is required",
    }),
    appointmentType: Joi.string()
      .valid(...Object.values(AppointmentType))
      .required()
      .messages({
        "any.only": `Appointment type must be one of: ${Object.values(
          AppointmentType
        ).join(", ")}`,
        "any.required": "Appointment type is required",
      }),
    notes: Joi.string().max(500).optional(),
  }),
};

export const cancelAppointmentSchema = {
  params: Joi.object({
    appointmentId: generalRules.id.required().messages({
      "string.pattern.base": "Appointment ID must be a valid MongoDB ObjectId",
      "any.required": "Appointment ID is required",
    }),
  }),
  body: Joi.object({
    reason: Joi.string().max(200).required().messages({
      "string.max": "Reason must not exceed 200 characters",
      "any.required": "Cancellation reason is required",
    }),
  }),
};

export const getPaymentStatusSchema = {
  params: Joi.object({
    appointmentId: generalRules.id.required().messages({
      "string.pattern.base": "Appointment ID must be a valid MongoDB ObjectId",
      "any.required": "Appointment ID is required",
    }),
  }),
}; 