export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'Virtual' | 'In-person';
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  image?: any;
}

export interface MedicalRecord {
  id: string;
  title: string;
  date: string;
  doctor: string;
  description: string;
  type: 'Diagnosis' | 'Test' | 'Surgery' | 'Vaccination';
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  experience: string;
  availability: string;
  image?: any;
  price: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  date: string;
  type: 'appointment' | 'medication' | 'system' | 'payment';
  read: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'applepay' | 'googlepay';
  name: string;
  details: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  type: 'appointment' | 'medication' | 'subscription';
}