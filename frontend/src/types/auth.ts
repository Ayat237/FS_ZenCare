export interface User {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string[];
  activeRole: string;
  profileImage: string;
  token: string;
  refreshToken: string;
  mobilePhone: string;
  // Doctor-specific fields
  specialty?: string;
  yearsOfExperience?: number;
  education?: {
    degree: string;
    institution: string;
    graduationYear: number;
  }[];
  certifications?: string[];
  hospitalAffiliations?: {
    name: string;
  }[];
  verificationId?: string;
  clinicBranches?: {
    address: {
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
    };
    phoneNumber: string;
  }[];
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
