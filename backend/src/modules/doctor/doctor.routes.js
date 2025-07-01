import { Router } from "express";
import * as doctorController from "./doctor.controller.js";
import { errorHandling } from "../../middlewares/error-hanling.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as validate from "./doctor.validation.js";
import { authenticattion } from "../../middlewares/index.js";
import { multerMiddleware } from "../../middlewares/multer.middleware.js";
import extensions from "../../utils/file-extenstions.utils.js";

const doctorRouter = Router();

const upload = multerMiddleware({
  filePath: "verification",
  allowedExtensions: extensions.Images,
});

const profileUpload = multerMiddleware({
  filePath: "profile",
  allowedExtensions: extensions.Images,
});

export const parseDoctorFormData = (req, res, next) => {
  function safeParseArray(field) {
    try {
      const value = req.body[field];
      if (!value || value === "") {
        req.body[field] = []; // empty or missing becomes empty array
        return;
      }
  
      if (Array.isArray(value)) return;
  
      const parsed = JSON.parse(value);
      req.body[field] = Array.isArray(parsed) ? parsed : [parsed]; // ensure it's always array
    } catch (e) {
      console.warn(`Failed to parse field ${field}:`, e.message);
      req.body[field] = [];
    }
  }
  

  // Parse fields expected to be arrays or objects
  safeParseArray("education");
  safeParseArray("certifications");
  safeParseArray("hospitalAffiliation");
  safeParseArray("clinicBranches");
  safeParseArray("role");

  next();
};

// Doctor registration (with verificationId and profile image upload)
doctorRouter.post(
  "/register",
  upload.fields([
    { name: "verificationId", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
  ]),
  parseDoctorFormData,
  errorHandling(validation(validate.doctorRegisterSchema)),
  errorHandling(doctorController.registerDoctor)
);

// Doctor email verification
doctorRouter.patch(
  "/verify-email",
  errorHandling(validation(validate.verifyDoctorEmailSchema)),
  errorHandling(doctorController.verifyDoctorEmail)
);

// Admin approval for doctor verification
doctorRouter.patch(
  "/admin-approve/:doctorId",
  authenticattion(),
  errorHandling(validation(validate.adminApproveDoctorSchema)),
  errorHandling(doctorController.adminApproveDoctor)
);

// Get doctor profile (authenticated)
doctorRouter.get(
  "/profile",
  authenticattion(),
  errorHandling(doctorController.getDoctorProfile)
);

// Update doctor profile (authenticated)
doctorRouter.put(
  "/profile",
  authenticattion(),
  errorHandling(validation(validate.updateDoctorProfileSchema)),
  errorHandling(doctorController.updateDoctorProfile)
);

// Update doctor profile image (authenticated)
doctorRouter.patch(
  "/profile/image",
  authenticattion(),
  profileUpload.single("profileImage"),
  errorHandling(validation(validate.updateProfileImageSchema)),
  errorHandling(doctorController.updateProfileImage)
);

export { doctorRouter };
