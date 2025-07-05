export interface PendingDoctor {
  userId: string;
  doctorData: {
    specialty: string;
    yearsOfExperience: string;
    education: Array<{
      degree: string;
      institution: string;
      graduationYear: number;
    }>;
    certifications: string[];
    hospitalAffiliation: Array<{
      name: string;
    }>;
    clinicBranches: Array<{
      address: {
        displayName: string;
        coordinates: {
          latitude: number;
          longitude: number;
        };
      };
      phoneNumber: string;
    }>;
  };
  profileImageObject: {
    URL: {
      secure_url: string;
      public_id: string;
    };
    customId: string;
  };
  verificationId: string | null;
}

export interface PendingDoctorsResponse {
  success: boolean;
  message: string;
  data: {
    doctors: PendingDoctor[];
  };
}

export interface VerifyDoctorRequest {
  isAdminApproved: boolean;
}

export interface VerifyDoctorResponse {
  success: boolean;
  message: string;
  data: {
    doctor: any;
  };
}
