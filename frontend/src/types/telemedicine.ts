export interface TelemedicineSession {
  id: string;
  patientName: string;
  patientImage?: string;
  date: string;
  time: string;
  type: "video" | "voice";
  status: "upcoming" | "completed" | "missed";
  notes?: string;
}