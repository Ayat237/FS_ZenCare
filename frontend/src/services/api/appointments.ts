import apiClient from "./apiClient";

export interface AppointmentResponse {
  _id: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  doctorId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    specialization?: string;
  };
  slotId: {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    type: "telemedicine" | "inperson";
  };
  type: "telemedicine" | "inperson";
  dateTime: string;
  duration: number;
  notes?: string;
  price: number;
  isPaid: boolean;
  paymentIntentId?: string;
  medicalHistoryShared: boolean;
  jitsiMeeting?: {
    roomName: string;
    moderatorToken: string;
    guestToken: string;
    createdAt: string;
    expiresAt: string;
  };
  prescription?: {
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
    notes?: string;
    sentAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  doctorId: string;
  patientId: string;
  slotId: string;
  type: "telemedicine" | "inperson";
  notes?: string;
  price: number;
  paymentIntentId?: string;
}

export interface GetMyAppointmentsFilters {
  startDate?: string;
  endDate?: string;
  type?: "telemedicine" | "inperson";
}

export interface AppointmentApiResponse {
  success: boolean;
  message: string;
  data: AppointmentResponse | AppointmentResponse[];
  count?: number;
}

export const appointmentsService = {
  // Create a new appointment
  async createAppointment(
    appointmentData: CreateAppointmentRequest
  ): Promise<AppointmentResponse> {
    const response = await apiClient.post<AppointmentApiResponse>(
      "/appointments",
      appointmentData
    );
    return response.data.data as AppointmentResponse;
  },

  // Get user's appointments (based on their role - doctor or patient)
  async getMyAppointments(
    filters?: GetMyAppointmentsFilters
  ): Promise<AppointmentResponse[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.type) params.append("type", filters.type);

    const queryString = params.toString();
    const url = `/appointments/my-appointments${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await apiClient.get<AppointmentApiResponse>(url);
    return response.data.data as AppointmentResponse[];
  },

  // Get specific appointment by ID
  async getAppointment(appointmentId: string): Promise<AppointmentResponse> {
    const response = await apiClient.get<AppointmentApiResponse>(
      `/appointments/${appointmentId}`
    );
    return response.data.data as AppointmentResponse;
  },

  // Update appointment
  async updateAppointment(
    appointmentId: string,
    updateData: Partial<AppointmentResponse>
  ): Promise<AppointmentResponse> {
    const response = await apiClient.patch<AppointmentApiResponse>(
      `/appointments/${appointmentId}`,
      updateData
    );
    return response.data.data as AppointmentResponse;
  },

  // Get Jitsi meeting details for telemedicine appointment
  async getJitsiMeetingDetails(appointmentId: string): Promise<{
    roomName: string;
    token: string;
    expiresAt: string;
    appointmentDateTime: string;
    duration: number;
    isModerator: boolean;
  }> {
    const response = await apiClient.get(
      `/appointments/${appointmentId}/meeting`
    );
    return response.data.data;
  },
};
