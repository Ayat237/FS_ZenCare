import express from "express";
import * as patientController from "./patient.controller.js";
import {
  authenticattion,
  authorization,
  errorHandling,
  multerHost,
  validation,
} from "../../middlewares/index.js";
import extensions from "../../utils/file-extenstions.utils.js";
import * as VSchema from "./patient.validation.js";
import { possibleRoles } from "../../utils/system-roles.utils.js";

const patientRouter = express.Router();

patientRouter.post(
  "/register",
  multerHost({ allowedExtensions: extensions.Images }).single("profileImage"),
  validation(VSchema.registerSchema),
  errorHandling(patientController.registerPatient)
);
patientRouter.patch(
  "/verify-email-otp/:emailToken",
  errorHandling(patientController.verifyEmailOTP)
);

patientRouter.delete(
  "/deleteAccount",
  authenticattion(),
  authorization(possibleRoles.PATIENT),
  errorHandling(patientController.deletePatientAccount)
);

patientRouter.patch(
  "/edit-profile-image",
  multerHost({ allowedExtensions: extensions.Images }).single("profileImage"),
  authenticattion(),
  authorization(possibleRoles.PATIENT),
  errorHandling(patientController.editProfileImage)
);

patientRouter.patch(
  "/remove-profile-image",
  authenticattion(),
  authorization(possibleRoles.PATIENT),
  errorHandling(patientController.removeProfileImage)
);


export { patientRouter };
