/**
 * Utility functions for address operations
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

/**
 * Validate if coordinates are within valid ranges
 * @param {number} longitude - Longitude coordinate
 * @param {number} latitude - Latitude coordinate
 * @returns {boolean} True if coordinates are valid
 */
export const validateCoordinates = (longitude, latitude) => {
  return longitude >= -180 && longitude <= 180 && 
         latitude >= -90 && latitude <= 90;
};

/**
 * Format address for display
 * @param {Object} address - Address object
 * @returns {string} Formatted address string
 */
export const formatAddressString = (address) => {
  const parts = [];
  
  if (address.buildingNumber) {
    parts.push(`Building ${address.buildingNumber}`);
  }
  
  if (address.buildingName) {
    parts.push(address.buildingName);
  }
  
  if (address.street) {
    parts.push(address.street);
  }
  
  if (address.neighborhood) {
    parts.push(address.neighborhood);
  }
  
  if (address.city) {
    parts.push(address.city);
  }
  
  if (address.country) {
    parts.push(address.country);
  }
  
  return parts.join(', ');
};

/**
 * Generate bounding box for coordinate search
 * @param {number} longitude - Center longitude
 * @param {number} latitude - Center latitude
 * @param {number} radius - Search radius in kilometers
 * @returns {Object} Bounding box coordinates
 */
export const generateBoundingBox = (longitude, latitude, radius) => {
  // Approximate conversion: 1 degree ≈ 111.32 km
  const latDelta = radius / 111.32;
  const lonDelta = radius / (111.32 * Math.cos(latitude * Math.PI / 180));
  
  return {
    minLon: longitude - lonDelta,
    maxLon: longitude + lonDelta,
    minLat: latitude - latDelta,
    maxLat: latitude + latDelta,
  };
};

/**
 * Validate address data before saving
 * @param {Object} addressData - Address data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateAddressData = (addressData) => {
  const errors = [];
  
  // Check required fields
  if (!addressData.street) {
    errors.push("Street is required");
  }
  
  if (!addressData.city) {
    errors.push("City is required");
  }
  
  if (!addressData.coordinates) {
    errors.push("Coordinates are required");
  } else {
    const { longitude, latitude } = addressData.coordinates;
    if (!validateCoordinates(longitude, latitude)) {
      errors.push("Invalid coordinates");
    }
  }
  
  // Check user reference
  if (!addressData.patientId && !addressData.doctorId) {
    errors.push("Either patientId or doctorId is required");
  }
  
  if (addressData.patientId && addressData.doctorId) {
    errors.push("Cannot specify both patientId and doctorId");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}; 