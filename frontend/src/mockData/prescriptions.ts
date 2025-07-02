import { Prescription } from '../types/prescription';

// Mock data for doctor prescriptions
export const mockPrescriptions: Prescription[] = [
  {
    id: 'presc001',
    patientName: 'John Smith',
    date: '2023-06-10',
    medications: [
      {
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '7 days',
      },
      {
        name: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'As needed',
        duration: '3 days',
      },
    ],
    notes: 'Take with food. Complete the full course of antibiotics.',
  },
  {
    id: 'presc002',
    patientName: 'Emily Johnson',
    date: '2023-06-12',
    medications: [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
      },
    ],
    notes: 'Monitor blood pressure regularly.',
  },
  {
    id: 'presc003',
    patientName: 'Michael Brown',
    date: '2023-06-14',
    medications: [
      {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '90 days',
      },
      {
        name: 'Atorvastatin',
        dosage: '20mg',
        frequency: 'Once daily at bedtime',
        duration: '90 days',
      },
    ],
  },
  {
    id: 'presc004',
    patientName: 'Sarah Wilson',
    date: '2023-06-15',
    medications: [
      {
        name: 'Levothyroxine',
        dosage: '75mcg',
        frequency: 'Once daily on empty stomach',
        duration: '30 days',
      },
    ],
    notes: 'Take in the morning, 30-60 minutes before breakfast.',
  },
  {
    id: 'presc005',
    patientName: 'David Lee',
    date: '2023-06-16',
    medications: [
      {
        name: 'Fluticasone',
        dosage: '50mcg',
        frequency: 'Two sprays per nostril',
        duration: '14 days',
      },
      {
        name: 'Cetirizine',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '14 days',
      },
    ],
    notes: 'For seasonal allergies. Avoid alcohol while taking these medications.',
  },
];

// Helper function to get a prescription by ID
export const getPrescriptionById = (id: string): Prescription | undefined => {
  return mockPrescriptions.find(prescription => prescription.id === id);
};

// Helper function to format date
export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};