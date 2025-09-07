import {
  createAppointmentService,
  getAppointmentService,
  getUserAppointmentsService,
  updateAppointmentService,
} from "./appointment.service.js";
import { ErrorHandlerClass } from "../../utils/error-class.utils.js";
import { logger } from "../../utils/logger.utils.js";

/**
 * Create a new appointment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, patientId, slotId, type, notes, price, paymentIntentId } =
      req.body;

    // Verify the requesting user is either the patient or has admin privileges
    if (
      req.authUser._id.toString() !== patientId &&
      !req.authUser.role.includes("admin")
    ) {
      throw new ErrorHandlerClass(
        "Unauthorized to create appointment for this patient",
        403,
        "Forbidden"
      );
    }

    const appointment = await createAppointmentService({
      doctorId,
      patientId,
      slotId,
      type,
      notes,
      price,
      paymentIntentId,
    });

    return res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: appointment,
    });
  } catch (error) {
    logger.error("Error in createAppointment controller", {
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.authUser?._id,
    });
    next(error);
  }
};

/**
 * Get appointment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await getAppointmentService(appointmentId);

    // Check if user has access to this appointment
    const hasAccess =
      appointment.patientId._id.toString() === req.authUser._id.toString() ||
      appointment.doctorId._id.toString() === req.authUser._id.toString() ||
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
      message: "Appointment retrieved successfully",
      data: appointment,
    });
  } catch (error) {
    logger.error("Error in getAppointment controller", {
      error: error.message,
      stack: error.stack,
      appointmentId: req.params.appointmentId,
      userId: req.authUser?._id,
    });
    next(error);
  }
};

/**
 * Get appointments for the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getMyAppointments = async (req, res, next) => {
  try {
    const userId = req.authUser._id.toString();
    const role = req.authUser.activeRole; // 'doctor' or 'patient'

    // Extract query filters
    const { startDate, endDate, type } = req.query;
    const filters = {};

    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (type) filters.type = type;

    const appointments = await getUserAppointmentsService(
      userId,
      role,
      filters
    );

    return res.status(200).json({
      success: true,
      message: "Appointments retrieved successfully",
      data: appointments,
      count: appointments.length,
    });
  } catch (error) {
    logger.error("Error in getMyAppointments controller", {
      error: error.message,
      stack: error.stack,
      userId: req.authUser?._id,
      role: req.authUser?.activeRole,
      query: req.query,
    });
    next(error);
  }
};

/**
 * Update appointment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const updateAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const updateData = req.body;

    // First, get the appointment to check permissions
    const appointment = await getAppointmentService(appointmentId);

    // Check if user has permission to update this appointment
    const canUpdate =
      appointment.patientId._id.toString() === req.authUser._id.toString() ||
      appointment.doctorId._id.toString() === req.authUser._id.toString() ||
      req.authUser.role.includes("admin");

    if (!canUpdate) {
      throw new ErrorHandlerClass(
        "Unauthorized to update this appointment",
        403,
        "Forbidden"
      );
    }

    // Only doctors can add prescriptions
    if (
      updateData.prescription &&
      appointment.doctorId._id.toString() !== req.authUser._id.toString()
    ) {
      throw new ErrorHandlerClass(
        "Only the assigned doctor can add prescriptions",
        403,
        "Forbidden"
      );
    }

    const updatedAppointment = await updateAppointmentService(
      appointmentId,
      updateData
    );

    return res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: updatedAppointment,
    });
  } catch (error) {
    logger.error("Error in updateAppointment controller", {
      error: error.message,
      stack: error.stack,
      appointmentId: req.params.appointmentId,
      updateData: req.body,
      userId: req.authUser?._id,
    });
    next(error);
  }
};

/**
 * Get Jitsi meeting details for telemedicine appointment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getJitsiMeetingDetails = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await getAppointmentService(appointmentId);

    // Check if user has access to this appointment
    const hasAccess =
      appointment.patientId._id.toString() === req.authUser._id.toString() ||
      appointment.doctorId._id.toString() === req.authUser._id.toString();

    if (!hasAccess) {
      throw new ErrorHandlerClass(
        "Unauthorized to access this appointment",
        403,
        "Forbidden"
      );
    }

    // Check if appointment is telemedicine
    if (appointment.type !== "telemedicine") {
      throw new ErrorHandlerClass(
        "This appointment is not a telemedicine appointment",
        400,
        "Bad Request"
      );
    }

    // Check if Jitsi meeting exists
    if (!appointment.jitsiMeeting) {
      throw new ErrorHandlerClass(
        "No video meeting configured for this appointment",
        404,
        "Not Found"
      );
    }

    // Return appropriate token based on user role
    const isDoctor =
      appointment.doctorId._id.toString() === req.authUser._id.toString();
    const token = isDoctor
      ? appointment.jitsiMeeting.moderatorToken
      : appointment.jitsiMeeting.guestToken;

    return res.status(200).json({
      success: true,
      message: "Meeting details retrieved successfully",
      data: {
        roomName: appointment.jitsiMeeting.roomName,
        token: token,
        expiresAt: appointment.jitsiMeeting.expiresAt,
        appointmentDateTime: appointment.dateTime,
        duration: appointment.duration,
        isModerator: isDoctor,
      },
    });
  } catch (error) {
    logger.error("Error in getJitsiMeetingDetails controller", {
      error: error.message,
      stack: error.stack,
      appointmentId: req.params.appointmentId,
      userId: req.authUser?._id,
    });
    next(error);
  }
};
