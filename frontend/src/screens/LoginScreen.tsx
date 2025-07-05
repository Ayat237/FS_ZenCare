import React, { useState, useEffect } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import Colors from "@theme/colors";
import AuthHeader from "@components/Auth/AuthHeader";
import InputField from "@components/ui/inputs/InputField";
import GoogleButton from "@components/ui/buttons/GoogleButton";
import RememberMeCheckbox from "@components/Auth/RememberMeCheckbox";
import AuthDivider from "@components/Auth/AuthDivider";
import AuthFooter from "@components/Auth/AuthFooter";
import AuthButton from "@/components/ui/buttons/AuthButton";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  loginUser,
  clearError,
  loadUserProfile,
  logoutUser,
} from "@/store/auth/authSlice";
import ErrorOverlay from "@components/ui/feedback/ErrorOverlay";
import LoadingOverlay from "@components/ui/feedback/LoadingOverlay";
import { resetLogoutFlag } from "@/services/api/apiClient";

const LoginScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const validateInputs = () => {
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setValidationError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setValidationError("Please enter a valid email address");
      return false;
    }
    if (!password.trim()) {
      setValidationError("Password is required");
      return false;
    }
    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters long");
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleLogin = () => {
    if (!validateInputs()) return;
    dispatch(loginUser({ email, password }));
  };

  // After successful login, dispatch loadUserProfile to ensure we have the doctor ID
  React.useEffect(() => {
    if (user) {
      console.log(
        "🔍 LoginScreen: Login successful, navigating based on role:",
        user.activeRole
      );

      // Reset the logout flag since we have a successful login
      resetLogoutFlag();

      // First dispatch loadUserProfile to get doctorId
      if (user.activeRole === "doctor" && !user.doctorId) {
        console.log(
          "🔍 LoginScreen: Doctor role detected, loading profile data"
        );
        dispatch(loadUserProfile())
          .unwrap()
          .then(() => {
            console.log(
              "🔍 LoginScreen: Profile loaded successfully, navigating to DoctorHome"
            );
            navigation.navigate("DoctorDrawer", { screen: "DoctorHome" });
          })
          .catch((error) => {
            console.error("🔍 LoginScreen: Error loading profile:", error);
            // Still navigate even if profile load fails
            navigation.navigate("DoctorDrawer", { screen: "DoctorHome" });
          });
      } else {
        // Either not a doctor or doctorId already exists
        if (user.activeRole === "doctor") {
          navigation.navigate("DoctorDrawer", { screen: "DoctorHome" });
        } else {
          // Navigate to patient DrawerNavigation with MainTabs as the initial screen
          navigation.navigate("Drawer", { screen: "MainTabs" });
        }
      }
    }
  }, [user, navigation, dispatch]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaTop}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
        >
          <View style={styles.headerContainer}>{/* <BackButton /> */}</View>

          <AuthHeader
            title="Welcome to ZenCare"
            subtitle="Your personal companion for better health"
          />

          <View style={styles.formOuterContainer}>
            <View style={styles.formContainer}>
              <InputField
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                error={
                  validationError && !email.trim() ? validationError : undefined
                }
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <InputField
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={
                  validationError && (!password.trim() || password.length < 6)
                    ? validationError
                    : undefined
                }
              />

              <RememberMeCheckbox
                isChecked={isChecked}
                onPress={setIsChecked}
                onForgotPasswordPress={() =>
                  navigation.navigate("ResetPasswordEmail")
                }
              />

              <AuthButton title="Login" onPress={handleLogin} />
            </View>

            <AuthDivider />

            <View style={styles.iconsContainer}>
              <GoogleButton />
            </View>

            <AuthFooter
              question="Don't have an account?"
              actionText="Register"
              onPress={() => navigation.navigate("SignUp")}
            />

            <AuthFooter
              question="Need help?"
              actionText="Visit our help center"
              onPress={() => {}}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      <ErrorOverlay
        visible={!!error || !!validationError}
        message={error || validationError || ""}
        onRetry={() => {
          setValidationError(null);
          dispatch(clearError());
        }}
      />

      <LoadingOverlay visible={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary500,
  },
  safeAreaTop: {
    flex: 1,
    marginTop: 50,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  formOuterContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingTop: 48,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  formContainer: {
    gap: 5,
  },
  iconsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  loginText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
  loginContainer: {
    paddingVertical: 12,
    backgroundColor: Colors.primary500,
    borderRadius: 16,
  },
});

export default LoginScreen;
