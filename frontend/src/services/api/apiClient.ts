import axios from "axios";
import { AxiosInstance } from 'axios';
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
      const state = store?.getState();
      // Add null check for state.auth to prevent TypeError
      const token = state?.auth?.user?.token;

      if (token) {
        config.headers.Authorization = `Bearer_${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for handling errors
  // apiClient.interceptors.response.use(
  //   (response) => response,
  //   (error) => {
  //     // Handle specific error cases
  //     if (error.response?.status === 401) {
  //       // Handle unauthorized access
  //       store.dispatch({ type: "auth/logout" });
  //     }
  //     return Promise.reject(error);
  //   }
  // );
};

export default apiClient;
