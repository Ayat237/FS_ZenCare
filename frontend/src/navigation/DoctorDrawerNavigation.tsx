import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@theme/colors';
import { useRoute } from '@react-navigation/native';
import { DoctorDrawerParamList } from '@/types/navigation';

// Doctor Screens
import DoctorHomeScreen from '../screens/Doctor/DoctorHomeScreen';
import DoctorDashboardScreen from '../screens/Doctor/DoctorDashboardScreen';
import DoctorAppointmentsScreen from '../screens/Doctor/DoctorAppointmentsScreen';
import DoctorProfileScreen from '../screens/Doctor/DoctorProfileScreen';
import DoctorPrescriptionScreen from '../screens/Doctor/DoctorPrescriptionScreen';
import DoctorClinicLocationScreen from '../screens/Doctor/DoctorClinicLocationScreen';
import PatientListScreen from '../screens/Doctor/PatientListScreen';
import PatientMedicalHistoryScreen from '../screens/Doctor/PatientMedicalHistoryScreen';
import TelemedicineSessionsScreen from '../screens/Doctor/TelemedicineSessionsScreen';
import DoctorTelemedicineScreen from '../screens/Doctor/DoctorTelemedicineScreen';
import TelemedicineTestScreen from '../screens/Doctor/TelemedicineTestScreen';
import DoctorNotificationsScreen from '../screens/Doctor/DoctorNotificationsScreen';
import DoctorPaymentsScreen from '../screens/Doctor/DoctorPaymentsScreen';
import AvailabilityScreen from '../screens/Doctor/AvailabilityScreen';
import LabResultScreen from '../screens/LabResultScreen';

// Custom Drawer Content
import CustomDrawerContent from '../components/layout/CustomDrawerContent';

// Using DoctorDrawerParamList from types/navigation.ts

const Drawer = createDrawerNavigator<DoctorDrawerParamList>();

const DoctorDrawerNavigation = () => {
  const route = useRoute<any>();
  // Get the screen parameter from route params if available
  const initialRouteName = route.params?.screen || 'DoctorDashboard';

  return (
    <Drawer.Navigator
      drawerContent={(props: any) => <CustomDrawerContent {...props} />}
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: Colors.primary100,
        drawerActiveTintColor: Colors.primary600,
        drawerInactiveTintColor: "#333",
        drawerPosition: "right",
        drawerLabelStyle: {
          marginLeft: -20,
          fontSize: 16,
          fontWeight: "500",
        },
      }}
    >
      <Drawer.Screen
        name="DoctorDashboard"
        component={DoctorDashboardScreen}
        options={{
          title: "Dashboard",
          drawerIcon: ({ color } : { color: string }) => (
            <Icon name="view-dashboard-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="DoctorHome"
        component={DoctorHomeScreen}
        options={{
          title: "Home",
          drawerIcon: ({ color } : { color: string }) => (
            <Icon name="home-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="DoctorAppointments"
        component={DoctorAppointmentsScreen}
        options={{
          title: "Appointments",
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="calendar-clock" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="DoctorPrescriptions"
        component={DoctorPrescriptionScreen}
        options={{
          title: "Prescriptions",
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="file-document-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="DoctorProfile"
        component={DoctorProfileScreen}
        options={{
          title: "Profile",
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="account-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="DoctorClinicLocation"
        component={DoctorClinicLocationScreen}
        options={{
          title: "Clinic Location",
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="map-marker" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="PatientList"
        component={PatientListScreen}
        options={{
          title: "Patients",
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="account-group-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="TelemedicineSessions"
        component={TelemedicineSessionsScreen}
        options={{
          title: 'Telemedicine',
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="video" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Availability"
        component={AvailabilityScreen}
        options={{
          title: 'Availability',
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="calendar-clock" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="DoctorNotifications"
        component={DoctorNotificationsScreen}
        options={{
          title: 'Notifications',
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="bell-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="DoctorPayments"
        component={DoctorPaymentsScreen}
        options={{
          title: 'Payments',
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="cash-multiple" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="PatientMedicalHistory"
        component={PatientMedicalHistoryScreen}
        options={{
          title: "Patient History",
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="clipboard-text-outline" size={22} color={color} />
          ),
          drawerItemStyle: { display: 'none' } // Hide from drawer but keep in navigation
        }}
      />
      <Drawer.Screen
        name="DoctorTelemedicine"
        component={DoctorTelemedicineScreen}
        options={{
          title: "Video Consultation",
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="video-outline" size={22} color={color} />
          ),
          drawerItemStyle: { display: 'none' } // Hide from drawer but keep in navigation
        }}
      />
      <Drawer.Screen
        name="TelemedicineTest"
        component={TelemedicineTestScreen}
        options={{
          title: "Test Video Call",
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="video-check" size={22} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="LabResult"
        component={LabResultScreen}
        options={{
          title: "Lab Result",
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="file-pdf-box" size={22} color={color} />
          ),
          drawerItemStyle: { display: 'none' } // Hide from drawer but keep in navigation
        }}
      />
    </Drawer.Navigator>
  );
};

export default DoctorDrawerNavigation;