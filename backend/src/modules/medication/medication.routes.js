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

export { medicationRouter };
