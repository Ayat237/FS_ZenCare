export interface User {
  id?: string;
  userName?: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string[];
  activeRole: string;
  profileImage?: string;
  token?: string;
  refreshToken?: string;
  mobilePhone?: string;
  gender?: string;
  // Complete role data from API
  roleData?: {
    doctor?: {
      _id: string;
      user: string;
      isAdminApproved: boolean;
      specialty: string;
      hospitalAffiliation: {
        name: string;
        _id: string;
      }[];
      clinicBranches: {
        address: {
          _id: string;
          displayName: string;
        };
        phoneNumber: string;
        _id: string;
      }[];
      yearsOfExperience: number;
      education: {
        degree: string;
        institution: string;
        graduationYear: number;
        _id: string;
      }[];
      certifications: string[];
      profileImage: {
        URL: {
          public_id: string;
          secure_url: string;
        };
        customId: string;
      };
      rating: {
        average: number;
        count: number;
      };
      createdAt: string;
      updatedAt: string;
    };
    patient?: any; // Add patient data structure if needed
  };
  // Legacy doctor-specific fields for backward compatibility
  doctorId?: string;
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
  profileLoading: boolean;
}
