import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "@/types/auth";
// Import the specific service to avoid circular dependency
import { authService } from "@/services/api/auth";
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

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, thunkAPI) => {
    try {
      console.log("🔍 Fetching user profile in background...");
      const profileData = await authService.getUserProfile();
      console.log("🔍 Profile data received:", profileData);
      return profileData;
    } catch (error: any) {
      console.log("🔍 Profile fetch error:", error.message);
      return thunkAPI.rejectWithValue(error.message);
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
      state.user = null;
      state.error = null;
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
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true;
      })
      .addCase(
        fetchUserProfile.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.profileLoading = false;
          // Merge the profile data with existing user data
          if (state.user) {
            state.user = { ...state.user, ...action.payload };
            console.log("🔍 Profile data stored in Redux:", state.user);
          }
        }
      )
      .addCase(
        fetchUserProfile.rejected,
        (state, action: PayloadAction<any>) => {
          state.profileLoading = false;
          console.log("🔍 Profile fetch failed:", action.payload);
        }
      );
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
