import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Colors from "@theme/colors";

import logo from "@assets/images/zencare_logo.png";


const SplashScreen: React.FC = () => {
  // Add null check for state.auth to prevent TypeError
  const user = useSelector((state: RootState) => state?.auth?.user);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        // Check user role for navigation
        if (user.activeRole === 'doctor') {
          // Navigate to DoctorDrawerNavigation with DoctorDashboard as initial screen
          navigation.navigate("DoctorDrawer", { screen: "DoctorDashboard" });
        } else {
          // Navigate to patient DrawerNavigation with MainTabs as the initial screen
          navigation.navigate("Drawer", { screen: "MainTabs" });
        }
      } else {
        navigation.navigate("Login"); // Navigate to Login screen if user is not logged in
      }
    }, 1500);

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [navigation, user]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerText}>Let's Get Started!</Text>
        <View style={styles.imageContainer}>
          <Image source={logo} style={styles.image} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary500,
  },
  container: {
    flex: 1,
    justifyContent: "space-around",
    marginVertical: 16,
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 36,
    textAlign: "center",
  },
  imageContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  image: {
    width: 350,
    height: 350,
    resizeMode: "contain",
    borderRadius: 70,
  },
});

export default SplashScreen;
