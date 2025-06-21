import database from "../../../database/databaseConnection.js";
import { MedicationModel } from "../../../database/models/medications.model.js";
import {
  Prescription,
  PrescriptionModel,
} from "../../../database/models/prescription.model.js";
import { checkSignificantInteractions } from "../../services/drugInteraction.service.js";
import { ErrorHandlerClass } from "../../utils/error-class.utils.js";
import { logger } from "../../utils/logger.utils.js";
import { addMedicationService } from "../medication/medication.service.js";

const prescriptionModel = new PrescriptionModel(database);
const medicationModel = new MedicationModel(database);

export const addPrescriptionService = async (user, prescriptionData) => {
  logger.info("Starting add prescription with medications process", {
    userId: user._id,
    prescriptionName: prescriptionData.diseaseName,
    
  });

  const patientId = user.patientID?._id || user.patientID;
  const { diseaseName,diseaseType, medications } = prescriptionData;

  const prescription = new Prescription({
    diseaseName,
    diseaseType,
    patientId,
    createdBy: user._id,
    medicationIds: [],
  });

  // Check for duplicate active medications across all new medications
  logger.debug("Checking for duplicate active medications");
  const allDrugIds = medications.map((med) => med.drugId);
  const existingMedications = await medicationModel.find({
    patientId,
    drugId: { $in: allDrugIds },
    isActive: true,
  });

  const duplicates = [];
  medications.forEach((med) => {
    const matchingDuplicates = existingMedications.filter(
      (existingMed) => existingMed.drugId === med.drugId
    );
    if (matchingDuplicates.length > 0) {
      duplicates.push(
        ...matchingDuplicates.map((dup) => ({
          _id: dup._id,
          medicineName: dup.medicineName,
          drugId: dup.drugId,
          hasInteractions: dup.hasInteractions || false,
        }))
      );
    }
  });

  if (duplicates.length > 0) {
    logger.warn("Duplicate active medications found", { patientId, duplicates });
    throw new ErrorHandlerClass(
      "Duplicate active medications found",
      200,
      "Interaction Warning",
      `Please confirm before proceeding with adding `,
      duplicates
    );
  }
  logger.debug("No duplicate active medications found");

  // Prepare new drugs for interaction check
  const newDrugs = medications.map((med) => ({
    drugId: med.drugId,
    drugName: med.medicineName,
  }));

  // Check interactions for all new medications
  const { hasSignificantNewInteractions, interactionResult } =
    await checkSignificantInteractions(patientId, newDrugs);

  if (hasSignificantNewInteractions) {
    logger.warn("Significant interactions found", {
      patientId,
      interactions: interactionResult.interactionsByDrug,
    });
    throw new ErrorHandlerClass(
      "Potential drug interactions found",
      200,
      "Interaction Warning",
      "Please confirm before proceeding with adding",
      interactionResult
    );
  }

  // Add medications using addMedicationService
  const medicationResults = [];
  for (const medicationData of medications) {
    const updatedMedicationData = {
      ...medicationData,
    };
    const result = await addMedicationService(user, updatedMedicationData, prescription._id);
    medicationResults.push(result);
    prescription.medicationIds.push(result._id);
  }



  // // Prepare new drugs for interaction check (include both drugId and drugName)
  // const newDrugs = medications.map((med) => ({
  //   drugId: med.drugId,
  //   drugName: med.medicineName,
  // }));

  // // Check interactions for all new medications
  // const { hasSignificantNewInteractions, interactionResult } =
  //   await checkSignificantInteractions(patientId, newDrugs);

  // if (hasSignificantNewInteractions) {
  //   throw new ErrorHandlerClass(
  //     "Potential drug interactions found",
  //     200,
  //     "Interaction Warning",
  //     `Please confirm before proceeding with adding `,
  //     interactionResult
  //   );
  // }

  // // Add medications using addMedicationService
  // const medicationResults = [];
  // const duplicateMedications = [];

  // for (const medicationData of medications) {
  //   const updatedMedicationData = {
  //     ...medicationData,
  //   };

  //   const result = await addMedicationService(user, updatedMedicationData,prescription._id);
  //   console.log("result",result);  
  //   if (result.success !== undefined) {
  //     // Interaction warning found
  //     return {
  //       success: false,
  //       message: "Potential drug interactions found",
  //       data: { result },
  //     };
  //   }
  //   medicationResults.push(result);
  //   prescription.medicationIds.push(result.id);
  // }
  // console.log("prescription",prescription);
  // console.log("medicationResults",medicationResults);
  
  
  await prescriptionModel.save(prescription);

  return {
    prescription,
    medications: medicationResults,
  };
};

export const addAllAcceptedMedicationsService = async (
  user,
  prescriptionData
) => {
  logger.info("Adding all accepted medications to prescription", {
    userId: user._id,
    prescriptionId: prescriptionData.prescriptionId,
  });
  try {
    const patientId = user.patientID?._id || user.patientID;
    const { diseaseName,diseaseType, medications } = prescriptionData;

    const prescription = new Prescription({
      diseaseName,
      diseaseType,
      patientId,
      createdBy: user._id,
      medicationIds: [],
    });

    // Add medications using addMedicationService
    const medicationResults = [];
    for (const medicationData of medications) {
      const updatedMedicationData = {
        ...medicationData,
        hasInteractions: medicationData.hasInteractions || false, // Set based on frontend input
      };

      const result = await addMedicationService(user, updatedMedicationData,prescription._id);

      if (result.success !== undefined) {
        // Interaction warning found
        return {
          success: false,
          message: result.message || "Failed to add medication",
          data: result || {},
        };
      }

      medicationResults.push(result);

      prescription.medicationIds.push(result.id);

      
    }
    console.log("prescription",prescription);
    
    await prescriptionModel.save(prescription);

    logger.info("Prescription with accepted medications successfully created", {
      userId: user._id,
      prescriptionId: prescription._id,
      medicationCount: medications.length,
    });

    return {
      prescription,
      medications: medicationResults,
    };
  } catch (error) {
    logger.error("Error adding all accepted medications to prescription", {
      userId: user._id,
      prescriptionId: prescriptionData.prescriptionId,
      error: error.message,
    });
    throw error instanceof ErrorHandlerClass
      ? error
      : new ErrorHandlerClass(
          "Error accepting and adding prescription",
          500,
          "Server Error",
          error.message
        );
  }
};
