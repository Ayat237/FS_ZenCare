import { Router } from "express";
import * as appointmentController from "./appointment-payment.controller.js";
import {
  initializePaymentSchema,
  completeBookingSchema,
  cancelAppointmentSchema,
  getPaymentStatusSchema,
} from "./appointment-payment.validation.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { authenticattion } from "../../middlewares/authentication.middleware.js";
import { authorization } from "../../middlewares/authorization.middleware.js";
import { possibleRoles} from "../../utils/system-roles.utils.js";
const appointmentPaymentRouter = Router();

// Initialize payment for appointment booking (patients only)
appointmentPaymentRouter.post(
  "/initialize-payment",
  authenticattion(),
  authorization(possibleRoles.PATIENT),
  validation(initializePaymentSchema),
  appointmentController.initializePayment
);

// Complete appointment booking after successful payment (patients only)
appointmentPaymentRouter.post(
  "/complete-booking",
  authenticattion(),
  authorization(possibleRoles.PATIENT),
  //validation(completeBookingSchema),
  appointmentController.completeBooking
);

// Cancel appointment and process refund (appointment participants and admins)
appointmentPaymentRouter.post(
  "/:appointmentId/cancel",
  authenticattion(),
  authorization([possibleRoles.PATIENT, possibleRoles.DOCTOR, possibleRoles.ADMIN]),
  validation(cancelAppointmentSchema),
  appointmentController.cancelAppointment
);

// Get payment status for an appointment (appointment participants and admins)
appointmentPaymentRouter.get(
  "/:appointmentId/payment-status",
  authenticattion(),
  authorization([possibleRoles.PATIENT, possibleRoles.DOCTOR, possibleRoles.ADMIN]),
  validation(getPaymentStatusSchema),
  appointmentController.getPaymentStatus
);

// Stripe webhook endpoint (no authentication required)
//appointmentPaymentRouter.post("/webhook/stripe", express.raw({ type: 'application/json' }), router.stripeWebhookRouter);

  export { appointmentPaymentRouter }; 