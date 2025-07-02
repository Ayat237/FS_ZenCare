// Patient-specific types
import { ImageSourcePropType } from 'react-native';

export interface Patient {
  id: string;
  name: string;
  age: number;
  image: ImageSourcePropType;
  history: {
    chronicDiseases: string[];
    surgeries: string[];
    allergies: string[];
    medications: string[];
    labResults: { title: string; date: string; filePath?: string }[];
  };
}

// Type for patient history section
export type PatientHistorySection = 'chronicDiseases' | 'surgeries' | 'allergies' | 'medications' | 'labResults';

// Type for patient list state
export interface PatientListState {
  patients: Patient[];
  filteredPatients: Patient[];
  searchQuery: string;
}