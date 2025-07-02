import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "@screens/WelcomeScreen";
import LoginScreen from "@screens/LoginScreen";
import RoleSelectionScreen from "@screens/SignUp/RoleSelectionScreen";
import SignUpDetailsScreen from "@screens/SignUp/SignUpDetailsScreen";
import PhotoUploadScreen from "@screens/SignUp/PhotoUploadScreen";
import RegistrationSubmittedScreen from "@screens/SignUp/RegistrationSubmittedScreen";
import EmailVerificationScreen from "@screens/EmailVerification/EmailVerificationScreen";
import SplashScreen from "@screens/SplashScreen";
import ResetPasswordEmailScreen from "@screens/ResetPassword/ResetPasswordEmailScreen";
import ResetPasswordVerificationScreen from "@screens/ResetPassword/ResetPasswordVerificationScreen";
import NewPasswordScreen from "@screens/ResetPassword/NewPasswordScreen";
import TabNavigation from "./TabNavigation";
import DrawerNavigation from "./DrawerNavigation";
import DoctorDrawerNavigation from "./DoctorDrawerNavigation";
import { RootStackParamList } from "@/types/navigation";

// Create Stack Navigator with type safety
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: "default",
          animationDuration: 200,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={RoleSelectionScreen} />
        <Stack.Screen name="SignUpDetails" component={SignUpDetailsScreen} />
        <Stack.Screen name="PhotoUpload" component={PhotoUploadScreen} />
        <Stack.Screen
          name="RegistrationSubmitted"
          component={RegistrationSubmittedScreen}
        />
        <Stack.Screen
          name="EmailVerification"
          component={EmailVerificationScreen}
        />
        <Stack.Screen
          name="ResetPasswordEmail"
          component={ResetPasswordEmailScreen}
        />
        <Stack.Screen
          name="ResetPasswordVerification"
          component={ResetPasswordVerificationScreen}
        />
        <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
        <Stack.Screen name="Drawer" component={DrawerNavigation} />
        <Stack.Screen name="DoctorDrawer" component={DoctorDrawerNavigation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
