import { Router } from "express";
import * as medicationsController from "./medication.controller.js";
import { authenticattion, authorization, errorHandling, validation } from "../../middlewares/index.js";
import { possibleRoles } from "../../utils/system-roles.utils.js";
import * as VSchema from "./medication.validtion.js";


const medicationRouter = Router();

medicationRouter.post(
    "/add-medicine",
    validation(VSchema.addMedicineSchema),
    authenticattion(),
    authorization(possibleRoles.PATIENT),
    errorHandling(medicationsController.addMedicine)
)

medicationRouter.put(
    "/update-medicine/:id",
    validation(VSchema.updateMedicineSchema),
    authenticattion(),
    authorization(possibleRoles.PATIENT),
    errorHandling(medicationsController.updateMedicationRecord)
)

medicationRouter.get(
    "/list-all-medications",
    authenticattion(),
    authorization(possibleRoles.PATIENT),
    errorHandling(medicationsController.listAllMedications)
)

medicationRouter.get(
    "/get-medication/:id",
    authenticattion(),
    authorization(possibleRoles.PATIENT),
    errorHandling(medicationsController.getMedicationById)
)

medicationRouter.get(
    "/medDashboard-reminder",
    authenticattion(),
    authorization(possibleRoles.PATIENT),
    errorHandling(medicationsController.getDashboardReminders)
)

medicationRouter.put(
    "/update-medication-status/:medicationId",
    validation(VSchema.updateMedicationStatusSchema),
    authenticattion(),
    authorization(possibleRoles.PATIENT),
    errorHandling(medicationsController.markDoseTakenAndUpdateDashboard)
)

medicationRouter.get(
    "/medication-history",
    authenticattion(),
    authorization(possibleRoles.PATIENT),
    errorHandling(medicationsController.listHistoricalMedications)
)

medicationRouter.delete(
    "/delete-medication/:medicationId",
    authenticattion(),
    authorization(possibleRoles.PATIENT),
    errorHandling(medicationsController.deleteMedication)
)



export { medicationRouter };
