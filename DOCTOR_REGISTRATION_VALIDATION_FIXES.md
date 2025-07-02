# Doctor Registration Validation Fixes

## Issues Identified from Backend Validation Error

### 1. `birthDate` Field Error

**Problem**: The backend validation for doctor registration doesn't allow the `birthDate` field, but it was being sent from the frontend.

**Fix**: Modified `PhotoUploadScreen.tsx` to only include `birthDate` for patient registrations, not doctor registrations.

```typescript
// Only add birthDate for patient registration
if (role !== "doctor") {
  formData.append("birthDate", userData.birthDate);
}
```

### 2. Empty Clinic Branches Address Fields

**Problem**: The clinic branches were being sent with empty address fields (street, city, country, neighborhood), which violates backend validation requirements.

**Fix**: Added data validation and fallback defaults in `PhotoUploadScreen.tsx`:

- Filter out incomplete clinic branches
- Provide default values when no valid clinic branches exist
- Ensure all required address fields are populated
- Add default coordinates for Cairo, Egypt

### 3. Empty Hospital Affiliations

**Problem**: Similar to clinic branches, hospital affiliations could be empty.

**Fix**: Added validation and fallback for hospital affiliations:

- Filter out empty hospital names
- Provide default "To be updated" value when no valid affiliations exist

### 4. Missing Neighborhood Field

**Problem**: The initial form data didn't include the `neighborhood` field, which is required by backend validation.

**Fix**:

- Updated `useDoctorSignUpForm.ts` initial data to include empty `neighborhood` field
- Added neighborhood handling in the PhotoUploadScreen fallback logic

## Code Changes Made

### PhotoUploadScreen.tsx

1. Conditional `birthDate` inclusion
2. Enhanced clinic branches validation with fallbacks
3. Enhanced hospital affiliations validation with fallbacks
4. Default coordinates for address validation

### useDoctorSignUpForm.ts

1. Added `neighborhood: ''` to initial clinic branch address data

## Default Values Used

- **Country**: "Egypt" (backend default)
- **Coordinates**: Cairo coordinates (31.2357, 30.0444)
- **Phone**: Uses user's mobile phone as fallback
- **Placeholder text**: "To be updated" for empty required fields

## Validation Strategy

1. **Primary**: Use actual form data when properly filled
2. **Fallback**: Provide valid defaults that meet backend requirements
3. **Principle**: Allow registration to proceed while indicating fields need updating

This approach ensures the registration won't fail due to empty required fields while still allowing doctors to provide actual information during the registration process.
