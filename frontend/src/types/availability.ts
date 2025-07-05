export interface TimeSlot {
  _id?: string; // MongoDB ID from backend
  id?: string; // Frontend ID for compatibility
  doctorId?: string; // Doctor who owns this slot
  day?: string; // ISO date string (YYYY-MM-DD) - frontend field
  date?: Date | string; // Backend field (can be Date or string)
  startTime: string; // 24-hour format (HH:MM)
  endTime: string; // 24-hour format (HH:MM)
  duration: number; // Duration in minutes (changed from union type to number)
  type: "telemedicine" | "inperson"; // Updated to match backend enum
  price: number; // Price for the slot
  isBooked?: boolean; // Whether the slot is booked
  isRecurring?: boolean; // Frontend field for UI purposes
  createdAt?: string; // Backend timestamp
  updatedAt?: string; // Backend timestamp
}

export interface DayAvailability {
  date: string; // ISO date string (YYYY-MM-DD)
  dayName: string; // Monday, Tuesday, etc.
  dayOfMonth: number; // 1-31
  month: string; // January, February, etc.
  slots: TimeSlot[];
}

export interface WeekAvailability {
  days: DayAvailability[];
  startDate: string; // ISO date string (YYYY-MM-DD) for the first day of the week
  endDate: string; // ISO date string (YYYY-MM-DD) for the last day of the week
}
