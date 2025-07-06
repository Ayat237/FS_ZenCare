import { Router } from "express";
import {
  initializePayment,
  completeBooking,
  cancelAppointment,
  getPaymentStatus,
} from "./appointment-payment.controller.js";
import {
  initializePaymentSchema,
  completeBookingSchema,
  cancelAppointmentSchema,
  getPaymentStatusSchema,
} from "./appointment-payment.validation.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { authenticattion } from "../../middlewares/authentication.middleware.js";
import { authorization } from "../../middlewares/authorization.middleware.js";
import { systemRoles } from "../../utils/system-roles.utils.js";

const router = Router();

// Initialize payment for appointment booking (patients only)
router.post(
  "/initialize-payment",
  authenticattion(),
  authorization([systemRoles.PATIENT]),
  validation(initializePaymentSchema),
  initializePayment
);

// Complete appointment booking after successful payment (patients only)
router.post(
  "/complete-booking",
  authenticattion(),
  authorization([systemRoles.PATIENT]),
  validation(completeBookingSchema),
  completeBooking
);

// Cancel appointment and process refund (appointment participants and admins)
router.post(
  "/:appointmentId/cancel",
  authenticattion(),
  authorization([systemRoles.PATIENT, systemRoles.DOCTOR, systemRoles.ADMIN]),
  validation(cancelAppointmentSchema),
  cancelAppointment
);

// Get payment status for an appointment (appointment participants and admins)
router.get(
  "/:appointmentId/payment-status",
  authenticattion(),
  authorization([systemRoles.PATIENT, systemRoles.DOCTOR, systemRoles.ADMIN]),
  validation(getPaymentStatusSchema),
  getPaymentStatus
);

export default router; 