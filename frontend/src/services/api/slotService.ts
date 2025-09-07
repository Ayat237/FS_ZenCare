import apiClient from "./apiClient";
import { TimeSlot } from "@/types/availability";

export interface CreateSlotRequest {
  doctorId: string;
  date: string; // ISO date string
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  duration: number; // in minutes
  type: "telemedicine" | "inperson";
  price: number;
}

export interface SlotResponse {
  success: boolean;
  message?: string;
  data?: TimeSlot[] | TimeSlot;
}

class SlotService {
  /**
   * Create multiple time slots for a doctor
   */
  async createSlots(slotData: CreateSlotRequest): Promise<SlotResponse> {
    try {
      const response = await apiClient.post("/slots", slotData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create slots"
      );
    }
  }

  /**
   * Get available slots for a doctor on a specific date
   */
  async getAvailableSlots(
    doctorId: string,
    date: string,
    type?: "telemedicine" | "inperson"
  ): Promise<TimeSlot[]> {
    try {
      const params: any = { doctorId, date };
      if (type) {
        params.type = type;
      }

      const response = await apiClient.get("/slots/available", { params });
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch available slots"
      );
    }
  }

  /**
   * Get all slots for a doctor
   */
  async getDoctorSlots(doctorId: string): Promise<TimeSlot[]> {
    try {
      console.log("🔍 SlotService: Getting slots for doctor:", doctorId);
      const response = await apiClient.get("/slots", {
        params: { doctorId },
      });
      console.log("🔍 SlotService: Response:", response.data);
      return response.data.data || [];
    } catch (error: any) {
      console.error("🔍 SlotService: Error getting doctor slots:", error);
      console.error("🔍 SlotService: Error response:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to fetch doctor slots"
      );
    }
  }

  /**
   * Delete a slot if it's not booked
   */
  async deleteSlot(slotId: string): Promise<void> {
    try {
      await apiClient.delete(`/slots/${slotId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to delete slot");
    }
  }

  /**
   * Mark a slot as booked (internal use)
   */
  async markSlotAsBooked(slotId: string): Promise<TimeSlot> {
    try {
      const response = await apiClient.patch(`/slots/${slotId}/book`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to mark slot as booked"
      );
    }
  }
}

export const slotService = new SlotService();
export default slotService;
