# Side Drawer Navigation Component

## Overview
This document provides an overview of the Side Drawer Navigation component implemented in the ZenCare application. The drawer navigation provides easy access to various sections of the application including Appointments, Medical History, Prescriptions, Telemedicine, Notifications, and Payments.

## Implementation Details

### Files Created/Modified

#### Navigation Setup
- `src/navigation/DrawerNavigation.tsx` - Main drawer navigator setup
- `src/components/layout/CustomDrawerContent.tsx` - Custom drawer content with user profile and navigation items
- `src/types/navigation.ts` - Updated with drawer navigation types
- `src/navigation/appNavigation.tsx` - Updated to include drawer navigation in the stack

#### Drawer Screens
- `src/screens/Drawer/AppointmentsScreen.tsx` - Displays upcoming and past appointments
- `src/screens/Drawer/MedicalHistoryScreen.tsx` - Shows medical records with filtering options
- `src/screens/Drawer/PrescriptionsScreen.tsx` - Lists prescriptions with status filtering
- `src/screens/Drawer/TelemedicineScreen.tsx` - Provides telemedicine services with doctor listings
- `src/screens/Drawer/NotificationsScreen.tsx` - Displays notifications with filtering options
- `src/screens/Drawer/PaymentsScreen.tsx` - Shows payment history and payment methods

### Integration with Existing UI
- Added drawer menu button to the HomeScreen header
- Added notification button that navigates to the Notifications screen in the drawer

## Features

### Appointments Screen
- View upcoming and past appointments
- Appointment cards with doctor info, date, time, and status
- Book new appointment button

### Medical History Screen
- Filter medical records by type (Lab Tests, Diagnoses, Surgeries, etc.)
- Expandable medical record items with details
- Type-specific icons for easy identification

### Prescriptions Screen
- Filter prescriptions by status (Active, Completed, Expired)
- Expandable prescription items with medication details
- Status-based styling for visual differentiation

### Telemedicine Screen
- Browse doctors by specialty
- View upcoming telemedicine appointments
- Access appointment history
- Doctor cards with ratings and availability

### Notifications Screen
- Toggle notifications on/off
- Filter by notification type and read/unread status
- Type-specific icons for different notification categories

### Payments Screen
- View transaction history with status indicators
- Manage payment methods
- View billing information
- Total spending summary

## Usage

### Accessing the Drawer
The drawer can be accessed in two ways:
1. By tapping the menu icon in the top-left corner of the HomeScreen
2. By swiping from the left edge of the screen

### Navigation
- Tap on any item in the drawer to navigate to the corresponding screen
- The active screen is highlighted in the drawer
- Use the back button or swipe to return to the previous screen

## Customization

The drawer appearance can be customized by modifying:
- `src/components/layout/CustomDrawerContent.tsx` for drawer content layout
- `src/navigation/DrawerNavigation.tsx` for drawer navigation options

## Dependencies

The drawer navigation uses the following packages:
- `@react-navigation/drawer`
- `react-native-gesture-handler`
- `react-native-reanimated`