import database from "../../../database/databaseConnection.js";
import { logger } from "../../utils/logger.utils.js";
import { ErrorHandlerClass } from "../../utils/error-class.utils.js";
import { SlotModel } from "../../../database/models/slot.model.js";
import { AppointmentType } from "../../utils/enums.utils.js";

const slotModel = new SlotModel(database);

/**
 * Create multiple time slots for a doctor
 * @param {Object} slotData - Slot data including doctorId, date, startTime, endTime, duration, and type
 * @returns {Promise<Array>} Array of created slots
 */
export const createSlotsService = async (slotData) => {
  try {
    const { doctorId, date, startTime, endTime, duration, type, price } =
      slotData;

    // Convert times to minutes for easier calculation
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    if (startTotalMinutes >= endTotalMinutes) {
      throw new ErrorHandlerClass(
        "Start time must be before end time",
        400,
        "Validation Error"
      );
    }

    // Generate slots
    const slots = [];
    let currentTime = startTotalMinutes;

    while (currentTime + duration <= endTotalMinutes) {
      const slotStartHour = Math.floor(currentTime / 60);
      const slotStartMinute = currentTime % 60;
      const slotEndTime = currentTime + duration;
      const slotEndHour = Math.floor(slotEndTime / 60);
      const slotEndMinute = slotEndTime % 60;

      const slotStartTime = `${slotStartHour
        .toString()
        .padStart(2, "0")}:${slotStartMinute.toString().padStart(2, "0")}`;
      const slotEndTimeStr = `${slotEndHour
        .toString()
        .padStart(2, "0")}:${slotEndMinute.toString().padStart(2, "0")}`;

      // Check for overlapping slots
      const existingSlot = await slotModel.findOne({
        doctorId,
        date,
        startTime: slotStartTime,
        endTime: slotEndTimeStr,
        isBooked: true,
      });

      if (!existingSlot) {
        slots.push({
          doctorId,
          date,
          startTime: slotStartTime,
          endTime: slotEndTimeStr,
          duration,
          type,
          price,
          isBooked: false,
        });
      }

      currentTime = slotEndTime;
    }

    if (slots.length === 0) {
      throw new ErrorHandlerClass(
        "No available slots could be created. All slots in the given range are already booked.",
        400,
        "No Available Slots"
      );
    }

    console.log("🔍 Creating slots:", JSON.stringify(slots, null, 2));

    // Insert all slots one by one (since insertMany is not available in BaseModel)
    const createdSlots = [];
    for (const slot of slots) {
      const createdSlot = await slotModel.create(slot);
      createdSlots.push(createdSlot);
    }

    logger.info("Successfully created slots", {
      count: createdSlots.length,
      doctorId,
      date,
    });

    return createdSlots;
  } catch (error) {
    logger.error("Error in createSlotsService", {
      error: error.message,
      stack: error.stack,
      slotData,
    });

    throw error instanceof ErrorHandlerClass
      ? error
      : new ErrorHandlerClass(
          "Failed to create slots",
          500,
          "Server Error",
          error.message
        );
  }
};

/**
 * Get available slots for a doctor on a specific date
 * @param {string} doctorId - Doctor ID
 * @param {Date} date - Date to check for available slots
 * @param {string} [type] - Optional slot type filter
 * @returns {Promise<Array>} Array of available slots
 */
export const getAvailableSlotsService = async (doctorId, date, type) => {
  try {
    const query = {
      doctorId,
      date,
      isBooked: false,
    };

    if (type) {
      query.type = type;
    }

    const slots = await slotModel.find(query, { __v: 0 });
    return slots;
  } catch (error) {
    logger.error("Error in getAvailableSlotsService", {
      error: error.message,
      stack: error.stack,
      doctorId,
      date,
      type,
    });

    throw new ErrorHandlerClass(
      "Failed to fetch available slots",
      500,
      "Server Error",
      error.message
    );
  }
};

/**
 * Get all slots for a doctor
 * @param {string} doctorId - Doctor ID
 * @returns {Promise<Array>} Array of all slots for the doctor
 */
export const getDoctorSlotsService = async (doctorId) => {
  try {
    const slots = await slotModel.find({ doctorId }, { __v: 0 });
    return slots;
  } catch (error) {
    logger.error("Error in getDoctorSlotsService", {
      error: error.message,
      stack: error.stack,
      doctorId,
    });

    throw new ErrorHandlerClass(
      "Failed to fetch doctor slots",
      500,
      "Server Error",
      error.message
    );
  }
};

/**
 * Delete a slot if it's not booked
 * @param {string} slotId - Slot ID to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteSlotService = async (slotId) => {
  try {
    const slot = await slotModel.findById(slotId);

    if (!slot) {
      throw new ErrorHandlerClass("Slot not found", 404, "Not Found");
    }

    if (slot.isBooked) {
      throw new ErrorHandlerClass(
        "Cannot delete a booked slot",
        400,
        "Bad Request"
      );
    }

    await slotModel.deleteOne({ _id: slotId });
    return { success: true };
  } catch (error) {
    logger.error("Error in deleteSlotService", {
      error: error.message,
      stack: error.stack,
      slotId,
    });

    throw error instanceof ErrorHandlerClass
      ? error
      : new ErrorHandlerClass(
          "Failed to delete slot",
          500,
          "Server Error",
          error.message
        );
  }
};

/**
 * Mark a slot as booked
 * @param {string} slotId - Slot ID to mark as booked
 * @returns {Promise<Object>} Update result
 */
export const markSlotAsBookedService = async (slotId) => {
  try {
    const slot = await slotModel.findById(slotId);

    if (!slot) {
      throw new ErrorHandlerClass("Slot not found", 404, "Not Found");
    }

    if (slot.isBooked) {
      throw new ErrorHandlerClass("Slot is already booked", 400, "Bad Request");
    }

    const updatedSlot = await slotModel.findByIdAndUpdate(
      slotId,
      { isBooked: true },
      { new: true, select: "-__v" }
    );

    return updatedSlot;
  } catch (error) {
    logger.error("Error in markSlotAsBookedService", {
      error: error.message,
      stack: error.stack,
      slotId,
    });

    throw error instanceof ErrorHandlerClass
      ? error
      : new ErrorHandlerClass(
          "Failed to mark slot as booked",
          500,
          "Server Error",
          error.message
        );
  }
};
