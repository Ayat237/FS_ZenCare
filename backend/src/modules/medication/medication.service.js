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

const checkSignificantInteractions = async (
  patientId,
  drugId,
  medicationId = null
) => {
  logger.debug("Checking for significant drug interactions");
  // Step 1: Fetch the patient's existing medications (exclude the medication being updated if applicable)
  const existingMedications = await medicationModel.find({
    patientId,
    _id: { $ne: medicationId }, // Exclude the medication being updated (for updateMedicationService)
  });


  const existingDrugIds = existingMedications
    .map((med) => med.drugId)
    .filter((id) => id && id !== drugId);

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
  //  logger.debug("Pre-existing drug interactions",preExistingInteractionResult);
    hasPreExistingInteractions =
      filterCounts.major > 0 ||
      filterCounts.moderate > 0 ||
      filterCounts.minor > 0 ||
      filterCounts.food > 0 ||
      filterCounts.therapeuticDuplication > 0;
  }
   const allDrugIds = [...existingDrugIds, drugId];

  const interactionResult = await checkDrugInteractionsService(
    patientId,
    ...allDrugIds
  );
  const { summary, drugs, metadata,interactions, filterCounts } = interactionResult;

  const drugIds = metadata.drugList.split(",");
  
  let drugMap = {};
  drugIds.forEach((drugId,index) => {
    const drug = drugs[index];

    if (drug) {
      drugMap[drugId] = {
        drugName: drug.drugName,
      };
    }
  });

  const newDrugName = drugMap[drugId]; 
  console.log("newDrugName", newDrugName);
  

  const filteredInteractions = interactions.filter((interaction) =>
    interaction.drugs.some((drug) =>
      drug.drugName.toLowerCase() === newDrugName.drugName.toLowerCase()
    )
  );
  console.log("filteredInteractions", filteredInteractions);

  // Count interactions by severity for the new drug
  const newDrugFilterCounts = {
    major: 0,
    moderate: 0, 
    minor: 0,
    food: 0,
    therapeuticDuplication: 0
  };

  // Increment counts based on severity
  filteredInteractions.forEach(interaction => {
    switch(interaction.severity) {
      case 'Major':
        newDrugFilterCounts.major++;
        break;
      case 'Moderate': 
        logger.debug("Moderate interaction",interaction);
        newDrugFilterCounts.moderate++;
        break;
      case 'Minor':
        newDrugFilterCounts.minor++;
        break;
      case 'Food':
        newDrugFilterCounts.food++;
        break;
      case 'Therapeutic Duplication':
        newDrugFilterCounts.therapeuticDuplication++;
        break;
    }
  });
   console.log("newDrugFilterCounts", newDrugFilterCounts);

  // Check if there are any significant interactions
  const hasSignificantNewInteractions = 
    newDrugFilterCounts.major > 0 ||
    newDrugFilterCounts.moderate > 0 ||
    newDrugFilterCounts.minor > 0 ||
    newDrugFilterCounts.therapeuticDuplication > 0;
    console.log("hasSignificantNewInteractions", hasSignificantNewInteractions);

    console.log("newDrugFilterCounts", newDrugFilterCounts);
    
  return {
    hasSignificantNewInteractions,
    interactionResult: {
      summary,
      drugs,
      metadata,
      filteredInteractions,
      newDrugFilterCounts,

    },
  };
};

const handlePendingAction = async (
  patientId,
  medicationData,
  interactionResult,
  action
) => {
  const pendingId = randomUUID();
  await storePendingMedication(pendingId, {
    patientId,
    medicationData,
    interactionResult,
    action,
  });

  throw new ErrorHandlerClass(
    "Potential drug interactions found",
    200,
    "Interaction Warning",
    `Please confirm before proceeding with the ${action}`,
    {
      pendingId,
      ...interactionResult,
    }
  );
};
// Service to add a new medication
export const addMedicationService = async (user, medicationData) => {
  logger.debug("Adding new medication", { userId: user._id, medicationData });

  const patientId = user.patientID?._id || user.patientID;
  const patient = await patientModel.findById(patientId);
  if (!patient) {
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

  // Parse dates
  const startDate = DateTime.fromISO(startDateTime, { zone: "UTC" });
  const endDate = DateTime.fromISO(endDateTime, { zone: "UTC" });

  const startDateAtMidnight = startDate.toJSDate();
  const endDateAtMidnight = endDate.toJSDate();

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

  // Check for drug interactions
  const { hasSignificantNewInteractions, interactionResult } =
    await checkSignificantInteractions(patientId, drugId);

  if (hasSignificantNewInteractions) {
    // Store parsed dates in the medicationData for confirmAddMedicine
    const medicationDataWithParsedDates = {
      ...medicationData,
      startDateTime: startDateAtMidnight,
      endDateTime: endDateAtMidnight,
    };
    await handlePendingAction(
      patientId,
      medicationDataWithParsedDates,
      interactionResult,
      "add"
    );
  }
};
