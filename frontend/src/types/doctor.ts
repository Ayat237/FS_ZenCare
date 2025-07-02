// Doctor-specific types

export interface Doctor {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone: string;
  specialty: string;
  yearsOfExperience: number;
  education: Education[];
  certifications: string[];
  hospitalAffiliations: HospitalAffiliation[];
  verificationId?: string; // File path or URL to verification document
  clinicBranches: ClinicBranch[];
  profileImage: string;
  role: string[];
  activeRole: string;
}

export interface Education {
  degree: string;
  institution: string;
  graduationYear: number;
}

export interface HospitalAffiliation {
  name: string;
}

export interface ClinicBranch {
  address: Address;
  phoneNumber: string;
}

export interface Address {
  street: string;
  city: string;
  country: string;
  buildingNumber?: number;
  buildingName?: string;
  neighborhood?: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
}

export interface DoctorAppointment {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'virtual' | 'in-person';
  notes?: string;
}