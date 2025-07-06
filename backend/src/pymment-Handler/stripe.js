import Stripe from "stripe";
import { ErrorHandlerClass } from "../utils/error-class.utils.js";
import { logger } from "../utils/logger.utils.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a payment intent for appointment booking
 * @param {Object} params - Payment parameters
 * @param {number} params.amount - Amount in cents
 * @param {string} params.currency - Currency code (default: 'usd')
 * @param {string} params.patientId - Patient ID
 * @param {string} params.slotId - Slot ID
 * @param {string} params.doctorId - Doctor ID
 * @param {string} params.appointmentType - Type of appointment
 * @returns {Object} Payment intent
 */
export const createPaymentIntent = async (params) => {
  try {
    const {
      amount,
      currency = 'usd',
      patientId,
      slotId,
      doctorId,
      appointmentType
    } = params;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        patientId,
        slotId,
        doctorId,
        appointmentType,
        purpose: 'appointment_booking'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logger.info("Payment intent created successfully", {
      paymentIntentId: paymentIntent.id,
      amount,
      patientId,
      slotId
    });

    return paymentIntent;
  } catch (error) {
    logger.error("Error creating payment intent", {
      error: error.message,
      params
    });
    throw new ErrorHandlerClass(
      "Failed to create payment intent",
      500,
      "Payment Error",
      error.message
    );
  }
};

/**
 * Confirm payment intent
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Object} Confirmed payment intent
 */
export const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      return paymentIntent;
    }

    throw new ErrorHandlerClass(
      "Payment not completed",
      400,
      "Payment Error",
      `Payment status: ${paymentIntent.status}`
    );
  } catch (error) {
    logger.error("Error confirming payment intent", {
      error: error.message,
      paymentIntentId
    });
    throw error;
  }
};

/**
 * Refund payment
 * @param {string} paymentIntentId - Payment intent ID
 * @param {number} amount - Amount to refund in cents (optional, defaults to full amount)
 * @returns {Object} Refund object
 */
export const refundPayment = async (paymentIntentId, amount = null) => {
  try {
    const refundParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundParams.amount = amount;
    }

    const refund = await stripe.refunds.create(refundParams);

    logger.info("Payment refunded successfully", {
      refundId: refund.id,
      paymentIntentId,
      amount: refund.amount
    });

    return refund;
  } catch (error) {
    logger.error("Error refunding payment", {
      error: error.message,
      paymentIntentId,
      amount
    });
    throw new ErrorHandlerClass(
      "Failed to refund payment",
      500,
      "Payment Error",
      error.message
    );
  }
};

/**
 * Get payment intent details
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Object} Payment intent details
 */
export const getPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    logger.error("Error retrieving payment intent", {
      error: error.message,
      paymentIntentId
    });
    throw new ErrorHandlerClass(
      "Failed to retrieve payment intent",
      500,
      "Payment Error",
      error.message
    );
  }
};

export default stripe;
