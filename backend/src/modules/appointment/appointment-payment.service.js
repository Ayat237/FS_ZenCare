import {
  AppointmentModel,
  SlotModel,
  UserModel,
} from "../../../database/models/index.js";
import { ErrorHandlerClass } from "../../utils/error-class.utils.js";
import { logger } from "../../utils/logger.utils.js";
import { PaymentStatus } from "../../utils/enums.utils.js";
import {
  createPaymentIntent,
  confirmPaymentIntent,
} from "../../pymment-Handler/stripe.js";
import {
  generateJitsiToken,
  generateRoomName,
} from "../../services/jitsi.service.js";
import { AppointmentType } from "../../utils/enums.utils.js";
import database from "../../../database/databaseConnection.js";

const appointmentModel = new AppointmentModel(database);
const slotModel = new SlotModel(database);
const userModel = new UserModel(database);

/**
 * Initialize payment for appointment booking
 * @param {Object} params - Payment initialization parameters
 * @param {string} params.slotId - Slot ID
 * @param {string} params.patientId - Patient ID
 * @param {string} params.doctorId - Doctor ID
 * @param {string} params.appointmentType - Type of appointment
 * @param {string} params.notes - Appointment notes
 * @returns {Object} Payment intent and slot details
 */
export const initializeAppointmentPayment = async (params) => {
  try {
    const { slotId, patientId, doctorId, appointmentType } = params;

    // 1. Fetch and validate the slot
    const slot = await slotModel.findById(slotId);
    if (!slot) {
      throw new ErrorHandlerClass(
        "Slot not found",
        404,
        "Not Found",
        "The specified slot does not exist"
      );
    }

    // 2. Check if slot is already booked
    if (slot.isBooked) {
      throw new ErrorHandlerClass(
        "Slot already booked",
        400,
        "Validation Error",
        "This time slot is no longer available"
      );
    }

    // 3. Verify slot belongs to the specified doctor
    if (slot.doctorId.toString() !== doctorId) {
      throw new ErrorHandlerClass(
        "Invalid slot for doctor",
        400,
        "Validation Error",
        "The selected slot does not belong to the specified doctor"
      );
    }

    // 4. Verify appointment type matches slot type
    if (slot.type !== appointmentType) {
      throw new ErrorHandlerClass(
        "Appointment type mismatch",
        400,
        "Validation Error",
        `Slot is configured for ${slot.type} but appointment type is ${appointmentType}`
      );
    }

    // 5. Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount: slot.price,
      currency: "egp",
      patientId,
      slotId,
      doctorId,
      appointmentType,
    });

    logger.info("Appointment payment initialized", {
      paymentIntentId: paymentIntent.id,
      slotId,
      patientId,
      doctorId,
      amount: slot.price,
    });

    return {
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: slot.price,
        currency: paymentIntent.currency,
      },
      slot: {
        id: slot._id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        type: slot.type,
        price: slot.price,
      },
    };
  } catch (error) {
    logger.error("Error in initializeAppointmentPayment", {
      error: error.message,
      stack: error.stack,
      params,
    });
    throw error;
  }
};

/**
 * Complete appointment booking after successful payment
 * @param {Object} params - Payment completion parameters
 * @param {string} params.paymentIntentId - Payment intent ID
 * @param {string} params.patientId - Patient ID
 * @param {string} params.doctorId - Doctor ID
 * @param {string} params.slotId - Slot ID
 * @param {string} params.appointmentType - Type of appointment
 * @param {string} params.notes - Appointment notes
 * @returns {Object} Created appointment
 */
export const completeAppointmentBooking = async (params) => {
  try {
    const {
      paymentIntentId,
      patientId,
      doctorId,
      slotId,
      appointmentType,
      notes,
      medicalHistoryShared,
    
    } = params;

    // 1. Confirm payment was successful
    const paymentIntent = await confirmPaymentIntent(paymentIntentId);

    // 2. Fetch slot details
    const slot = await slotModel.findById(slotId);
    if (!slot) {
      throw new ErrorHandlerClass(
        "Slot not found",
        404,
        "Not Found",
        "The specified slot does not exist"
      );
    }

    // 3. Double-check slot is still available
    if (slot.isBooked) {
      throw new ErrorHandlerClass(
        "Slot already booked",
        400,
        "Validation Error",
        "This time slot is no longer available"
      );
    }

    // 4. Create appointment date from slot date and time
    const appointmentDateTime = new Date(slot.date);
    const [hours, minutes] = slot.startTime.split(":");
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // 5. Create base appointment data
    const appointmentPayload = {
      patientId,
      doctorId,
      slotId,
      type: appointmentType,
      dateTime: appointmentDateTime,
      duration: slot.duration,
      notes: notes || "",
      price: slot.price,
      paymentStatus: PaymentStatus.PAID,
      paymentIntentId,
      medicalHistoryShared: medicalHistoryShared || false,
    //  attachments: attachments || [],
    };

    // 6. Create the appointment
    const appointment = await appointmentModel.save(appointmentPayload);

    // 7. Handle Jitsi meeting setup for telemedicine appointments
    if (appointmentType === AppointmentType.TELEMEDICINE) {
      try {
        // Calculate meeting expiration time from slot end time
        const expiresAt = new Date(slot.date);
        const [endHours, endMinutes] = slot.endTime.split(":");
        expiresAt.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

        // Generate room name using appointment ID
        const roomName = generateRoomName(appointment._id.toString());

        // Fetch user and doctor details for token generation
        const [patient, doctor] = await Promise.all([
          userModel.findById(patientId),
          userModel.findById(doctorId),
        ]);

        if (!patient || !doctor) {
          throw new Error("Patient or doctor not found for token generation");
        }

        // Generate JWT tokens
        const moderatorToken = generateJitsiToken({
          roomName,
          user: {
            id: doctorId,
            name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            email: doctor.email || `doctor-${doctorId}@zencare.com`,
          },
          isModerator: true,
          expiresAt,
        });

        const guestToken = generateJitsiToken({
          roomName,
          user: {
            id: patientId,
            name: `${patient.firstName} ${patient.lastName}`,
            email: patient.email,
          },
          isModerator: false,
          expiresAt,
        });

        // Update appointment with Jitsi meeting details
        appointment.jitsiMeeting = {
          roomName,
          moderatorToken,
          guestToken,
          createdAt: new Date(),
          expiresAt,
        };

        await appointmentModel.save(appointment);

        logger.info("Jitsi meeting configured for appointment", {
          appointmentId: appointment._id,
          roomName,
          expiresAt,
        });
      } catch (jitsiError) {
        logger.error("Error setting up Jitsi meeting", {
          error: jitsiError.message,
          appointmentId: appointment._id,
        });

        // Delete the appointment if Jitsi setup fails
        await appointmentModel.deleteById(appointment._id);

        throw new ErrorHandlerClass(
          "Failed to set up video meeting",
          500,
          "Internal Server Error",
          "Could not configure telemedicine meeting"
        );
      }
    }

    // 8. Mark the slot as booked
    await slotModel.updateById(slotId, { isBooked: true });

    logger.info("Appointment booking completed successfully", {
      appointmentId: appointment._id,
      paymentIntentId,
      type: appointmentType,
      doctorId,
      patientId,
      slotId,
    });

    return appointment;
  } catch (error) {
    logger.error("Error in completeAppointmentBooking", {
      error: error.message,
      stack: error.stack,
      params,
    });
    throw error;
  }
};

/**
 * Cancel appointment and process refund
 * @param {string} appointmentId - Appointment ID
 * @param {string} reason - Cancellation reason
 * @returns {Object} Cancelled appointment and refund details
 */
export const cancelAppointmentWithRefund = async (appointmentId, reason) => {
  try {
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      throw new ErrorHandlerClass(
        "Appointment not found",
        404,
        "Not Found",
        "The specified appointment does not exist"
      );
    }

    if (appointment.paymentStatus !== PaymentStatus.PAID) {
      throw new ErrorHandlerClass(
        "Appointment not paid",
        400,
        "Validation Error",
        "Cannot refund unpaid appointment"
      );
    }

    // Process refund if payment intent exists
    let refund = null;
    if (appointment.paymentIntentId) {
      try {
        const { refundPayment } = await import(
          "../../pymment-Handler/stripe.js"
        );
        refund = await refundPayment(appointment.paymentIntentId);
      } catch (refundError) {
        logger.error("Error processing refund", {
          error: refundError.message,
          appointmentId,
          paymentIntentId: appointment.paymentIntentId,
        });
        // Continue with cancellation even if refund fails
      }
    }

    // Update appointment status
    const updatedAppointment = await appointmentModel.updateById(
      appointmentId,
      {
        paymentStatus: PaymentStatus.FAILED,
        notes: appointment.notes
          ? `${appointment.notes}\n[CANCELLED: ${reason}]`
          : `[CANCELLED: ${reason}]`,
      }
    );

    // Free up the slot
    await slotModel.updateById(appointment.slotId, { isBooked: false });

    logger.info("Appointment cancelled with refund", {
      appointmentId,
      refundId: refund?.id,
      reason,
    });

    return {
      appointment: updatedAppointment,
      refund,
    };
  } catch (error) {
    logger.error("Error in cancelAppointmentWithRefund", {
      error: error.message,
      stack: error.stack,
      appointmentId,
      reason,
    });
    throw error;
  }
};
