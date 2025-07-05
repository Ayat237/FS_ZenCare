import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "@/types/auth";
// Import the specific service to avoid circular dependency
import { authService } from "@/services/api/auth";
import { PURGE } from "redux-persist";
// Explicitly export the reducer to avoid circular dependency issues

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    { email, password }: { email: string; password: string },
    thunkAPI
  ) => {
    try {
      const response = await authService.login({ email, password });
      return response.user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Simple helper function to make direct API calls
const callApi = async (url: string, token: string) => {
  const baseURL = "http://192.168.1.10:4000"; // No '/api' in the path
  console.log("🔍 callApi: Full URL:", `${baseURL}${url}`);
  console.log("🔍 callApi: Token header:", `Bearer_${token}`);

  const response = await fetch(`${baseURL}${url}`, {
    method: "GET",
    headers: {
      token: `Bearer_${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("🔍 callApi: API Error:", response.status, errorText);

    // If it's a 401 error, don't retry
    if (response.status === 401) {
      throw new Error(
        `Authentication failed: ${response.status} - ${errorText}`
      );
    }

    throw new Error(`API call failed: ${response.status} - ${errorText}`);
  }

  const jsonResponse = await response.json();
  console.log("🔍 callApi: API Response:", jsonResponse);
  return jsonResponse;
};

// Thunk to handle complete logout including persisted data
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      console.log("🔍 authSlice: Starting complete logout process");

      // Import AsyncStorage to clear any stored tokens
      const AsyncStorage = require("@react-native-async-storage/async-storage");

      // Clear any specific auth-related storage keys
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("refreshToken");

      console.log("🔍 authSlice: Cleared AsyncStorage auth data");

      // The reducer will handle clearing the state
      return true;
    } catch (error: any) {
      console.error("🔍 authSlice: Error during logout:", error);
      // Even if clearing storage fails, we still want to logout
      return true;
    }
  }
);

// Global flag to prevent multiple concurrent profile loads
let isProfileLoadInProgress = false;

// Thunk to load user profile with proper authentication
export const loadUserProfile = createAsyncThunk(
  "auth/loadUserProfile",
  async (_, thunkAPI) => {
    try {
      // Prevent multiple concurrent loads
      if (isProfileLoadInProgress) {
        console.log(
          "🔍 authSlice: Profile load already in progress globally, aborting"
        );
        return thunkAPI.rejectWithValue("Profile load already in progress");
      }

      isProfileLoadInProgress = true;

      // Get current state to access the token
      const state: any = thunkAPI.getState();
      const token = state.auth?.user?.token;
      const existingDoctorId = state.auth?.user?.doctorId;

      // If we already have doctorId, don't reload unless forced
      if (existingDoctorId) {
        console.log("🔍 authSlice: Already have doctorId:", existingDoctorId);
        isProfileLoadInProgress = false;
        return { doctorId: existingDoctorId };
      }

      console.log("🔍 authSlice: Starting profile load...");

      console.log("🔍 authSlice: Token exists:", !!token);
      if (token) {
        console.log("🔍 authSlice: Token length:", token.length);
        console.log(
          "🔍 authSlice: Token first 10 chars:",
          token.substring(0, 10)
        );
        console.log(
          "🔍 authSlice: Token last 10 chars:",
          token.substring(token.length - 10)
        );
      }

      if (!token) {
        isProfileLoadInProgress = false;
        return thunkAPI.rejectWithValue("No auth token available");
      }

      console.log("🔍 authSlice: Loading user profile with token");

      // Use our helper function to call the API
      const result = await callApi("/auth/user-profile", token);
      const profile = result.data;

      console.log("🔍 authSlice: Raw profile data received:", profile);

      // Extract doctorId from various possible locations based on backend response structure
      let doctorId = null;

      // The backend returns doctor data in roleData.doctor
      if (profile.roleData?.doctor?._id) {
        doctorId = profile.roleData.doctor._id;
        console.log(
          "🔍 authSlice: Found doctorId in roleData.doctor._id:",
          doctorId
        );
      } else if (profile.doctorID?._id) {
        doctorId = profile.doctorID._id;
        console.log("🔍 authSlice: Found doctorId in doctorID._id:", doctorId);
      } else if (profile.doctorId) {
        doctorId = profile.doctorId;
        console.log("🔍 authSlice: Found doctorId in doctorId:", doctorId);
      } else {
        console.log("🔍 authSlice: No doctorId found in profile data");
        console.log("🔍 authSlice: Profile keys:", Object.keys(profile));
        if (profile.roleData) {
          console.log(
            "🔍 authSlice: RoleData keys:",
            Object.keys(profile.roleData)
          );
        }
      }

      // Return the profile with doctorId if available
      isProfileLoadInProgress = false;
      return {
        ...profile,
        doctorId: doctorId,
      };
    } catch (error: any) {
      console.error("Failed to load user profile:", error);
      isProfileLoadInProgress = false;
      return thunkAPI.rejectWithValue(
        error.message || "Failed to load user profile"
      );
    }
  }
);

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  profileLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      // Clear all authentication state completely
      console.log("🔍 authSlice: User logged out, all state cleared");

      // Return to initial state to ensure clean logout
      return initialState;
    },
    clearError(state) {
      state.error = null;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = { ...state.user, ...action.payload }; // Merge new data
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // User profile loading cases
      .addCase(loadUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(loadUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        console.log(
          "🔍 authSlice: Profile loaded successfully with data:",
          action.payload
        );

        // If we have a user, update it with the new data
        if (state.user && action.payload.doctorId) {
          console.log(
            "🔍 authSlice: Updating user with doctorId:",
            action.payload.doctorId
          );
          state.user = {
            ...state.user,
            doctorId: action.payload.doctorId,
          };
        } else if (state.user && !action.payload.doctorId) {
          console.log("🔍 authSlice: No doctorId in payload to update");
        } else if (!state.user) {
          console.log("🔍 authSlice: No user in state to update");
        }
        state.error = null;
      })
      .addCase(
        loadUserProfile.rejected,
        (state, action: PayloadAction<any>) => {
          state.profileLoading = false;
          state.error = action.payload;
        }
      )

      // Logout thunk cases
      .addCase(logoutUser.fulfilled, (state) => {
        console.log("🔍 authSlice: Logout thunk completed, resetting state");
        return initialState;
      })
      .addCase(logoutUser.rejected, (state) => {
        console.log(
          "🔍 authSlice: Logout thunk failed, but still resetting state"
        );
        return initialState;
      })

      // Handle PURGE action to reset state on logout
      .addCase(PURGE, () => {
        console.log("🔍 authSlice: PURGE action - resetting to initial state");
        return initialState;
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
