import Joi from "joi";
import { Gender, generalRules, systemRoles } from "../../utils/index.js";

export const registerSchema = {
  body: Joi.object({
    firstName: Joi.string().min(3).max(10).required(),
    lastName: Joi.string().min(3).max(10).required(),
    userName: Joi.string().min(3).max(10).required(),
    mobilePhone: generalRules.phoneNumber,
    email: generalRules.email,
    password: generalRules.password,
    confirmedPassword: Joi.string().valid(Joi.ref("password")).required(),
    role: Joi.string().valid(systemRoles.PATIENT, systemRoles.DOCTOR),
    gender: Joi.string()
      .valid(Gender.MALE, Gender.FEMALE, Gender.OTHER)
      .required(),
    birthDate: Joi.date().required(),
    profileImage: Joi.object({
        URL: Joi.object({
          public_id: Joi.string().required(),
          secure_url: Joi.string().required(),
        }),
        customId: Joi.string().required(),
    }),
  }).with("password","confirmedPassword"),
};
