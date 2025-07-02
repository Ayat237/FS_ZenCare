import { useState, useCallback } from "react";
import { INITIAL_FORM_DATA } from "../constants";

interface SignUpFormData {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  mobilePhone: string;
  gender: string;
  birthDate: string;
  password: string;
  confirmedPassword: string;
  location: {
    latitude: number | null;
    longitude: number | null;
    displayName: string;
  };
}

export const useSignUpForm = () => {
  const [formData, setFormData] = useState<SignUpFormData>(INITIAL_FORM_DATA);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleInputChange = useCallback(
    (field: keyof SignUpFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const validateForm = () => {
    // First Name validation
    if (!formData.firstName.trim()) {
      setValidationError("First name is required");
      return false;
    }
    if (formData.firstName.length < 3 || formData.firstName.length > 10) {
      setValidationError("First name must be between 3 and 10 characters");
      return false;
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      setValidationError("Last name is required");
      return false;
    }
    if (formData.lastName.length < 3 || formData.lastName.length > 10) {
      setValidationError("Last name must be between 3 and 10 characters");
      return false;
    }

    // userName validation
    if (!formData.userName.trim()) {
      setValidationError("userName is required");
      return false;
    }
    if (formData.userName.length < 3 || formData.userName.length > 10) {
      setValidationError("userName must be between 3 and 10 characters");
      return false;
    }

    // Email validation
    if (!formData.email.trim()) {
      setValidationError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailDomainRegex = /^[^@]+@[^@]+\.com$/;
    if (
      !emailRegex.test(formData.email) ||
      !emailDomainRegex.test(formData.email)
    ) {
      setValidationError("Please enter a valid email address with .com domain");
      return false;
    }

    // Mobile number validation
    if (!formData.mobilePhone.trim()) {
      setValidationError("Mobile number is required");
      return false;
    }
    const phoneRegex = /^01[0-2,5]\d{8}$/;
    if (!phoneRegex.test(formData.mobilePhone)) {
      setValidationError("Please enter a valid Egyptian mobile number");
      return false;
    }

    // Gender validation
    if (!formData.gender.trim()) {
      setValidationError("Gender is required");
      return false;
    }

    // Birth date validation
    if (!formData.birthDate.trim()) {
      setValidationError("Birth date is required");
      return false;
    }

    // Password validation
    if (!formData.password.trim()) {
      setValidationError("Password is required");
      return false;
    }
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$!%*?&])[A-Za-z\d$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setValidationError(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character ($!%*?&)"
      );
      return false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmedPassword) {
      setValidationError("Passwords do not match");
      return false;
    }

    // Terms agreement validation
    if (!agreeToTerms) {
      setValidationError("You must agree to the terms and conditions");
      return false;
    }

    return true;
  };

  const getFieldError = (field: keyof SignUpFormData): string | undefined => {
    if (!validationError) return undefined;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailDomainRegex = /^[^@]+@[^@]+\.com$/;
    const phoneRegex = /^01[0-2,5]\d{8}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$!%*?&])[A-Za-z\d$!%*?&]{8,}$/;

    switch (field) {
      case "firstName":
        if (!formData.firstName.trim()) return "First name is required";
        if (formData.firstName.length < 3 || formData.firstName.length > 10)
          return "First name must be between 3 and 10 characters";
        return undefined;

      case "lastName":
        if (!formData.lastName.trim()) return "Last name is required";
        if (formData.lastName.length < 3 || formData.lastName.length > 10)
          return "Last name must be between 3 and 10 characters";
        return undefined;

      case "userName":
        if (!formData.userName.trim()) return "userName is required";
        if (formData.userName.length < 3 || formData.userName.length > 10)
          return "userName must be between 3 and 10 characters";
        return undefined;

      case "email":
        if (!formData.email.trim()) return "Email is required";
        if (
          !emailRegex.test(formData.email) ||
          !emailDomainRegex.test(formData.email)
        )
          return "Please enter a valid email address with .com domain";
        return undefined;

      case "mobilePhone":
        if (!formData.mobilePhone.trim()) return "Mobile number is required";
        if (!phoneRegex.test(formData.mobilePhone))
          return "Please enter a valid Egyptian mobile number";
        return undefined;

      case "gender":
        if (!formData.gender.trim()) return "Gender is required";
        return undefined;

      case "birthDate":
        if (!formData.birthDate.trim()) return "Birth date is required";
        return undefined;

      case "password":
        if (!formData.password.trim()) return "Password is required";
        if (!passwordRegex.test(formData.password))
          return "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character ($!%*?&)";
        return undefined;

      case "confirmedPassword":
        if (formData.password !== formData.confirmedPassword)
          return "Passwords do not match";
        return undefined;

      default:
        return undefined;
    }
  };

  return {
    formData,
    setFormData,
    validationError,
    agreeToTerms,
    setAgreeToTerms,
    handleInputChange,
    validateForm,
    getFieldError,
  };
};

export type { SignUpFormData };
