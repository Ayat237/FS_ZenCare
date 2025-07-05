import axios from "axios";
import { AxiosInstance } from "axios";
import { getApiUrl } from "@/config/api";

// Get the base URL from the centralized configuration
const BASE_URL = getApiUrl();

// Create API client without initial headers that depend on store
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Store reference to be injected later
let store: any;
let isLoggingOut = false; // Flag to prevent multiple logout attempts

export const injectStore = (_store: any) => {
  store = _store;

  // Set up interceptors after store is injected
  setupInterceptors();
};

// Function to set up interceptors after store is injected
const setupInterceptors = () => {
  // Request interceptor for adding auth token
  apiClient.interceptors.request.use(
    (config) => {
      // If we're in the process of logging out, reject all new requests
      if (isLoggingOut) {
        console.log("🔍 ApiClient: Blocking request during logout process");
        return Promise.reject(new Error("Logout in progress"));
      }

      const state = store?.getState();
      // Add null check for state.auth to prevent TypeError
      const token = state?.auth?.user?.token;

      if (token) {
        config.headers.token = `Bearer_${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for handling errors
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle specific error cases
      if (error.response?.status === 401) {
        // Prevent multiple logout attempts
        if (isLoggingOut) {
          console.log("🔍 ApiClient: Already logging out, ignoring 401");
          return Promise.reject(error);
        }

        isLoggingOut = true;

        // Handle unauthorized access
        console.error(
          "🔍 ApiClient: Received 401 unauthorized, logging out user"
        );

        // Show user friendly message
        if (error.response?.data?.message) {
          console.error(
            "🔍 ApiClient: Server message:",
            error.response.data.message
          );
        }

        // Clear auth state immediately
        if (store) {
          store.dispatch({ type: "auth/logoutUser/fulfilled" });
        }

        // Show alert after logout is triggered
        try {
          const { Alert } = require("react-native");
          Alert.alert(
            "Session Expired",
            error.response?.data?.message ||
              "Your session has expired. Please log in again.",
            [
              {
                text: "OK",
                onPress: () => {
                  // Reset the logout flag after user acknowledges
                  isLoggingOut = false;
                },
              },
            ]
          );
        } catch (e) {
          console.error("Could not show alert:", e);
          // Reset flag even if alert fails
          setTimeout(() => {
            isLoggingOut = false;
          }, 1000);
        }
      }
      return Promise.reject(error);
    }
  );
};

export default apiClient;

// Export utility function to reset logout flag (for use after successful login)
export const resetLogoutFlag = () => {
  isLoggingOut = false;
  console.log("🔍 ApiClient: Reset logout flag");
};
