# Appointment Payment Flow with Stripe

This document outlines the complete payment flow for booking appointments in the ZenCare system using Stripe.

## Overview

The payment flow consists of two main steps:
1. **Initialize Payment**: Create a payment intent when patient selects a slot
2. **Complete Booking**: Process payment and create appointment after successful payment

## Step-by-Step Flow

### Step 1: Patient Selects Available Slot

1. Patient browses available slots for a doctor
2. Patient selects a slot and appointment type (telemedicine/in-person)
3. System validates slot availability and creates payment intent

### Step 2: Initialize Payment

**Endpoint**: `POST /appointments/payment/initialize-payment`

**Request Body**:
```json
{
  "slotId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "doctorId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "appointmentType": "telemedicine",
  "notes": "Optional appointment notes"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "paymentIntent": {
      "id": "pi_3OqX8Y2eZvKYlo2C1gQJ8X9Y",
      "clientSecret": "pi_3OqX8Y2eZvKYlo2C1gQJ8X9Y_secret_abc123",
      "amount": 150.00,
      "currency": "usd"
    },
    "slot": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "date": "2024-01-15T00:00:00.000Z",
      "startTime": "10:00",
      "endTime": "10:30",
      "duration": 30,
      "type": "telemedicine",
      "price": 150.00
    }
  }
}
```

### Step 3: Frontend Payment Processing

1. Frontend receives `clientSecret` from payment intent
2. Frontend integrates with Stripe Elements to collect payment details
3. Frontend confirms payment using the client secret
4. Upon successful payment, frontend calls complete booking endpoint

### Step 4: Complete Appointment Booking

**Endpoint**: `POST /appointments/payment/complete-booking`

**Request Body**:
```json
{
  "paymentIntentId": "pi_3OqX8Y2eZvKYlo2C1gQJ8X9Y",
  "slotId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "doctorId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "appointmentType": "telemedicine",
  "notes": "Optional appointment notes"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
    "patientId": "64f1a2b3c4d5e6f7g8h9i0j4",
    "doctorId": "64f1a2b3c4d5e6f7g8h9i0j2",
    "slotId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "type": "telemedicine",
    "dateTime": "2024-01-15T10:00:00.000Z",
    "duration": 30,
    "notes": "Optional appointment notes",
    "price": 150.00,
    "paymentStatus": "paid",
    "paymentIntentId": "pi_3OqX8Y2eZvKYlo2C1gQJ8X9Y",
    "jitsiMeeting": {
      "roomName": "appointment_64f1a2b3c4d5e6f7g8h9i0j3",
      "moderatorToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "guestToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "createdAt": "2024-01-10T12:00:00.000Z",
      "expiresAt": "2024-01-15T10:30:00.000Z"
    },
    "createdAt": "2024-01-10T12:00:00.000Z",
    "updatedAt": "2024-01-10T12:00:00.000Z"
  }
}
```

## Additional Endpoints

### Get Payment Status

**Endpoint**: `GET /appointments/payment/:appointmentId/payment-status`

**Response**:
```json
{
  "success": true,
  "message": "Payment status retrieved successfully",
  "data": {
    "appointmentId": "64f1a2b3c4d5e6f7g8h9i0j3",
    "paymentStatus": "paid",
    "paymentIntentId": "pi_3OqX8Y2eZvKYlo2C1gQJ8X9Y",
    "price": 150.00
  }
}
```

### Cancel Appointment with Refund

**Endpoint**: `POST /appointments/payment/:appointmentId/cancel`

**Request Body**:
```json
{
  "reason": "Patient requested cancellation"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "appointment": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "paymentStatus": "failed",
      "notes": "Original notes\n[CANCELLED: Patient requested cancellation]"
    },
    "refund": {
      "id": "re_3OqX8Y2eZvKYlo2C1gQJ8X9Y",
      "amount": 15000,
      "currency": "usd",
      "status": "succeeded"
    }
  }
}
```

## Webhook Handling

The system includes webhook handling for Stripe events:

**Endpoint**: `POST /webhook/stripe`

**Supported Events**:
- `payment_intent.succeeded`: Updates appointment status to "paid"
- `payment_intent.payment_failed`: Updates appointment status to "failed"
- `payment_intent.canceled`: Updates appointment status to "failed"
- `charge.refunded`: Updates appointment status to "failed"

## Environment Variables Required

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Frontend Integration Example

```javascript
// 1. Initialize payment
const initializePayment = async (slotData) => {
  const response = await fetch('/appointments/payment/initialize-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(slotData)
  });
  
  const result = await response.json();
  return result.data.paymentIntent;
};

// 2. Process payment with Stripe
const processPayment = async (paymentIntent) => {
  const stripe = Stripe('pk_test_...');
  const { error } = await stripe.confirmPayment({
    clientSecret: paymentIntent.clientSecret,
    confirmParams: {
      return_url: 'https://your-domain.com/payment-success',
    },
  });
  
  if (error) {
    throw new Error(error.message);
  }
};

// 3. Complete booking
const completeBooking = async (paymentData) => {
  const response = await fetch('/appointments/payment/complete-booking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(paymentData)
  });
  
  const result = await response.json();
  return result.data;
};
```

## Error Handling

The system includes comprehensive error handling for:
- Invalid slot selection
- Payment failures
- Duplicate bookings
- Unauthorized access
- Network issues

## Security Features

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Role-based access control
3. **Webhook Verification**: Stripe signature verification
4. **Input Validation**: Comprehensive request validation
5. **Payment Confirmation**: Server-side payment verification

## Database Schema Updates

The appointment model includes payment-related fields:
- `paymentStatus`: "pending", "paid", "failed"
- `paymentIntentId`: Stripe payment intent ID
- `price`: Appointment price

## Testing

Use Stripe test cards for testing:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 9995` 