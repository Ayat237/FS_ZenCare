import { useState, useCallback } from "react";
import { Education, HospitalAffiliation, ClinicBranch } from "@/types/doctor";

interface DoctorFormData {
  specialty: string;
  yearsOfExperience: number | string;
  education: Education[];
  certifications: string[];
  hospitalAffiliations: HospitalAffiliation[];
  clinicBranches: ClinicBranch[];
  verificationId?: string;
  verificationDocumentType?: string;
  verificationDocumentName?: string;
}

export const INITIAL_DOCTOR_FORM_DATA: DoctorFormData = {
  specialty: "",
  yearsOfExperience: "",
  education: [
    {
      degree: "",
      institution: "",
      graduationYear: new Date().getFullYear(),
    },
  ],
  certifications: [],
  hospitalAffiliations: [
    {
      name: "",
    },
  ],
  clinicBranches: [
    {
      address: {
        street: "",
        city: "",
        country: "",
        neighborhood: "",
        coordinates: {
          longitude: 0,
          latitude: 0,
        },
      },
      phoneNumber: "",
    },
  ],
};

export const useDoctorSignUpForm = () => {
  const [doctorFormData, setDoctorFormData] = useState<DoctorFormData>(
    INITIAL_DOCTOR_FORM_DATA
  );
  const [validationErrors, setValidationErrors] = useState<{
    specialty?: string;
    yearsOfExperience?: string;
    education?: string;
    certifications?: string;
    hospitalAffiliations?: string;
    clinicBranches?: string;
    verificationId?: string;
  }>({});

  const handleDoctorFormChange = useCallback(
    (newData: Partial<DoctorFormData>) => {
      setDoctorFormData((prev) => ({ ...prev, ...newData }));
    },
    []
  );

  const validateDoctorForm = (): boolean => {
    const errors: {
      specialty?: string;
      yearsOfExperience?: string;
      education?: string;
      certifications?: string;
      hospitalAffiliations?: string;
      clinicBranches?: string;
      verificationId?: string;
    } = {};

    // Validate specialty
    if (!doctorFormData.specialty) {
      errors.specialty = "Specialty is required";
    }

    // Validate years of experience
    if (doctorFormData.yearsOfExperience === "") {
      errors.yearsOfExperience = "Years of experience is required";
    } else if (Number(doctorFormData.yearsOfExperience) < 0) {
      errors.yearsOfExperience = "Years of experience cannot be negative";
    }

    // Validate education
    const hasIncompleteEducation = doctorFormData.education.some(
      (edu) => !edu.degree || !edu.institution || !edu.graduationYear
    );
    if (doctorFormData.education.length === 0 || hasIncompleteEducation) {
      errors.education = "Complete education information is required";
    }

    // Validate hospital affiliations
    const hasIncompleteHospital = doctorFormData.hospitalAffiliations.some(
      (hospital) => !hospital.name
    );
    if (
      doctorFormData.hospitalAffiliations.length === 0 ||
      hasIncompleteHospital
    ) {
      errors.hospitalAffiliations =
        "At least one hospital affiliation is required";
    }

    // Validate clinic branches
    const hasIncompleteClinic = doctorFormData.clinicBranches.some((branch) => {
      // Check if coordinates are valid (not 0,0)
      const hasValidCoordinates =
        branch.address.coordinates &&
        (branch.address.coordinates.latitude !== 0 ||
          branch.address.coordinates.longitude !== 0);

      // If coordinates are valid, we don't need to strictly check street/city/country
      if (hasValidCoordinates) {
        return !branch.phoneNumber; // Only require phone number
      } else {
        // If no valid coordinates, require the traditional address fields
        return (
          !branch.address.street ||
          !branch.address.city ||
          !branch.address.country ||
          !branch.phoneNumber
        );
      }
    });
    if (doctorFormData.clinicBranches.length === 0 || hasIncompleteClinic) {
      errors.clinicBranches = "Complete clinic branch information is required";
    }

    // Validate verification document
    if (!doctorFormData.verificationId) {
      errors.verificationId = "Verification document is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return {
    doctorFormData,
    setDoctorFormData,
    handleDoctorFormChange,
    validateDoctorForm,
    validationErrors,
  };
};

export type { DoctorFormData };
