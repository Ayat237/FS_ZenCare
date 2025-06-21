import { DateTime } from "luxon";
import { PatientModel } from "../../../database/models/patient.model.js";
import {
  MedicationModel,
  Medication,
} from "../../../database/models/medications.model.js";
import { Frequency } from "../../utils/enums.utils.js";
import database from "../../../database/databaseConnection.js";
import { ErrorHandlerClass } from "../../utils/error-class.utils.js";
import {
  checkSignificantInteractions,
} from "../../services/index.js";
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
    frequency,
    timesPerDay,
    daysOfWeek,
    startHour,
    startDateTime,
    endDateTime,
    intakeInstructions,
    notes,
  } = updateData;


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

    return formatMedicationResponse(medicineRecord);
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

    return formatMedicationResponse(medicineRecord);

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

    return formatMedicationResponse(medicineRecord);
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

  const medicationRecord = await medicationModel.findById(medicationId,{
    isActive: true,
  });
  if (!medicationRecord ) {
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

  return formatMedicationResponse(medicationRecord);
};
