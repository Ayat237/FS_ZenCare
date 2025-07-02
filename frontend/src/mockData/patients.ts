import { Patient } from '../types/patient';

// PDF file path for lab results
const labResultPdf = require('../assets/pdfs/lab result.pdf');

// Mock data for patients
export const mockPatients: Patient[] = [
  {
    id: 'pat001',
    name: 'John Smith',
    age: 45,
    image: require('../assets/images/avatar-placeholder.png'),
    history: {
      chronicDiseases: ['Hypertension', 'Type 2 Diabetes'],
      surgeries: ['Appendectomy (2010)', 'Knee Arthroscopy (2018)'],
      allergies: ['Penicillin', 'Peanuts'],
      medications: ['Metformin 500mg', 'Lisinopril 10mg', 'Aspirin 81mg'],
      labResults: [
        { title: 'Complete Blood Count', date: '2023-05-15', filePath: labResultPdf },
        { title: 'Lipid Panel', date: '2023-05-15', filePath: labResultPdf },
        { title: 'HbA1c Test', date: '2023-04-10', filePath: labResultPdf },
      ],
    },
  },
  {
    id: 'pat002',
    name: 'Sarah Johnson',
    age: 32,
    image: require('../assets/images/girl.png'),
    history: {
      chronicDiseases: ['Asthma', 'Migraine'],
      surgeries: [],
      allergies: ['Dust', 'Pollen'],
      medications: ['Albuterol Inhaler', 'Sumatriptan 50mg'],
      labResults: [
        { title: 'Pulmonary Function Test', date: '2023-06-20', filePath: labResultPdf },
        { title: 'Allergy Panel', date: '2023-03-12', filePath: labResultPdf },
      ],
    },
  },
  {
    id: 'pat003',
    name: 'Michael Chen',
    age: 58,
    image: require('../assets/images/avatar-placeholder.png'),
    history: {
      chronicDiseases: ['Coronary Artery Disease', 'Hyperlipidemia'],
      surgeries: ['Coronary Bypass (2015)', 'Cataract Surgery (2020)'],
      allergies: ['Sulfa Drugs'],
      medications: ['Atorvastatin 40mg', 'Metoprolol 25mg', 'Aspirin 81mg'],
      labResults: [
        { title: 'Cardiac Stress Test', date: '2023-07-05', filePath: labResultPdf },
        { title: 'Echocardiogram', date: '2023-07-05', filePath: labResultPdf },
        { title: 'Lipid Panel', date: '2023-06-10', filePath: labResultPdf },
      ],
    },
  },
  {
    id: 'pat004',
    name: 'Emily Rodriguez',
    age: 29,
    image: require('../assets/images/girl.png'),
    history: {
      chronicDiseases: ['Anxiety Disorder'],
      surgeries: ['Wisdom Teeth Extraction (2018)'],
      allergies: ['Latex'],
      medications: ['Escitalopram 10mg'],
      labResults: [
        { title: 'Thyroid Panel', date: '2023-04-22', filePath: labResultPdf },
        { title: 'Complete Blood Count', date: '2023-04-22', filePath: labResultPdf },
      ],
    },
  },
  {
    id: 'pat005',
    name: 'Robert Williams',
    age: 62,
    image: require('../assets/images/avatar-placeholder.png'),
    history: {
      chronicDiseases: ['Osteoarthritis', 'GERD'],
      surgeries: ['Hip Replacement (2019)'],
      allergies: [],
      medications: ['Omeprazole 20mg', 'Acetaminophen 500mg'],
      labResults: [
        { title: 'X-Ray Hip', date: '2023-02-15', filePath: labResultPdf },
        { title: 'Bone Density Scan', date: '2022-11-30', filePath: labResultPdf },
      ],
    },
  },
];

// Helper function to get a patient by ID
export const getPatientById = (id: string): Patient | undefined => {
  return mockPatients.find(patient => patient.id === id);
};

// Helper function to format date
export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};