import Joi from "joi";
import { Gender, generalRules, systemRoles } from "../../utils/index.js";

export const registerSchema = {
  body: Joi.object({
    firstName: Joi.string().min(3).max(20).required().messages({
      "string.min": "First name must be at least 3 characters long",
      "string.max": "First name cannot exceed 10 characters",
      "any.required": "First name is required"
    }),
    lastName: Joi.string().min(3).max(20).required().messages({
      "string.min": "Last name must be at least 3 characters long", 
      "string.max": "Last name cannot exceed 10 characters",
      "any.required": "Last name is required"
    }),
    userName: Joi.string().min(3).max(20).required().messages({
      "string.min": "Username must be at least 3 characters long",
      "string.max": "Username cannot exceed 10 characters", 
      "any.required": "Username is required"
    }),
    mobilePhone: generalRules.phoneNumber,
    email: generalRules.email,
    password: generalRules.password.messages({
      "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      "any.required": "Password is required",
      "string.min": "Password must be at least 8 characters long",
    }),
    confirmedPassword: Joi.string().valid(Joi.ref("password")).required().messages({
      "any.only": "Confirmed password must match password",
      "any.required": "Password confirmation is required"
    }),
    role: Joi.string().valid(systemRoles.PATIENT).required().messages({
      "any.only": "Role must be PATIENT for patient registration",
      "any.required": "Role is required"
    }),
    gender: Joi.string()
      .valid(Gender.MALE, Gender.FEMALE, Gender.OTHER)
      .required()
      .messages({
        "any.only": "Gender must be MALE, FEMALE or OTHER",
        "any.required": "Gender is required"
      }),
    birthDate: Joi.date().required().messages({
      "date.base": "Birth date must be a valid date",
      "any.required": "Birth date is required"
    }),
    profileImage: Joi.object({
        URL: Joi.object({
          public_id: Joi.string().required().messages({
            "any.required": "Profile image public ID is required"
          }),
          secure_url: Joi.string().required().messages({
            "any.required": "Profile image secure URL is required"
          }),
        }),
        customId: Joi.string().required().messages({
          "any.required": "Profile image custom ID is required"
        }),
    }),
  }).with("password", "confirmedPassword"),
};

export const verifyEmailOTPSchema = {
  headers: Joi.object({
    emailtoken: Joi.string().required().messages({
      "string.base": "Email token must be a string",
      "string.empty": "Email token cannot be empty",
      "any.required": "Email token is required"
    })
  }).unknown(),
  body: Joi.object({
    otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
      "string.length": "OTP must be exactly 6 digits",
      "string.pattern.base": "OTP must contain only numbers",
      "any.required": "OTP is required"
    })
  })
};

export const deletePatientAccountSchema = {
  headers: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Authorization token is required",
      "string.base": "Token must be a string",
      "string.empty": "Token cannot be empty"
    })
  }).unknown()
};

export const editProfileImageSchema = {
  headers: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Authorization token is required",
      "string.base": "Token must be a string",
      "string.empty": "Token cannot be empty"
    })
  }).unknown(),
};

export const removeProfileImageSchema = {
  headers: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Authorization token is required",
      "string.base": "Token must be a string",      
    })
  }).unknown(),
  body: Joi.object({
    removeImage: Joi.boolean().required().messages({
      "boolean.base": "removeImage must be a boolean value",
      "any.required": "removeImage is required"
    })
  })
};
