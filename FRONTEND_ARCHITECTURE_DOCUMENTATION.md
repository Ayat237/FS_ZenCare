# ZenCare Frontend Architecture Documentation

## Overview

The ZenCare frontend is a React Native mobile application built with TypeScript that provides a comprehensive healthcare platform for both patients and doctors. The application follows a modern, scalable architecture with clear separation of concerns and robust state management.

## Architecture Layers

### 1. **Presentation Layer**

- **Screens**: Feature-specific screens organized by functionality
- **Components**: Reusable UI components with strict type safety
- **Navigation**: Multi-level navigation system supporting different user roles

### 2. **State Management Layer**

- **Redux Toolkit**: Centralized state management with persistence
- **Slices**: Feature-specific state slices (auth, chat, etc.)
- **Persistence**: AsyncStorage for offline data persistence

### 3. **Service Layer**

- **API Client**: Centralized HTTP client with interceptors
- **Service Modules**: Feature-specific API service modules
- **Authentication**: Token-based authentication with automatic injection

### 4. **Utility Layer**

- **Types**: Comprehensive TypeScript type definitions
- **Utils**: Helper functions and utilities
- **Theme**: Centralized styling and color schemes
- **Configuration**: Environment and API configuration

## Core Architecture Components

### **Navigation Structure**

```
App Navigation (Stack)
├── Authentication Flows
│   ├── Splash Screen
│   ├── Welcome Screen
│   ├── Login Screen
│   ├── Sign Up Flow
│   │   ├── Role Selection
│   │   ├── Sign Up Details
│   │   ├── Photo Upload
│   │   └── Registration Submitted
│   ├── Email Verification
│   └── Password Reset Flow
└── Main Application
    ├── Patient Flow (Drawer + Tabs)
    │   ├── Home
    │   ├── Doctors
    │   ├── Appointments
    │   ├── Chat
    │   └── Profile
    └── Doctor Flow (Drawer + Tabs)
        ├── Dashboard
        ├── Patients
        ├── Schedule
        ├── Consultations
        └── Profile
```

### **State Management Architecture**

- **Auth Slice**: User authentication, profile data, role management
- **Chat Slice**: Real-time messaging state and history
- **Persistence**: Automatic state persistence with AsyncStorage
- **Type Safety**: Full TypeScript coverage for all state operations

### **API Integration Layer**

- **Centralized Client**: Axios-based HTTP client with base configuration
- **Interceptors**: Automatic token injection and response handling
- **Service Modules**:
  - `authService`: Authentication operations
  - `chatService`: Real-time messaging
  - `drugService`: Medication and drug information
- **Error Handling**: Unified error handling across all API calls

### **Component Architecture**

#### **Screen Components**

Organized by feature domains:

- **Auth Screens**: Login, signup, verification flows
- **Patient Screens**: Home, doctor search, appointments, medications
- **Doctor Screens**: Dashboard, patient management, scheduling
- **Shared Screens**: Profile, chat, calendar

#### **UI Components**

Categorized into functional groups:

- **Auth Components**: Login forms, verification inputs, role selectors
- **UI Components**: Buttons, inputs, modals, overlays, feedback components
- **Layout Components**: Headers, navigation, containers
- **Domain Components**: Doctor cards, appointment cards, medication lists

### **Type System**

Comprehensive TypeScript coverage:

- **Navigation Types**: Type-safe navigation parameters
- **API Types**: Request/response type definitions
- **Component Types**: Props and state type definitions
- **Domain Types**: Business logic type definitions (User, Doctor, Patient, Appointment, etc.)

## Key Architectural Patterns

### **1. Feature-Based Organization**

```
src/
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication components
│   ├── ui/             # Generic UI components
│   ├── doctor/         # Doctor-specific components
│   └── layout/         # Layout components
├── screens/            # Feature screens
│   ├── SignUp/         # Registration flow
│   ├── Doctor/         # Doctor-specific screens
│   └── Home/           # Patient home screens
├── navigation/         # Navigation configuration
├── services/           # API integration
├── store/              # State management
├── types/              # TypeScript definitions
├── utils/              # Helper functions
└── theme/              # Styling system
```

### **2. Role-Based Access Control**

- **Dynamic Navigation**: Different navigation flows for patients vs doctors
- **Component Rendering**: Role-specific component visibility
- **API Access**: Role-based API endpoint access

### **3. State Persistence Strategy**

- **Selective Persistence**: Only critical state (auth) is persisted
- **Automatic Rehydration**: State restoration on app launch
- **Type-Safe Operations**: Full TypeScript coverage for persisted state

### **4. Service Layer Pattern**

- **Abstraction**: Business logic separated from UI components
- **Reusability**: Services shared across multiple components
- **Testing**: Isolated service layer for easier unit testing

## Security & Performance Features

### **Security**

- **Token Management**: Automatic JWT token injection via interceptors
- **Secure Storage**: Sensitive data stored in AsyncStorage
- **Type Safety**: Compile-time type checking prevents runtime errors

### **Performance**

- **Code Splitting**: Feature-based code organization
- **Lazy Loading**: Component lazy loading where applicable
- **State Optimization**: Minimal state updates and selective persistence
- **Memory Management**: Proper cleanup of subscriptions and listeners

## Integration Points

### **External Services**

- **Backend API**: RESTful API communication
- **Real-time Chat**: WebSocket integration for messaging
- **File Upload**: Image and document upload capabilities
- **Location Services**: Maps and location-based features

### **Native Features**

- **Camera/Gallery**: Image picker for profile and verification
- **Push Notifications**: Healthcare reminders and alerts
- **Biometric Auth**: Secure authentication options
- **Offline Storage**: AsyncStorage for data persistence

## Development & Maintenance

### **Code Quality**

- **TypeScript**: Full type coverage for better developer experience
- **Component Reusability**: Extensive component library
- **Consistent Patterns**: Standardized architectural patterns
- **Error Boundaries**: Comprehensive error handling

### **Scalability**

- **Modular Architecture**: Easy to add new features
- **State Management**: Scalable Redux architecture
- **Component Library**: Reusable component system
- **API Abstraction**: Easy to modify or extend API integrations

This architecture provides a solid foundation for a healthcare application that can scale with user growth and feature expansion while maintaining code quality and developer productivity.
