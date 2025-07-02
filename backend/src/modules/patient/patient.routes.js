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
import { patientRegisterNewSchema, patientRegisterExistingSchema } from "./patient.validation.js";

const patientRouter = express.Router();
export const parseCoordinatesFromFormData = (req, res, next) => {
  try {
    if (req.body.coordinates && typeof req.body.coordinates === "string") {
      req.body.coordinates = JSON.parse(req.body.coordinates);
    }
  } catch (error) {
    console.error("Invalid coordinates JSON:", error.message);
    req.body.coordinates = {}; // fallback so Joi validation fails correctly
  }
  next();
};


patientRouter.post(
  "/register",
  multerHost({ allowedExtensions: extensions.Images }).single("profileImage"),
  parseCoordinatesFromFormData,
  errorHandling(validation(VSchema.registerSchema)),
  errorHandling(patientController.registerPatient)
);

// Register a new patient (new user)
patientRouter.post(
  "/register-new",
  multerHost({ allowedExtensions: extensions.Images }).single("profileImage"),
  parseCoordinatesFromFormData,
  errorHandling(validation(patientRegisterNewSchema)),
  errorHandling(patientController.registerNewPatientUser)
);

// Add patient role to existing user
patientRouter.post(
  "/register-existing",
  multerHost({ allowedExtensions: extensions.Images }).single("profileImage"),
  parseCoordinatesFromFormData,
  errorHandling(validation(patientRegisterExistingSchema)),
  errorHandling(patientController.addPatientRoleToExistingUser)
);

patientRouter.delete(
  "/deleteAccount",
  authenticattion(),
  authorization(possibleRoles.PATIENT),
  errorHandling(validation(VSchema.deleteAccountSchema)),
  errorHandling(patientController.deletePatientAccount)
);

patientRouter.patch(
  "/edit-profile-image",
  multerHost({ allowedExtensions: extensions.Images }).single("profileImage"),
  authenticattion(),
  authorization(possibleRoles.PATIENT),
  errorHandling(validation(VSchema.editProfileImageSchema)),
  errorHandling(patientController.editProfileImage)
);

patientRouter.patch(
  "/remove-profile-image",
  authenticattion(),
  authorization(possibleRoles.PATIENT),
  errorHandling(validation(VSchema.removeProfileImageSchema)),
  errorHandling(patientController.removeProfileImage)
);


export { patientRouter };
