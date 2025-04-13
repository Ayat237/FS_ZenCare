import Joi from "joi";
import { generalRules, possibleRoles, systemRoles } from "../../utils/index.js";

export const loginSchema = {
  body: Joi.object({
    email: generalRules.email.messages({
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
    }),
    password: generalRules.password.messages({
      "any.required": "Password is required",
    }),
  }).with("email", "password"),
};

export const selectRoleSchema = {
  body: Joi.object({
    selectedRole: Joi.string()
      .valid(possibleRoles.PATIENT, possibleRoles.DOCTOR)
      .required()
      .messages({
        "any.only": `Selected role must be one of ${possibleRoles.PATIENT}, ${possibleRoles.DOCTOR}`,
        "any.required": "SelectedRole is required",
      }),
  }),
  params: Joi.object({
    userId: generalRules.id.messages({
      "string.pattern.base": "User ID must be a valid MongoDB ObjectId",
      "any.required": "User ID is required",
    }),
  }),
};
