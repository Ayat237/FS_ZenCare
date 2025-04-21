import Joi from "joi";
import {
  DayOfWeek,
  Frequency,
  generalRules,
  IntakeInstruction,
  MedicineType,
} from "../../utils/index.js";

export const addMedicineSchema = {
  body: Joi.object({
    medicineName: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': 'Medicine name must be a string',
      'string.empty': 'Medicine name cannot be empty',
      'string.min': 'Medicine name must be at least 1 character long',
      'string.max': 'Medicine name must not exceed 100 characters',
      'any.required': 'Medicine name is required',
      'any.unknown': 'Medicine name is not allowed',

    }),
  medicineType: Joi.string()
    .valid(...Object.values(MedicineType))
    .required()
    .messages({
      'any.only': 'Medicine type must be one of: {{#valid}}',
      'any.required': 'Medicine type is required',
      'any.unknown': 'Medicine type is not allowed',
    }),
  dose: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Dose must be a number',
      'number.integer': 'Dose must be an integer',
      'number.min': 'Dose must be at least 1',
      'any.required': 'Dose is required',
      'any.unknown': 'Dose is not allowed',
    }),
  frequency: Joi.string()
    .valid(...Object.values(Frequency))
    .required()
    .messages({
      'any.only': 'Frequency must be one of: {{#valid}}',
      'any.required': 'Frequency is required',
      'any.unknown': 'Frequency is not allowed',
    }),
  timesPerDay: Joi.number()
    .integer()
    .min(1)
    .when("frequency", { is: Frequency.DAILY, then: Joi.required() })
    .messages({
      'number.base': 'Times per day must be a number',
      'number.integer': 'Times per day must be an integer',
      'number.min': 'Times per day must be at least 1',
      'any.required': 'Times per day is required when frequency is DAILY',
      'any.unknown': 'Times per day is not allowed when frequency is not DAILY',
    }),
  daysOfWeek: Joi.array()
    .items(Joi.string().valid(...Object.values(DayOfWeek)))
    .when("frequency", { is: Frequency.WEEKLY, then: Joi.required() }).messages({
      'array.base': 'Days of week must be an array',
      'array.includes': 'Days of week must contain valid days: {{#valid}}',
      'any.required': 'Days of week is required when frequency is WEEKLY',
      'any.unknown': 'Days of week is not allowed when frequency is not WEEKLY',
    }),
  startHour: Joi.number().min(0).max(23).required()
    .messages({
      'number.base': 'Start hour must be a number',
      'number.min': 'Start hour must be at least 0',
      'number.max': 'Start hour must not exceed 23',
      'any.required': 'Start hour is required',
      'any.unknown': 'Start hour is not allowed',
    }),
  startDateTime: generalRules.startDate.required()
    .messages({
      'string.isoDate': 'Start date-time must be a valid ISO date string (e.g., 2025-04-15T08:00:00Z)',
      'any.required': 'Start date-time is required',
      'any.unknown': 'Start date-time is not allowed',
    }).required(),
  endDateTime: generalRules.endDate.required()
    .messages({
      'string.isoDate': 'End date-time must be a valid ISO date string (e.g., 2025-04-15T20:00:00Z)',
      'any.required': 'End date-time is required when start date-time is provided',
      'any.unknown': 'End date-time is not allowed without start date-time',
      'date.greater': 'End date-time must be greater than start date-time',
    }).required(),
  intakeInstructions: Joi.string()
    .valid(...Object.values(IntakeInstruction))
    .required()
    .messages({
      'any.only': 'Intake instructions must be one of: {{#valid}}',
      'any.required': 'Intake instructions are required',
      'any.unknown': 'Intake instructions are not allowed',
    })
    ,
  notes: Joi.string().allow("").trim().max(500).optional()
    .messages({
      'string.base': 'Notes must be a string',
      'string.max': 'Notes must not exceed 500 characters',
      'any.required': 'Notes are required',
      'any.unknown': 'Notes are not allowed',
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
    .optional().
    messages({
      'array.base': 'Reminders must be an array',
      'array.includes': 'Reminders must contain valid reminder objects',
      'any.required': 'Reminders are required',
      'any.unknown': 'Reminders are not allowed',
    })
  }),
};
//=============================================================================
export const updateMedicineSchema = {
  params: Joi.object({
    id: generalRules.id.messages({
      'string.objectId': 'Medication ID must be a valid MongoDB ObjectId',
      'string.base': 'Medication ID must be a string',
      'string.empty': 'Medication ID cannot be empty',
      'any.required': 'Medication ID is required',
      'any.unknown': 'Medication ID is not allowed',
    }),
  }),
  body: Joi.object({
    medicineName: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.base': 'Medicine name must be a string',
        'string.empty': 'Medicine name cannot be empty',
        'string.min': 'Medicine name must be at least 1 character long',
        'string.max': 'Medicine name must not exceed 100 characters',

      }),
    medicineType: Joi.string()
      .valid(...Object.values(MedicineType))
      .optional()
      .messages({
        'any.only': 'Medicine type must be one of: {{#valid}}',
      }),
    dose: Joi.number()
      .integer()
      .min(1)
      .optional()
      .messages({
        'number.base': 'Dose must be a number',
        'number.integer': 'Dose must be an integer',
        'number.min': 'Dose must be at least 1',
      }),
    frequency: Joi.string()
      .valid(...Object.values(Frequency))
      .optional()
      .messages({
        'any.only': 'Frequency must be one of: {{#valid}}',

      }),
    timesPerDay: Joi.number()
      .integer()
      .min(1)
      .when("frequency", { is: Frequency.DAILY, then: Joi.required() })
      .messages({
        'number.base': 'Times per day must be a number',
        'number.integer': 'Times per day must be an integer',
        'number.min': 'Times per day must be at least 1',

      }),
    daysOfWeek: Joi.array()
      .items(Joi.string().valid(...Object.values(DayOfWeek)))
      .when("frequency", { is: Frequency.WEEKLY, then: Joi.required() }).messages({
        'array.base': 'Days of week must be an array',
        'array.includes': 'Days of week must contain valid days: {{#valid}}',

      }),
    startHour: Joi.number().min(0).max(23).optional()
      .messages({
        'number.base': 'Start hour must be a number',
        'number.min': 'Start hour must be at least 0',
        'number.max': 'Start hour must not exceed 23',
      }),
    startDateTime: generalRules.startDate
      .messages({
        'string.isoDate': 'Start date-time must be a valid ISO date string (e.g., 2025-04-15)',
        'any.required': 'Start date-time is required',
        'any.unknown': 'Start date-time is not allowed',
      }),
    endDateTime: generalRules.endDate
      .messages({
        'string.isoDate': 'End date-time must be a valid ISO date string (e.g., 2025-04-15T20:00:00Z)',
        'date.greater': 'End date-time must be greater than start date-time',
        'any.required': 'End date-time is required when start date-time is provided',
        'any.unknown': 'End date-time is not allowed without start date-time',
      }),
    intakeInstructions: Joi.string()
      .valid(...Object.values(IntakeInstruction))
      .optional()
      .messages({
        'any.only': 'Intake instructions must be one of: {{#valid}}',
      })
      ,
    notes: Joi.string().allow("").trim().max(500).optional()
      .messages({
        'string.base': 'Notes must be a string',
        'string.max': 'Notes must not exceed 500 characters',
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
      .optional().
      messages({
        'array.base': 'Reminders must be an array',
        'array.includes': 'Reminders must contain valid reminder objects',
      })
  }).with(
    'startDateTime',
    'endDateTime',
  ),
};

//===========================================================================
export const getMedicationByIdSchema = {
  params: Joi.object({
    id: generalRules.id.messages({
      'string.objectId': 'Medication ID must be a valid MongoDB ObjectId',
      'string.base': 'Medication ID must be a string',
      'string.empty': 'Medication ID cannot be empty',
      'any.required': 'Medication ID is required',
      'any.unknown': 'Medication ID is not allowed',
    }),
  }),
};


//=============================================================================
export const updateMedicationStatusSchema = {
  params: Joi.object({
    medicationId: generalRules.id.messages({
      'string.objectId': 'medicationId must be a valid MongoDB ObjectId',
      'string.base': 'medicationId must be a string',
      'string.empty': 'Medication ID cannot be empty',
      'any.required': 'Medication ID is required',
      'any.unknown': 'Medication ID is not allowed',
    }),
  }),
  body: Joi.object({
      reminderIndex: Joi.number()
      .integer().required().messages({
        'number.base': 'Reminder index must be a number',
        'number.integer': 'Reminder index must be an integer',
        'any.required': 'Reminder index is required',
        'any.unknown': 'Reminder index is not allowed',
      })
  }),
};

//=============================================================================
export const deleteMedicationSchema = {
  params: Joi.object({
    medicationId: generalRules.id.messages({
      'string.objectId': 'medicationId must be a valid MongoDB ObjectId',
      'string.base': 'Medication ID must be a string',
      'string.empty': 'Medication ID cannot be empty',
      'any.required': 'Medication ID is required',
      'any.unknown': 'Medication ID is not allowed',
    }),
  }),
};