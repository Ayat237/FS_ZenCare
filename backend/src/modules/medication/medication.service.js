import { DateTime } from "luxon";
import { PatientModel } from "../../../database/models/patient.model.js";
import {
  MedicationModel,
  Medication,
} from "../../../database/models/medications.model.js";
import { Frequency, ReminderStatus } from "../../utils/enums.utils.js";
import database from "../../../database/databaseConnection.js";
import { ErrorHandlerClass } from "../../utils/error-class.utils.js";
import { checkSignificantInteractions } from "../../services/index.js";
import { logger } from "../../utils/logger.utils.js";
import { PrescriptionModel } from "../../../database/models/prescription.model.js";


const patientModel = new PatientModel(database);
const medicationModel = new MedicationModel(database);
const prescriptionModel = new PrescriptionModel(database);

const formatMedicationResponse = (medication) => ({
  id: medication._id,
  medicineName: medication.medicineName,
  drugId: medication.drugId,
  medicineType: medication.medicineType,
  startDate: medication.startDateTime,
  endDate: medication.endDateTime,
  dose: medication.dose,
  frequency: medication.frequency,
  timesPerDay: medication.timesPerDay,
  daysOfWeek: medication.daysOfWeek,
  hasInteractions: medication.hasInteractions || false,
});

// Helper function to update medication fields (already exists)
const updateMedicationFields = (medication, updateData) => {
  const updates = {};
  const {
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
  } = updateData;
  if (medicineType) updates.medicineType = medicineType;
  if (dose) updates.dose = dose;
  if (frequency && frequency !== medication.frequency) {
    updates.frequency = frequency;
    updates.timesPerDay = frequency === Frequency.DAILY ? timesPerDay : null;
    updates.daysOfWeek = frequency === Frequency.WEEKLY ? daysOfWeek : null;
  } else {
    if (frequency === Frequency.DAILY && timesPerDay)
      updates.timesPerDay = timesPerDay;
    if (frequency === Frequency.WEEKLY && daysOfWeek)
      updates.daysOfWeek = daysOfWeek;
  }

  if (startHour) updates.startHour = startHour;
  if (startDateTime) {
    const startDate = DateTime.fromISO(startDateTime, { zone: "UTC" });
    const startDateAtMidnight = startDate.toJSDate();
    updates.startDateTime = startDateAtMidnight;
  }
  if (endDateTime) {
    const endDate = DateTime.fromISO(endDateTime, { zone: "UTC" });
    const endDateAtMidnight = endDate.toJSDate();
    updates.endDateTime = endDateAtMidnight;
  }
  if (intakeInstructions) updates.intakeInstructions = intakeInstructions;
  if (notes) updates.notes = notes;

  Object.assign(medication, updates);
  return medication;
};

/**
 * Service to add a new medication for a patient
 * @param {Object} user - The user object containing user details
 * @param {Object} medicationData - The medication data to be added
 * @throws {ErrorHandlerClass} Throws an error if patient not found, duplicate active medication, or drug interactions detected
 */
export const addMedicationService = async (
  user,
  medicationData,
  prescriptionId
) => {
  logger.info("Starting medication addition process", {
    userId: user._id,
    medicineName: medicationData.medicineName,
  });

  try {
    const patientId = user.patientID?._id || user.patientID;
    const patient = await patientModel.findById(patientId);

    if (!patient) {
      logger.error("Patient not found", { patientId });
      throw new ErrorHandlerClass(
        "Patient not found",
        404,
        "Not Found",
        "Error in create medicine"
      );
    }

    const {
      medicineName,
      drugId,
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
    } = medicationData;

    const startDate = DateTime.fromISO(startDateTime, { zone: "UTC" });
    const endDate = DateTime.fromISO(endDateTime, { zone: "UTC" });

    const startDateAtMidnight = startDate.toJSDate();
    const endDateAtMidnight = endDate.toJSDate();

    const medicineRecord = new Medication({
      CreatedBy: user._id,
      patientId,
      prescriptionId,
      medicineName,
      drugId,
      medicineType,
      dose,
      frequency,
      startHour,
      timesPerDay: frequency === Frequency.DAILY ? timesPerDay : null,
      daysOfWeek: frequency === Frequency.WEEKLY ? daysOfWeek : null,
      startDateTime: startDateAtMidnight,
      endDateTime: endDateAtMidnight,
      intakeInstructions,
      notes: notes || "",
      reminders: reminders || [],
      hasInteractions: medicationData.hasInteractions || false,
    });

    await medicationModel.save(medicineRecord);
    logger.info("Medication successfully added", { medicineName, patientId });

    return {
      ...formatMedicationResponse(medicineRecord),
      reminders:medicineRecord.reminders
    };
  } catch (error) {
    logger.error("Error adding medication", {
      error: error.message,
      userId: user._id,
      medicineName: medicationData.medicineName,
    });
    throw error;
  }
};

export const addSignificantMedicationsService = async (
  user,
  medicationData
) => {
  logger.info("Starting medication significant addition process", {
    userId: user._id,
    medicineName: medicationData.medicineName,
  });

  try {
    const patientId = user.patientID?._id || user.patientID;
    const patient = await patientModel.findById(patientId);

    if (!patient) {
      logger.error("Patient not found", { patientId });
      throw new ErrorHandlerClass(
        "Patient not found",
        404,
        "Not Found",
        "Error in create medicine"
      );
    }

    const {
      medicineName,
      prescriptionId,
      drugId,
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
    } = medicationData;

    // Validate prescription existence
    const prescription = await prescriptionModel.findById(prescriptionId);
    if (!prescription) {
      logger.error("Prescription not found", { prescriptionId, patientId });
      return {
        success: false,
        message: "Prescription not found",
        data: {},
        status: 404,
      };
    }

    const startDate = DateTime.fromISO(startDateTime, { zone: "UTC" });
    const endDate = DateTime.fromISO(endDateTime, { zone: "UTC" });

    const startDateAtMidnight = startDate.toJSDate();
    const endDateAtMidnight = endDate.toJSDate();

    // Check for duplicate active medication
    logger.debug("Checking for duplicate active medications");
    const existingMedications = await medicationModel.find({
      patientId,
      drugId,
      isActive: true,
    });

    if (existingMedications.length > 0) {
      logger.warn("Duplicate active medication found", { drugId, patientId });
      throw new ErrorHandlerClass(
        "Duplicate Medication",
        409, // Conflict status code
        "Conflict",
        "This medication is already active for the patient",
        {
          duplicates: existingMedications.map((med) => ({
            id: med._id,
            medicineName: med.medicineName,
            drugId: med.drugId,
            hasInteractions: med.hasInteractions,
          })),
        }
      );
    }
    logger.debug("No duplicate active medications found");

    // Check for drug interactions with the new medication
    const newDrug = [{ drugId, drugName: medicineName }];
    const { hasSignificantNewInteractions, interactionResult } =
      await checkSignificantInteractions(patientId, newDrug);

    if (hasSignificantNewInteractions) {
      logger.warn("Significant interactions found", {
        drugId,
        interactionResult,
      });
      throw new ErrorHandlerClass(
        "Potential drug interactions found",
        200,
        "Interaction Warning",
        `Please confirm before proceeding with adding `,
        interactionResult
      );
    }

    const medicineRecord = new Medication({
      CreatedBy: user._id,
      patientId,
      prescriptionId,
      medicineName,
      drugId,
      medicineType,
      dose,
      frequency,
      startHour,
      timesPerDay: frequency === Frequency.DAILY ? timesPerDay : null,
      daysOfWeek: frequency === Frequency.WEEKLY ? daysOfWeek : null,
      startDateTime: startDateAtMidnight,
      endDateTime: endDateAtMidnight,
      intakeInstructions,
      notes: notes || "",
      reminders: reminders || [],
      hasInteractions: medicationData.hasInteractions || false,
    });
    await medicationModel.save(medicineRecord);
    logger.info("Medication successfully added", { medicineName, patientId });

    // Append medication to prescription
    prescription.medicationIds.push(medicineRecord._id);
    await prescriptionModel.save(prescription);

    return{
      ...formatMedicationResponse(medicineRecord),
      reminders:medicineRecord.reminders
    };
  } catch (error) {
    logger.error("Error adding medication", {
      error: error.message,
      userId: user._id,
      medicineName: medicationData.medicineName,
    });
    throw error;
  }
};

/**
 * Confirms and adds a medication despite significant interactions
 * @param {Object} user - The user object
 * @param {Object} medicationData - The medication data
 * @param {Array} interactions - Interaction details
 * @returns {Promise<Object>} Response with success status and medication data
 */
export const confirmAddMedicationService = async (user, medicationData) => {
  logger.info("Starting confirmed medication addition process", {
    userId: user._id,
    medicineName: medicationData.medicineName,
  });

  try {
    const patientId = user.patientID?._id || user.patientID;
    const {
      prescriptionId,
      medicineName,
      drugId,
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
    } = medicationData;

    const startDate = DateTime.fromISO(startDateTime, { zone: "UTC" });
    const endDate = DateTime.fromISO(endDateTime, { zone: "UTC" });

    const startDateAtMidnight = startDate.toJSDate();
    const endDateAtMidnight = endDate.toJSDate();

    const medicineRecord = new Medication({
      CreatedBy: user._id,
      patientId,
      prescriptionId,
      medicineName,
      drugId,
      medicineType,
      dose,
      frequency,
      startHour,
      timesPerDay: frequency === Frequency.DAILY ? timesPerDay : null,
      daysOfWeek: frequency === Frequency.WEEKLY ? daysOfWeek : null,
      startDateTime: startDateAtMidnight,
      endDateTime: endDateAtMidnight,
      intakeInstructions,
      notes: notes || "",
      reminders: reminders || [],
      hasInteractions: true, // Set to true since interactions were confirmed
    });
    console.log("medicineRecord", medicineRecord);

    await medicationModel.save(medicineRecord);

    // Append medication to prescription
    const prescription = await prescriptionModel.findById(prescriptionId);
    if (!prescription) {
      throw new ErrorHandlerClass(
        "Prescription not found",
        404,
        "Not Found",
        "Error updating prescription with medication"
      );
    }
    prescription.medicationIds.push(medicineRecord._id);
    await prescription.save();

    logger.info("Medication added with confirmed interactions", {
      medicineName,
      patientId,
      prescriptionId,
    });

    return {
      ...formatMedicationResponse(medicineRecord),
      reminders:medicineRecord.reminders
    };
  } catch (error) {
    logger.error("Error confirming medication addition", {
      error: error.message,
      userId: user._id,
      medicineName: medicationData.medicineName,
    });
    throw error;
  }
};

export const updateMedicationService = async (
  user,
  medicationId,
  updateData
) => {
  logger.debug("Updating medication", {
    userId: user._id,
    medicationId,
    updateData,
  });

  const patientId = user.patientID?._id || user.patientID;
  const patient = await patientModel.findById(patientId);
  if (!patient) {
    throw new ErrorHandlerClass(
      "Patient not found",
      404,
      "Not Found",
      "Error in update medication"
    );
  }

  const medicationRecord = await medicationModel.findById(medicationId, {
    isActive: true,
  });
  if (!medicationRecord) {
    throw new ErrorHandlerClass(
      "Medication not found",
      404,
      "Not Found",
      "Error in update medication"
    );
  }
  if (medicationRecord.isActive === false) {
    throw new ErrorHandlerClass(
      "Medication is inactive",
      400,
      "Bad Request",
      "Error in update medication"
    );
  }
  updateMedicationFields(medicationRecord, updateData);

  await medicationModel.save(medicationRecord);

  logger.info("Medication updated successfully", {
    userId: user._id,
    medicationId,
  });

  return {
   ...formatMedicationResponse(medicationRecord),
    reminders:medicationRecord.reminders
  };
};

/**
 * Fetches all active medications for a patient
 * @param {string} patientId - The ID of the patient
 * @returns {Promise<Object>} Response with success status and medication data
 */
export const listAllActiveMedicationsService = async (patientId) => {
  logger.info("Starting to fetch all active medications", { patientId });

  try {
    const now = DateTime.now().setZone("UTC");

    // Fetch all medications and filter by endDateTime
    const medications = await medicationModel.find(
      { patientId },
      {
        select: "-diseaseType",
        populate: "prescriptionId",
      }
    );
    console.log("medications", medications);

    const activeMedications = medications.filter((medication) => {
      const endDateTime = DateTime.fromJSDate(medication.endDateTime, {
        zone: "UTC",
      });
      return now <= endDateTime;
    });

    if (!activeMedications || activeMedications.length === 0) {
      logger.warn("No active medications found", { patientId });
      return {
        success: false,
        message: "No active medications found",
        data: {},
        status: 404,
      };
    }
    logger.info("Successfully fetched active medications", {
      count: activeMedications.length,
      patientId,
    });

    // Map medications with their disease names
    const medicationsWithDisease = activeMedications.map((med) => ({
      ...formatMedicationResponse(med),
      diseaseName: med.prescriptionId?.diseaseName || null,

    }));

    logger.info("Successfully fetched active medications", {
      count: activeMedications.length,
      patientId,
    });
    return {
      success: true,
      message: "Active medications fetched successfully",
      data: medicationsWithDisease,
      status: 200,
    };
  } catch (error) {
    logger.error("Error fetching active medications", {
      error: error.message,
      patientId,
    });
    throw error;
  }
};

/**
 * Fetches a specific active medication by ID
 * @param {string} id - The ID of the medication
 * @returns {Promise<Object>} Response with success status and medication data
 */
export const getMedicationByIdService = async (id, patientId) => {
  logger.info("Starting to fetch medication by ID", { medicationId: id });

  try {
    const now = DateTime.now().setZone("UTC");

    const medication = await medicationModel.findOne(
      { _id: id, patientId },
      {
        select: "-diseaseType",
        populate: "prescriptionId",
      }
    );
    if (!medication) {
      logger.warn("Medication not found", { medicationId: id, patientId });
      return {
        success: false,
        message: "Medication not found",
        data: {},
        status: 404,
      };
    }

    const endDateTime = DateTime.fromJSDate(medication.endDateTime, {
      zone: "UTC",
    });
    if (now > endDateTime) {
      logger.warn("Medication is no longer active", { medicationId: id });
      return {
        success: false,
        message: "Medication is no longer active",
        data: {},
        status: 404,
      };
    }
    logger.info("Successfully fetched medication by ID", { medicationId: id });

    return {
      success: true,
      message: "Active medication fetched successfully",
      data: {
        ...formatMedicationResponse(medication),
        diseaseName: medication.prescriptionId?.diseaseName || null,
        diseaseType : medication.prescriptionId?.diseaseType || null
      },
      status: 200,
    };
  } catch (error) {
    logger.error("Error fetching medication by ID", {
      error: error.message,
      medicationId: id,
    });
    throw error;
  }
};

/**
 * Fetches all active medications for a patient and organizes reminders into dashboard data
 * @param {string} patientId - The ID of the patient
 * @returns {Promise<Object>} Response with success status and dashboard data
 */
export const getDashboardRemindersService = async (patientId) => {
  logger.info("Starting to fetch dashboard reminders", { patientId });

  try {
    //date ranges for Yesterday, Today, and Tomorrow
    const now = DateTime.now().setZone("UTC");
    const today = now.startOf("day");
    const yesterday = today.minus({ days: 1 });
    const tomorrow = today.plus({ days: 1 });

    // get medications for the patient
    const medications = await medicationModel.find(
      { patientId },
      {
        select: "-diseaseType",
        populate: "prescriptionId",
      }
    );
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
              diseaseName: medication.prescriptionId?.diseaseName || null,
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
    logger.info("Successfully fetched dashboard reminders", { patientId });
    return {
      success: true,
      message: "Dashboard reminders retrieved successfully",
      data: dashboardData,
      status: 200,
    };
  } catch (error) {
    logger.error("Error fetching dashboard reminders", {
      error: error.message,
      patientId,
    });
    throw error;
  }
};

/**
 * Marks a dose as taken and updates dashboard data
 * @param {Object} user - The authenticated user object
 * @param {string} medicationId - The ID of the medication
 * @param {number} reminderIndex - The index of the reminder to mark
 * @returns {Promise<Object>} Response with success status and updated dashboard data
 */
export const markDoseTakenAndUpdateDashboardService = async (
  user,
  medicationId
) => {
  logger.info("Starting to mark dose as taken and update dashboard", {
    userId: user._id,
    medicationId,
  });

  try {
    const patientId = user.patientID?._id || user.patientID;
    if (!patientId) {
      logger.warn("User not authenticated or patient ID missing", {
        userId: user._id,
      });
      return {
        success: false,
        message: "User not authenticated or patient ID missing",
        data: {},
        status: 401,
      };
    }

    // Find the medication by ID
    const medication = await medicationModel.findById(medicationId);
    if (!medication) {
      return {
        success: false,
        message: "Medication not found",
        data: {},
        status: 404,
      };
    }

    // Check if the medication belongs to the authenticated patient
    if (medication.patientId.toString() !== patientId.toString()) {
      return {
        success: false,
        message: "Unauthorized access to medication",
        data: {},
        status: 403,
      };
    }

    // Define date ranges for Today
    const now = DateTime.now().setZone("UTC");
    const today = now.startOf("day");

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
      return {
        success: false,
        message: "No pending reminders for today to mark as taken",
        data: {},
        status: 400,
      };
    }

    // Mark the dose as taken
    await medication.markDoseTaken(nextReminderIndex);

    // Get updated dashboard data
    const dashboardData = await getDashboardRemindersService(patientId);

    return dashboardData;
  } catch (error) {
    logger.error("Error in marking dose as taken", {
      error: error.message,
      medicationId,
    });
    throw error;
  }
};

/**
 * Fetches all historical (inactive) medications for a patient
 * @param {string} patientId - The ID of the patient
 * @returns {Promise<Object>} Response with success status and medication data
 */
export const listHistoricalMedicationsService = async (patientId) => {
  logger.info("Starting to fetch historical medications", { patientId });

  try {
    const medications = await medicationModel.find(
      { patientId, isActive: false },
      {
        select: "-diseaseType",
        populate: "prescriptionId",
      }
    );
    if (!medications || medications.length === 0) {
      logger.warn("No historical medications found", { patientId });
      return {
        success: false,
        message: "No historical medications found",
        data: {},
        status: 404,
      };
    }
    logger.info("Successfully fetched historical medications", {
      count: medications.length,
      patientId,
    });

    // Map medications with their disease names
    const historicalMedications = medications.map((med) => ({
      ...formatMedicationResponse(med),
      diseaseName: med.prescriptionId?.diseaseName || null,
    }));

    return {
      success: true,
      message: "Historical medications fetched successfully",
      data: historicalMedications,
      status: 200,
    };
  } catch (error) {
    logger.error("Error fetching historical medications", {
      error: error.message,
      patientId,
    });
    throw error;
  }
};




/**
 * Deletes a medication and updates its associated prescription
 * @param {Object} authUser - The authenticated user object
 * @param {string} medicationId - The ID of the medication to delete
 * @returns {Promise<Object>} Response with success status
 */
/**
 * Deletes a medication
 * @param {Object} user - The authenticated user object
 * @param {string} medicationId - The ID of the medication to delete
 * @returns {Promise<Object>} Response with success status
 */
/**
 * Deletes a medication and updates its associated prescription, deleting the prescription if empty
 * @param {Object} authUser - The authenticated user object
 * @param {string} medicationId - The ID of the medication to delete
 * @returns {Promise<Object>} Response with success status
 */
export const deleteMedicationService = async (authUser, medicationId) => {
  logger.info("Starting to delete medication", { medicationId, userId: authUser._id });

  try {
    const patientId = authUser.patientID?._id || authUser.patientID;

    const medication = await medicationModel.findById(medicationId);
    if (!medication) {
      logger.warn("Medication not found", { medicationId });
      return {
        success: false,
        message: "Medication not found",
        data: {},
        status: 404,
      };
    }

    if (medication.patientId.toString() !== patientId.toString()) {
      logger.warn("Unauthorized access to medication", { medicationId, patientId });
      return {
        success: false,
        message: "Unauthorized access to medication",
        data: {},
        status: 403,
      };
    }

    // Remove medication from its prescription and check if prescription should be deleted
    if (medication.prescriptionId) {
      const prescription = await prescriptionModel.findById(medication.prescriptionId);
      if (prescription) {
        prescription.medicationIds = prescription.medicationIds.filter(
          (id) => id.toString() !== medicationId
        );
        await prescriptionModel.save(prescription);
        logger.info("Updated prescription by removing medication", { prescriptionId: medication.prescriptionId });

        // Delete prescription if no medications remain
        if (prescription.medicationIds.length === 0) {
          await prescriptionModel.deleteById(medication.prescriptionId);
          logger.info("Deleted prescription due to no remaining medications", { prescriptionId: medication.prescriptionId });
        }
      }
    }

    await medicationModel.deleteById(medicationId);

    logger.info("Successfully deleted medication", { medicationId });
    return {
      success: true,
      message: `Medication with id(${medication._id}) deleted successfully`,
      data: {},
      status: 200,
    };
  } catch (error) {
    logger.error("Error deleting medication", { error: error.message, medicationId, userId: authUser._id });
    throw error;
  }
};