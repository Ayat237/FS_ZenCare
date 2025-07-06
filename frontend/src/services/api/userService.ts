import apiClient from "./apiClient";

export interface UserProfile {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  mobilePhone: string;
  gender: string;
  roleData: {
    doctor?: {
      _id: string;
      user: string;
      isAdminApproved: boolean;
      specialty: string;
      hospitalAffiliation: Array<{
        name: string;
        _id: string;
      }>;
      clinicBranches: Array<{
        address: {
          _id: string;
          displayName: string;
        };
        phoneNumber: string;
        _id: string;
      }>;
      yearsOfExperience: number;
      education: Array<{
        degree: string;
        institution: string;
        graduationYear: number;
        _id: string;
      }>;
      certifications: string[];
      profileImage?: {
        URL: {
          public_id: string;
          secure_url: string;
        };
        customId: string;
      };
      rating: {
        average: number;
        count: number;
      };
      createdAt: string;
      updatedAt: string;
    };
    patient?: {
      _id: string;
      // Add patient fields if needed
    };
  };
  activeRole: "doctor" | "patient";
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

class UserService {
  /**
   * Get current user profile with role data
   */
  async getUserProfile(): Promise<UserProfile> {
    try {
      console.log("🔍 UserService: Getting user profile");
      const response = await apiClient.get("/auth/user-profile");
      console.log("🔍 UserService: Profile response:", response.data);
      return response.data.data;
    } catch (error: any) {
      console.error("🔍 UserService: Error getting user profile:", error);
      console.error("🔍 UserService: Error response:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
  }

  /**
   * Get doctor ID from user profile
   */
  async getDoctorId(): Promise<string | null> {
    try {
      const profile = await this.getUserProfile();
      if (profile.activeRole === "doctor" && profile.roleData.doctor) {
        return profile.roleData.doctor._id;
      }
      return null;
    } catch (error) {
      console.error("🔍 UserService: Error getting doctor ID:", error);
      return null;
    }
  }
}

export default new UserService();
