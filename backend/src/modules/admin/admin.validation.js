import Joi from "joi";
import { generalRules } from "../../utils/index.js";

export const adminLoginSchema = Joi.object({
  email: generalRules.email.required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required"
  }),
  password: generalRules.password.required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required"
  })
});

export const verifyDoctorSchema = Joi.object({
  doctorId: generalRules.id.required().messages({
    "string.base": "Doctor ID must be a string",
    "any.required": "Doctor ID is required"
  })
}).unknown(true); 