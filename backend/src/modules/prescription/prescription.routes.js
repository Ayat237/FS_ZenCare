import { Router } from "express";
import * as prescriptionController from "./prescription.controller.js";
import { authenticattion, authorization, errorHandling } from "../../middlewares/index.js";
import { possibleRoles } from "../../utils/system-roles.utils.js";
//import * as VSchema from "./medication.validtion.js";


const prescriptionRouter = Router();

prescriptionRouter.post(
    "/create-prescription",
    //(VSchema.addMedicineSchema),
    authenticattion(),
    authorization(possibleRoles.PATIENT),
    errorHandling(prescriptionController.createPrescription)
)




export { prescriptionRouter };
