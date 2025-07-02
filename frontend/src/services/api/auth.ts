import apiClient from "./apiClient";
// Import store reference function instead of direct import to avoid circular dependency
import { injectStore } from "./apiClient";

// Get store reference directly for use in service functions
let store: any;
export const injectAuthStore = (_store: any) => {
  store = _store;
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  userName: string;
  email: string;
  password: string;
  confirmedPassword: string;
  firstName: string;
  lastName: string;
  role: string;
  mobilePhone: string;
  gender: string;
  birthDate: string;
  profileImage: string | null;
}

export interface ForgetPasswordData {
  email: string;
}

export interface VerifyOtpData {
  otp: string;
}

export interface ResetPasswordData {
  newPassword: string;
  confirmPassword: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    try {
      // Import the dummy doctor data for local authentication
      const { dummyDoctor } = await import("../../mockData/doctors.js");

      // Check if the credentials match the dummy doctor account
      if (
        credentials.email === dummyDoctor.email &&
        credentials.password === dummyDoctor.password
      ) {
        console.log("Doctor login successful");
        // Return mock doctor data with dummy tokens
        return {
          user: {
            ...dummyDoctor,
            token: "dummy-doctor-token",
            refreshToken: "dummy-doctor-refresh-token",
          },
        };
      }

      // If not a doctor login, proceed with regular API call
      const response = await apiClient.post("/auth/login", credentials);
      const { data } = response.data; // Access nested data structure
      if (!data || !data.user) {
        throw new Error("Invalid response format");
      }
      const { token, refreshToken } = data;
      const userData = data.user;
      console.log("userData", userData);
      // console.log("token", token);
      return {
        user: {
          ...userData,
          token,
          refreshToken,
        },
      };
    } catch (error: any) {
      console.log("error:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Login failed";
      throw new Error(errorMessage);
    }
  },

  signupFormData: async (data: FormData) => {
    try {
      // console.log("data", data.getParts());
      const response = await apiClient.post("/patient/register", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      console.log("error:", error.response);
      const errorMessage =
        error.response?.data?.error || error.message || "Registration failed";
      throw new Error(errorMessage);
    }
  },

  signupDoctorFormData: async (data: FormData) => {
    try {
      const response = await apiClient.post("/doctor/register", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      console.log("error:", error.response);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Doctor registration failed";
      throw new Error(errorMessage);
    }
  },

  verifyEmailOtp: async (data: { otp: string; emailToken: string | null }) => {
    try {
      console.log("data", data);
      const response = await apiClient.post(
        "/auth/verify-email-otp",
        { otp: data.otp },
        {
          headers: {
            emailtoken: data.emailToken,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.log("error:", error.response.data);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to verify email";
      throw new Error(errorMessage);
    }
  },

  forgetPassword: async (data: ForgetPasswordData) => {
    try {
      // console.log("data", data);
      const response = await apiClient.post("/auth/forget-password", data);
      // console.log("response", response);
      return response.data;
    } catch (error: any) {
      // console.log("error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to send reset password email";
      throw new Error(errorMessage);
    }
  },

  verifyForgetPasswordOtp: async (emailToken: string, data: VerifyOtpData) => {
    try {
      // console.log("emailToken", emailToken);
      // console.log("data", data);
      const response = await apiClient.post(
        `/auth/verify-forgetPass-otp`,
        { otp: data.otp },
        {
          headers: {
            emailtoken: `${emailToken}`,
          },
        }
      );
      // console.log("response", response);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to verify OTP";
      throw new Error(errorMessage);
    }
  },

  resetPassword: async (emailToken: string, data: ResetPasswordData) => {
    try {
      // console.log("data", data);
      const response = await apiClient.patch(`/auth/reset-password`, data, {
        headers: {
          emailtoken: `${emailToken}`,
        },
      });
      // console.log("response", response);
      return response.data;
    } catch (error: any) {
      // console.log("error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to reset password";
      throw new Error(errorMessage);
    }
  },
  resendOtp: async (emailToken: string) => {
    try {
      console.log("data", emailToken);
      const response = await apiClient.post(
        `/auth/resend-otp`,
        {},
        {
          headers: {
            emailtoken: `${emailToken}`,
          },
        }
      );
      // console.log("response", response);
      return response.data;
    } catch (error: any) {
      // console.log("error:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to resend OTP";
      throw new Error(errorMessage);
    }
  },

  refreshToken: async () => {
    try {
      // Get the current refresh token from the store
      if (!store) {
        throw new Error("Store not initialized");
      }

      const state = store.getState();
      // Add null check for state.auth to prevent TypeError
      const refreshToken = state?.auth?.user?.refreshToken;

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await apiClient.post("/auth/refresh-token", {
        refreshToken,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error refreshing token:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to refresh authentication token";
      throw new Error(errorMessage);
    }
  },

  updateProfileImage: async (data: FormData) => {
    try {
      const response = await apiClient.patch(
        "/user/update-profile-image",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.log("error:", error.response);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to update profile image";
      throw new Error(errorMessage);
    }
  },

  verifyDoctorEmailOtp: async (data: {
    otp: string;
    email: string;
    emailToken: string;
  }) => {
    try {
      const response = await apiClient.patch(
        "/doctor/verify-email",
        {
          otp: data.otp,
          email: data.email,
        },
        {
          headers: {
            emailtoken: data.emailToken,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.log("Doctor email verification error:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Doctor email verification failed";
      throw new Error(errorMessage);
    }
  },
};
