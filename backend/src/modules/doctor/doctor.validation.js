import Joi from "joi";
import {
  generalRules,
  Gender,
  possibleRoles,
  systemRoles,
} from "../../utils/index.js";
import { Specialties } from "../../utils/enums.utils.js";

const addressSchema = Joi.object({
  displayName: Joi.string().min(2).max(100).required(),
  coordinates: Joi.object({
    longitude: Joi.number().min(-180).max(180).required(),
    latitude: Joi.number().min(-90).max(90).required(),
  }).required(),
});

export const doctorRegisterNewSchema = Joi.object({
  firstName: Joi.string().min(3).max(20).required(),
  lastName: Joi.string().min(3).max(20).required(),
  userName: Joi.string().min(3).max(20).required(),
  email: generalRules.email.required(),
  password: generalRules.password,
  confirmedPassword: Joi.string().valid(Joi.ref("password")).required(),
  mobilePhone: generalRules.phoneNumber.required(),
  role: Joi.array().items(Joi.string().valid(systemRoles.DOCTOR)).required(),
  gender: Joi.string()
    .valid(Gender.MALE, Gender.FEMALE, Gender.OTHER)
    .required(),
  specialty: Joi.string()
    .valid(...Object.values(Specialties))
    .required(),
  yearsOfExperience: Joi.number().min(0).max(60).required(),
  education: Joi.array()
    .items(
      Joi.object({
        degree: Joi.string().required(),
        institution: Joi.string().required(),
        graduationYear: Joi.number()
          .min(1900)
          .max(new Date().getFullYear())
          .required(),
      })
    )
    .min(1)
    .required(),
  certifications: Joi.array().items(Joi.string()),
  hospitalAffiliation: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
  clinicBranches: Joi.array()
    .items(
      Joi.object({
        address: addressSchema.required(),
        phoneNumber: generalRules.phoneNumber.required(),
      })
    )
    .min(1)
    .required(),
});

export const doctorRegisterExistingSchema = Joi.object({
  email: generalRules.email.required(),
  gender: Joi.string()
    .valid(Gender.MALE, Gender.FEMALE, Gender.OTHER)
    .required(),
  specialty: Joi.string()
    .valid(...Object.values(Specialties))
    .required(),
  yearsOfExperience: Joi.number().min(0).max(60).required(),
  education: Joi.array()
    .items(
      Joi.object({
        degree: Joi.string().required(),
        institution: Joi.string().required(),
        graduationYear: Joi.number()
          .min(1900)
          .max(new Date().getFullYear())
          .required(),
      })
    )
    .min(1)
    .required(),
  certifications: Joi.array().items(Joi.string()),
  hospitalAffiliation: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
  clinicBranches: Joi.array().items(
    Joi.object({
      address: addressSchema.required(),
      phoneNumber: generalRules.phoneNumber.required(),
    })
  ).min(1).required(),
});

export const verifyDoctorEmailSchema = {
  body: Joi.object({
    email: generalRules.email.required(),
    otp: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required(),
  }),
};

export const adminApproveDoctorSchema = {
  params: Joi.object({
    doctorId: Joi.string().length(24).required(),
  }),
  body: Joi.object({
    isVerified: Joi.boolean().required(),
  }),
};

export const updateDoctorProfileSchema = {
  body: Joi.object({
    firstName: Joi.string().min(3).max(20).optional(),
    lastName: Joi.string().min(3).max(20).optional(),
    mobilePhone: generalRules.phoneNumber.optional(),
    specialty: Joi.string()
      .valid(...Object.values(Specialties))
      .optional(),
    yearsOfExperience: Joi.number().min(0).max(60).optional(),
    education: Joi.array()
      .items(
        Joi.object({
          degree: Joi.string().required(),
          institution: Joi.string().required(),
          graduationYear: Joi.number()
            .min(1900)
            .max(new Date().getFullYear())
            .required(),
        })
      )
      .min(1)
      .optional(),
    certifications: Joi.array().items(Joi.string()).optional(),
    hospitalAffiliation: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
        })
      )
      .min(1)
      .optional(),
    clinicBranches: Joi.array()
      .items(
        Joi.object({
          address: addressSchema.required(),
          phoneNumber: generalRules.phoneNumber.required(),
        })
      )
      .min(1)
      .optional(),
  }),
};

export const updateProfileImageSchema = {
  body: Joi.object({
    profileImage: Joi.any().required(), // file validation handled by multer
  }),
};
