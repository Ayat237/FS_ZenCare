import { ErrorHandlerClass, logger } from "../../../utils/index.js";
import redisClient from "../../../utils/redis.utils.js";

export const storePendingMedication = async (
  pendingId,
  medicationData = {}
) => {
  try {
    await redisClient.SET(pendingId, JSON.stringify(medicationData), 900); // 15 minutes expiration
    logger.debug("Stored pending medication in Redis", { pendingId });
  } catch (error) {
    // Log the error
    logger.error("Error storing pending medication:", {
      error: error.message,
      stack: error.stack,
    });
    throw new ErrorHandlerClass(
      "Error storing pending medication",
      500,
      "Server Error",
      "Error in storePendingMedication",
      { error: error.message }
    );
  }
};

export const getPendingMedication = async (pendingId) => {
  try {
    const data = await redisClient.GET(pendingId);
    if (!data) {
      logger.warn("Pending medication not found in Redis", { pendingId });
      return new ErrorHandlerClass(
        "Pending medication not found",
        404,
        "Not Found",
        "No pending medication found for the given ID",
        { pendingId }
      );
    }
    logger.debug("Retrieved pending medication from Redis", { pendingId });
    const parsedData = JSON.parse(data);
    return parsedData;
  } catch (error) {
    // Log the error
    logger.error("Error retrieving pending medication:", {
      error: error.message,
      stack: error.stack,
    });
    throw new ErrorHandlerClass(
      "Error retrieving pending medication",
      500,
      "Server Error",
      "Error in getPendingMedication",
      { error: error.message }
    );
  }
};

export const deletePendingMedication = async (pendingId) => {
  try {
    await redisClient.DEL(pendingId);
    logger.debug("Deleted pending medication from Redis", { pendingId });
  } catch (error) {
    // Log the error
    logger.error("Error deleting pending medication:", {
      error: error.message,
      stack: error.stack,
    });
    throw new ErrorHandlerClass(
      "Error deleting pending medication",
      500,
      "Server Error",
      "Error in deletePendingMedication",
      { error: error.message }
    );
  }
};

