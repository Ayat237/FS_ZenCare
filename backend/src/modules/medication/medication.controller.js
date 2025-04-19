import { DateTime } from "luxon";
import { PatientModel } from "../../../database/models/patient.model.js";
import {
  MedicationModel,
  Medication,
} from "../../../database/models/medications.model.js";
import { Frequency, ReminderStatus } from "../../utils/enums.utils.js";
import database from "../../../database/databaseConnection.js";
import { ErrorHandlerClass } from "../../utils/error-class.utils.js";

const patientModel = new PatientModel(database);
const medicationModel = new MedicationModel(database);

export const addMedicine = async (req, res, next) => {
  const user = req.authUser;
  console.log("user:  ", user);

  const patientId = user.patientID?._id || user.patientID;
  console.log(patientId);

  const patient = await patientModel.findById(patientId);
  if (!patient) {
    return next(
      new ErrorHandlerClass(
        "Patient not found",
        404,
        "Not Found",
        "Error in create medicine"
      )
    );
  }

  const {
    medicineName,
    medicineType,
    dose,
    frequency,
    timesPerDay,
    daysOfWeek,
    startHour,
    startDateTime,
    endDateTime,
    intakeInstructions,
    notes,
    reminders,
  } = req.body;

  const startDate = DateTime.fromISO(startDateTime).toJSDate();
  const endDate = DateTime.fromISO(endDateTime).toJSDate();

  const medicineRecord = new Medication({
    CreatedBy: user._id,
    patientId,
    medicineName,
    medicineType,
    dose,
    frequency,
    startHour,
    timesPerDay: frequency === Frequency.DAILY ? timesPerDay : null,
    daysOfWeek: frequency === Frequency.WEEKLY ? daysOfWeek : null,
    startDateTime: startDate,
    endDateTime: endDate,
    intakeInstructions,
    notes,
    reminders: reminders || [],
  });

  await medicationModel.save(medicineRecord);

  // Respond with the created medication
  res.status(201).json({
    success: true,
    message: "Medication created successfully",
    data: {
      ...medicineRecord.toObject(),
    },
  });
};

export const updateMedicationRecord = async (req, res, next) => {
  const { id } = req.params;
  const {
    medicineName,
    medicineType,
    dose,
    frequency,
    timesPerDay,
    daysOfWeek,
    startHour,
    startDateTime,
    endDateTime,
    intakeInstructions,
    notes,
  } = req.body; // Fields to update (e.g., name, dosage, frequency, timesPerDay)

  // Find the medication by ID
  const medication = await medicationModel.findById(id);
  if (!medication) {
    return next(
      new ErrorHandlerClass(
        "Medication not found",
        404,
        "Not Found",
        "Error in update medication"
      )
    );
  }

  if (medicineName) {
    medication.medicineName = medicineName;
  }
  if (medicineType) {
    medication.medicineType = medicineType;
  }
  if (dose) {
    medication.dose = dose;
  }

  // Update the frequency and related fields based on the new frequency
  if (frequency && frequency !== medication.frequency) {
    medication.frequency = frequency;
    medication.timesPerDay = frequency === Frequency.DAILY ? timesPerDay : null;
    medication.daysOfWeek = frequency === Frequency.WEEKLY ? daysOfWeek : null;
  } else if (frequency === Frequency.DAILY && timesPerDay) {
    medication.timesPerDay = timesPerDay;
  } else if (frequency === Frequency.WEEKLY && daysOfWeek) {
    medication.daysOfWeek = daysOfWeek;
  }

  if (startHour) {
    medication.startHour = startHour;
  }
  if (startDateTime) {
    medication.startDateTime = DateTime.fromISO(startDateTime).toJSDate();
  }
  if (endDateTime) {
    medication.endDateTime = DateTime.fromISO(endDateTime).toJSDate();
  }
  if (intakeInstructions) {
    medication.intakeInstructions = intakeInstructions;
  }
  if (notes) {
    medication.notes = notes;
  }
  // Save the updated medication record
  await medicationModel.save(medication);

  // Respond with the updated medication
  res.status(200).json({
    success: true,
    message: "Medication updated successfully",
    data: {
      ...medication.toObject(),
    },
  });
};

export const listAllMedications = async (req, res, next) => {
  const user = req.authUser;
  const patientId = user.patientID?._id || user.patientID;
  const now = DateTime.now().setZone('UTC');

  // Fetch medications and filter by endDateTime at runtime
  const medications = await medicationModel.find({ patientId });
  const activeMedications = medications.filter((medication) => {
    const endDateTime = DateTime.fromJSDate(medication.endDateTime, { zone: 'UTC' });
    return now <= endDateTime;
  });

  if (!activeMedications || activeMedications.length === 0) {
    return next(
      new ErrorHandlerClass(
        'No active medications found',
        404,
        'Not Found',
        'Error in fetching medications'
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
    message: 'Active medications fetched successfully',
    data: formattedMedications,
  });
};

export const getMedicationById = async (req, res, next) => {
  const { id } = req.params;

  // Find the medication by ID
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

  // Transform medications to return specific fields

  // Respond with the medication details
  res.status(200).json({
    success: true,
    message: "Medication fetched successfully",
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
        dashboardData[day].push({
          medicineName: medication.medicineName,
          medicineType: medication.medicineType,
          frequency: frequencyText,
          instruction: medication.instruction,
          reminderCount: remindersByDay[day].length,
        });
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
//====================================================================================
export const markDoseTakenAndUpdateDashboard = async (req, res, next) => {
  const user = req.authUser;
  const patientId = user.patientID?._id || user.patientID;
  const { medicationId } = req.params;
  const { reminderIndex } = req.body;
  console.log("reminderIndex: ", reminderIndex);

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

  // Mark the dose as taken (embedded logic from markDoseTaken)
  const reminder = medication.reminders[reminderIndex];
  if (!reminder) {
    return next(
      new ErrorHandlerClass(
        `Reminder at index ${reminderIndex} not found`,
        404,
        'Not Found',
        'Error in markDoseTakenAndUpdateDashboard'
      )
    );
  }

  // Check if the dose is already taken or marked as missed
  if (reminder.status === ReminderStatus.TAKEN) {
    return next(
      new ErrorHandlerClass(
        `Dose at index ${reminderIndex} is already marked as taken`,
        400,
        'Bad Request',
        'Error in markDoseTakenAndUpdateDashboard'
      )
    );
  }

  if(reminder.status === ReminderStatus.MISSED) {
    return next(
      new ErrorHandlerClass(
        `Dose at index ${reminderIndex} is already marked as missed`,
        400,
        'Bad Request',
        'Error in markDoseTakenAndUpdateDashboard'
      )
    );
  }

  // Update the reminder status to TAKEN
  reminder.isTaken = true; 
  reminder.status = ReminderStatus.TAKEN;
  reminder.takenAt = DateTime.now().toJSDate();

  medication.quantityLeft = medication.calculateQuantityLeft();

  // Save the updated medication before calculating the dashboard
  medication.markModified('reminders'); // Ensure Mongoose detects the change

  // Save the updated medication
  await medicationModel.save(medication);


  // Define date ranges for Yesterday, Today, and Tomorrow
  const now = DateTime.now().setZone("UTC");
  const today = now.startOf("day");
  const yesterday = today.minus({ days: 1 });
  const tomorrow = today.plus({ days: 1 });

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
        
        if(reminderCount > 0) {
          dashboardData[day].push({
            medicineName: medication.medicineName,
            medicineType: medication.medicineType,
            frequency: frequencyText,
            intakeInstructions: medication.intakeInstructions ,
            reminderCount: reminderCount,
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
  })
  
  // Respond with the dashboard data
  res.status(200).json({
    success: true,
    message: "Dashboard reminders retrieved successfully",
    data: dashboardData,
  });
};
