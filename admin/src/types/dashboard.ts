export interface DashboardMetrics {
  totalDoctors: number;
  pendingVerifications: number;
  verifiedToday: number;
  activeUsers: number;
  totalAppointments: number;
  systemUptime: string;
}

export interface Activity {
  id: string;
  type: "doctor_registered" | "doctor_verified" | "doctor_rejected";
  message: string;
  timestamp: string;
  userId?: string;
}

export interface ChartData {
  registrationTrends: Array<{
    date: string;
    doctors: number;
    patients: number;
  }>;
  verificationStatus: Array<{
    status: "pending" | "approved" | "rejected";
    count: number;
  }>;
}
