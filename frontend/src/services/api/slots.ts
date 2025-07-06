import apiClient from "./apiClient";

export interface CreateSlotData {
  doctorId: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  duration: number; // in minutes
  type: "telemedicine" | "inperson";
  price: number;
}

export interface SlotResponse {
  _id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  isBooked: boolean;
  type: "telemedicine" | "inperson";
  price: number;
  createdAt: string;
  updatedAt: string;
}

export const slotsService = {
  // Create a new slot
  createSlot: async (slotData: CreateSlotData): Promise<SlotResponse> => {
    try {
      console.log("Creating slot:", slotData);
      const response = await apiClient.post("/slots", slotData);
      console.log("✅ Slot created successfully:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.log("❌ Create slot error:", error);
      console.log("❌ Error response:", error.response?.data);
      console.log("❌ Error status:", error.response?.status);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to create slot";
      throw new Error(errorMessage);
    }
  },

  // Get all slots for a doctor
  getDoctorSlots: async (doctorId: string): Promise<SlotResponse[]> => {
    try {
      console.log("Fetching doctor slots for:", doctorId);
      const response = await apiClient.get("/slots", {
        params: { doctorId },
      });
      return response.data.data;
    } catch (error: any) {
      console.log("Get doctor slots error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch doctor slots";
      throw new Error(errorMessage);
    }
  },

  // Get available slots for a doctor on a specific date
  getAvailableSlots: async (
    doctorId: string,
    date: string,
    type?: "telemedicine" | "inperson"
  ): Promise<SlotResponse[]> => {
    try {
      console.log("Fetching available slots for:", doctorId, "on", date);
      const params: any = { doctorId, date };
      if (type) {
        params.type = type;
      }

      const response = await apiClient.get("/slots/available", { params });
      return response.data.data;
    } catch (error: any) {
      console.log("Get available slots error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch available slots";
      throw new Error(errorMessage);
    }
  },

  // Delete a slot
  deleteSlot: async (slotId: string): Promise<void> => {
    try {
      console.log("Deleting slot:", slotId);
      const response = await apiClient.delete(`/slots/${slotId}`);
      console.log("✅ Slot deleted successfully:", response.data);
    } catch (error: any) {
      console.log("❌ Delete slot error:", error);
      console.log("❌ Error response:", error.response?.data);
      console.log("❌ Error status:", error.response?.status);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to delete slot";
      throw new Error(errorMessage);
    }
  },

  // Mark slot as booked (internal use)
  markSlotAsBooked: async (slotId: string): Promise<SlotResponse> => {
    try {
      console.log("Marking slot as booked:", slotId);
      const response = await apiClient.patch(`/slots/${slotId}/book`);
      return response.data.data;
    } catch (error: any) {
      console.log("Mark slot as booked error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to mark slot as booked";
      throw new Error(errorMessage);
    }
  },
};
