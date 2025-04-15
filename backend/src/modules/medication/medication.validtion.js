import Joi from "joi";
import {
  DayOfWeek,
  Frequency,
  generalRules,
  IntakeInstructionEnum,
  MedicineType,
} from "../../utils/index.js";

export const addMedicineSchema = {
  body: Joi.object({
    medicineName: Joi.string().required(),
    medicineType: Joi.string()
      .valid(...Object.values(MedicineType))
      .required(),
    dose: Joi.number().min(1).required(),
    frequency: Joi.string()
      .valid(...Object.values(Frequency))
      .required(),
    timesPerDay: Joi.number()
      .min(1)
      .when("frequency", { is: Frequency.DAILY, then: Joi.required() }),
    daysOfWeek: Joi.array()
      .items(Joi.string().valid(...Object.values(DayOfWeek)))
      .when("frequency", { is: Frequency.WEEKLY, then: Joi.required() }),
    startHour: Joi.number().min(0).max(23).required(),
    startDateTime: generalRules.startDate,
    endDateTime: generalRules.endDate,
    intakeInstructions: Joi.string()
      .valid(...Object.values(IntakeInstructionEnum))
      .required(),
    notes: Joi.string().allow("").optional(),
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
      .optional(),
  }),
};
