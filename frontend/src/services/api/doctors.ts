import apiClient from "./apiClient";

export interface DoctorResponse {
  _id: string;
  specialty: string;
  yearsOfExperience: number;
  isAdminApproved: boolean;
  hospitalAffiliation: Array<{
    name: string;
  }>;
  clinicBranches: Array<{
    address:
      | string
      | {
          _id: string;
          displayName: string;
          coordinates: {
            longitude: number;
            latitude: number;
          };
        };
    phoneNumber: string;
  }>;
  profileImage?: {
    URL: {
      public_id: string;
      secure_url: string;
    };
    customId: string;
  };
  education: Array<{
    degree: string;
    institution: string;
    graduationYear: number;
  }>;
  certifications: string[];
  rating: {
    average: number;
    count: number;
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobilePhone: string;
    activeRole: string;
    isVerified: boolean;
    userName: string;
    gender: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const doctorsService = {
  // Get all doctors
  getAllDoctors: async (): Promise<DoctorResponse[]> => {
    try {
      console.log("Fetching all doctors...");
      const response = await apiClient.get("/doctor/all");
      console.log("✅ Doctors fetched successfully:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.log("❌ Error fetching doctors:", error);
      console.log("❌ Error response:", error.response?.data);
      console.log("❌ Error status:", error.response?.status);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch doctors";
      throw new Error(errorMessage);
    }
  },

  // Get doctor by ID
  getDoctorById: async (doctorId: string): Promise<DoctorResponse> => {
    try {
      console.log("Fetching doctor by ID:", doctorId);
      const response = await apiClient.get(`/doctor/${doctorId}`);
      console.log("✅ Doctor fetched successfully:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.log("❌ Error fetching doctor:", error);
      console.log("❌ Error response:", error.response?.data);
      console.log("❌ Error status:", error.response?.status);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch doctor";
      throw new Error(errorMessage);
    }
  },

  // Get doctor's available slots
  getDoctorSlots: async (doctorId: string, date?: string): Promise<any[]> => {
    try {
      console.log("Fetching available slots for doctor:", doctorId);

      // If no date provided, use today as default
      const targetDate = date || new Date().toISOString().split("T")[0];

      const response = await apiClient.get("/slots/available", {
        params: {
          doctorId,
          date: targetDate,
        },
      });
      console.log(
        "✅ Doctor available slots fetched successfully:",
        response.data.data
      );
      return response.data.data;
    } catch (error: any) {
      console.log("❌ Error fetching doctor available slots:", error);
      console.log("❌ Error response:", error.response?.data);
      console.log("❌ Error status:", error.response?.status);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch doctor available slots";
      throw new Error(errorMessage);
    }
  },
};
