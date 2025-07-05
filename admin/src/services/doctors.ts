import apiClient from "./apiClient";
import {
  PendingDoctorsResponse,
  VerifyDoctorRequest,
  VerifyDoctorResponse,
} from "@/types/doctor";

export const doctorService = {
  async getPendingDoctors(): Promise<PendingDoctorsResponse> {
    try {
      console.log("🔍 ADMIN WEB: Fetching pending doctors...");
      const response = await apiClient.get("/admin/pending-doctors");
      console.log("🔍 ADMIN WEB: Pending doctors response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("🔍 ADMIN WEB: Get pending doctors error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch pending doctors"
      );
    }
  },

  async verifyDoctor(
    userId: string,
    verificationData: VerifyDoctorRequest
  ): Promise<VerifyDoctorResponse> {
    try {
      console.log(
        `🔍 ADMIN WEB: Verifying doctor ${userId} with data:`,
        verificationData
      );
      const response = await apiClient.patch(
        `/admin/verify-doctor/${userId}`,
        verificationData
      );
      console.log("🔍 ADMIN WEB: Verify doctor response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("🔍 ADMIN WEB: Verify doctor error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to verify doctor"
      );
    }
  },
};
