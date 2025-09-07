import { getAllDrugsService, searchDrugsService } from "./drug.service.js";
import { ErrorHandlerClass } from "../../utils/error-class.utils.js";
import { logger } from "../../utils/logger.utils.js";

/**
 * Get all drugs controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getAllDrugs = async (req, res, next) => {
  try {
    logger.info("Getting all drugs");
    
    const drugs = await getAllDrugsService();
    
    return res.status(200).json({
      success: true,
      data: drugs,
    });
  } catch (error) {
    logger.error("Error in getAllDrugs controller", {
      error: error.message,
      stack: error.stack,
    });
    return next(
      error instanceof ErrorHandlerClass
        ? error
        : new ErrorHandlerClass(
            "Failed to get drugs",
            500,
            "Server Error",
            error.message
          )
    );
  }
};

/**
 * Search drugs by name controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const searchDrugs = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }
    
    logger.info("Searching drugs", { query });
    
    const drugs = await searchDrugsService(query);
    
    return res.status(200).json({
      success: true,
      data: drugs,
    });
  } catch (error) {
    logger.error("Error in searchDrugs controller", {
      error: error.message,
      stack: error.stack,
      query: req.query.query,
    });
    return next(
      error instanceof ErrorHandlerClass
        ? error
        : new ErrorHandlerClass(
            "Failed to search drugs",
            500,
            "Server Error",
            error.message
          )
    );
  }
};