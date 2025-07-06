/**
 * API Configuration
 *
 * This file centralizes all API endpoint configurations for the application.
 * It provides environment-specific URLs and makes it easier to manage
 * different backend services across development, testing, and production.
 */

// Main API service configuration
export const API_CONFIG = {
  // Default development URL (local development)
  DEV_URL: "http://192.168.1.10:4000",
  // Alternative development URL (different network)
  ALT_DEV_URL: "http://192.168.187.46:4000",
  // Staging URL (for testing before production)
  STAGING_URL: "https://staging-api.zencare.com", // Replace with actual staging URL when available
  // Production URL
  PROD_URL: "https://api.zencare.com", // Replace with actual production URL when available
};

// Chatbot service configuration
export const CHATBOT_API_CONFIG = {
  // Default development URL
  DEV_URL: "http://192.168.1.10:3000",
  // Staging URL
  STAGING_URL: "https://staging-chatbot.zencare.com", // Replace with actual staging URL when available
  // Production URL
  PROD_URL: "https://chatbot.zencare.com", // Replace with actual production URL when available
};

// Helper function to determine the current environment
export const getEnvironment = (): "development" | "staging" | "production" => {
  // In a real app, this would use environment variables
  // For now, we'll just use __DEV__ which is available in React Native
  if (__DEV__) {
    return "development";
  }

  // You could add additional logic here to detect staging vs production
  // For example, checking a specific flag or domain
  return "production";
};

// Get the appropriate URL based on the current environment
export const getApiUrl = () => {
  const env = getEnvironment();

  switch (env) {
    case "development":
      return API_CONFIG.DEV_URL;
    case "staging":
      return API_CONFIG.STAGING_URL;
    case "production":
      return API_CONFIG.PROD_URL;
    default:
      return API_CONFIG.DEV_URL;
  }
};

// Get the appropriate chatbot URL based on the current environment
export const getChatbotUrl = () => {
  const env = getEnvironment();

  switch (env) {
    case "development":
      return CHATBOT_API_CONFIG.DEV_URL;
    case "staging":
      return CHATBOT_API_CONFIG.STAGING_URL;
    case "production":
      return CHATBOT_API_CONFIG.PROD_URL;
    default:
      return CHATBOT_API_CONFIG.DEV_URL;
  }
};

// Export default configuration object
export default {
  getApiUrl,
  getChatbotUrl,
  getEnvironment,
};
