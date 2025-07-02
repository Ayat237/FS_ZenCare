// Appointment types for the application

export interface Appointment {
  id: string;
  patientName: string;
  patientImage: string;
  date: string;        // ISO format
  time: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  reason: string;
  type: "in-person" | "telemedicine";
}

// Type for appointment filtering
export type AppointmentFilterType = "all" | "pending" | "accepted" | "completed";