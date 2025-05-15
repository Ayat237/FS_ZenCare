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
import { randomUUID } from "crypto";
import { logger } from "../../utils/logger.utils.js";

const patientModel = new PatientModel(database);
const medicationModel = new MedicationModel(database);

/**
 * @typedef {Object} DrugInteractionResult
 * @property {string} summary - Summary of drug interactions
 * @property {Array} drugs - List of drugs involved in interactions
 * @property {Object} metadata - Additional metadata about the interactions
 * @property {Array} interactions - Detailed list of drug interactions
 * @property {Object} filterCounts - Count of interactions by severity
 */

/**
 * @typedef {Object} InteractionCheckResult
 * @property {boolean} hasSignificantNewInteractions - Whether significant interactions were found
 * @property {Object} interactionResult - Detailed interaction results
 * @property {string} interactionResult.summary - Summary of interactions with the new drug
 */

/**
 * Checks for significant drug interactions between a new drug and existing medications
 * @param {string} patientId - The ID of the patient
 * @param {string} drugId - The ID of the new drug to check
 * @param {string} [medicationId=null] - Optional ID of medication being updated
 * @returns {Promise<InteractionCheckResult>} Object containing interaction check results
 */
const checkSignificantInteractions = async (
  patientId,
  drugId,
  medicationId = null
) => {
  logger.info("Starting drug interaction check", {
    patientId,
    drugId,
    medicationId,
  });

  try {
    // Step 1: Fetch the patient's existing medications (exclude the medication being updated if applicable)
    logger.debug("Fetching existing medications for patient");
    const existingMedications = await medicationModel.find({
      patientId,
      _id: { $ne: medicationId }, // Exclude the medication being updated
      isActive: true,
    });
    logger.debug("Found existing medications", {
      count: existingMedications.length,
    });

    let currentDrugId = drugId; // Default to new drugId
    if (medicationId) {
      // Fetch the current medication to check its drugId
      const currentMedication = await medicationModel.findById(medicationId,{
        isActive: true,
      });
      if (currentMedication) {
        currentDrugId = currentMedication.drugId; // Use the original drugId if updating
        if (currentDrugId === drugId) {
          // If drugId hasn't changed, exclude it from the check
          logger.debug("DrugId unchanged, excluding from interaction check");
        } else {
          logger.debug("DrugId changed, including new drugId in check");
        }
      }
    }

    const existingDrugIds = [
      ...new Set(
        existingMedications
          .map((med) => med.drugId)
          .filter(
            (id) =>
              id &&
              id !== drugId &&
              (medicationId ? id !== currentDrugId : true)
          )
      ),
    ];

    logger.debug("Extracted existing drug IDs", {
      count: existingDrugIds.length,
    });

    let preExistingInteractionResult = {
      summary: "",
      drugs: [],
      metadata: {},
      interactions: [],
      filterCounts: {},
    };
    let hasPreExistingInteractions = false;

    if (existingDrugIds.length > 0) {
      preExistingInteractionResult = await checkDrugInteractionsService(
        patientId,
        ...existingDrugIds
      );
      const { filterCounts } = preExistingInteractionResult;
      hasPreExistingInteractions = Object.values(filterCounts).some(
        (count) => count > 0
      );
    }

    // Only check interactions if drugId has changed or it's a new medication
    let interactionResult = {
      summary: "No significant interactions found with the new medication.",
      drugs: [],
      metadata: {},
      interactions: [],
      filterCounts: {},
    };
    if (!medicationId || (medicationId && currentDrugId !== drugId)) {
      const allDrugIds = [...existingDrugIds, drugId];
      interactionResult = await checkDrugInteractionsService(
        patientId,
        ...allDrugIds
      );
    } else {
      logger.debug(
        "No new interaction check needed, using pre-existing result"
      );
      interactionResult = preExistingInteractionResult;
    }
    console.log("interactionResult", interactionResult);

    const { drugs, metadata, interactions, filterCounts } = interactionResult;
    const drugIds = metadata.drugList.split(",");
    const drugMap = Object.fromEntries(
      drugIds.map((id, idx) => [id, drugs[idx]?.drugName || id])
    );

    const newDrugName = drugMap[drugId];
    const filteredInteractions = interactions.filter((interaction) =>
      interaction.drugs.some(
        (drug) => drug.drugName.toLowerCase() === newDrugName.toLowerCase()
      )
    );

    // Optimize interaction filtering with parallel processing
    const [
      majorInteractions,
      moderateInteractions,
      minorInteractions,
      therapeuticDuplications,
    ] = await Promise.all([
      filteredInteractions
        .filter((i) => i.severity.toLowerCase() === "major")
        .map((i) => i.description),
      filteredInteractions
        .filter((i) => i.severity.toLowerCase() === "moderate")
        .map((i) => i.description),
      filteredInteractions
        .filter((i) => i.severity.toLowerCase() === "minor")
        .map((i) => i.description),
      filteredInteractions
        .filter((i) => i.severity.toLowerCase() === "therapeutic duplication")
        .map((i) => i.description),
    ]);

    let summary = "No significant interactions found with the new medication.";
    if (majorInteractions.length > 0) {
      summary = `Major interactions: ${majorInteractions.join(". ")}`;
    } else {
      const summaries = [];
      if (therapeuticDuplications.length)
        summaries.push(
          `Therapeutic duplications: ${therapeuticDuplications.join(". ")}`
        );
      if (moderateInteractions.length)
        summaries.push(
          `Moderate interactions: ${moderateInteractions.join(". ")}`
        );
      if (minorInteractions.length)
        summaries.push(`Minor interactions: ${minorInteractions.join(". ")}`);
      summary = summaries.join(". ") || summary;
    }

    const newDrugFilterCounts = {
      major: majorInteractions.length,
      moderate: moderateInteractions.length,
      minor: minorInteractions.length,
      food: filteredInteractions.filter(
        (i) => i.severity.toLowerCase() === "food"
      ).length,
      therapeuticDuplication: therapeuticDuplications.length,
    };

    const hasSignificantNewInteractions = Object.values(
      newDrugFilterCounts
    ).some((count) => count > 0);

    logger.info("Significant interactions check completed", {
      hasSignificantNewInteractions,
      newDrugFilterCounts,
    });
    return {
      hasSignificantNewInteractions,
      interactionResult: { summary },
      preExistingInteractionResult,
      hasPreExistingInteractions,
    };
  } catch (error) {
    logger.error("Error checking drug interactions", {
      error: error.message,
      patientId,
      drugId,
      medicationId,
    });
    throw error;
  }
};

/**
 * Handles pending medication actions when drug interactions are found
 * @param {string} patientId - The ID of the patient
 * @param {Object} medicationData - The medication data to be stored
 * @param {Object} interactionResult - Results of the drug interaction check
 * @param {string} action - The action being performed (e.g., 'add', 'update')
 * @throws {ErrorHandlerClass} Throws an error with interaction warning details
 */
const handlePendingAction = async (
  patientId,
  medicationData,
  interactionResult,
  action
) => {
  logger.info("Handling pending medication action", {
    patientId,
    action,
    hasInteractions: !!interactionResult.summary,
  });

  try {
    const pendingId = randomUUID();
    await storePendingMedication(pendingId, {
      patientId,
      medicationData,
      interactionResult,
      action,
    });
    logger.warn("Potential drug interactions found", {
      pendingId,
      action,
      interactionSummary: interactionResult.summary,
    });

    throw new ErrorHandlerClass(
      "Potential drug interactions found",
      200,
      "Interaction Warning",
      `Please confirm before proceeding with the ${action}`,
      { pendingId, ...interactionResult }
    );
  } catch (error) {
    logger.error("Error handling pending action", {
      error: error.message,
      patientId,
      action,
    });
    throw error;
  }
};

const formatMedicationResponse = (medication) => ({
  medicineName: medication.medicineName,
  medicineType: medication.medicineType,
  startDate: medication.startDateTime,
  endDate: medication.endDateTime,
  dose: medication.dose,
  frequency: medication.frequency,
  timesPerDay: medication.timesPerDay,
  daysOfWeek: medication.daysOfWeek,
});

// Helper function to update medication fields (already exists)
const updateMedicationFields = (medication, updateData) => {
  const updates = {};
  const {
    medicineName,
    medicineType,
    drugId,
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

  if (medicineName) updates.medicineName = medicineName;
  if (medicineType) updates.medicineType = medicineType;
  if (drugId) updates.drugId = drugId;
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
export const addMedicationService = async (user, medicationData) => {
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
        { drugId, patientId }
      );
    }
    logger.debug("No duplicate active medications found");

    const medicineRecord = new Medication({
      CreatedBy: user._id,
      patientId,
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
    });

    const { hasSignificantNewInteractions, interactionResult } =
      await checkSignificantInteractions(patientId, drugId);
    if (hasSignificantNewInteractions) {
      const medicationDataWithDates = {
        ...medicationData,
        startDateTime: startDateAtMidnight,
        endDateTime: startDateAtMidnight,
      };
      await handlePendingAction(
        patientId,
        medicationDataWithDates,
        interactionResult,
        "add"
      );
    }

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

export const confirmAddMedicationService = async (user, pendingId, accept) => {
  logger.debug("Confirming medication addition", {
    userId: user._id,
    pendingId,
    accept,
  });

  const pendingData = await getPendingMedication(pendingId);
  console.log("pending Data", pendingData);

  if (!pendingData) {
    throw new ErrorHandlerClass(
      "Pending medication not found",
      404,
      "Not Found",
      "The pending medication request has expired or does not exist"
    );
  }

  const { patientId, medicationData, action } = pendingData;
  if (patientId !== user.patientID?._id.toString()) {
    throw new ErrorHandlerClass(
      "Unauthorized access to pending medication",
      403,
      "Forbidden",
      "You are not authorized to confirm this medication addition"
    );
  }

  if (action !== "add") {
    throw new ErrorHandlerClass(
      "Invalid action",
      400,
      "Bad Request",
      "This pending request is not for an add action"
    );
  }


    // Convert accept to boolean for consistency
    const isAccepted = accept === true || accept === "true";

    if (!isAccepted) {
      await deletePendingMedication(pendingId);
      throw new ErrorHandlerClass(
        "Medication addition cancelled",
        200,
        "Cancelled Request",
        "The medication addition request has been cancelled"
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

  const medicineRecord = new Medication({
    CreatedBy: user._id,
    patientId,
    medicineName,
    drugId,
    medicineType,
    dose,
    frequency,
    startHour,
    timesPerDay: frequency === Frequency.DAILY ? timesPerDay : null,
    daysOfWeek: frequency === Frequency.WEEKLY ? daysOfWeek : null,
    startDateTime,
    endDateTime,
    intakeInstructions,
    notes: notes || "",
    reminders: reminders || [],
  });

  await medicationModel.save(medicineRecord);
  await deletePendingMedication(pendingId);

  return formatMedicationResponse(medicineRecord);
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

  const medicationRecord = await medicationModel.findById(medicationId);
  if (!medicationRecord) {
    throw new ErrorHandlerClass(
      "Medication not found",
      404,
      "Not Found",
      "Error in update medication"
    );
  }


  const originalDrugId = medicationRecord.drugId;
  const originalMedicineName = medicationRecord.medicineName;
  console.log("originalDrugId", originalDrugId);
  console.log("originalMedicineName", originalMedicineName);
  
  
  updateMedicationFields(medicationRecord, updateData);

  
  let interactionResult;
  let preExistingInteractionResult;
  let hasPreExistingInteractions = false;


  const newMedicineName = updateData.medicineName;
  const drugId = updateData.drugId;
  const medicineNameChanged = newMedicineName !== originalMedicineName;

  if (medicineNameChanged) {
    if (!drugId) {
      throw new ErrorHandlerClass(
        "Drug ID is required",
        400,
        "Bad Request",
        "Drug ID is required for medication update"
      );
    }
  

    const drugIdChanged = drugId !== originalDrugId;

    if (drugIdChanged) {
      logger.info("DrugId changed", { originalDrugId, newDrugId: drugId });
      const existingMedications = await medicationModel.find({
        patientId,
        drugId,
        _id: { $ne: medicationId },
        isActive: true,
      });
      if (existingMedications.length > 0) {
        logger.warn("Duplicate active medication found", { drugId, patientId });
        throw new ErrorHandlerClass(
          "Duplicate Medication found",
          409,
          "Conflict error",
          "This medication is already active for the patient",
          { drugId, patientId }
        );
      }
    }
    const {
      hasSignificantNewInteractions,
      interactionResult: result,
      hasPreExistingInteractions: preExisting,
      preExistingInteractionResult: preExistingResult,
    } = await checkSignificantInteractions(patientId, drugId, medicationId);

    interactionResult = result;
    hasPreExistingInteractions = preExisting;
    preExistingInteractionResult = preExistingResult;

    if (hasSignificantNewInteractions) {
      await handlePendingAction(
        patientId,
        medicationRecord,
        interactionResult,
        "update"
      );
    }
  } else {
    logger.debug("Medicine name unchanged, skipping interaction check");
  }

  await medicationModel.save(medicationRecord);

  const response = {
    success: true,
    message: "Medication updated successfully",
    data: formatMedicationResponse(medicationRecord),
  };

  // If there are pre-existing interactions, include a warning in the response
  if (hasPreExistingInteractions) {
    response.message =
      "Medication updated successfully, but there are pre-existing interactions between your current medications.";
    response.preExistingWarning = preExistingInteractionResult;
  }

  logger.info("Medication updated successfully", {
    userId: user._id,
    medicationId,
  });

  return response;
};

export const confirmUpdateMedicationService = async (
  user,
  pendingId,
  accept
) => {
  logger.debug("Confirming medication update", {
    userId: user._id,
    pendingId,
    accept,
  });

  const pendingData = await getPendingMedication(pendingId);
  if (!pendingData) {
    throw new ErrorHandlerClass(
      "Pending medication update not found",
      404,
      "Not Found",
      "The pending medication update request has expired or does not exist"
    );
  }

  const { patientId, medicationData, action } = pendingData;

  if (patientId !== user.patientID?._id.toString()) {
    throw new ErrorHandlerClass(
      "Unauthorized access to pending medication",
      403,
      "Forbidden",
      "You are not authorized to confirm this medication addition"
    );
  }

  if (action !== "update") {
    throw new ErrorHandlerClass(
      "Invalid action",
      400,
      "Bad Request",
      "This pending request is not for an update action"
    );
  }


  // Convert accept to boolean for consistency
  const isAccepted = accept === true || accept === "true";

  if (!isAccepted) {
    await deletePendingMedication(pendingId);
    throw new ErrorHandlerClass(
      "Medication update cancelled",
      200,
      "Cancelled Request",
      "The medication update request has been cancelled"
    );
  }

  //Validate and update the medication record
  const medicationId = medicationData._id; // Assuming _id is included in medicationData
  if (!medicationId) {
    throw new ErrorHandlerClass(
      "Medication ID not found in pending data",
      400,
      "Bad Request",
      "Invalid medication data in pending request"
    );
  }

  const medicationRecord = await medicationModel.findById(medicationId);
  if (!medicationRecord) {
    throw new ErrorHandlerClass(
      "Medication not found",
      404,
      "Not Found",
      "The medication to update does not exist"
    );
  }

  // Update fields from medicationData
  updateMedicationFields(medicationRecord, medicationData);

  console.log("medication Record", medicationRecord);
  console.log("medication Data", medicationData);
  
  

  await medicationModel.save(medicationRecord);
  await deletePendingMedication(pendingId);

  return formatMedicationResponse(medicationData);
};
