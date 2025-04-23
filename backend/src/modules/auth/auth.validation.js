import Joi from "joi";
import { generalRules, possibleRoles, systemRoles } from "../../utils/index.js";

export const loginSchema = {
  body: Joi.object({
    email: generalRules.email,
    password: Joi.string().min(8).messages({
      "any.required": "Password is required",
      "string.min": "Password must be at least 8 characters long",
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
      "string.empty": "User ID cannot be empty",
      "string.objectId": "User ID must be a valid MongoDB ObjectId",
    }),
  }),
};

export const forgetPasswordSchema = {
  body: Joi.object({
    email: generalRules.email
  }),
};

export const resetPasswordSchema = {
  headers: Joi.object({
    emailtoken: Joi.string().required().messages({
      "string.base": "Email token must be a string",
      "string.empty": "Email token cannot be empty",
      "any.required": "Email token is required"
    })
  }).unknown(),
  body: Joi.object({
    newPassword: generalRules.password.messages({
      "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      "any.required": "New password is required",
      "string.min": "Password must be at least 8 characters long",
    }),
    confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
      "any.only": "Confirmed password must match new password",
      "any.required": "Password confirmation is required"
    }),
  }).with("newPassword", "confirmPassword"),
};

export const verifyPasswordOTPSchema = {
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

export const resendOtpSchema = {
  headers: Joi.object({
    emailtoken: Joi.string().required().messages({
      "string.base": "Email token must be a string",
      "string.empty": "Email token cannot be empty",
      "any.required": "Email token is required"
    })
  }).unknown()
};

export const logoutSchema = {
  headers: Joi.object({
    token: Joi.string().required().messages({
      "string.base": "Token must be a string",
      "string.empty": "Token cannot be empty",
      "any.required": "Authorization token is required"
    })
  }).unknown()
};

export const getLoggedInProfileSchema = {
  headers: Joi.object({
    token: Joi.string().required().messages({
      "string.base": "Token must be a string",
      "string.empty": "Token cannot be empty",
      "any.required": "Authorization token is required"
    })
  }).unknown(),
};

export const updateAccountSchema = {
  headers: Joi.object({
    token: Joi.string().required().messages({
      "string.base": "Token must be a string",
      "string.empty": "Token cannot be empty",
      "any.required": "Authorization token is required"
    })
  }).unknown(),
  body: Joi.object({
    firstName: Joi.string().min(3).max(20).messages({
      "string.min": "First name must be at least 3 characters long",
      "string.max": "First name cannot exceed 10 characters"
    }),
    lastName: Joi.string().min(3).max(20).messages({
      "string.min": "Last name must be at least 3 characters long",
      "string.max": "Last name cannot exceed 10 characters"
    }),
    userName: Joi.string().min(3).max(20).messages({
      "string.min": "Username must be at least 3 characters long",
      "string.max": "Username cannot exceed 10 characters"
    }),
    email:  generalRules.email,
    phoneNumber: generalRules.phoneNumber,
  })
};

export const verifyNewEmailSchema = {
  headers: Joi.object({
    token: Joi.string().required().messages({
      "string.base": "Token must be a string",
      "string.empty": "Token cannot be empty",
      "any.required": "Authorization token is required"
    })
  }).unknown(),
  body: Joi.object({
    OTP: Joi.string().length(6).pattern(/^\d+$/).required().messages({
      "string.length": "OTP must be exactly 6 digits",
      "string.pattern.base": "OTP must contain only numbers",
      "any.required": "OTP is required"
    })
  })
};

export const refreshTokenSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required().messages({
      "string.base": "Refresh token must be a string",
      "string.empty": "Refresh token cannot be empty",
      "any.required": "Refresh token is required"
    })
  })
};

export const signupWithGoogleSchema = {
  body: Joi.object({
    idToken: Joi.string().required().messages({
      "string.base": "Google ID token must be a string",
      "string.empty": "Google ID token cannot be empty",
      "any.required": "Google ID token is required"
    }),
    role: Joi.string().valid(possibleRoles.PATIENT,possibleRoles.DOCTOR).required().messages({
      "any.only": "Role must be PATIENT or DOCTOR for Google signup",
      "any.required": "Role is required"
    })
  })
};

export const loginWithGoogleSchema = {
  body: Joi.object({
    idToken: Joi.string().required().messages({
      "string.base": "Google ID token must be a string",
      "string.empty": "Google ID token cannot be empty",
      "any.required": "Google ID token is required"
    })
  })
};
