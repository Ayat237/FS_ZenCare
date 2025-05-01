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

// const checkSignificantInteractions = async (patientId, drugId) => {
//   const interactionResult = await checkDrugInteractionsService(
//     patientId,
//     drugId
//   );

//   const { summary, drugs, metadata, filterCounts, interactions, consumerHtml } =
//     interactionResult;

//   const hasSignificantInteractions =
//     filterCounts.major > 0 ||
//     filterCounts.moderate > 0 ||
//     filterCounts.therapeuticDuplication > 0;

//   return {
//     hasSignificantInteractions,
//     interactionResult: {
//       summary,
//       drugs,
//       metadata,
//       filterCounts,
//       interactions,
//       consumerHtml,
//     },
//   };
// };

// const handlePendingAction = async (
//   user,
//   medicationData,
//   interactionResult,
//   action
// ) => {
//   const pendingId = randomUUID();
//   await storePendingMedication(pendingId, {
//     user,
//     medicationData,
//     interactionResult,
//     action,
//   });
  
//   throw new ErrorHandlerClass(
//     "Potential drug interactions found",
//     200,
//     "Interaction Warning",
//     `Please confirm before proceeding with the ${action}`,
//     {
//       pendingId,
//       ...interactionResult,
//     }
//   );
// };
// // Service to add a new medication
// export const addMedicationService = async (user, medicationData) => {
//   logger.debug("Adding new medication", { userId: user._id, medicationData });

//   const patientId = user.patientID?._id || user.patientID;
//   const patient = await patientModel.findById(patientId);
//   if (!patient) {
//     throw new ErrorHandlerClass(
//       "Patient not found",
//       404,
//       "Not Found",
//       "Error in create medicine"
//     );
//   }

//   const {
//     medicineName,
//     drugId,
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
//     reminders,
//   } = medicationData;

//   // Parse dates
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
//     notes: notes || "",
//     reminders: reminders || [],
//   });

//   // Check for drug interactions
//   const { hasSignificantInteractions, interactionResult } =
//     await checkSignificantInteractions(patientId, drugId);

//   if (hasSignificantInteractions) {
//     // Store parsed dates in the medicationData for confirmAddMedicine
//     const medicationDataWithParsedDates = {
//       ...medicationData,
//       startDateTime: startDateAtMidnight,
//       endDateTime: endDateAtMidnight,
//     };
//     await handlePendingAction(
//       user,
//       medicationDataWithParsedDates,
//       interactionResult,
//       "add"
//     );
//   }

  
// };
