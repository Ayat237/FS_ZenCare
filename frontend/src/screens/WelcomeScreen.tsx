import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ImageSourcePropType,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types/navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Colors from "@theme/colors";

const GetStartedScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerText}>Let's Get Started!</Text>
        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/images/welcome.jpg")}
            style={styles.image}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}> Log In</Text>
            </TouchableOpacity>
          </View>

          {/* Temporary Admin Access Button */}
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => navigation.navigate("AdminDoctorVerification")}
          >
            <Text style={styles.adminButtonText}>Admin Access (Testing)</Text>
          </TouchableOpacity>
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
    borderRadius: 50,
  },
  buttonContainer: {
    gap: 16,
  },
  signUpButton: {
    paddingVertical: 12,
    backgroundColor: "#facc15",
    marginHorizontal: 28,
    borderRadius: 10,
    alignItems: "center",
  },
  signUpText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4b5563",
    textAlign: "center",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#fff",
    fontWeight: "600",
  },
  loginLink: {
    fontWeight: "600",
    color: "#facc15",
    marginLeft: 4,
  },
  adminButton: {
    paddingVertical: 8,
    backgroundColor: "#dc2626",
    marginHorizontal: 28,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  adminButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
});

export default GetStartedScreen;
