import { Router } from "express";
import * as adminController from "./admin.controller.js";
import { errorHandling } from "../../middlewares/error-hanling.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { possibleRoles } from "../../utils/system-roles.utils.js";
import { authenticattion, authorization } from "../../middlewares/index.js";
import * as VSchema from "./admin.validation.js";

// import your admin login validation if you have one

const adminRouter = Router();

adminRouter.post("/login", 
    errorHandling(validation(VSchema.adminLoginSchema)),
    errorHandling(adminController.adminLogin));
adminRouter.get(
  "/pending-doctors",
  //authenticattion(),
//  authorization('admin'),
  errorHandling(adminController.getPendingDoctors)
);
adminRouter.patch(
  "/verify-doctor/:userId",
 // authenticattion(),
 // authorization(possibleRoles.ADMIN),
  errorHandling(validation(VSchema.verifyDoctorSchema)),
  errorHandling(adminController.verifyDoctor)
);

export { adminRouter };
