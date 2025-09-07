import apiClient from "./apiClient";
import { dummyDoctor } from "../../mockData/doctors";
// Import store reference function instead of direct import to avoid circular dependency
import { injectStore } from "./apiClient";
import { debugToken } from "../../utils/tokenDebug";

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

      console.log("🔍 Login API response.data:", response.data);
      console.log("🔍 Login extracted token:", token);
      console.log("🔍 Login extracted refreshToken:", refreshToken);
      console.log("🔍 Login userData:", userData);

      const finalUserData = {
        ...userData,
        token,
        refreshToken,
      };

      console.log("🔍 Login final user data with tokens:", finalUserData);

      return {
        user: finalUserData,
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
      console.log("Submitting doctor registration...");
      const response = await apiClient.post("/doctor/register-new", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      console.log(
        "Doctor registration error:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Doctor registration failed";
      throw new Error(errorMessage);
    }
  },

  signupExistingDoctorFormData: async (data: FormData) => {
    try {
      console.log("Submitting existing user doctor registration...");
      const response = await apiClient.post("/doctor/register-existing", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      console.log(
        "Existing user doctor registration error:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Doctor registration failed";
      throw new Error(errorMessage);
    }
  },

  signupPatientFormData: async (data: FormData) => {
    try {
      console.log("Submitting patient registration...");
      const response = await apiClient.post("/patient/register-new", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      console.log(
        "Patient registration error:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.error || error.message || "Registration failed";
      throw new Error(errorMessage);
    }
  },

  signupExistingPatientFormData: async (data: FormData) => {
    try {
      console.log("Submitting existing user patient registration...");
      const response = await apiClient.post(
        "/patient/register-existing",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.log(
        "Existing user patient registration error:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.error || error.message || "Registration failed";
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
      const response = await apiClient.post(
        "/auth/verify-email-otp",
        {
          otp: data.otp,
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

  getUserProfile: async () => {
    try {
      console.log("Fetching user profile...");

      // Let's manually check the token from store to debug
      if (store) {
        const state = store.getState();
        const token = state?.auth?.user?.token;
        console.log("🔍 getUserProfile - Token from store:", token);
        console.log("🔍 getUserProfile - User in store:", state?.auth?.user);

        // Debug the token in detail
        debugToken(token);
      }

      const response = await apiClient.get("/auth/user-profile");
      console.log("User profile response:", response.data);

      if (!response.data || !response.data.data) {
        throw new Error("Invalid profile response format");
      }

      return response.data.data; // Return the user profile data
    } catch (error: any) {
      console.log("Get user profile error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch profile";
      throw new Error(errorMessage);
    }
  },
};
