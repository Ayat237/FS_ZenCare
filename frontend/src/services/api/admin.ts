import apiClient from "./apiClient";

export interface PendingDoctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  yearsOfExperience: number;
  education: Array<{
    degree: string;
    institution: string;
    graduationYear: number;
  }>;
  certifications: string[];
  hospitalAffiliation: Array<{
    name: string;
  }>;
  verificationDocument: {
    uri: string;
    type: string;
    name: string;
  };
  profileImage?: string;
  submittedAt: string;
}

export const adminService = {
  // Get all pending doctors for verification
  getPendingDoctors: async (): Promise<PendingDoctor[]> => {
    try {
      // Try to get from API first
      try {
        const response = await apiClient.get("/admin/pending-doctors");
        return response.data;
      } catch (apiError) {
        console.log("API not available, using mock data");
        // API failed, use mock data instead
        return [
          {
            id: "1",
            firstName: "Dr. Ahmed",
            lastName: "Hassan",
            email: "ahmed.hassan@example.com",
            specialty: "Cardiology",
            yearsOfExperience: 8,
            education: [
              {
                degree: "MD",
                institution: "Cairo University",
                graduationYear: 2015,
              },
            ],
            certifications: ["Board Certified Cardiologist", "ACLS Certified"],
            hospitalAffiliation: [
              {
                name: "Cairo Heart Hospital",
              },
            ],
            verificationDocument: {
              uri: "https://via.placeholder.com/400x600/FF6B6B/FFFFFF?text=Medical+License",
              type: "image/jpeg",
              name: "medical_license_ahmed.jpg",
            },
            profileImage:
              "https://via.placeholder.com/100x100/4ECDC4/FFFFFF?text=AH",
            submittedAt: "2025-01-02T10:30:00Z",
          },
          {
            id: "2",
            firstName: "Dr. Fatima",
            lastName: "Mahmoud",
            email: "fatima.mahmoud@example.com",
            specialty: "Pediatrics",
            yearsOfExperience: 5,
            education: [
              {
                degree: "MD",
                institution: "Alexandria University",
                graduationYear: 2018,
              },
            ],
            certifications: ["Pediatric Board Certification"],
            hospitalAffiliation: [
              {
                name: "Children's Hospital Alexandria",
              },
            ],
            verificationDocument: {
              uri: "https://via.placeholder.com/400x600/45B7D1/FFFFFF?text=Medical+Certificate",
              type: "image/png",
              name: "medical_certificate_fatima.png",
            },
            profileImage:
              "https://via.placeholder.com/100x100/96CEB4/FFFFFF?text=FM",
            submittedAt: "2025-01-01T14:20:00Z",
          },
          {
            id: "3",
            firstName: "Dr. Omar",
            lastName: "Saleh",
            email: "omar.saleh@example.com",
            specialty: "Orthopedics",
            yearsOfExperience: 12,
            education: [
              {
                degree: "MD",
                institution: "Ain Shams University",
                graduationYear: 2011,
              },
            ],
            certifications: [
              "Orthopedic Surgery Board",
              "Trauma Surgery Certification",
            ],
            hospitalAffiliation: [
              {
                name: "Ain Shams Specialized Hospital",
              },
            ],
            verificationDocument: {
              uri: "https://via.placeholder.com/400x600/F7DC6F/000000?text=License+Document",
              type: "application/pdf",
              name: "orthopedic_license_omar.pdf",
            },
            profileImage:
              "https://via.placeholder.com/100x100/FFEAA7/000000?text=OS",
            submittedAt: "2024-12-30T09:15:00Z",
          },
        ];
      }
    } catch (error: any) {
      console.log("Error fetching pending doctors:", error.response);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch pending doctors";
      throw new Error(errorMessage);
    }
  },

  // Verify a doctor
  verifyDoctor: async (doctorId: string): Promise<void> => {
    try {
      try {
        const response = await apiClient.patch(
          `/admin/doctors/${doctorId}/verify`,
          {
            isVerified: true,
          }
        );
        return response.data;
      } catch (apiError) {
        console.log("API not available, using mock implementation");
        // Mock successful verification
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
        return;
      }
    } catch (error: any) {
      console.log("Error verifying doctor:", error.response);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to verify doctor";
      throw new Error(errorMessage);
    }
  },

  // Reject a doctor
  rejectDoctor: async (doctorId: string, reason?: string): Promise<void> => {
    try {
      try {
        const response = await apiClient.patch(
          `/admin/doctors/${doctorId}/verify`,
          {
            isVerified: false,
            rejectionReason: reason,
          }
        );
        return response.data;
      } catch (apiError) {
        console.log("API not available, using mock implementation");
        // Mock successful rejection
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
        return;
      }
    } catch (error: any) {
      console.log("Error rejecting doctor:", error.response);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to reject doctor";
      throw new Error(errorMessage);
    }
  },

  // Get all verified doctors
  getVerifiedDoctors: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get("/admin/verified-doctors");
      return response.data;
    } catch (error: any) {
      console.log("Error fetching verified doctors:", error.response);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch verified doctors";
      throw new Error(errorMessage);
    }
  },

  // Get admin dashboard statistics
  getDashboardStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get("/admin/dashboard/stats");
      return response.data;
    } catch (error: any) {
      console.log("Error fetching dashboard stats:", error.response);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch dashboard statistics";
      throw new Error(errorMessage);
    }
  },
};
