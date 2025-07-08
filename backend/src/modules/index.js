export * from "./auth/auth.routes.js";
export * from "./patient/patient.routes.js";
export * from "./doctor/doctor.routes.js";
export * from "./medication/medication.routes.js";
export * from "./medical_history/medical-history.routes.js";
export * from "./prescription/prescription.routes.js";
export * from "./drug/drug.routes.js";
export * from "./address/address.routes.js";
export * from "./admin/admin.routes.js";
export * from "./slot/slot.routes.js";
export * from "./appointment/appointment.routes.js";
export * from "./chat/chat.routes.js";

// Stripe webhook router
import { Router } from "express";
import { handleStripeWebhook } from "./appointment/stripe-webhook.controller.js";

const stripeWebhookRouter = Router();
stripeWebhookRouter.post("/", handleStripeWebhook);

export { stripeWebhookRouter };
