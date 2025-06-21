import { Router } from "express";
import * as prescriptionController from "./prescription.controller.js";
import { authenticattion, authorization, errorHandling, validation } from "../../middlewares/index.js";
import { possibleRoles } from "../../utils/system-roles.utils.js";
import * as VSchema from "./prescription.validation.js";


const prescriptionRouter = Router();

prescriptionRouter.post(
    "/create-prescription",
    validation(VSchema.createPrescriptionSchema),
    authenticattion(),
    authorization(possibleRoles.PATIENT),
    errorHandling(prescriptionController.createPrescription)
)


prescriptionRouter.post(
    "/accepted-prescription",
    errorHandling(validation(VSchema.acceptAndAddPrescriptionSchema)),
    authenticattion(),
    authorization(possibleRoles.PATIENT),
    errorHandling(prescriptionController.acceptAndAddPrescription)
)




export { prescriptionRouter };
