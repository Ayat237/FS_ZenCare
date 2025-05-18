import { DateTime } from "luxon";
import { PatientModel } from "../../../database/models/patient.model.js";
import {
  MedicationModel,
  Medication,
} from "../../../database/models/medications.model.js";
import { Frequency, ReminderStatus } from "../../utils/enums.utils.js";
import database from "../../../database/databaseConnection.js";
import { ErrorHandlerClass } from "../../utils/error-class.utils.js";
import { checkDrugInteractionsService } from "../../services/index.js";
import {
  deletePendingMedication,
  getPendingMedication,
  storePendingMedication,
} from "./utils/pendingMedications.utils.js";
import { addMedicationService, confirmUpdateMedicationService, updateMedicationService } from "./medication.service.js";

const patientModel = new PatientModel(database);
const medicationModel = new MedicationModel(database);

// export const addMedicine = async (req, res, next) => {
//   const user = req.authUser;
//   const {
//     medicineName,
//     medicineType,
//     drugId,
//     dose,
//     frequency,
//     timesPerDay,
//     daysOfWeek,
//     startHour,
//     startDateTime,
//     endDateTime,
//     intakeInstructions,
//     notes,
//     reminders,
//   } = req.body;

//   const patientId = user.patientID?._id || user.patientID;
//   const patient = await patientModel.findById(patientId);
//   if (!patient) {
//     return next(
//       new ErrorHandlerClass(
//         "Patient not found",
//         404,
//         "Not Found",
//         "Error in create medicine"
//       )
//     );
//   }
//   const interactionResult = await checkDrugInteractionsService(
//     patientId,
//     drugId
//   );
//   const { summary, drugs, metadata, filterCounts, interactions } =
//     interactionResult;

//   const hasPotentalInteractions =
//     filterCounts.major > 0 ||
//     filterCounts.moderate > 0 ||
//     filterCounts.minor > 0 ||
//     filterCounts.therapeuticDuplication > 0;

//   if (hasPotentalInteractions) {
//     const pendingId = `pendingMedicationId:${user.userName}`;
//     storePendingMedication(pendingId, {
//       patientId,
//       medicationData: req.body,
//       interactionResult,
//     });

//     return res.status(200).json({
//       success: false,
//       message: "Potential drug interactions found",
//       status: "Interaction Warning",
//       stack: "Please confirm before proceeding",
//       data: {
//         pendingId,
//         summary,
//         drugs,
//         metadata,
//         filterCounts,
//         interactions,
//       },
//     });
//   }

//   const startDate = DateTime.fromISO(startDateTime, { zone: "UTC" });
//   const endDate = DateTime.fromISO(endDateTime, { zone: "UTC" });

//   const startDateAtMidnight = startDate.toJSDate();
//   const endDateAtMidnight = endDate.toJSDate();

//   const medicineRecord = new Medication({
//     CreatedBy: user._id,
//     patientId,
//     medicineName,
//     drugId,
//     medicineType,
//     dose,
//     frequency,
//     startHour,
//     timesPerDay: frequency === Frequency.DAILY ? timesPerDay : null,
//     daysOfWeek: frequency === Frequency.WEEKLY ? daysOfWeek : null,
//     startDateTime: startDateAtMidnight,
//     endDateTime: endDateAtMidnight,
//     intakeInstructions,
//     notes,
//     reminders: reminders || [],
//   });

//   await medicationModel.save(medicineRecord);

//   // Respond with the created medication
//   res.status(201).json({
//     success: true,
//     message: "Medication created successfully",
//     data: {
//       ...medicineRecord.toObject(),
//     },
//   });
// };



export const addMedicine = async (req, res, next) => {
  const user = req.authUser;
  const medicationData = req.body;

  const addedMedicine = await addMedicationService(user, medicationData);

  // Check if the result includes a pre-existing interaction warning
  if (addedMedicine.success !== undefined) {
    return res.status(201).json({
      success: addedMedicine.success,
      message: addedMedicine.message,
      data: addedMedicine.data,
      preExistingWarning: addedMedicine.preExistingWarning || null,
    });
  }
  
  return res.status(200).json({
    success: true,
    message: "Medication created successfully",
    data: addedMedicine,
  })
}


// export const confirmAddMedicine = async (req, res, next) => {
//   const user = req.authUser;
//   const { pendingId, accept } = req.body;

//   const result = await confirmAddMedicationService(user, pendingId, accept);

//   // Respond with the created medication
//   res.status(201).json({
//     success: true,
//     message: "Medication created successfully",
//     data: result,
//   });
// };

export const updateMedicationRecord = async (req, res, next) => {
  const user = req.authUser;
  const { id } = req.params;

  const result = await updateMedicationService(
    user,
    id,
    req.body
  )

  // Check if the result includes a pre-existing interaction warning
  if (result.success !== undefined) {
    return res.status(200).json({
      success: result.success,
      message: result.message,
      data: result.data,
      preExistingWarning: result.preExistingWarning || null,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Medication updated successfully',
    data: result,
  });
}


export const confirmUpdateMedication = async (req, res, next) => {
  const user = req.authUser;
  const { pendingId, accept } = req.body;
  
  const result = await confirmUpdateMedicationService(user, pendingId, accept);

  res.status(200).json({
    success: true,
    message: 'Medication updated successfully',
    data: result,
  });
}




// export const updateMedicationRecord = async (req, res, next) => {
//   const { id } = req.params;
//   const {
//     medicineName,
//     medicineType,
//     dose,
//     frequency,
//     timesPerDay,
//     daysOfWeek,
//     startHour,
//     startDateTime,
//     endDateTime,
//     intakeInstructions,
//     notes,
//   } = req.body; // Fields to update (e.g., name, dosage, frequency, timesPerDay)

//   // Find the medication by ID
//   const medication = await medicationModel.findById(id);
//   if (!medication) {
//     return next(
//       new ErrorHandlerClass(
//         "Medication not found",
//         404,
//         "Not Found",
//         "Error in update medication"
//       )
//     );
//   }

//   if (medicineName) {
//     medication.medicineName = medicineName;
//   }
//   if (medicineType) {
//     medication.medicineType = medicineType;
//   }
//   if (dose) {
//     medication.dose = dose;
//   }

//   // Update the frequency and related fields based on the new frequency
//   if (frequency && frequency !== medication.frequency) {
//     medication.frequency = frequency;
//     medication.timesPerDay = frequency === Frequency.DAILY ? timesPerDay : null;
//     medication.daysOfWeek = frequency === Frequency.WEEKLY ? daysOfWeek : null;
//   } else if (frequency === Frequency.DAILY && timesPerDay) {
//     medication.timesPerDay = timesPerDay;
//   } else if (frequency === Frequency.WEEKLY && daysOfWeek) {
//     medication.daysOfWeek = daysOfWeek;
//   }

//   if (startHour) {
//     medication.startHour = startHour;
//   }
//   if (startDateTime) {
//     const startDate = DateTime.fromISO(startDateTime, { zone: "UTC" });
//     const startDateAtMidnight = startDate.toJSDate();
//     medication.startDateTime = startDateAtMidnight;
//   }
//   if (endDateTime) {
//     const endDate = DateTime.fromISO(endDateTime, { zone: "UTC" });
//     const endDateAtMidnight = endDate.toJSDate();
//     medication.endDateTime = endDateAtMidnight;
//   }
//   if (intakeInstructions) {
//     medication.intakeInstructions = intakeInstructions;
//   }
//   if (notes) {
//     medication.notes = notes;
//   }
//   // Save the updated medication record
//   await medicationModel.save(medication);

//   // Respond with the updated medication
//   res.status(200).json({
//     success: true,
//     message: "Medication updated successfully",
//     data: {
//       ...medication.toObject(),
//     },
//   });
// };

export const listAllMedications = async (req, res, next) => {
  const user = req.authUser;
  const patientId = user.patientID?._id || user.patientID;
  const now = DateTime.now().setZone("UTC");

  // Fetch medications and filter by endDateTime at runtime
  const medications = await medicationModel.find({ patientId });
  const activeMedications = medications.filter((medication) => {
    const endDateTime = DateTime.fromJSDate(medication.endDateTime, {
      zone: "UTC",
    });
    return now <= endDateTime;
  });

  if (!activeMedications || activeMedications.length === 0) {
    return next(
      new ErrorHandlerClass(
        "No active medications found",
        404,
        "Not Found",
        "Error in fetching medications"
      )
    );
  }

  const formattedMedications = activeMedications.map((medication) => ({
    medicineName: medication.medicineName,
    medicineType: medication.medicineType,
    dose: medication.dose,
    frequency: medication.frequency,
    timesPerDay: medication.timesPerDay,
    daysOfWeek: medication.daysOfWeek,
    intakeInstructions: medication.intakeInstructions,
  }));

  res.status(200).json({
    success: true,
    message: "Active medications fetched successfully",
    data: formattedMedications,
  });
};

export const getMedicationById = async (req, res, next) => {
  const { id } = req.params;
  const now = DateTime.now().setZone("UTC");

  const medication = await medicationModel.findById(id);
  if (!medication) {
    return next(
      new ErrorHandlerClass(
        "Medication not found",
        404,
        "Not Found",
        "Error in fetching medication"
      )
    );
  }

  const endDateTime = DateTime.fromJSDate(medication.endDateTime, {
    zone: "UTC",
  });
  if (now > endDateTime) {
    return next(
      new ErrorHandlerClass(
        "Medication is no longer active",
        404,
        "Not Found",
        "Error in fetching medication"
      )
    );
  }

  res.status(200).json({
    success: true,
    message: "Active medication fetched successfully",
    data: {
      medicineName: medication.medicineName,
      medicineType: medication.medicineType,
      dose: medication.dose,
      frequency: medication.frequency,
      timesPerDay: medication.timesPerDay,
      daysOfWeek: medication.daysOfWeek,
      intakeInstructions: medication.intakeInstructions,
      quantityLeft: medication.quantityLeft,
      startDateTime: medication.startDateTime,
      endDateTime: medication.endDateTime,
      notes: medication.notes,
    },
  });
};

export const getDashboardReminders = async (req, res, next) => {
  const user = req.authUser;
  const patientId = user.patientID?._id || user.patientID;

  //date ranges for Yesterday, Today, and Tomorrow
  const now = DateTime.now().setZone("UTC");
  const today = now.startOf("day");
  const yesterday = today.minus({ days: 1 });
  const tomorrow = today.plus({ days: 1 });

  // get medications for the patient
  const medications = await medicationModel.find({ patientId });
  if (!medications) {
    return next(
      new ErrorHandlerClass(
        "No medications found",
        404,
        "Not Found",
        "Error in fetching medications"
      )
    );
  }

  // Organize reminders into Yesterday, Today, Tomorrow
  const dashboardData = {
    Yesterday: [],
    Today: [],
    Tomorrow: [],
  };

  medications.forEach((medication) => {
    const remindersByDay = {
      Yesterday: [],
      Today: [],
      Tomorrow: [],
    };

    medication.reminders.forEach((reminder) => {
      const reminderDate = DateTime.fromJSDate(reminder.date)
        .setZone("UTC")
        .startOf("day");

      if (reminderDate.equals(yesterday)) {
        remindersByDay.Yesterday.push(reminder);
      } else if (reminderDate.equals(today)) {
        remindersByDay.Today.push(reminder);
      } else if (reminderDate.equals(tomorrow)) {
        remindersByDay.Tomorrow.push(reminder);
      }
    });

    // // Add medication reminders to the dashboard data
    // if (remindersByDay.Yesterday.length > 0) {
    //   dashboardData.Yesterday.push({
    //     medicineName: medication.medicineName,
    //     reminders: remindersByDay.Yesterday,
    //   });
    // }
    // Add medication to dashboard data if it has reminders for that day
    const frequencyText =
      medication.frequency === Frequency.DAILY
        ? `${
            medication.timesPerDay === 1
              ? "once"
              : medication.timesPerDay === 2
              ? "twice"
              : `${medication.timesPerDay} times`
          } a day`
        : medication.frequency === Frequency.WEEKLY
        ? "weekly"
        : medication.frequency === Frequency.MONTHLY
        ? "monthly"
        : "as needed";
    ["Yesterday", "Today", "Tomorrow"].forEach((day) => {
      if (remindersByDay[day].length > 0) {
        let reminderCount =
          day === "Yesterday"
            ? remindersByDay[day].filter(
                (reminder) =>
                  reminder.status.toUpperCase() ===
                  ReminderStatus.MISSED.toUpperCase()
              ).length
            : remindersByDay[day].filter(
                (reminder) =>
                  reminder.status.toUpperCase() ===
                  ReminderStatus.PENDING.toUpperCase()
              ).length; // Only count PENDING reminders

        if (reminderCount > 0) {
          dashboardData[day].push({
            medicineName: medication.medicineName,
            medicineType: medication.medicineType,
            frequency: frequencyText,
            intakeInstructions: medication.intakeInstructions,
            reminderCount: reminderCount,
            id: medication._id,
            reminderIndexes: remindersByDay[day].map((reminder) => {
              return medication.reminders.indexOf(reminder);
            }),
            canMark: day === "Today" ? true : false,
          });
        }
      }
    });
  });

  // Respond with the dashboard data
  res.status(200).json({
    success: true,
    message: "Dashboard reminders retrieved successfully",
    data: dashboardData,
  });
};

export const markDoseTakenAndUpdateDashboard = async (req, res, next) => {
  const user = req.authUser;
  const patientId = user.patientID?._id || user.patientID;
  const { medicationId } = req.params;
  const { reminderIndex } = req.body;

  // Validate input
  if (!patientId) {
    return next(
      new ErrorHandlerClass(
        "User not authenticated or patient ID missing",
        401,
        "Unauthorized",
        "Error in markDoseTakenAndUpdateDashboard"
      )
    );
  }

  // Find the medication by ID
  const medication = await medicationModel.findById(medicationId);
  if (!medication) {
    return next(
      new ErrorHandlerClass(
        "Medication not found",
        404,
        "Not Found",
        "Error in markDoseTakenAndUpdateDashboard"
      )
    );
  }

  // Check if the medication belongs to the authenticated patient
  if (medication.patientId.toString() !== patientId.toString()) {
    return next(
      new ErrorHandlerClass(
        "Unauthorized access to medication",
        403,
        "Forbidden",
        "Error in markDoseTaken"
      )
    );
  }

  // Define date ranges for Yesterday, Today, and Tomorrow
  const now = DateTime.now().setZone("UTC");
  const today = now.startOf("day");
  const yesterday = today.minus({ days: 1 });
  const tomorrow = today.plus({ days: 1 });

  // Find the next PENDING reminder for Today
  let nextReminderIndex = -1;
  let todayReminderCount = 0;
  for (let i = 0; i < medication.reminders.length; i++) {
    const reminder = medication.reminders[i];
    const reminderDate = DateTime.fromJSDate(reminder.date)
      .setZone("UTC")
      .startOf("day");

    if (
      reminderDate.equals(today) &&
      reminder.status.toUpperCase() === ReminderStatus.PENDING.toUpperCase()
    ) {
      todayReminderCount++;
      if (nextReminderIndex === -1) {
        nextReminderIndex = i; // Set the first PENDING reminder for Today
      }
    }
  }

  // If no PENDING reminders for Today, return an error
  if (nextReminderIndex === -1) {
    return next(
      new ErrorHandlerClass(
        "No pending reminders for today to mark as taken",
        400,
        "Bad Request",
        "Error in markDoseTakenAndUpdateDashboard"
      )
    );
  }

  // Mark the dose as taken (embedded logic from markDoseTaken)
  const reminder = medication.reminders[nextReminderIndex];
  if (!reminder) {
    return next(
      new ErrorHandlerClass(
        `Reminder at index ${reminderIndex} not found`,
        404,
        "Not Found",
        "Error in markDoseTakenAndUpdateDashboard"
      )
    );
  }

  // Check if the dose is already taken or marked as missed
  if (reminder.status === ReminderStatus.TAKEN) {
    return next(
      new ErrorHandlerClass(
        `Dose at index ${reminderIndex} is already marked as taken`,
        400,
        "Bad Request",
        "Error in markDoseTakenAndUpdateDashboard"
      )
    );
  }

  if (reminder.status === ReminderStatus.MISSED) {
    return next(
      new ErrorHandlerClass(
        `Dose at index ${reminderIndex} is already marked as missed`,
        400,
        "Bad Request",
        "Error in markDoseTakenAndUpdateDashboard"
      )
    );
  }

  // Update the reminder status to TAKEN
  reminder.isTaken = true;
  reminder.status = ReminderStatus.TAKEN;
  reminder.takenAt = DateTime.now().toJSDate();

  medication.quantityLeft = medication.calculateQuantityLeft();

  // Save the updated medication before calculating the dashboard
  medication.markModified("reminders"); // Ensure Mongoose detects the change

  // Save the updated medication
  await medicationModel.save(medication);

  // Update the todayReminderCount after marking the reminder as taken
  todayReminderCount--;

  // Find the next PENDING reminder index for Today (if any)
  let updatedNextReminderIndex = -1;
  for (let i = 0; i < medication.reminders.length; i++) {
    const reminder = medication.reminders[i];
    const reminderDate = DateTime.fromJSDate(reminder.date)
      .setZone("UTC")
      .startOf("day");

    if (
      reminderDate.equals(today) &&
      reminder.status.toUpperCase() === ReminderStatus.PENDING.toUpperCase()
    ) {
      updatedNextReminderIndex = i;
      break;
    }
  }

  // Organize reminders into Yesterday, Today, Tomorrow
  const dashboardData = {
    Yesterday: [],
    Today: [],
    Tomorrow: [],
  };

  // Fetch all medications for the patient
  const medications = await medicationModel.find({ patientId });
  if (!medications || medications.length === 0) {
    return next(
      new ErrorHandlerClass(
        "No medications found",
        404,
        "Not Found",
        "Error in fetching medications"
      )
    );
  }

  medications.forEach((medication) => {
    // Skip medications with no PENDING reminders (Today/Tomorrow) or MISSED reminders (Yesterday)
    const hasRelevantReminders = medication.reminders.some((reminder) => {
      const reminderDate = DateTime.fromJSDate(reminder.date, {
        zone: "UTC",
      }).startOf("day");
      return (
        // Include if there are PENDING reminders for Today or Tomorrow
        (reminder.status.toUpperCase() ===
          ReminderStatus.PENDING.toUpperCase() &&
          (reminderDate.equals(today) || reminderDate.equals(tomorrow))) ||
        // Include if there are MISSED reminders for Yesterday
        (reminder.status.toUpperCase() ===
          ReminderStatus.MISSED.toUpperCase() &&
          reminderDate.equals(yesterday))
      );
    });
    if (!hasRelevantReminders) {
      return; // Exclude from dashboard if all doses are taken or missed
    }

    const remindersByDay = {
      Yesterday: [],
      Today: [],
      Tomorrow: [],
    };

    medication.reminders.forEach((reminder) => {
      const reminderDate = DateTime.fromJSDate(reminder.date)
        .setZone("UTC")
        .startOf("day");

      if (reminderDate.equals(yesterday)) {
        remindersByDay.Yesterday.push(reminder);
      } else if (reminderDate.equals(today)) {
        remindersByDay.Today.push(reminder);
      } else if (reminderDate.equals(tomorrow)) {
        remindersByDay.Tomorrow.push(reminder);
      }
    });

    let frequencyText;
    if (medication.frequency === Frequency.DAILY) {
      frequencyText =
        medication.timesPerDay === 1
          ? "once"
          : medication.timesPerDay === 2
          ? "twice"
          : `${medication.timesPerDay} times`;
    } else if (medication.frequency === Frequency.WEEKLY) {
      frequencyText = "weekly";
    } else if (medication.frequency === Frequency.MONTHLY) {
      frequencyText = "monthly";
    } else {
      frequencyText = "as needed";
    }

    ["Yesterday", "Today", "Tomorrow"].forEach((day) => {
      if (remindersByDay[day].length > 0) {
        let reminderCount =
          day === "Yesterday"
            ? remindersByDay[day].filter(
                (reminder) =>
                  reminder.status.toUpperCase() ===
                  ReminderStatus.MISSED.toUpperCase()
              ).length
            : remindersByDay[day].filter(
                (reminder) =>
                  reminder.status.toUpperCase() ===
                  ReminderStatus.PENDING.toUpperCase()
              ).length; // Only count PENDING reminders

        if (reminderCount > 0) {
          dashboardData[day].push({
            medicineName: medication.medicineName,
            medicineType: medication.medicineType,
            frequency: frequencyText,
            intakeInstructions: medication.intakeInstructions,
            reminderCount: reminderCount,
            id: medication._id,
          });
        }
      }
    });
  });

  // Filter out empty reminder entries
  ["Yesterday", "Today", "Tomorrow"].forEach((day) => {
    dashboardData[day] = dashboardData[day].filter(
      (entry) => entry.reminderCount > 0
    );
  });

  // Respond with the dashboard data
  res.status(200).json({
    success: true,
    message: "Dashboard reminders updated successfully",
    medication: {
      medicineName: medication.medicineName,
      id: medicationId,
      nextReminderIndex: updatedNextReminderIndex,
      todayReminderCount: todayReminderCount,
    },
  });
};

export const listHistoricalMedications = async (req, res, next) => {
  const user = req.authUser;
  const patientId = user.patientID?._id || user.patientID;

  // Fetch medications and filter by endDateTime at runtime
  const medications = await medicationModel.find({
    patientId,
    isActive: false,
  });
  if (!medications || medications.length === 0) {
    return next(
      new ErrorHandlerClass(
        "No historical medications found",
        404,
        "Not Found",
        "Error in fetching medications"
      )
    );
  }

  const formattedMedications = medications.map((medication) => ({
    medicineName: medication.medicineName,
    medicineType: medication.medicineType,
    dose: medication.dose,
    frequency: medication.frequency,
    timesPerDay: medication.timesPerDay,
    daysOfWeek: medication.daysOfWeek,
    intakeInstructions: medication.intakeInstructions,
    startDateTime: medication.startDateTime,
    endDateTime: medication.endDateTime,
    notes: medication.notes,
  }));

  res.status(200).json({
    success: true,
    message: "Historical medications fetched successfully",
    data: formattedMedications,
  });
};

export const deleteMedication = async (req, res, next) => {
  const { medicationId } = req.params;
  const user = req.authUser;
  const patientId = user.patientID?._id || user.patientID;

  // Find the medication by ID
  const medication = await medicationModel.findById(medicationId);
  if (!medication) {
    return next(
      new ErrorHandlerClass(
        "Medication not found",
        404,
        "Not Found",
        "Error in deleting medication"
      )
    );
  }

  // Check if the medication belongs to the authenticated patient
  if (medication.patientId.toString() !== patientId.toString()) {
    return next(
      new ErrorHandlerClass(
        "Unauthorized access to medication",
        403,
        "Forbidden",
        "Error in deleting medication"
      )
    );
  }

  // Delete the medication record
  await medicationModel.deleteById(medicationId);

  res.status(200).json({
    success: true,
    message: `Medication with id(${medication._id}) deleted successfully`,
  });
};


