/**
 * Test Payment Flow for Appointment Booking
 * 
 * This file demonstrates how to test the payment flow for booking appointments.
 * Make sure to have valid test data (slots, doctors, patients) in your database.
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000'; // Adjust to your server URL
const PATIENT_TOKEN = 'your-patient-jwt-token'; // Replace with actual token

// Test data - replace with actual IDs from your database
const TEST_DATA = {
  slotId: '64f1a2b3c4d5e6f7g8h9i0j1',
  doctorId: '64f1a2b3c4d5e6f7g8h9i0j2',
  appointmentType: 'telemedicine',
  notes: 'Test appointment booking'
};

/**
 * Step 1: Initialize Payment
 */
async function testInitializePayment() {
  try {
    console.log('🔵 Step 1: Initializing payment...');
    
    const response = await axios.post(
      `${BASE_URL}/appointments/payment/initialize-payment`,
      TEST_DATA,
      {
        headers: {
          'Authorization': `Bearer ${PATIENT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Payment initialized successfully');
    console.log('Payment Intent:', response.data.data.paymentIntent);
    console.log('Slot Details:', response.data.data.slot);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Error initializing payment:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Step 2: Complete Booking (after successful payment)
 */
async function testCompleteBooking(paymentData) {
  try {
    console.log('🔵 Step 2: Completing booking...');
    
    const bookingData = {
      paymentIntentId: paymentData.paymentIntent.id,
      slotId: TEST_DATA.slotId,
      doctorId: TEST_DATA.doctorId,
      appointmentType: TEST_DATA.appointmentType,
      notes: TEST_DATA.notes
    };

    const response = await axios.post(
      `${BASE_URL}/appointments/payment/complete-booking`,
      bookingData,
      {
        headers: {
          'Authorization': `Bearer ${PATIENT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Booking completed successfully');
    console.log('Appointment:', response.data.data);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Error completing booking:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Step 3: Get Payment Status
 */
async function testGetPaymentStatus(appointmentId) {
  try {
    console.log('🔵 Step 3: Getting payment status...');
    
    const response = await axios.get(
      `${BASE_URL}/appointments/payment/${appointmentId}/payment-status`,
      {
        headers: {
          'Authorization': `Bearer ${PATIENT_TOKEN}`
        }
      }
    );

    console.log('✅ Payment status retrieved');
    console.log('Payment Status:', response.data.data);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Error getting payment status:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Step 4: Cancel Appointment (with refund)
 */
async function testCancelAppointment(appointmentId) {
  try {
    console.log('🔵 Step 4: Cancelling appointment...');
    
    const response = await axios.post(
      `${BASE_URL}/appointments/payment/${appointmentId}/cancel`,
      {
        reason: 'Test cancellation'
      },
      {
        headers: {
          'Authorization': `Bearer ${PATIENT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Appointment cancelled successfully');
    console.log('Cancellation Result:', response.data.data);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Error cancelling appointment:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Run the complete test flow
 */
async function runPaymentFlowTest() {
  try {
    console.log('🚀 Starting Payment Flow Test\n');
    
    // Step 1: Initialize payment
    const paymentData = await testInitializePayment();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Step 2: Complete booking
    const appointment = await testCompleteBooking(paymentData);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Step 3: Get payment status
    await testGetPaymentStatus(appointment._id);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Step 4: Cancel appointment (optional - uncomment to test)
    // await testCancelAppointment(appointment._id);
    
    console.log('\n✅ Payment Flow Test Completed Successfully!');
    
  } catch (error) {
    console.error('\n❌ Payment Flow Test Failed:', error.message);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPaymentFlowTest();
}

export {
  testInitializePayment,
  testCompleteBooking,
  testGetPaymentStatus,
  testCancelAppointment,
  runPaymentFlowTest
}; 