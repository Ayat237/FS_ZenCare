import mongoose, { Schema, model } from "mongoose";
import BaseModel from "./base.model.js";
import {
  DayOfWeek,
  Frequency,
  IntakeInstructionEnum,
  MedicineType,
  ReminderStatus,
} from "../../src/utils/enums.utils.js";
import { DateTime } from "luxon";

const medicationSchema = new Schema(
  {
    CreatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    medicineName: {
      type: String,
      required: true,
      trim: true,
    },
    medicineType: {
      type: String,
      enum: Object.values(MedicineType),
      required: true,
    },
    dose: {
      type: Number,
      required: true,
      min: 1,
    },
    initialQuantity: {
      type: Number,
      min: 0,
      default: 0,
    },
    quantityLeft: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },
    frequency: {
      type: String,
      enum: Object.values(Frequency),
      required: true,
    },
    timesPerDay: {
      type: Number,
      required: function () {
        return this.frequency === Frequency.DAILY;
      },
      min: 1,
      default: 1,
    },
    daysOfWeek: {
      type: [String],
      enum: Object.values(DayOfWeek),
      required: function () {
        return this.frequency === Frequency.WEEKLY;
      },
      default: [],
    },
    startHour: {
      type: Number,
      min: 0,
      max: 23,

      required: true,
    },
    startDateTime: {
      type: Date,
      required: true,
    },
    endDateTime: {
      type: Date,
      required: true,
    },
    intakeInstructions: {
      type: String,
      enum: Object.values(IntakeInstructionEnum),
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    reminders: [
      {
        date: {
          type: Date,
          required: true,
        },
        time: {
          type: String, //"12:00PM or AM"
          required: true,
        },
        isTaken: {
          type: Boolean,
          default: false,
        },
        status: {
          type: String,
          enum: Object.values(ReminderStatus),
          default: ReminderStatus.PENDING,
        },
        takenAt: {
          type: Date,
          default: null,
        },
        lastResetDate: {
          type: Date,
          default: null,
        },
      },
    ],
    missedDoses: [
      {
        reminderIndex: {
          type: Number,
          required: true,
        },
        missedAt: {
          type: Date,
          required: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// calculate total doses between start and end dates (total number of scheduled dose events)
medicationSchema.methods.calculateTotalDoses = function () {
  // convert js date to luxon date(iso), start from start of day
  const startDate = DateTime.fromJSDate(this.startDateTime, {
    zone: "UTC",
  }).startOf("day");
  const endDate = DateTime.fromJSDate(this.endDateTime, {
    zone: "UTC",
  }).startOf("day");
  let totalDoses = 0;

  if (this.frequency === Frequency.DAILY) {
    //calculate total days included the current day
    const days = endDate.diff(startDate, "days").days + 1;
    totalDoses += days * this.timesPerDay;
  } else if (this.frequency === Frequency.WEEKLY) {
    let currentDate = startDate;

    while (currentDate <= endDate) {
      const dayName = currentDate.toFormat("ccc");
      if (this.daysOfWeek.includes(dayName)) {
        totalDoses += this.timesPerDay;
      }
      //increase one day
      currentDate = currentDate.plus({ days: 1 });
    }
  } else if (this.frequency === Frequency.MONTHLY) {
    let currentDate = startDate;

    let scheduledDay = startDate.day;

    while (currentDate <= endDate) {
      if (currentDate.day === scheduledDay) {
        totalDoses += 1;
      }
      //increase one day
      currentDate = currentDate.plus({ days: 1 });
    }
  } else if (this.frequency === Frequency.AS_NEEDED) {
    totalDoses = 0;
  }

  return totalDoses;
};

//calculate doses taksn
medicationSchema.methods.calculateDosesTaken = function () {
  const dosesTaken = this.reminders.filter((reminder) => {
    reminder.status === ReminderStatus.TAKEN;
  });
  return dosesTaken.length;
};

//calculate quantityLeft
medicationSchema.methods.calculateQuantityLeft = function () {
  const totalDoses = this.calculateTotalDoses();
  //The total number of individual units of medication (capsules) prescribed for the entire duration.
  const totalQuantity = totalDoses * this.dose;
  const dosesTaken = this.calculateDosesTaken();
  const quantityTaken = dosesTaken * this.dose;
  const quantityLeft = Math.max(0, totalQuantity - quantityTaken);
  return quantityLeft;
};

medicationSchema.methods.getRemainingDosesForDay = function (
  date = new Date()
) {
  // Only applicable for Daily frequency
  if (this.frequency !== Frequency.DAILY) return 0;

  // Convert the input date to a Luxon DateTime object and set to start of the day
  const targetDay = DateTime.fromJSDate(date, { zone: "UTC" }).startOf("day");

  // Filter reminders for the target day
  const dayReminders = this.reminders.filter((reminder) =>
    DateTime.fromJSDate(reminder.date, { zone: "UTC" })
      .startOf("day")
      .equals(targetDay)
  );

  // If no reminders exist for the day, return 0 (e.g., day outside schedule)
  if (dayReminders.length === 0) return 0;

  // Use timesPerDay as the expected number of doses for the day
  const expectedDoses = this.timesPerDay || 1;

  // Count the number of non-pending reminders (TAKEN, MISSED, SKIPPED)
  const completedDoses = dayReminders.filter(
    (reminder) => reminder.status !== ReminderStatus.PENDING
  ).length;

  // Remaining doses = expected doses - completed doses
  const remainingDoses = expectedDoses - completedDoses;

  return Math.max(0, remainingDoses);
};

medicationSchema.methods.resetRemindersForDay = function (date = new Date()) {
  const targetDay = DateTime.fromJSDate(date, { zone: "UTC" }).startOf("day");
  const now = DateTime.now();

  // Only reset if the target day is done (i.e., it's before today)
  const today = now.startOf("day");
  if (!targetDay < today) return; // Do not reset if the day is not done

  // Reset reminders for the target day if they haven't been reset yet
  this.reminders.forEach((reminder) => {
    const reminderDate = DateTime.fromJSDate(reminder.date, {
      zone: "UTC",
    }).startOf("day");
    const lastReset = reminder.lastResetDate
      ? DateTime.fromJSDate(reminder.lastResetDate, { zone: "UTC" })
      : null;

    if (
      reminderDate.equals(targetDay) &&
      (!lastReset || lastReset < targetDay)
    ) {
      if (reminder.status === ReminderStatus.PENDING) {
        reminder.isTaken = false;
        reminder.takenAt = null;
        reminder.status = ReminderStatus.PENDING;
      }
      reminder.lastResetDate = targetDay.toJSDate();
    }
  });
};

// Method to check for missed doses at the end of the day
medicationSchema.methods.checkMissedDoses = function () {
  const now = DateTime.now();
  const today = now.startOf("day");

  // Find all reminders up to yesterday (exclude today since we're checking at the end of the day)
  const pastDays = this.reminders.reduce((acc, reminder, index) => {
    const reminderDate = DateTime.fromJSDate(reminder.date).startOf("day");
    if (reminderDate < today) {
      if (!acc[reminderDate.toISODate()]) {
        acc[reminderDate.toISODate()] = [];
      }
      acc[reminderDate.toISODate()].push({ reminder, index });
    }
    return acc;
  }, {});

  // For each past day, check the remaining doses
  Object.keys(pastDays).forEach((dateKey) => {
    const dayReminders = pastDays[dateKey];
    const dayDate = DateTime.fromISO(dateKey);

    // Reset reminders for the day (since the day is done)
    this.resetRemindersForDay(dayDate.toJSDate());

    // Calculate remaining doses for that day
    const remainingDoses = this.getRemainingDosesForDay(dayDate.toJSDate());

    if (remainingDoses > 0) {
      // Mark the remaining doses as missed
      let dosesToMarkAsMissed = remainingDoses;
      for (const { reminder, index } of dayReminders) {
        if (
          dosesToMarkAsMissed > 0 &&
          reminder.status === ReminderStatus.PENDING
        ) {
          reminder.status = ReminderStatus.MISSED;
          this.missedDoses.push({
            reminderIndex: index,
            missedAt: dayDate.endOf("day").toJSDate(),
          });
          dosesToMarkAsMissed--;
        }
      }
    }
  });

  this.quantityLeft = this.calculateQuantityLeft();
};

// Pre-save hook to calculate totalDoses, initialQuantity, and generate reminders
medicationSchema.pre("save", function (next) {
  const now = DateTime.now();
  // check if this new document
  if (this.isNew) {
    const startDate = DateTime.fromJSDate(this.startDateTime, {
      zone: "UTC",
    });
    const endDate = DateTime.fromJSDate(this.endDateTime, {
      zone: "UTC",
    });

    //calculate total doses
    const totalDoses = this.calculateTotalDoses();
    this.initialQuantity = totalDoses * this.dose;
    this.quantityLeft = this.initialQuantity;

    // Generate reminders
    const reminders = [];
    let currentDate = startDate.startOf("day");
    const scheduledDay = startDate.startOf("day").day;

    while (currentDate <= endDate.startOf("day")) {
      const dayName = currentDate.toFormat("ccc");

      // it determine if the reminder should be scheduled on the current date
      const shouldSchedule =
        this.frequency === Frequency.DAILY ||
        (this.frequency === Frequency.WEEKLY &&
          this.daysOfWeek.includes(dayName)) ||
        (this.frequency === Frequency.MONTHLY &&
          currentDate.day === scheduledDay);

      //If shouldSchedule is true, generate reminders for that day.
      if (shouldSchedule) {
        const timesPerDay = this.timesPerDay || 1;
        const interval = 24 / timesPerDay;
        let currentHour = this.startHour; // start from startHour

        // Generate reminders for the current date
        for (let i = 0; i < timesPerDay; i++) {
          const hour = (currentHour + i * interval) % 24;
          const time = `${hour % 12 === 0 ? 12 : hour % 12}:00${
            hour < 12 ? "AM" : "PM"
          }`;
          const reminderDate = currentDate.set({
            hour: Math.floor(hour),
            minute: 0,
          });

          // On the first day, only include reminders that are in the future
          if (currentDate.equals(startDate.startOf("day"))) {
            if (reminderDate >= now) {
              console.log(" only include reminders that are in the future");
              reminders.push({
                date: reminderDate.toJSDate(),
                time,
              });
            }
          } else {
            // For all other days, include all reminders
            reminders.push({
              date: reminderDate.toJSDate(),
              time,
              isTaken: false,
              status: ReminderStatus.PENDING,
              takenAt: null,
              lastResetDate: null,
            });
          }
        }
        // If no reminders were scheduled for the first day (all times passed), adjust totalDoses
        if (currentDate.equals(startDate) && reminders.length === 0) {
          currentDate = currentDate.plus({ days: 1 });
          this.totalDoses = this.calculateTotalDoses(); // Recalculate based on new start
          this.initialQuantity = this.totalDoses * this.dose;
          this.quantityLeft = this.initialQuantity;
          continue;
        }
      }

      currentDate = currentDate.plus({ days: 1 });
    }
    this.reminders = reminders;
  } else {
    this.quantityLeft = this.calculateQuantityLeft();
    this.checkMissedDoses();

    // Regenerate reminders if scheduling fields are modified
    const isModifiedFields =
      this.isModified("startHour") ||
      this.isModified("timesPerDay") ||
      this.isModified("frequency") ||
      this.isModified("daysOfWeek")||
      this.isModified('startDateTime') ||
      this.isModified('endDateTime');
    if (isModifiedFields) {
      const startDate = DateTime.fromJSDate(this.startDateTime, {
        zone: "UTC",
      }).startOf("day");
      const endDate = DateTime.fromJSDate(this.endDateTime, {
        zone: "UTC",
      }).startOf("day");
  

      const reminders = [];
      let currentDate = startDate;
      const scheduledDay = startDate.day;

      while (currentDate <= endDate) {
        const dayName = currentDate.toFormat("ccc");

        const shouldSchedule =
          this.frequency === Frequency.DAILY ||
          (this.frequency === Frequency.WEEKLY &&
            this.daysOfWeek.includes(dayName)) ||
          (this.frequency === Frequency.MONTHLY &&
            currentDate.day === scheduledDay);

        if (shouldSchedule) {
          const timesPerDay = this.timesPerDay || 1;
          const interval = 24 / timesPerDay;
          let currentHour = this.startHour;

          for (let i = 0; i < timesPerDay; i++) {
            const hour = (currentHour + i * interval) % 24;
            const time = `${hour % 12 === 0 ? 12 : hour % 12}:00${
              hour < 12 ? "AM" : "PM"
            }`;
            const reminderDate = currentDate.set({
              hour: Math.floor(hour),
              minute: 0,
            });

            reminders.push({
              date: reminderDate.toJSDate(),
              time,
              isTaken: false,
              status: ReminderStatus.PENDING,
              takenAt: null,
              lastResetDate: null,
            });
          }
        }

        currentDate = currentDate.plus({ days: 1 });
      }

      // Preserve existing reminder statuses
      const oldReminders = this.reminders || [];
      this.reminders = reminders.map((newReminder, index) => {
        const matchingOldReminder = oldReminders.find((old) => {
          return DateTime.fromJSDate(old.date).equals(
            DateTime.fromJSDate(newReminder.date)
          );
        });
        return matchingOldReminder
          ? {
              ...newReminder,
              isTaken: matchingOldReminder.isTaken,
              status: matchingOldReminder.status,
              takenAt: matchingOldReminder.takenAt,
            }
          : newReminder;
      });

      this.initialQuantity = this.totalDoses * this.dose;
      this.quantityLeft = this.calculateQuantityLeft();
    }
  }

  this.checkMissedDoses();

  next();
});

const Medication =
  mongoose.models.medicationModel || model("Medication", medicationSchema);

class MedicationModel extends BaseModel {
  constructor(database) {
    super(database, "medication");
  }
}

export { MedicationModel, Medication };
