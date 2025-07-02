export interface TimeSlot {
  id: string;
  day: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // 24-hour format (HH:MM)
  endTime: string; // 24-hour format (HH:MM)
  duration: 15 | 30 | 45 | 60; // Duration in minutes
  type: 'telemedicine' | 'in-person';
  isRecurring: boolean;
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