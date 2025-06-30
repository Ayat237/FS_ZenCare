import {
  ErrorHandlerClass,
  logger,
  possibleRoles,
} from "../../utils/index.js";
import {
  createAddressService,
  getAddressByUserService,
  updateAddressService,
  deleteAddressService,
  findNearbyAddressesService,
  getAllAddressesService,
} from "./address.service.js";

/**
 * Controller to create a new address
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const createAddress = async (req, res, next) => {
  try {
    const addressData = req.body;
    const user = req.user;

    // Validate user permissions
    if (!user.role.includes(possibleRoles.ADMIN) && 
        !user.role.includes(possibleRoles.DOCTOR) && 
        !user.role.includes(possibleRoles.PATIENT)) {
      return next(
        new ErrorHandlerClass(
          "Insufficient permissions to create address",
          403,
          "Authorization Error",
          "Access denied"
        )
      );
    }

    const result = await createAddressService(user, addressData);

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error in createAddress controller", {
      error: error.message,
      userId: req.user?._id,
    });
    next(error);
  }
};

/**
 * Controller to get address by user ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getAddressByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = req.user;

    // Validate user permissions - users can only access their own address or admin can access any
    if (!user.role.includes(possibleRoles.ADMIN) && user._id.toString() !== userId) {
      return next(
        new ErrorHandlerClass(
          "Insufficient permissions to access this address",
          403,
          "Authorization Error",
          "Access denied"
        )
      );
    }

    const result = await getAddressByUserService(userId);

    res.status(200).json({
      success: true,
      message: "Address retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error in getAddressByUser controller", {
      error: error.message,
      userId: req.params.userId,
    });
    next(error);
  }
};

/**
 * Controller to update address
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const updateAddress = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    const user = req.user;

    // Validate user permissions - users can only update their own address or admin can update any
    if (!user.role.includes(possibleRoles.ADMIN) && user._id.toString() !== userId) {
      return next(
        new ErrorHandlerClass(
          "Insufficient permissions to update this address",
          403,
          "Authorization Error",
          "Access denied"
        )
      );
    }

    const result = await updateAddressService(user, userId, updateData);

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error in updateAddress controller", {
      error: error.message,
      userId: req.params.userId,
    });
    next(error);
  }
};

/**
 * Controller to delete address
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = req.user;

    // Validate user permissions - users can only delete their own address or admin can delete any
    if (!user.role.includes(possibleRoles.ADMIN) && user._id.toString() !== userId) {
      return next(
        new ErrorHandlerClass(
          "Insufficient permissions to delete this address",
          403,
          "Authorization Error",
          "Access denied"
        )
      );
    }

    const result = await deleteAddressService(user, userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    logger.error("Error in deleteAddress controller", {
      error: error.message,
      userId: req.params.userId,
    });
    next(error);
  }
};

/**
 * Controller to find nearby addresses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const findNearbyAddresses = async (req, res, next) => {
  try {
    const { longitude, latitude, radius = 10 } = req.query;
    const user = req.user;

    // Validate coordinates
    if (!longitude || !latitude) {
      return next(
        new ErrorHandlerClass(
          "Longitude and latitude are required",
          400,
          "Validation Error",
          "Missing coordinates"
        )
      );
    }

    // Validate coordinate values
    const long = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const searchRadius = parseFloat(radius);

    if (isNaN(long) || isNaN(lat) || isNaN(searchRadius)) {
      return next(
        new ErrorHandlerClass(
          "Invalid coordinate values",
          400,
          "Validation Error",
          "Invalid coordinates"
        )
      );
    }

    if (long < -180 || long > 180 || lat < -90 || lat > 90) {
      return next(
        new ErrorHandlerClass(
          "Coordinates out of valid range",
          400,
          "Validation Error",
          "Invalid coordinate range"
        )
      );
    }

    const result = await findNearbyAddressesService(long, lat, searchRadius);

    res.status(200).json({
      success: true,
      message: "Nearby addresses retrieved successfully",
      data: result,
      count: result.length,
    });
  } catch (error) {
    logger.error("Error in findNearbyAddresses controller", {
      error: error.message,
      query: req.query,
    });
    next(error);
  }
};

/**
 * Controller to get all addresses (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getAllAddresses = async (req, res, next) => {
  try {
    const user = req.user;
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    // Validate admin permissions
    if (!user.role.includes(possibleRoles.ADMIN)) {
      return next(
        new ErrorHandlerClass(
          "Admin access required to view all addresses",
          403,
          "Authorization Error",
          "Access denied"
        )
      );
    }

    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
    };

    const result = await getAllAddressesService(options);

    res.status(200).json({
      success: true,
      message: "All addresses retrieved successfully",
      data: result,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        count: result.length,
      },
    });
  } catch (error) {
    logger.error("Error in getAllAddresses controller", {
      error: error.message,
      userId: req.user?._id,
    });
    next(error);
  }
}; 