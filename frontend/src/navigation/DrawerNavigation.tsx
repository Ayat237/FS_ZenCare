import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@theme/colors';
import TabNavigation from './TabNavigation';
import { useRoute } from '@react-navigation/native';
import { DrawerParamList } from '@/types/navigation';

// Drawer Screens
import AppointmentsScreen from '@/screens/Drawer/AppointmentsScreen';
import MedicalHistoryScreen from '@/screens/Drawer/MedicalHistoryScreen';
import PrescriptionsScreen from '@/screens/Drawer/PrescriptionsScreen';
import TelemedicineScreen from '@/screens/Drawer/TelemedicineScreen';
import NotificationsScreen from '@screens/Drawer/NotificationsScreen';
import PaymentsScreen from '@screens/Drawer/PaymentsScreen';
import PDFViewerTestScreen from '@/screens/PDFViewerTestScreen';
import LabResultScreen from '@/screens/LabResultScreen';

// Custom Drawer Content
import CustomDrawerContent from '@/components/layout/CustomDrawerContent';

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigation = () => {
  const route = useRoute<any>();
  // Get the screen parameter from route params if available
  const initialRouteName = route.params?.screen || 'MainTabs';

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
        name="MainTabs"
        component={TabNavigation}
        options={{
          title: "Home",
          drawerIcon: ({ color } : { color: string }) => (
            <Icon name="home-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="calendar-clock" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="MedicalHistory"
        component={MedicalHistoryScreen}
        options={{
          title: "Medical History",
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="file-document-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Prescriptions"
        component={PrescriptionsScreen}
        options={{
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="pill" size={22} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Telemedicine"
        component={TelemedicineScreen}
        options={{
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="video-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="bell-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="credit-card-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="PDFViewerTest"
        component={PDFViewerTestScreen}
        options={{
          title: "PDF Viewer Test",
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="file-pdf-box" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="LabResult"
        component={LabResultScreen}
        options={{
          title: "Lab Result",
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="test-tube" size={22} color={color} />
          ),
          drawerItemStyle: { display: 'none' }, // Hide from drawer menu
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigation;

const styles = StyleSheet.create({
  // Add any styles needed for the drawer navigation
});