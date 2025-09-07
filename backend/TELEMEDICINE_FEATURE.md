# Telemedicine Appointments with Jitsi Integration

## Overview

This feature enables the creation and management of telemedicine appointments using Jitsi video conferencing.

## Features Implemented

### 1. Updated Appointment Model

- Added `slotId` reference to connect appointments with time slots
- Added `type` field with enum values: 'telemedicine' | 'in-person'
- Added `jitsiMeeting` object with:
  - `roomName`: Unique room identifier
  - `moderatorToken`: JWT token for doctors (with moderator privileges)
  - `guestToken`: JWT token for patients (guest access)
  - `createdAt`: Meeting creation timestamp
  - `expiresAt`: Meeting expiration timestamp

### 2. Jitsi Service

- JWT token generation for secure meeting access
- Separate tokens for doctors (moderators) and patients (guests)
- Automatic room name generation using appointment ID
- Token expiration tied to appointment end time

### 3. Appointment Module

- Full CRUD operations for appointments
- Slot booking validation
- Automatic Jitsi meeting setup for telemedicine appointments
- Role-based access control

## API Endpoints

### POST /appointments

Create a new appointment

```json
{
  "doctorId": "ObjectId",
  "patientId": "ObjectId",
  "slotId": "ObjectId",
  "type": "telemedicine",
  "notes": "Optional notes",
  "price": 50.0
}
```

### GET /appointments/my-appointments

Get user's appointments (filtered by role)

- Query params: `startDate`, `endDate`, `type`

### GET /appointments/:appointmentId

Get specific appointment details

### PATCH /appointments/:appointmentId

Update appointment (notes, prescription, medical history sharing)

### GET /appointments/:appointmentId/meeting

Get Jitsi meeting details for telemedicine appointments

- Returns appropriate token based on user role (doctor/patient)

## Environment Variables Required

Add these to your `.env` file:

```env
# Jitsi Configuration
JITSI_SECRET=your-jitsi-secret-key-here
JITSI_APP_ID=zencare
JITSI_DOMAIN=meet.jit.si
```

## Appointment Creation Flow

1. **Validation**: Verify all required fields and user permissions
2. **Slot Verification**:
   - Check slot exists and is not booked
   - Verify slot belongs to specified doctor
   - Verify appointment type matches slot type
3. **Appointment Creation**: Create base appointment record
4. **Jitsi Setup** (for telemedicine):
   - Generate unique room name
   - Create JWT tokens for doctor and patient
   - Calculate meeting expiration time
   - Save meeting details to appointment
5. **Slot Booking**: Mark slot as booked
6. **Response**: Return complete appointment with meeting details

## Security Features

- JWT tokens with proper expiration
- Role-based access control
- User authorization for appointment access
- Secure token generation with user context
- Automatic meeting cleanup on appointment creation failure

## Error Handling

- Invalid slot ID
- Slot already booked
- Appointment type mismatch
- Jitsi setup failures
- Unauthorized access attempts
- Missing user data for token generation

## Usage Example

```javascript
// Create telemedicine appointment
const appointment = await fetch("/appointments", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer your-token",
  },
  body: JSON.stringify({
    doctorId: "doctor-id",
    patientId: "patient-id",
    slotId: "slot-id",
    type: "telemedicine",
    price: 75.0,
  }),
});

// Get meeting details
const meetingDetails = await fetch(`/appointments/${appointmentId}/meeting`, {
  headers: {
    Authorization: "Bearer your-token",
  },
});
```

## Notes

- Appointments are automatically linked to slots
- Slot booking prevents double-booking
- Meeting tokens expire with appointment end time
- Only assigned doctors can add prescriptions
- Both patients and doctors can access their appointment meetings
