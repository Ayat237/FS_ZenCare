import { Router } from "express";
import {
  createAppointment,
  getAppointment,
  getMyAppointments,
  updateAppointment,
  getJitsiMeetingDetails,
} from "./appointment.controller.js";
import {
  createAppointmentSchema,
  getAppointmentSchema,
  updateAppointmentSchema,
} from "./appointment.validation.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { authenticattion } from "../../middlewares/authentication.middleware.js";
import { authorization } from "../../middlewares/authorization.middleware.js";
import { systemRoles } from "../../utils/system-roles.utils.js";
import appointmentPaymentRouter from "./appointment-payment.routes.js";

const router = Router();

// Create appointment (patients and admins)
router.post(
  "/",
  authenticattion(),
  authorization([systemRoles.PATIENT, systemRoles.ADMIN]),
  validation(createAppointmentSchema),
  createAppointment
);

// Get user's appointments (authenticated users)
router.get(
  "/my-appointments",
  authenticattion(),
  authorization([systemRoles.PATIENT, systemRoles.DOCTOR, systemRoles.ADMIN]),
  getMyAppointments
);

// Get specific appointment (appointment participants and admins)
router.get(
  "/:appointmentId",
  authenticattion(),
  authorization([systemRoles.PATIENT, systemRoles.DOCTOR, systemRoles.ADMIN]),
  validation(getAppointmentSchema),
  getAppointment
);

// Update appointment (appointment participants and admins)
router.patch(
  "/:appointmentId",
  authenticattion(),
  authorization([systemRoles.PATIENT, systemRoles.DOCTOR, systemRoles.ADMIN]),
  validation(updateAppointmentSchema),
  updateAppointment
);

// Get Jitsi meeting details for telemedicine appointment
router.get(
  "/:appointmentId/meeting",
  authenticattion(),
  authorization([systemRoles.PATIENT, systemRoles.DOCTOR]),
  validation(getAppointmentSchema),
  getJitsiMeetingDetails
);

// Mount payment routes
router.use("/payment", appointmentPaymentRouter);

export { router as appointmentRouter };
