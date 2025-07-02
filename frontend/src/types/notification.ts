export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string; // ISO format
  type: "appointment" | "prescription" | "system" | "reminder";
  read: boolean;
}