import Joi from "joi";
import { Gender, generalRules, systemRoles } from "../../utils/index.js";

export const patientRegisterNewSchema = Joi.object({
  firstName: Joi.string().min(3).max(20).required(),
  lastName: Joi.string().min(3).max(20).required(),
  userName: Joi.string().min(3).max(20).required(),
  mobilePhone: generalRules.phoneNumber.required(),
  email: generalRules.email.required(),
  password: generalRules.password,
  confirmedPassword: Joi.string().valid(Joi.ref("password")).required(),
  role: Joi.array().items(Joi.string().valid(systemRoles.PATIENT)).required(),
  gender: Joi.string().valid(Gender.MALE, Gender.FEMALE, Gender.OTHER).required(),
  birthDate: Joi.date().required(),
  address: Joi.string().required(),
  coordinates: Joi.object({
    longitude: Joi.number().required(),
    latitude: Joi.number().required(),
  }).required(),
});

export const patientRegisterExistingSchema = Joi.object({
  email: generalRules.email.required(),
  gender: Joi.string().valid(Gender.MALE, Gender.FEMALE, Gender.OTHER).required(),
  birthDate: Joi.date().required(),
  address: Joi.string().required(),
  coordinates: Joi.object({
    longitude: Joi.number().required(),
    latitude: Joi.number().required(),
  }).required(),
});

export const deletePatientAccountSchema = {
  headers: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Authorization token is required",
      "string.base": "Token must be a string",
      "string.empty": "Token cannot be empty",
    }),
  }).unknown(),
};

export const editProfileImageSchema = {
  headers: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Authorization token is required",
      "string.base": "Token must be a string",
      "string.empty": "Token cannot be empty",
    }),
  }).unknown(),
};

export const removeProfileImageSchema = {
  headers: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Authorization token is required",
      "string.base": "Token must be a string",
    }),
  }).unknown(),
};
