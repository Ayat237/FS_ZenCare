import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.utils.js";

/**
 * Generate Jitsi JWT token for meeting access
 * @param {Object} options - Token generation options
 * @param {string} options.roomName - The room name for the meeting
 * @param {Object} options.user - User information
 * @param {string} options.user.id - User ID
 * @param {string} options.user.name - User display name
 * @param {string} options.user.email - User email
 * @param {boolean} options.isModerator - Whether the user is a moderator
 * @param {Date} options.expiresAt - Token expiration date
 * @returns {string} JWT token for Jitsi
 */
export function generateJitsiToken({ roomName, user, isModerator, expiresAt }) {
  try {
    const jitsiSecret = process.env.JITSI_SECRET;

    if (!jitsiSecret) {
      throw new Error("JITSI_SECRET environment variable is not set");
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = Math.floor(expiresAt.getTime() / 1000);

    const payload = {
      iss: process.env.JITSI_APP_ID || "zencare",
      aud: "jitsi",
      sub: process.env.JITSI_DOMAIN || "meet.jit.si",
      room: roomName,
      exp: exp,
      iat: now,
      context: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          moderator: isModerator,
        },
      },
    };

    const token = jwt.sign(payload, jitsiSecret, { algorithm: "HS256" });

    logger.debug("Generated Jitsi token", {
      roomName,
      userId: user.id,
      isModerator,
      expiresAt,
    });

    return token;
  } catch (error) {
    logger.error("Error generating Jitsi token", {
      error: error.message,
      stack: error.stack,
      roomName,
      userId: user?.id,
    });
    throw error;
  }
}

/**
 * Generate a unique room name for an appointment
 * @param {string} appointmentId - The appointment ID
 * @returns {string} Unique room name
 */
export function generateRoomName(appointmentId) {
  return `zencare-appt-${appointmentId}`;
}
