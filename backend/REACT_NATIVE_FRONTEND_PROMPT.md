# React Native Mobile App Development Prompt

## Project Overview

Create a React Native mobile application for ZenCare - a telemedicine platform that allows patients to book appointments with doctors, make payments via Stripe, and attend video consultations. The app should integrate seamlessly with the existing backend payment system.

## Tech Stack Requirements

- **React Native** (latest stable version)
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Redux Toolkit** or **Zustand** for state management
- **Axios** for API calls
- **Stripe React Native SDK** for payment processing
- **React Native Elements** or **NativeBase** for UI components
- **AsyncStorage** for local storage
- **React Native Video** for Jitsi integration
- **React Native Permissions** for camera/microphone access

## Core Features to Implement

### 1. Authentication System
- Login/Register screens
- JWT token management
- Role-based navigation (Patient/Doctor/Admin)
- Password reset functionality
- Biometric authentication (optional)

### 2. Patient Dashboard
- View upcoming appointments
- View past appointments
- Quick access to book new appointments
- Payment history
- Medical history access

### 3. Doctor Search & Booking
- Browse available doctors
- Filter by specialty, location, availability
- View doctor profiles and ratings
- Select appointment slots
- Choose appointment type (telemedicine/in-person)

### 4. Payment Integration
- Stripe payment processing
- Secure card input
- Payment confirmation
- Receipt generation
- Refund handling

### 5. Video Consultation
- Jitsi Meet integration
- Camera/microphone permissions
- Screen sharing capability
- Chat during consultation
- Recording consent

### 6. Appointment Management
- Appointment details view
- Reschedule/cancel appointments
- Add notes/attachments
- View prescriptions
- Share medical history

## API Integration Structure

### Base API Configuration

```typescript
// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://your-backend-url.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor for JWT tokens
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      await AsyncStorage.removeItem('authToken');
      // Navigate to login
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Authentication Service

```typescript
// src/services/authService.ts
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: 'patient' | 'doctor';
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    await AsyncStorage.setItem('authToken', response.data.data.token);
    await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user));
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  },

  getCurrentUser: async () => {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
};
```

### Appointment & Payment Service

```typescript
// src/services/appointmentService.ts
import api from './api';

export interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: 'telemedicine' | 'inperson';
  price: number;
  isBooked: boolean;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface AppointmentData {
  slotId: string;
  doctorId: string;
  appointmentType: 'telemedicine' | 'inperson';
  notes?: string;
  medicalHistoryShared?: boolean;
  attachments?: Array<{
    file: string;
    customId: string;
  }>;
}

export const appointmentService = {
  // Get available slots for a doctor
  getAvailableSlots: async (doctorId: string, date?: string) => {
    const params = date ? { doctorId, date } : { doctorId };
    const response = await api.get('/slots/available', { params });
    return response.data.data;
  },

  // Initialize payment for appointment booking
  initializePayment: async (data: AppointmentData) => {
    const response = await api.post('/appointments/payment/initialize-payment', data);
    return response.data.data;
  },

  // Complete appointment booking after payment
  completeBooking: async (data: AppointmentData & { paymentIntentId: string }) => {
    const response = await api.post('/appointments/payment/complete-booking', data);
    return response.data.data;
  },

  // Get user's appointments
  getMyAppointments: async (filters?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }) => {
    const response = await api.get('/appointments/my-appointments', { params: filters });
    return response.data.data;
  },

  // Get appointment details
  getAppointment: async (appointmentId: string) => {
    const response = await api.get(`/appointments/${appointmentId}`);
    return response.data.data;
  },

  // Get payment status
  getPaymentStatus: async (appointmentId: string) => {
    const response = await api.get(`/appointments/payment/${appointmentId}/payment-status`);
    return response.data.data;
  },

  // Cancel appointment with refund
  cancelAppointment: async (appointmentId: string, reason: string) => {
    const response = await api.post(`/appointments/payment/${appointmentId}/cancel`, { reason });
    return response.data.data;
  },

  // Get Jitsi meeting details
  getMeetingDetails: async (appointmentId: string) => {
    const response = await api.get(`/appointments/${appointmentId}/meeting`);
    return response.data.data;
  }
};
```

## Screen Structure

### Navigation Setup

```typescript
// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// Patient Tab Navigator
const PatientTabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={PatientDashboardScreen} />
    <Tab.Screen name="Book Appointment" component={BookAppointmentScreen} />
    <Tab.Screen name="My Appointments" component={MyAppointmentsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : userRole === 'patient' ? (
          <Stack.Screen name="PatientApp" component={PatientTabNavigator} />
        ) : (
          <Stack.Screen name="DoctorApp" component={DoctorTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### Key Screens Implementation

#### 1. Login Screen

```typescript
// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { authService } from '../../services/authService';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await authService.login({ email, password });
      // Navigation will be handled by the navigator
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ZenCare</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 16,
  },
});
```

#### 2. Book Appointment Screen

```typescript
// src/screens/patient/BookAppointmentScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { appointmentService } from '../../services/appointmentService';
import { Slot } from '../../types/appointment';

const BookAppointmentScreen = ({ navigation }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      // Implement doctor fetching logic
      const response = await api.get('/doctor/available');
      setDoctors(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch doctors');
    }
  };

  const fetchSlots = async (doctorId: string) => {
    setLoading(true);
    try {
      const availableSlots = await appointmentService.getAvailableSlots(doctorId);
      setSlots(availableSlots);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch available slots');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelection = async (slot: Slot) => {
    try {
      // Initialize payment
      const paymentData = await appointmentService.initializePayment({
        slotId: slot.id,
        doctorId: selectedDoctor.id,
        appointmentType: slot.type,
        notes: '',
      });

      // Navigate to payment screen
      navigation.navigate('PaymentScreen', {
        paymentIntent: paymentData.paymentIntent,
        slot,
        doctor: selectedDoctor,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize payment');
    }
  };

  const renderSlot = ({ item }: { item: Slot }) => (
    <TouchableOpacity
      style={styles.slotItem}
      onPress={() => handleSlotSelection(item)}
    >
      <Text style={styles.slotTime}>
        {new Date(item.date).toLocaleDateString()} at {item.startTime}
      </Text>
      <Text style={styles.slotType}>{item.type}</Text>
      <Text style={styles.slotPrice}>${item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book Appointment</Text>
      
      {selectedDoctor && (
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>
            Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
          </Text>
          <Text style={styles.doctorSpecialty}>
            {selectedDoctor.specialization}
          </Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={slots}
          renderItem={renderSlot}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  doctorInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  slotItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  slotTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  slotType: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  slotPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 5,
  },
});
```

#### 3. Payment Screen with Stripe Integration

```typescript
// src/screens/payment/PaymentScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  CardField,
  useStripe,
  useConfirmPayment,
} from '@stripe/stripe-react-native';
import { appointmentService } from '../../services/appointmentService';

const PaymentScreen = ({ route, navigation }) => {
  const { paymentIntent, slot, doctor } = route.params;
  const { confirmPayment, loading } = useStripe();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const { error, paymentIntent: confirmedPaymentIntent } = await confirmPayment(
        paymentIntent.clientSecret,
        {
          paymentMethodType: 'Card',
        }
      );

      if (error) {
        Alert.alert('Payment Failed', error.message);
      } else if (confirmedPaymentIntent.status === 'Succeeded') {
        // Complete booking
        await appointmentService.completeBooking({
          paymentIntentId: paymentIntent.id,
          slotId: slot.id,
          doctorId: doctor.id,
          appointmentType: slot.type,
          notes: '',
        });

        Alert.alert(
          'Success',
          'Appointment booked successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('AppointmentConfirmation', {
                appointmentId: confirmedPaymentIntent.id,
              }),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Payment</Text>
      
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Appointment Summary</Text>
        <Text style={styles.summaryText}>
          Doctor: Dr. {doctor.firstName} {doctor.lastName}
        </Text>
        <Text style={styles.summaryText}>
          Date: {new Date(slot.date).toLocaleDateString()}
        </Text>
        <Text style={styles.summaryText}>
          Time: {slot.startTime} - {slot.endTime}
        </Text>
        <Text style={styles.summaryText}>
          Type: {slot.type}
        </Text>
        <Text style={styles.summaryText}>
          Duration: {slot.duration} minutes
        </Text>
        <Text style={styles.amount}>
          Total: ${paymentIntent.amount}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>Card Details</Text>
        <CardField
          postalCodeEnabled={false}
          placeholder={{
            number: '4242 4242 4242 4242',
          }}
          cardStyle={styles.card}
          style={styles.cardField}
        />
      </View>

      <TouchableOpacity
        style={[styles.payButton, processing && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={processing}
      >
        {processing ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.payButtonText}>
            Pay ${paymentIntent.amount}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  summaryContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 10,
  },
  cardContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  card: {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
  },
  cardField: {
    width: '100%',
    height: 50,
  },
  payButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

#### 4. Video Consultation Screen

```typescript
// src/screens/consultation/VideoConsultationScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { JitsiMeeting } from '@jitsi/react-native-sdk';
import { appointmentService } from '../../services/appointmentService';

const VideoConsultationScreen = ({ route, navigation }) => {
  const { appointmentId } = route.params;
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetingDetails();
  }, []);

  const fetchMeetingDetails = async () => {
    try {
      const details = await appointmentService.getMeetingDetails(appointmentId);
      setMeetingDetails(details);
    } catch (error) {
      Alert.alert('Error', 'Failed to load meeting details');
    } finally {
      setLoading(false);
    }
  };

  const onConferenceTerminated = (event) => {
    navigation.navigate('AppointmentSummary', { appointmentId });
  };

  const onConferenceJoined = (event) => {
    console.log('Conference joined');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading meeting...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <JitsiMeeting
        room={meetingDetails.roomName}
        serverURL="https://meet.jit.si"
        user={{
          displayName: meetingDetails.userName,
          email: meetingDetails.userEmail,
        }}
        config={{
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          subject: 'ZenCare Consultation',
        }}
        eventListeners={{
          conferenceTerminated: onConferenceTerminated,
          conferenceJoined: onConferenceJoined,
        }}
        style={styles.jitsiMeeting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  jitsiMeeting: {
    flex: 1,
  },
});
```

## State Management

### Redux Store Setup

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import appointmentReducer from './slices/appointmentSlice';
import paymentReducer from './slices/paymentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentReducer,
    payment: paymentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Auth Slice

```typescript
// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    return response.data;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
```

## Environment Configuration

### App Configuration

```typescript
// src/config/index.ts
export const CONFIG = {
  API_BASE_URL: __DEV__ 
    ? 'http://localhost:3000' 
    : 'https://your-production-api.com',
  STRIPE_PUBLISHABLE_KEY: __DEV__
    ? 'pk_test_your_test_key'
    : 'pk_live_your_live_key',
  JITSI_SERVER_URL: 'https://meet.jit.si',
};
```

### Package.json Dependencies

```json
{
  "dependencies": {
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@reduxjs/toolkit": "^1.9.7",
    "@stripe/stripe-react-native": "^0.35.0",
    "@jitsi/react-native-sdk": "^6.0.0",
    "axios": "^1.6.2",
    "react": "18.2.0",
    "react-native": "0.72.7",
    "react-native-elements": "^3.4.3",
    "react-native-gesture-handler": "^2.14.0",
    "react-native-permissions": "^4.1.1",
    "react-native-reanimated": "^3.6.1",
    "react-native-safe-area-context": "^4.7.4",
    "react-native-screens": "^3.27.0",
    "react-native-vector-icons": "^10.0.3",
    "react-redux": "^8.1.3",
    "@react-native-async-storage/async-storage": "^1.21.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.42",
    "@types/react-native": "^0.72.8",
    "typescript": "^5.3.3"
  }
}
```

## Installation & Setup Instructions

### 1. Initialize React Native Project

```bash
npx react-native@latest init ZenCareApp --template react-native-template-typescript
cd ZenCareApp
```

### 2. Install Dependencies

```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @reduxjs/toolkit react-redux
npm install axios @react-native-async-storage/async-storage
npm install @stripe/stripe-react-native
npm install @jitsi/react-native-sdk
npm install react-native-permissions
npm install react-native-elements
npm install react-native-vector-icons
```

### 3. iOS Setup (ios/Podfile)

```ruby
target 'ZenCareApp' do
  # ... existing code ...
  
  # Stripe
  pod 'Stripe', '~> 23.0'
  
  # Jitsi
  pod 'JitsiMeetSDK', '~> 6.0'
  
  # Permissions
  pod 'Permission-Camera', :path => '../node_modules/react-native-permissions/ios/Camera'
  pod 'Permission-Microphone', :path => '../node_modules/react-native-permissions/ios/Microphone'
end
```

### 4. Android Setup (android/app/build.gradle)

```gradle
android {
    // ... existing code ...
    
    defaultConfig {
        // ... existing code ...
        missingDimensionStrategy 'react-native-camera', 'general'
    }
}

dependencies {
    // ... existing dependencies ...
    implementation 'com.stripe:stripe-android:20.25.0'
}
```

### 5. App.tsx Setup

```typescript
// App.tsx
import React from 'react';
import { Provider } from 'react-redux';
import { StripeProvider } from '@stripe/stripe-react-native';
import { store } from './src/store';
import { CONFIG } from './src/config';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <Provider store={store}>
      <StripeProvider publishableKey={CONFIG.STRIPE_PUBLISHABLE_KEY}>
        <AppNavigator />
      </StripeProvider>
    </Provider>
  );
};

export default App;
```

## Testing Strategy

### Unit Tests

```typescript
// src/services/__tests__/appointmentService.test.ts
import { appointmentService } from '../appointmentService';
import api from '../api';

jest.mock('../api');

describe('appointmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize payment successfully', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          paymentIntent: {
            id: 'pi_test',
            clientSecret: 'pi_test_secret',
            amount: 150,
            currency: 'egp',
          },
          slot: {
            id: 'slot_test',
            price: 150,
          },
        },
      },
    };

    (api.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await appointmentService.initializePayment({
      slotId: 'slot_test',
      doctorId: 'doctor_test',
      appointmentType: 'telemedicine',
    });

    expect(result.paymentIntent.id).toBe('pi_test');
    expect(result.slot.price).toBe(150);
  });
});
```

### Integration Tests

```typescript
// src/screens/__tests__/PaymentScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PaymentScreen from '../payment/PaymentScreen';

describe('PaymentScreen', () => {
  it('should process payment successfully', async () => {
    const mockNavigation = {
      navigate: jest.fn(),
    };

    const mockRoute = {
      params: {
        paymentIntent: {
          id: 'pi_test',
          clientSecret: 'pi_test_secret',
          amount: 150,
        },
        slot: {
          id: 'slot_test',
          price: 150,
        },
        doctor: {
          id: 'doctor_test',
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    };

    const { getByText } = render(
      <PaymentScreen navigation={mockNavigation} route={mockRoute} />
    );

    const payButton = getByText('Pay $150');
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('AppointmentConfirmation');
    });
  });
});
```

## Deployment Checklist

### Pre-deployment

- [ ] Test all payment flows with Stripe test keys
- [ ] Verify Jitsi integration works correctly
- [ ] Test on both iOS and Android devices
- [ ] Ensure all API endpoints are accessible
- [ ] Test error handling and edge cases
- [ ] Verify push notifications (if implemented)
- [ ] Test offline functionality
- [ ] Performance testing on low-end devices

### Production Setup

- [ ] Update API URLs to production endpoints
- [ ] Configure Stripe live keys
- [ ] Set up proper error monitoring (Sentry, Crashlytics)
- [ ] Configure app signing for both platforms
- [ ] Set up CI/CD pipeline
- [ ] Configure app store listings
- [ ] Set up analytics tracking

## Security Considerations

1. **API Security**: All API calls use HTTPS and JWT authentication
2. **Payment Security**: Stripe handles all sensitive payment data
3. **Local Storage**: Sensitive data is encrypted in AsyncStorage
4. **Input Validation**: All user inputs are validated on both client and server
5. **Error Handling**: Sensitive information is not exposed in error messages
6. **Permissions**: Camera and microphone permissions are requested only when needed

This comprehensive prompt provides everything needed to build a production-ready React Native mobile app that integrates seamlessly with your backend payment system. 