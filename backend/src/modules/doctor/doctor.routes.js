import { Router } from "express";
import * as doctorController from "./doctor.controller.js";
import { errorHandling } from "../../middlewares/error-hanling.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as validate from "./doctor.validation.js";
import { authenticattion, parseCoordinatesFromFormData, parseDoctorFormData } from "../../middlewares/index.js";
import { multerMiddleware } from "../../middlewares/multer.middleware.js";
import extensions from "../../utils/file-extenstions.utils.js";
import { doctorRegisterNewSchema, doctorRegisterExistingSchema } from "./doctor.validation.js";

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
  errorHandling(validation(doctorRegisterNewSchema)),
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
  errorHandling(validation(doctorRegisterExistingSchema)),
  errorHandling(doctorController.addDoctorRoleToExistingUser)
);


export { doctorRouter };
