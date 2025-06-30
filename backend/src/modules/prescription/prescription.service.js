import { populate } from "dotenv";
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
  const { diseaseName, diseaseType, medications } = prescriptionData;

  // Check for existing prescriptions with the same disease name
  const existingPrescriptions = await prescriptionModel.find(
    {
      patientId,
      diseaseName
    },
    {
      populate: {
        path: "medicationIds",
        select: "isActive",
      },
    }
  );
  console.log("existingPrescriptions", existingPrescriptions);

  if (existingPrescriptions.length > 0) {
    // Check each existing prescription for active medications
    for (const prescription of existingPrescriptions) {
      const activeMedications = prescription.medicationIds.filter(
        (med) => med.isActive
      );

      if (activeMedications.length > 0) {
        // At least one medication is active, so the prescription is active
        logger.warn("Found active prescription with same disease name", {
          patientId,
          diseaseName,
          prescriptionId: prescription._id,
        });
        // return {
        //   success: false,
        //   message: "Prescription with same disease name already exists",
        //   data: {},
        //   status: 409,
        // };
        throw new ErrorHandlerClass(
          "Active prescription exists",
          409,
          "Duplicate Warning",
          `An active prescription for ${diseaseName} exists`,
          { prescriptionId: prescription._id }
        );
      }
    }
  }

  const prescription = new Prescription({
    diseaseName,
    diseaseType,
    patientId,
    createdBy: user._id,
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
    logger.warn("Duplicate active medications found", {
      patientId,
      duplicates,
    });
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
    const result = await addMedicationService(
      user,
      updatedMedicationData,
      prescription._id
    );
    medicationResults.push(result);
    prescription.medicationIds.push(result.id);
  }
  await prescriptionModel.save(prescription);
  console.log("prescription", prescription);

  logger.info("Prescription with medications successfully created", {
    userId: user._id,
    prescriptionId: prescription._id,
    medicationCount: medications.length,
  });

  console.log("medicationResults", medicationResults);
  console.log("prescription", prescription);

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
    const { diseaseName, diseaseType, medications } = prescriptionData;

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

      const result = await addMedicationService(
        user,
        updatedMedicationData,
        prescription._id
      );

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
    console.log("prescription", prescription);

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

export const deletePrescriptionService = async (authUser, prescriptionId) => {
  logger.info("Starting to delete prescription and related medications", {
    prescriptionId,
    userId: authUser._id,
  });

  try {
    const patientId = authUser.patientID?._id || authUser.patientID;

    const prescription = await prescriptionModel.findById(prescriptionId);
    if (!prescription) {
      logger.warn("Prescription not found", { prescriptionId });
      return {
        success: false,
        message: "Prescription not found",
        data: {},
        status: 404,
      };
    }

    // Verify patient ownership through associated medications
    const medications = await medicationModel.find({
      prescriptionId,
      patientId,
    });
    if (medications.length === 0) {
      logger.warn("No medications found for prescription or unauthorized", {
        prescriptionId,
        patientId,
      });
      return {
        success: false,
        message: "No medications found for prescription or unauthorized",
        data: {},
        status: 403,
      };
    }

    // Delete all medications in bulk
    await medicationModel.deleteMany({ prescriptionId });
    logger.info("Deleted all medications for prescription", {
      prescriptionId,
      count: medications.length,
    });

    // Delete the prescription
    await prescriptionModel.deleteById(prescriptionId);
    logger.info("Deleted prescription", { prescriptionId });

    return {
      success: true,
      message: `Prescription with id(${prescriptionId}) and its medications deleted successfully`,
      data: {},
      status: 200,
    };
  } catch (error) {
    logger.error("Error deleting prescription and related medications", {
      error: error.message,
      prescriptionId,
      userId: authUser._id,
    });
    throw error;
  }
};



/**
 * Fetches all historical prescriptions for a patient
 * @param {string} patientId - The ID of the patient
 * @returns {Promise<Object>} Response with success status and historical prescription data
 */
export const historicalPrescriptionService = async (patientId) => {
  logger.info("Starting to fetch historical prescriptions", { patientId });

  try {
    // Find all prescriptions for the patient
    const prescriptions = await prescriptionModel.find({ patientId }, {
      populate: {
        path: "medicationIds",
        select: "isActive medicineName",
      },
    });

    if (!prescriptions || prescriptions.length === 0) {
      logger.warn("No prescriptions found", { patientId });
      return {
        success: false,
        message: "No prescriptions found",
        data: {},
        status: 404,
      };
    }

    // Filter for historical prescriptions (all medications inactive)
    const historicalPrescriptions = prescriptions.filter((prescription) => {
      const allInactive = prescription.medicationIds.every((med) => !med.isActive);
      return allInactive;
    });

    if (historicalPrescriptions.length === 0) {
      logger.warn("No historical prescriptions found", { patientId });
      return {
        success: false,
        message: "No historical prescriptions found",
        data: {},
        status: 404,
      };
    }

    // Format the response
    const formattedPrescriptions = historicalPrescriptions.map((prescription) => ({
      _id: prescription._id,
      diseaseName: prescription.diseaseName,
      diseaseType: prescription.diseaseType,
      medications: prescription.medicationIds.map((med) => ({
        _id: med._id,
        medicineName: med.medicineName,
        isActive: med.isActive,
      })),
      createdAt: prescription.createdAt,
    }));

    logger.info("Successfully fetched historical prescriptions", {
      count: historicalPrescriptions.length,
      patientId,
    });
    return {
      success: true,
      message: "Historical prescriptions fetched successfully",
      data: formattedPrescriptions,
      status: 200,
    };
  } catch (error) {
    logger.error("Error fetching historical prescriptions", { error: error.message, patientId });
    throw error;
  }
};
