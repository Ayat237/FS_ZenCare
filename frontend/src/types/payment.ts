export interface Payment {
  id: string;
  patientName: string;
  date: string;      // ISO format
  amount: number;
  method: "Cash" | "Visa" | "Online";
  status: "paid" | "pending" | "refunded";
}