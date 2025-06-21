import Joi from "joi";
import {
  Diseases,
  MedicineType,
  Frequency,
  IntakeInstruction,
  DayOfWeek,
  DiseaseType,
} from "../../utils/enums.utils.js";
import { generalRules } from "../../utils/general-rules.utils.js";

const medicationSchema = {
  medicineName: Joi.string().trim().min(1).max(100).required().messages({
    "string.base": "Medicine name must be a string",
    "string.empty": "Medicine name cannot be empty",
    "string.min": "Medicine name must be at least 1 character long",
    "string.max": "Medicine name must not exceed 100 characters",
    "any.required": "Medicine name is required",
    "any.unknown": "Medicine name is not allowed",
  }),
  drugId: Joi.string().required().messages({
    "string.base": "Drug ID must be a string",
    "string.empty": "Drug ID cannot be empty",
    "any.required": "Drug ID is required",
    "any.unknown": "Drug ID is not allowed",
  }),
  medicineType: Joi.string()
    .valid(...Object.values(MedicineType))
    .required()
    .messages({
      "any.only": "Medicine type must be one of: {{#valid}}",
      "any.required": "Medicine type is required",
      "any.unknown": "Medicine type is not allowed",
    }),
  dose: Joi.number().integer().min(1).required().messages({
    "number.base": "Dose must be a number",
    "number.integer": "Dose must be an integer",
    "number.min": "Dose must be at least 1",
    "any.required": "Dose is required",
    "any.unknown": "Dose is not allowed",
  }),
  frequency: Joi.string()
    .valid(...Object.values(Frequency))
    .required()
    .messages({
      "any.only": "Frequency must be one of: {{#valid}}",
      "any.required": "Frequency is required",
      "any.unknown": "Frequency is not allowed",
    }),
  timesPerDay: Joi.number()
    .integer()
    .min(1)
    .when("frequency", { is: Frequency.DAILY, then: Joi.required() })
    .messages({
      "number.base": "Times per day must be a number",
      "number.integer": "Times per day must be an integer",
      "number.min": "Times per day must be at least 1",
      "any.required": "Times per day is required when frequency is DAILY",
      "any.unknown": "Times per day is not allowed when frequency is not DAILY",
    }),
  daysOfWeek: Joi.array()
    .items(Joi.string().valid(...Object.values(DayOfWeek)))
    .when("frequency", { is: Frequency.WEEKLY, then: Joi.required() })
    .messages({
      "array.base": "Days of week must be an array",
      "array.includes": "Days of week must contain valid days: {{#valid}}",
      "any.required": "Days of week is required when frequency is WEEKLY",
      "any.unknown": "Days of week is not allowed when frequency is not WEEKLY",
    }),
  startHour: Joi.number().min(0).max(23).required().messages({
    "number.base": "Start hour must be a number",
    "number.min": "Start hour must be at least 0",
    "number.max": "Start hour must not exceed 23",
    "any.required": "Start hour is required",
    "any.unknown": "Start hour is not allowed",
  }),
  startDateTime: generalRules.startDate
    .required()
    .messages({
      "string.isoDate":
        "Start date-time must be a valid ISO date string (e.g., 2025-04-15T08:00:00Z)",
      "any.required": "Start date-time is required",
      "any.unknown": "Start date-time is not allowed",
    })
    .required(),
  endDateTime: generalRules.endDate
    .required()
    .messages({
      "string.isoDate":
        "End date-time must be a valid ISO date string (e.g., 2025-04-15T20:00:00Z)",
      "any.required":
        "End date-time is required when start date-time is provided",
      "any.unknown": "End date-time is not allowed without start date-time",
      "date.greater": "End date-time must be greater than start date-time",
    })
    .required(),
  intakeInstructions: Joi.string()
    .valid(...Object.values(IntakeInstruction))
    .required()
    .messages({
      "any.only": "Intake instructions must be one of: {{#valid}}",
      "any.required": "Intake instructions are required",
      "any.unknown": "Intake instructions are not allowed",
    }),
  notes: Joi.string().allow("").trim().max(500).optional().messages({
    "string.base": "Notes must be a string",
    "string.max": "Notes must not exceed 500 characters",
    "any.required": "Notes are required",
    "any.unknown": "Notes are not allowed",
  }),
  reminders: Joi.array()
    .items(
      Joi.object({
        date: Joi.string().isoDate().required(),
        time: Joi.string().required(),
        isTaken: Joi.boolean().default(false),
        takenAt: Joi.date().allow(null).default(null),
        lastResetDate: Joi.date().allow(null).default(null),
      })
    )
    .optional()
    .messages({
      "array.base": "Reminders must be an array",
      "array.includes": "Reminders must contain valid reminder objects",
      "any.required": "Reminders are required",
      "any.unknown": "Reminders are not allowed",
    }),
    hasInteractions: Joi.boolean().default(false)
    .messages({
      'boolean.base': 'Has interactions must be a boolean value'
    })
};

export const createPrescriptionSchema = {
    body: Joi.object({
        diseaseName: Joi.string()
        .valid(...Object.values(Diseases))
        .required()
        .messages({
          "string.empty": "Disease name is required",
          "any.required": "Disease name is required",
          "any.only": "Invalid disease name",
        }),
      diseaseType: Joi.string()
        .valid(...Object.values(DiseaseType))
        .required()
        .messages({
          "string.empty": "Disease type is required",
          "any.required": "Disease type is required",
          "any.only": "Invalid disease type",
        }),
      medications: Joi.array().items(medicationSchema).min(1).required().messages({
        "array.base": "Medications must be an array",
        "array.min": "At least one medication is required",
        "any.required": "Medications are required",
      }),
    })
};

export const acceptAndAddPrescriptionSchema = {
  body: Joi.object({
    diseaseName: Joi.string()
    .valid(...Object.values(Diseases))
    .required()
    .messages({
      "string.empty": "Disease name is required",
      "any.required": "Disease name is required",
      "any.only": "Invalid disease name",
    }),
  diseaseType: Joi.string()
    .valid(...Object.values(DiseaseType))
    .required()
    .messages({
      "string.empty": "Disease type is required",
      "any.required": "Disease type is required",
      "any.only": "Invalid disease type",
    }),
    medications: Joi.array()
      .items(medicationSchema)
      .min(1)
      .required()
      .messages({
        "array.base": "Medications must be an array",
        "array.min": "At least one medication is required",
        "any.required": "Medications are required",
      }),
  }),
};
