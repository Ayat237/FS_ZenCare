import stripe from "../../pymment-Handler/stripe.js";
import { ErrorHandlerClass } from "../../utils/error-class.utils.js";
import { logger } from "../../utils/logger.utils.js";
import { PaymentStatus } from "../../utils/enums.utils.js";
import { AppointmentModel } from "../../../database/models/index.js";
import MongooseDatabase from "../../../database/mongoDatabase.js";

const database = new MongooseDatabase(process.env.MONGODB_URI);
const appointmentModel = new AppointmentModel(database);

/**
 * Handle Stripe webhook events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const handleStripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      logger.error("Webhook signature verification failed", {
        error: err.message,
        signature: sig
      });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    logger.info("Stripe webhook received", {
      eventType: event.type,
      eventId: event.id
    });

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;
      case 'charge.refunded':
        await handlePaymentRefunded(event.data.object);
        break;
      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error("Error in handleStripeWebhook", {
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
};

/**
 * Handle successful payment
 * @param {Object} paymentIntent - Stripe payment intent object
 */
const handlePaymentSucceeded = async (paymentIntent) => {
  try {
    const { patientId, slotId, doctorId, appointmentType } = paymentIntent.metadata;

    // Find appointment by payment intent ID
    const appointment = await appointmentModel.findOne({ paymentIntentId: paymentIntent.id });

    if (appointment) {
      // Update appointment payment status
      await appointmentModel.updateById(appointment._id, {
        paymentStatus: PaymentStatus.PAID
      });

      logger.info("Appointment payment status updated to PAID", {
        appointmentId: appointment._id,
        paymentIntentId: paymentIntent.id
      });
    } else {
      logger.warn("No appointment found for payment intent", {
        paymentIntentId: paymentIntent.id,
        metadata: paymentIntent.metadata
      });
    }
  } catch (error) {
    logger.error("Error handling payment succeeded", {
      error: error.message,
      paymentIntentId: paymentIntent.id
    });
  }
};

/**
 * Handle failed payment
 * @param {Object} paymentIntent - Stripe payment intent object
 */
const handlePaymentFailed = async (paymentIntent) => {
  try {
    const appointment = await appointmentModel.findOne({ paymentIntentId: paymentIntent.id });

    if (appointment) {
      // Update appointment payment status
      await appointmentModel.updateById(appointment._id, {
        paymentStatus: PaymentStatus.FAILED
      });

      logger.info("Appointment payment status updated to FAILED", {
        appointmentId: appointment._id,
        paymentIntentId: paymentIntent.id,
        failureReason: paymentIntent.last_payment_error?.message
      });
    }
  } catch (error) {
    logger.error("Error handling payment failed", {
      error: error.message,
      paymentIntentId: paymentIntent.id
    });
  }
};

/**
 * Handle canceled payment
 * @param {Object} paymentIntent - Stripe payment intent object
 */
const handlePaymentCanceled = async (paymentIntent) => {
  try {
    const appointment = await appointmentModel.findOne({ paymentIntentId: paymentIntent.id });

    if (appointment) {
      // Update appointment payment status
      await appointmentModel.updateById(appointment._id, {
        paymentStatus: PaymentStatus.FAILED
      });

      logger.info("Appointment payment status updated to FAILED (canceled)", {
        appointmentId: appointment._id,
        paymentIntentId: paymentIntent.id
      });
    }
  } catch (error) {
    logger.error("Error handling payment canceled", {
      error: error.message,
      paymentIntentId: paymentIntent.id
    });
  }
};

/**
 * Handle payment refund
 * @param {Object} charge - Stripe charge object
 */
const handlePaymentRefunded = async (charge) => {
  try {
    const appointment = await appointmentModel.findOne({ paymentIntentId: charge.payment_intent });

    if (appointment) {
      // Update appointment payment status
      await appointmentModel.updateById(appointment._id, {
        paymentStatus: PaymentStatus.FAILED
      });

      logger.info("Appointment payment status updated to FAILED (refunded)", {
        appointmentId: appointment._id,
        paymentIntentId: charge.payment_intent,
        refundId: charge.refunds?.data[0]?.id
      });
    }
  } catch (error) {
    logger.error("Error handling payment refunded", {
      error: error.message,
      chargeId: charge.id
    });
  }
}; 