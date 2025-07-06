import {
  initializeAppointmentPayment,
  completeAppointmentBooking,
  cancelAppointmentWithRefund,
} from "./appointment-payment.service.js";
import { ErrorHandlerClass } from "../../utils/error-class.utils.js";
import { logger } from "../../utils/logger.utils.js";

/**
 * Initialize payment for appointment booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const initializePayment = async (req, res, next) => {
  try {
    const { slotId, doctorId, appointmentType, notes } = req.body;
    const patientId = req.authUser._id.toString();

    // Verify the requesting user is the patient
    if (req.authUser.activeRole !== 'patient') {
      throw new ErrorHandlerClass(
        "Only patients can book appointments",
        403,
        "Forbidden"
      );
    }

    const result = await initializeAppointmentPayment({
      slotId,
      patientId,
      doctorId,
      appointmentType,
      notes
    });

    return res.status(200).json({
      success: true,
      message: "Payment initialized successfully",
      data: result
    });
  } catch (error) {
    logger.error("Error in initializePayment controller", {
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.authUser?._id,
    });
    next(error);
  }
};

/**
 * Complete appointment booking after successful payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const completeBooking = async (req, res, next) => {
  try {
    const { paymentIntentId, slotId, doctorId, appointmentType, notes } = req.body;
    const patientId = req.authUser._id.toString();

    // Verify the requesting user is the patient
    if (req.authUser.activeRole !== 'patient') {
      throw new ErrorHandlerClass(
        "Only patients can complete appointment bookings",
        403,
        "Forbidden"
      );
    }

    const appointment = await completeAppointmentBooking({
      paymentIntentId,
      patientId,
      doctorId,
      slotId,
      appointmentType,
      notes
    });

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment
    });
  } catch (error) {
    logger.error("Error in completeBooking controller", {
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.authUser?._id,
    });
    next(error);
  }
};

/**
 * Cancel appointment and process refund
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;
    const userId = req.authUser._id.toString();

    // Get appointment to check permissions
    const { getAppointmentService } = await import("./appointment.service.js");
    const appointment = await getAppointmentService(appointmentId);

    // Check if user has permission to cancel this appointment
    const canCancel = 
      appointment.patientId._id.toString() === userId ||
      appointment.doctorId._id.toString() === userId ||
      req.authUser.role.includes("admin");

    if (!canCancel) {
      throw new ErrorHandlerClass(
        "Unauthorized to cancel this appointment",
        403,
        "Forbidden"
      );
    }

    const result = await cancelAppointmentWithRefund(appointmentId, reason);

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: result
    });
  } catch (error) {
    logger.error("Error in cancelAppointment controller", {
      error: error.message,
      stack: error.stack,
      appointmentId: req.params.appointmentId,
      body: req.body,
      userId: req.authUser?._id,
    });
    next(error);
  }
};

/**
 * Get payment status for an appointment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.authUser._id.toString();

    // Get appointment to check permissions
    const { getAppointmentService } = await import("./appointment.service.js");
    const appointment = await getAppointmentService(appointmentId);

    // Check if user has access to this appointment
    const hasAccess = 
      appointment.patientId._id.toString() === userId ||
      appointment.doctorId._id.toString() === userId ||
      req.authUser.role.includes("admin");

    if (!hasAccess) {
      throw new ErrorHandlerClass(
        "Unauthorized to access this appointment",
        403,
        "Forbidden"
      );
    }

    return res.status(200).json({
      success: true,
      message: "Payment status retrieved successfully",
      data: {
        appointmentId: appointment._id,
        paymentStatus: appointment.paymentStatus,
        paymentIntentId: appointment.paymentIntentId,
        price: appointment.price
      }
    });
  } catch (error) {
    logger.error("Error in getPaymentStatus controller", {
      error: error.message,
      stack: error.stack,
      appointmentId: req.params.appointmentId,
      userId: req.authUser?._id,
    });
    next(error);
  }
}; 