import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Colors from "@theme/colors";
import { useRoute } from "@react-navigation/native";
import { AdminDrawerParamList } from "@/types/navigation";

// Admin Screens
import { AdminDoctorVerificationScreen } from "@/screens/Admin";
// Add other admin screens here as they are developed

// Custom Drawer Content
import CustomDrawerContent from "@/components/layout/CustomDrawerContent";

const Drawer = createDrawerNavigator<AdminDrawerParamList>();

const AdminDrawerNavigation = () => {
  const route = useRoute<any>();
  // Get the screen parameter from route params if available
  const initialRouteName = route.params?.screen || "AdminDoctorVerification";

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
        name="AdminDoctorVerification"
        component={AdminDoctorVerificationScreen}
        options={{
          title: "Doctor Verification",
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.primary600,
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="check-decagram" size={22} color={color} />
          ),
        }}
      />
      {/* Add more admin screens here as they are developed */}
      {/* For example:
      <Drawer.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: "Dashboard",
          drawerIcon: ({ color }: { color: string }) => (
            <Icon name="view-dashboard-outline" size={22} color={color} />
          ),
        }}
      />
      */}
    </Drawer.Navigator>
  );
};

export default AdminDrawerNavigation;

const styles = StyleSheet.create({
  // Add any styles needed for the admin drawer navigation
});
