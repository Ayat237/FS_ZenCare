import {
  createSlotsService,
  getAvailableSlotsService,
  getDoctorSlotsService,
  deleteSlotService,
  markSlotAsBookedService,
} from "./slot.service.js";
import { SlotModel } from "../../../database/models/slot.model.js";
import database from "../../../database/databaseConnection.js";
import { ErrorHandlerClass } from "../../utils/error-class.utils.js";
import { logger } from "../../utils/logger.utils.js";

const slotModel = new SlotModel(database);

/**
 * Create time slots for a doctor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const createSlots = async (req, res, next) => {
  try {
    const { doctorId, date, startTime, endTime, duration, type, price } =
      req.body;

    console.log("🔍 CreateSlots: req.authUser:", req.authUser);
    console.log("🔍 CreateSlots: req.authUser.id:", req.authUser?.id);
    console.log("🔍 CreateSlots: req.authUser._id:", req.authUser?._id);
    console.log(
      "🔍 CreateSlots: req.authUser.doctorID:",
      req.authUser?.doctorID
    );
    console.log("🔍 CreateSlots: doctorId from body:", doctorId);

    // Verify the requesting user is the doctor
    // Check if the authenticated user's doctorID._id matches the requested doctorId
    const userDoctorId = req.authUser?.doctorID?._id?.toString();
    console.log("🔍 CreateSlots: userDoctorId (extracted _id):", userDoctorId);

    if (userDoctorId !== doctorId) {
      console.log(
        "🔍 CreateSlots: Authorization failed - userDoctorId:",
        userDoctorId,
        "!== doctorId:",
        doctorId
      );
      throw new ErrorHandlerClass(
        "Unauthorized to create slots for this doctor",
        403,
        "Forbidden"
      );
    }

    console.log("🔍 CreateSlots: Authorization successful");

    const slots = await createSlotsService({
      doctorId,
      date,
      startTime,
      endTime,
      duration,
      type,
      price,
    });

    return res.status(201).json({
      success: true,
      message: "Slots created successfully",
      data: slots,
    });
  } catch (error) {
    logger.error("Error in createSlots controller", {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });

    return next(
      error instanceof ErrorHandlerClass
        ? error
        : new ErrorHandlerClass(
            "Failed to create slots",
            500,
            "Server Error",
            error.message
          )
    );
  }
};

/**
 * Get available slots for a doctor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId, date, type } = req.query;

    const slots = await getAvailableSlotsService(
      doctorId,
      new Date(date),
      type
    );

    return res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error) {
    logger.error("Error in getAvailableSlots controller", {
      error: error.message,
      stack: error.stack,
      query: req.query,
    });

    return next(
      error instanceof ErrorHandlerClass
        ? error
        : new ErrorHandlerClass(
            "Failed to fetch available slots",
            500,
            "Server Error",
            error.message
          )
    );
  }
};

/**
 * Get all slots for a doctor (doctor's view)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getDoctorSlots = async (req, res, next) => {
  try {
    const { doctorId } = req.query;

    console.log("🔍 GetDoctorSlots: req.authUser:", req.authUser);
    console.log("🔍 GetDoctorSlots: req.authUser.id:", req.authUser?.id);
    console.log("🔍 GetDoctorSlots: req.authUser._id:", req.authUser?._id);
    console.log(
      "🔍 GetDoctorSlots: req.authUser.doctorID:",
      req.authUser?.doctorID
    );
    console.log("🔍 GetDoctorSlots: doctorId from query:", doctorId);

    // Verify the requesting user is the doctor
    // Check if the authenticated user's doctorID._id matches the requested doctorId
    const userDoctorId = req.authUser?.doctorID?._id?.toString();
    console.log(
      "🔍 GetDoctorSlots: userDoctorId (extracted _id):",
      userDoctorId
    );

    if (userDoctorId !== doctorId) {
      console.log(
        "🔍 GetDoctorSlots: Authorization failed - userDoctorId:",
        userDoctorId,
        "!== doctorId:",
        doctorId
      );
      throw new ErrorHandlerClass(
        "Unauthorized to view these slots",
        403,
        "Forbidden"
      );
    }

    console.log("🔍 GetDoctorSlots: Authorization successful");
    const slots = await getDoctorSlotsService(doctorId);

    return res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error) {
    logger.error("Error in getDoctorSlots controller", {
      error: error.message,
      stack: error.stack,
      query: req.query,
    });

    return next(
      error instanceof ErrorHandlerClass
        ? error
        : new ErrorHandlerClass(
            "Failed to fetch doctor slots",
            500,
            "Server Error",
            error.message
          )
    );
  }
};

/**
 * Delete a slot if it's not booked
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const deleteSlot = async (req, res, next) => {
  try {
    const { id } = req.params;

    // First get the slot to check ownership
    const slot = await slotModel.findById(id);

    if (!slot) {
      throw new ErrorHandlerClass("Slot not found", 404, "Not Found");
    }

    // Verify the requesting user is the doctor who owns the slot
    const userDoctorId = req.authUser?.doctorID?._id?.toString();
    console.log("🔍 DeleteSlot: userDoctorId (extracted _id):", userDoctorId);
    console.log("🔍 DeleteSlot: slot.doctorId:", slot.doctorId.toString());

    if (userDoctorId !== slot.doctorId.toString()) {
      throw new ErrorHandlerClass(
        "Unauthorized to delete this slot",
        403,
        "Forbidden"
      );
    }

    await deleteSlotService(id);

    return res.status(200).json({
      success: true,
      message: "Slot deleted successfully",
    });
  } catch (error) {
    logger.error("Error in deleteSlot controller", {
      error: error.message,
      stack: error.stack,
      params: req.params,
    });

    return next(
      error instanceof ErrorHandlerClass
        ? error
        : new ErrorHandlerClass(
            "Failed to delete slot",
            500,
            "Server Error",
            error.message
          )
    );
  }
};

/**
 * Mark a slot as booked (internal use)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const markSlotAsBooked = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedSlot = await markSlotAsBookedService(id);

    return res.status(200).json({
      success: true,
      message: "Slot marked as booked",
      data: updatedSlot,
    });
  } catch (error) {
    logger.error("Error in markSlotAsBooked controller", {
      error: error.message,
      stack: error.stack,
      params: req.params,
    });

    return next(
      error instanceof ErrorHandlerClass
        ? error
        : new ErrorHandlerClass(
            "Failed to mark slot as booked",
            500,
            "Server Error",
            error.message
          )
    );
  }
};
