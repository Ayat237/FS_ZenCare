# Doctor Module

This module handles all doctor-related operations including registration, verification, and profile management.

## API Endpoints

### 1. Doctor Registration
- **POST** `/doctor/register`
- **Description**: Register a new doctor with verification ID and profile image upload
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `firstName` (string, required): Doctor's first name
  - `lastName` (string, required): Doctor's last name
  - `userName` (string, required): Unique username
  - `email` (string, required): Valid email address
  - `password` (string, required): Password
  - `confirmedPassword` (string, required): Password confirmation
  - `mobilePhone` (string, required): Phone number
  - `role` (array, required): Must include "DOCTOR"
  - `specialty` (string, required): Medical specialty
  - `yearsOfExperience` (number, required): Years of experience
  - `education` (array, required): Education details
  - `certifications` (array, optional): Certifications
  - `hospitalAffiliation` (array, required): Hospital affiliations
  - `clinicBranches` (array, required): Clinic branch details
  - `gender` (string, required): Gender
  - `verificationId` (file, required): Verification document
  - `profileImage` (file, optional): Profile image (default image will be used if not provided)

### 2. Email Verification
- **PATCH** `/doctor/verify-email`
- **Description**: Verify doctor email with OTP
- **Headers**: `emailtoken` or `emailToken`
- **Body**:
  - `email` (string, required): Email address
  - `otp` (string, required): 6-digit OTP

### 3. Admin Approval
- **PATCH** `/doctor/admin-approve/:doctorId`
- **Description**: Admin approval for doctor verification
- **Authentication**: Required
- **Params**:
  - `doctorId` (string, required): Doctor ID
- **Body**:
  - `isVerified` (boolean, required): Approval status

### 4. Get Doctor Profile
- **GET** `/doctor/profile`
- **Description**: Get authenticated doctor's profile
- **Authentication**: Required

### 5. Update Doctor Profile
- **PUT** `/doctor/profile`
- **Description**: Update authenticated doctor's profile
- **Authentication**: Required
- **Body**: All fields optional
  - `firstName` (string, optional)
  - `lastName` (string, optional)
  - `mobilePhone` (string, optional)
  - `specialty` (string, optional)
  - `yearsOfExperience` (number, optional)
  - `education` (array, optional)
  - `certifications` (array, optional)
  - `hospitalAffiliation` (array, optional)
  - `clinicBranches` (array, optional)

### 6. Update Doctor Profile Image
- **PATCH** `/doctor/profile/image`
- **Description**: Update authenticated doctor's profile image
- **Authentication**: Required
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `profileImage` (file, required): New profile image

## Response Format

All endpoints return responses in the following format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

## Error Handling

Errors are returned in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "name": "Error name",
    "message": "Error description"
  }
}
```

## Authentication

Protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## File Upload

The registration endpoint accepts file uploads for verification documents and profile images:

- **Profile Image**: Uploaded to Cloudinary cloud storage
- **Verification ID**: Stored locally on server (encrypted) for security

Supported formats are defined in the file extensions utility. 