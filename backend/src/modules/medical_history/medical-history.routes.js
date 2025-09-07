import { Router } from "express";
import * as medicalHistoryController from "./medical-history.controller.js";
import {
  authenticattion,
  authorization,
  errorHandling,
  multerHost,
  validation,
} from "../../middlewares/index.js";
import { possibleRoles } from "../../utils/system-roles.utils.js";
import * as VSchema from "./medical-history.validation.js";
import extensions from "../../utils/file-extenstions.utils.js";


// Custom middleware to parse JSON fields
const parseJsonFields = (req, res, next) => {
  try {
    if (req.body.diagnoses && typeof req.body.diagnoses === "string") {
      req.body.diagnoses = JSON.parse(req.body.diagnoses);
    } else if (!req.body.diagnoses) {
      req.body.diagnoses = [];
    }
    if (req.body.testsAndRays && typeof req.body.testsAndRays === "string") {
      req.body.testsAndRays = JSON.parse(req.body.testsAndRays);
    } else if (!req.body.testsAndRays) {
      req.body.testsAndRays = [];
    }
    if (req.body.surgeries && typeof req.body.surgeries === "string") {
      req.body.surgeries = JSON.parse(req.body.surgeries);
    } else if (!req.body.surgeries) {
      req.body.surgeries = [];
    }
    if (req.body.vaccination && typeof req.body.vaccination === "string") {
      req.body.vaccination = JSON.parse(req.body.vaccination);
    } else if (!req.body.vaccination) {
      req.body.vaccination = [];
    }
    if (req.body.lifeStyles && typeof req.body.lifeStyles === "string") {
      req.body.lifeStyles = JSON.parse(req.body.lifeStyles);
    } else if (!req.body.lifeStyles) {
      req.body.lifeStyles = [];
    }
    next();
  } catch (error) {
    return res.status(400).json({ error: "Invalid JSON format in request body" });
  }
};
const medicalHistoryRouter = Router();

medicalHistoryRouter.post(
  "/add",
  multerHost({
    allowedExtensions: extensions.Images.concat(extensions.Documents),
  }).fields([
    { name: "diagnosisAttachment", maxCount: 1 },
    { name: "testsAndRaysAttachment", maxCount: 1 },
  ]),
  parseJsonFields,
  authenticattion(),
  authorization(possibleRoles.PATIENT),
 errorHandling(validation(VSchema.addMedicalHistorySchema)),
  errorHandling(medicalHistoryController.addMedicalHistory)
);

medicalHistoryRouter.get(
  "/",
  authenticattion(),
  authorization(possibleRoles.PATIENT),
  errorHandling(medicalHistoryController.getMedicalHistory)
);

medicalHistoryRouter.put(
  "/update",
  multerHost({
    allowedExtensions: extensions.Images.concat(extensions.Documents),
  }).fields([
    { name: "diagnosisAttachment", maxCount: 1 },
    { name: "testsAndRaysAttachment", maxCount: 1 },
  ]),
  parseJsonFields,
  authenticattion(),
  authorization(possibleRoles.PATIENT),
  errorHandling(validation(VSchema.updateMedicalHistorySchema)),
  errorHandling(medicalHistoryController.updateMedicalHistory)
);

medicalHistoryRouter.delete(
  "/delete",
  authenticattion(),
  authorization(possibleRoles.PATIENT),
  errorHandling(validation(VSchema.deleteMedicalHistorySchema)),
  errorHandling(medicalHistoryController.deleteMedicalHistory)
);
export { medicalHistoryRouter };
