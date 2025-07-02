import express from "express";
import { 
  createSlots, 
  getAvailableSlots, 
  getDoctorSlots,
  deleteSlot,
  markSlotAsBooked
} from "./slot.controller.js";
import { 
  createSlotsSchema, 
  getAvailableSlotsSchema, 
  getDoctorSlotsSchema 
} from "./slot.validation.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { authenticattion } from "../../middlewares/authentication.middleware.js";
import { errorHandling } from "../../middlewares/error-hanling.middleware.js";
// import { UserType } from "../../utils/enums.utils.js";

const router = express.Router();

/**
 * @route   POST /slots
 * @desc    Create time slots (Doctor only)
 * @access  Private (Doctor)
 * @body    {Object} Slot data {doctorId, date, startTime, endTime, duration, type}
 */
router.post(
  "/",
//   authenticattion([UserType.DOCTOR]),
  authenticattion(),
  validation(createSlotsSchema),
  errorHandling(createSlots)
);

/**
 * @route   GET /slots/available
 * @desc    Get available slots for a doctor (Public)
 * @access  Public
 * @query   {string} doctorId - Doctor ID
 * @query   {string} date - Date in YYYY-MM-DD format
 * @query   {string} [type] - Optional slot type (telemedicine/inperson)
 */
router.get(
  "/available",
  validation(getAvailableSlotsSchema, 'query'),
  errorHandling(getAvailableSlots)
);

/**
 * @route   GET /slots
 * @desc    Get all slots for a doctor (Doctor only)
 * @access  Private (Doctor)
 * @query   {string} doctorId - Doctor ID
 */
router.get(
  "/",
//   authenticattion([UserType.DOCTOR]),
  authenticattion(),
  validation(getDoctorSlotsSchema, 'query'),
  errorHandling(getDoctorSlots)
);

/**
 * @route   DELETE /slots/:id
 * @desc    Delete a slot if not booked (Doctor only)
 * @access  Private (Doctor)
 * @param   {string} id - Slot ID
 */
router.delete(
  "/:id",
//   authenticattion([UserType.DOCTOR]),
  authenticattion(),
  errorHandling(deleteSlot)
);

/**
 * @route   PATCH /slots/:id/book
 * @desc    Mark a slot as booked (Internal use)
 * @access  Private (Internal)
 * @param   {string} id - Slot ID
 */
router.patch(
  "/:id/book",
  authenticattion(),
  errorHandling(markSlotAsBooked)
);

export const slotRoutes = router;
