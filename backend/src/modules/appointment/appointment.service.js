import {
  AppointmentModel,
  SlotModel,
  UserModel,
  DoctorModel,
} from "../../../database/models/index.js";
import MongooseDatabase from "../../../database/mongoDatabase.js";
import { ErrorHandlerClass } from "../../utils/error-class.utils.js";
import { logger } from "../../utils/logger.utils.js";
import { AppointmentType } from "../../utils/enums.utils.js";
import {
  generateJitsiToken,
  generateRoomName,
} from "../../services/jitsi.service.js";

const database = new MongooseDatabase(process.env.MONGODB_URI);
const appointmentModel = new AppointmentModel(database);
const slotModel = new SlotModel(database);
const userModel = new UserModel(database);
const doctorModel = new DoctorModel(database);

/**
 * Create a new appointment
 * @param {Object} appointmentData - Appointment data
 * @param {string} appointmentData.doctorId - Doctor ID
 * @param {string} appointmentData.patientId - Patient ID
 * @param {string} appointmentData.slotId - Slot ID
 * @param {string} appointmentData.type - Appointment type ('telemedicine' | 'in-person')
 * @param {string} appointmentData.notes - Appointment notes
 * @param {number} appointmentData.price - Appointment price
 * @param {string} appointmentData.paymentIntentId - Payment intent ID from Stripe/payment processor
 * @returns {Object} Created appointment
 */
export const createAppointmentService = async (appointmentData) => {
  try {
    const { doctorId, patientId, slotId, type, notes, price, paymentIntentId } =
      appointmentData;

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
    if (slot.type !== type) {
      throw new ErrorHandlerClass(
        "Appointment type mismatch",
        400,
        "Validation Error",
        `Slot is configured for ${slot.type} but appointment type is ${type}`
      );
    }

    // 5. Create appointment date from slot date and time
    const appointmentDateTime = new Date(slot.date);
    const [hours, minutes] = slot.startTime.split(":");
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // 6. Create base appointment data
    const appointmentPayload = {
      patientId,
      doctorId,
      slotId,
      type,
      dateTime: appointmentDateTime,
      duration: slot.duration,
      notes: notes || "",
      price,
      isPaid: false,
      medicalHistoryShared: false,
      ...(paymentIntentId && { paymentIntentId }),
    };

    // 7. Create the appointment first to get its ID
    const appointment = await appointmentModel.create(appointmentPayload);

    // 8. Handle Jitsi meeting setup for telemedicine appointments
    if (type === AppointmentType.TELEMEDICINE) {
      try {
        // Calculate meeting expiration time from slot end time
        const expiresAt = new Date(slot.date);
        const [endHours, endMinutes] = slot.endTime.split(":");
        expiresAt.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

        // Generate room name using appointment ID
        const roomName = generateRoomName(appointment._id.toString());

        // Fetch user and doctor details for token generation
        // patientId is the user ID, doctorId is the doctor record ID
        const [patient, doctorRecord] = await Promise.all([
          userModel.findById(patientId),
          doctorModel.findById(doctorId, { populate: "user" }),
        ]);

        if (!patient || !doctorRecord || !doctorRecord.user) {
          throw new Error("Patient or doctor not found for token generation");
        }

        const doctor = doctorRecord.user;

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

    // 9. Mark the slot as booked
    await slotModel.updateById(slotId, { isBooked: true });

    logger.info("Appointment created successfully", {
      appointmentId: appointment._id,
      type,
      doctorId,
      patientId,
      slotId,
    });

    return appointment;
  } catch (error) {
    logger.error("Error in createAppointmentService", {
      error: error.message,
      stack: error.stack,
      appointmentData,
    });
    throw error;
  }
};

/**
 * Get appointment by ID
 * @param {string} appointmentId - Appointment ID
 * @returns {Object} Appointment details
 */
export const getAppointmentService = async (appointmentId) => {
  try {
    const appointment = await appointmentModel.findById(appointmentId, {
      populate: [
        { path: "patientId", select: "firstName lastName email" },
        { path: "doctorId", select: "firstName lastName email specialization" },
        { path: "slotId", select: "date startTime endTime duration type" },
      ],
    });

    if (!appointment) {
      throw new ErrorHandlerClass(
        "Appointment not found",
        404,
        "Not Found",
        "The specified appointment does not exist"
      );
    }

    return appointment;
  } catch (error) {
    logger.error("Error in getAppointmentService", {
      error: error.message,
      stack: error.stack,
      appointmentId,
    });
    throw error;
  }
};

/**
 * Get appointments for a user (doctor or patient)
 * @param {string} userId - User ID
 * @param {string} role - User role ('doctor' | 'patient')
 * @param {Object} filters - Optional filters
 * @returns {Array} List of appointments
 */
export const getUserAppointmentsService = async (
  userId,
  role,
  filters = {}
) => {
  try {
    const query = {};

    if (role === "doctor") {
      query.doctorId = userId;
    } else if (role === "patient") {
      query.patientId = userId;
    } else {
      throw new ErrorHandlerClass(
        "Invalid role",
        400,
        "Validation Error",
        "Role must be either 'doctor' or 'patient'"
      );
    }

    // Apply date filters if provided
    if (filters.startDate || filters.endDate) {
      query.dateTime = {};
      if (filters.startDate) {
        query.dateTime.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.dateTime.$lte = new Date(filters.endDate);
      }
    }

    // Apply type filter if provided
    if (filters.type) {
      query.type = filters.type;
    }

    const appointments = await appointmentModel.find(query, {
      populate: [
        { path: "patientId", select: "firstName lastName email" },
        { path: "doctorId", select: "firstName lastName email specialization" },
        { path: "slotId", select: "date startTime endTime duration type" },
      ],
      sort: { dateTime: -1 },
    });

    return appointments;
  } catch (error) {
    logger.error("Error in getUserAppointmentsService", {
      error: error.message,
      stack: error.stack,
      userId,
      role,
      filters,
    });
    throw error;
  }
};

/**
 * Update appointment
 * @param {string} appointmentId - Appointment ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated appointment
 */
export const updateAppointmentService = async (appointmentId, updateData) => {
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

    // Handle prescription update
    if (updateData.prescription) {
      updateData.prescription.sentAt = new Date();
    }

    const updatedAppointment = await appointmentModel.updateById(
      appointmentId,
      updateData
    );

    logger.info("Appointment updated successfully", {
      appointmentId,
      updateData,
    });

    return updatedAppointment;
  } catch (error) {
    logger.error("Error in updateAppointmentService", {
      error: error.message,
      stack: error.stack,
      appointmentId,
      updateData,
    });
    throw error;
  }
};
