import database from "../../../database/databaseConnection.js";
import { Prescription, PrescriptionModel } from "../../../database/models/prescription.model.js";
import { ErrorHandlerClass } from "../../utils/error-class.utils.js";
import { logger } from "../../utils/logger.utils.js";
import { addMedicationService, checkSignificantInteractions } from "../medication/medication.service.js";


const prescriptionModel = new PrescriptionModel(database);


export const addPrescriptionService = async (user, prescriptionData) => {
  logger.info("Starting add prescription with medications process", {
    userId: user._id,
    prescriptionName: prescriptionData.diseaseName,
  });

  const patientId = user.patientID?._id || user.patientID;
  const { diseaseName, medications } = prescriptionData;

  const prescription = new Prescription({
    diseaseName,
    patientId,
    createdBy: user._id,
    medicationIds: [],
  });

  // Prepare new drugs for interaction check (include both drugId and drugName)
  const newDrugs = medications.map((med) => ({
    drugId: med.drugId,
    drugName: med.medicineName,
  }));

  // Check interactions for all new medications
  const { hasSignificantNewInteractions, interactionResult } =
    await checkSignificantInteractions(patientId, newDrugs);

  if (hasSignificantNewInteractions) {
    throw new ErrorHandlerClass(
      "Potential drug interactions found",
      200,
      "Interaction Warning",
      `Please confirm before proceeding with adding `,
      interactionResult
    );
  }

  // Add medications using addMedicationService
  const medicationResults = [];
  for (const medicationData of medications) {
    const updatedMedicationData = {
      ...medicationData,
    };

    const result = await addMedicationService(user, updatedMedicationData);
    if (result.success !== undefined) {
      // Interaction warning found
      return {
        success: false,
        message: "Potential drug interactions found",
        data: { interactions: result.interactions },
      };
    }
    medicationResults.push(result);
    prescription.medicationIds.push(result.id);
  }
  await prescriptionModel.save(prescription);

  return {
    success: true,
    message: "Prescription with medications created successfully",
    data: {
      prescription,
      medications: medicationResults,
    },
  };
};
