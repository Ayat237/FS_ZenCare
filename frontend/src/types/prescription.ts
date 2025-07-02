export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  patientName: string;
  date: string; // ISO format
  medications: Medication[];
  notes?: string;
}

export interface PrescriptionFormData {
  patientName: string;
  date: string;
  medications: Medication[];
  notes?: string;
}

// Types for managing prescription state
export type PrescriptionAction =
  | { type: 'ADD_PRESCRIPTION'; prescription: Prescription }
  | { type: 'UPDATE_PRESCRIPTION'; prescription: Prescription }
  | { type: 'DELETE_PRESCRIPTION'; id: string }
  | { type: 'SET_PRESCRIPTIONS'; prescriptions: Prescription[] };

export interface PrescriptionState {
  prescriptions: Prescription[];
}

// Type for the form mode
export type FormMode = 'add' | 'edit' | 'view';