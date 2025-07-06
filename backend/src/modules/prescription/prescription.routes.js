import { Router } from "express";
import * as prescriptionController from "./prescription.controller.js";
import { authenticattion, authorization, errorHandling, validation } from "../../middlewares/index.js";
import { possibleRoles } from "../../utils/system-roles.utils.js";
import * as VSchema from "./prescription.validation.js";


const prescriptionRouter = Router();

prescriptionRouter.post(
    "/create-prescription",
    authenticattion(),
    authorization(possibleRoles.PATIENT),
    validation(VSchema.createPrescriptionSchema),
    errorHandling(prescriptionController.createPrescription)
)


prescriptionRouter.post(
    "/accepted-prescription",
    authenticattion(),
    authorization(possibleRoles.PATIENT),
    errorHandling(validation(VSchema.acceptAndAddPrescriptionSchema)),
    errorHandling(prescriptionController.acceptAndAddPrescription)
)



prescriptionRouter.delete(
    "/delete-prescription/:prescriptionId",
    authenticattion(),
    authorization(possibleRoles.PATIENT),
    errorHandling(validation(VSchema.deletePrescriptionSchema)),
    errorHandling(prescriptionController.deletePrescription)
)


prescriptionRouter.get(
    "/prescriptions-history",
    authenticattion(),
    authorization(possibleRoles.PATIENT),
    errorHandling(prescriptionController.historicalPrescriptions)
)
export { prescriptionRouter };
