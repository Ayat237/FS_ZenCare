import { Router } from "express";
import * as doctorController from "./doctor.controller.js";
import { errorHandling } from "../../middlewares/error-hanling.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as validate from "./doctor.validation.js";
import {
  parseCoordinatesFromFormData,
  parseDoctorFormData,
} from "../../middlewares/data-parse.utils.js";
import { multerMiddleware } from "../../middlewares/multer.middleware.js";
import extensions from "../../utils/file-extenstions.utils.js";
import { auth } from "google-auth-library";
import { possibleRoles } from "../../utils/system-roles.utils.js";
import { authenticattion as authentication } from "../../middlewares/authentication.middleware.js";
import { authorization } from "../../middlewares/authorization.middleware.js";

const doctorRouter = Router();

const upload = multerMiddleware({
  filePath: "verification",
  allowedExtensions: extensions.Images,
});

// Register a new doctor (new user)
doctorRouter.post(
  "/register-new",
  upload.fields([
    { name: "verificationId", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
  ]),
  parseDoctorFormData,
  parseCoordinatesFromFormData,
  errorHandling(validation(validate.doctorRegisterNewSchema)),
  errorHandling(doctorController.registerNewDoctorUser)
);

// Add doctor role to existing user
doctorRouter.post(
  "/register-existing",
  upload.fields([
    { name: "verificationId", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
  ]),
  parseDoctorFormData,
  parseCoordinatesFromFormData,
  errorHandling(validation(validate.doctorRegisterExistingSchema)),
  errorHandling(doctorController.addDoctorRoleToExistingUser)
);

// Get all doctors
doctorRouter.get(
  "/all",
  authentication(),
  authorization(possibleRoles.PATIENT),
  errorHandling(doctorController.getAllDoctors)
);

export { doctorRouter };
