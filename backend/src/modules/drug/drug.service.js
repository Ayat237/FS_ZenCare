import database from "../../../database/databaseConnection.js";
import { logger } from "../../utils/logger.utils.js";
import { ErrorHandlerClass } from "../../utils/error-class.utils.js";
import { DrugModel } from "../../../database/models/drug.model.js";

// Import the Drug model - using dynamic import since it uses CommonJS exports
const drugModel = new DrugModel(database);
/**
 * Get all drugs sorted alphabetically by name
 * @returns {Promise<Array>} Array of drugs with drugId and name
 */
export const getAllDrugsService = async () => {
  try {
    logger.info("Fetching all drugs");

    // Find all drugs and sort by name alphabetically
    const drugs = await drugModel
      .find({}, { drugId: 1, name: 1, _id: 0 })
      .sort({ name: 1 })
      .lean();

    logger.debug(`Retrieved ${drugs.length} drugs`);
    return drugs;
  } catch (error) {
    logger.error("Error fetching all drugs:", {
      error: error.message,
      stack: error.stack,
    });
    throw new ErrorHandlerClass(
      "Failed to fetch drugs",
      500,
      "Server Error",
      "Error in getAllDrugsService",
      { error: error.message }
    );
  }
};

/**
 * Search drugs by name (case-insensitive partial match)
 * @param {string} query - The search query
 * @returns {Promise<Array>} Array of matching drugs with drugId and name
 */
export const searchDrugsService = async (query) => {
  try {
    if (!query) {
      return [];
    }

    logger.info("Searching drugs with query", { query });

    // Use regex for case-insensitive partial search
    const drugs = await drugModel
      .find(
        { name: { $regex: query, $options: "i" } },
        { drugId: 1, name: 1, _id: 0 },{
          sort: { name: 1 },
          lean: true,
          limit: 10
        }
      )

    logger.debug(`Found ${drugs.length} drugs matching query: ${query}`);
    return drugs;
  } catch (error) {
    logger.error("Error searching drugs:", {
      error: error.message,
      stack: error.stack,
      query,
    });
    throw new ErrorHandlerClass(
      "Failed to search drugs",
      500,
      "Server Error",
      "Error in searchDrugsService",
      { error: error.message }
    );
  }
};
