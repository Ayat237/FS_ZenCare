import { ErrorHandlerClass, logger } from "../../utils/index.js";
import database from "../../../database/databaseConnection.js";
import AddressRepository from "../../../database/repositories/address.repository.js";

const addressRepository = new AddressRepository(database);

const formatAddressResponse = (address) => ({
  id: address._id,
  street: address.street,
  city: address.city,
  country: address.country,
  buildingNumber: address.buildingNumber,
  buildingName: address.buildingName,
  neighborhood: address.neighborhood,
});

/**
 * Service to create a new address
 * @param {Object} user - The authenticated user
 * @param {Object} addressData - The address data to be created
 * @returns {Object} The created address
 */
export const createAddressService = async (user, addressData) => {
  logger.info("Starting address creation process", {
    userId: user._id,
    addressData: { city: addressData.city, country: addressData.country },
  });

  try {
    const { patientId, doctorId, ...addressFields } = addressData;

    // Check if address already exists for this user
    const existingAddress = await addressRepository.findByUser(patientId || doctorId);
    if (existingAddress) {
      throw new ErrorHandlerClass(
        "Address already exists for this user",
        409,
        "Duplicate Error",
        "Address already exists"
      );
    }

    const addressObject =  {
        createdBy: user._id,
        patientId: patientId || null,
        doctorId: doctorId || null,
        ...addressFields,
      };

    const createdAddress = await addressRepository.save(addressObject);
    logger.info("Address successfully created", { addressId: createdAddress._id });

    return formatAddressResponse(createdAddress);
  } catch (error) {
    logger.error("Error creating address", {
      error: error.message,
      userId: user._id,
    });
    throw error;
  }
};

/**
 * Service to get address by user ID
 * @param {string} userId - The user ID
 * @returns {Object} The address data
 */
export const getAddressByUserService = async (userId) => {
  logger.info("Getting address for user", { userId });

  try {
    const address = await addressRepository.findByUser(userId);
    
    if (!address) {
      throw new ErrorHandlerClass(
        "Address not found for this user",
        404,
        "Not Found",
        "Address not found"
      );
    }

    return formatAddressResponse(address);
  } catch (error) {
    logger.error("Error getting address", {
      error: error.message,
      userId,
    });
    throw error;
  }
};

/**
 * Service to update address
 * @param {Object} user - The authenticated user
 * @param {string} userId - The user ID whose address to update
 * @param {Object} updateData - The data to update
 * @returns {Object} The updated address
 */
export const updateAddressService = async (userId, updateData) => {
  logger.info("Starting address update process", {
    userId,
    updateFields: Object.keys(updateData),
  });

  try {
    const address = await addressRepository.findByUser(userId);
    
    if (!address) {
      throw new ErrorHandlerClass(
        "Address not found for this user",
        404,
        "Not Found",
        "Address not found"
      );
    }

    // Remove patientId and doctorId from update data if present
    const { patientId, doctorId, ...validUpdateData } = updateData;

    const updatedAddress = await addressRepository.updateById(address._id, validUpdateData);
    logger.info("Address successfully updated", { addressId: address._id });

    return formatAddressResponse(updatedAddress);
  } catch (error) {
    logger.error("Error updating address", {
      error: error.message,
      userId,
    });
    throw error;
  }
};

/**
 * Service to delete address
 * @param {Object} user - The authenticated user
 * @param {string} userId - The user ID whose address to delete
 * @returns {Object} Success message
 */
export const deleteAddressService = async (userId) => {
  logger.info("Starting address deletion process", { userId });

  try {
    const address = await addressRepository.findByUser(userId);
    
    if (!address) {
      throw new ErrorHandlerClass(
        "Address not found for this user",
        404,
        "Not Found",
        "Address not found"
      );
    }

    await addressRepository.deleteById(address._id);
    logger.info("Address successfully deleted", { addressId: address._id });

    return { message: "Address deleted successfully" };
  } catch (error) {
    logger.error("Error deleting address", {
      error: error.message,
      userId,
    });
    throw error;
  }
};

/**
 * Service to find addresses by coordinates (nearby search)
 * @param {number} longitude - Longitude coordinate
 * @param {number} latitude - Latitude coordinate
 * @param {number} radius - Search radius in kilometers
 * @returns {Array} Array of nearby addresses
 */
export const findNearbyAddressesService = async (longitude, latitude, radius = 10) => {
  logger.info("Finding nearby addresses", { longitude, latitude, radius });

  try {
    const addresses = await addressRepository.findByCoordinates(longitude, latitude, radius);
    
    return addresses.map(formatAddressResponse);
  } catch (error) {
    logger.error("Error finding nearby addresses", {
      error: error.message,
      longitude,
      latitude,
      radius,
    });
    throw error;
  }
};

/**
 * Service to get all addresses (admin only)
 * @param {Object} options - Query options
 * @returns {Array} Array of all addresses
 */
export const getAllAddressesService = async (options = {}) => {
  logger.info("Getting all addresses", { options });

  try {
    const addresses = await addressRepository.find({}, options);
    
    return addresses.map(formatAddressResponse);
  } catch (error) {
    logger.error("Error getting all addresses", {
      error: error.message,
    });
    throw error;
  }
}; 