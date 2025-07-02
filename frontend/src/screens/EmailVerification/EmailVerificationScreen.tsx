import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView, Text } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/auth/authSlice";
import Colors from "@theme/colors";
import BackButton from "@components/layout/BackButton";
import AuthHeader from "@components/Auth/AuthHeader";
import OtpInput from "@components/ui/inputs/OtpInput";
import AuthButton from "@/components/ui/buttons/AuthButton";
import AuthFooter from "@components/Auth/AuthFooter";
import VerifiedOverlay from "@components/ui/feedback/VerifiedOverlay";
import LoadingOverlay from "@components/ui/feedback/LoadingOverlay";
import ErrorOverlay from "@components/ui/feedback/ErrorOverlay";
import { authService } from "@/services/api/auth";

type RouteProps = RouteProp<RootStackParamList, "EmailVerification">;

const EmailVerificationScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const route = useRoute<RouteProps>();
  const { emailToken, userRole, email } = route.params;

  const [verificationCode, setVerificationCode] = useState("");
  const [showVerified, setShowVerified] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError("Please enter verification code");
      return;
    }

    console.log("EmailVerification params:", { emailToken, userRole, email });
    console.log("Verification code:", verificationCode);

    setIsLoading(true);
    try {
      let response;

      if (userRole === "doctor") {
        // Doctor verification
        console.log("Doctor verification data:", {
          otp: verificationCode,
          email: email || "",
          emailToken: emailToken || "",
        });

        response = await authService.verifyDoctorEmailOtp({
          otp: verificationCode,
          email: email || "",
          emailToken: emailToken || "",
        });

        // For doctors, just show success and navigate to registration submitted
        setShowVerified(true);
        return;
      } else {
        // Patient verification
        response = await authService.verifyEmailOtp({
          otp: verificationCode,
          emailToken: emailToken,
        });

        const { data } = response;
        const { token, refreshToken, user } = data;

        // Create user object for Redux
        const userData = {
          id: user.id,
          userName: user.userName,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobilePhone: user.mobilePhone || "",
          role: user.role,
          activeRole: user.activeRole,
          profileImage: user.profileImage.trim(),
          token,
          refreshToken,
        };

        // Save user data to Redux
        dispatch(setUser(userData));
        setShowVerified(true);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDashboard = () => {
    if (userRole === "doctor") {
      // For doctors, navigate to registration submitted screen
      navigation.navigate("RegistrationSubmitted");
    } else {
      // For patients, navigate to dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: "Drawer", params: { screen: "MainTabs" } }],
      });
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaTop}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
        >
          <View style={styles.headerContainer}>
            <BackButton />
          </View>

          <AuthHeader
            title="Verify your email"
            subtitle="Enter the verification code we sent to your email"
          />

          <View style={styles.formOuterContainer}>
            <View style={styles.formContainer}>
              <OtpInput
                value={verificationCode}
                onChange={(otp: string) => {
                  setVerificationCode(otp);
                  setError(undefined);
                }}
                hasError={!!error}
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <AuthButton
                title="Verify"
                onPress={handleVerify}
                buttonStyle={styles.verifyButton}
              />

              <AuthFooter
                question="Didn't receive the code?"
                actionText="Resend"
                onPress={() => {
                  // TODO: Implement resend logic
                  console.log("Resending code...");
                }}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <VerifiedOverlay visible={showVerified} onDashboard={handleDashboard} />
      <LoadingOverlay visible={isLoading} />
      <ErrorOverlay
        visible={!!error}
        message={error || ""}
        onRetry={() => setError(undefined)}
      />
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
    gap: 20,
  },
  errorText: {
    color: Colors.error500,
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    fontWeight: "500",
  },
  verifyButton: {
    marginTop: 24,
  },
});

export default EmailVerificationScreen;
