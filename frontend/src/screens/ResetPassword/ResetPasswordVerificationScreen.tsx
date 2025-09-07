import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import Colors from "@theme/colors";
import BackButton from "@components/layout/BackButton";
import AuthHeader from "@components/Auth/AuthHeader";
import InputField from "@components/ui/inputs/InputField";
import AuthButton from "@/components/ui/buttons/AuthButton";
import AuthFooter from "@components/Auth/AuthFooter";
import { authService } from "@/services/api";
import ErrorOverlay from "@components/ui/feedback/ErrorOverlay";
import LoadingOverlay from "@components/ui/feedback/LoadingOverlay";

type RouteProps = RouteProp<RootStackParamList, "ResetPasswordVerification">;

const ResetPasswordVerificationScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProps>();
  const { email, emailToken } = route.params;

  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError("Please enter verification code");
      return;
    }

    if (!emailToken) {
      setError("Invalid token. Please try again.");
      return;
    }

    try {
      await authService.verifyForgetPasswordOtp(emailToken, {
        otp: verificationCode,
      });

      navigation.navigate("NewPassword", { email, emailToken });
    } catch (error: any) {
      setError(error.message);
    }
  };
  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await authService.resendOtp(emailToken);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

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
            title="Verify Code"
            subtitle={`Enter the verification code we sent to ${email}`}
          />

          <View style={styles.formOuterContainer}>
            <View style={styles.formContainer}>
              <InputField
                label="Verification Code"
                placeholder="Enter verification code"
                value={verificationCode}
                onChangeText={(text) => {
                  setVerificationCode(text);
                  setError(null);
                }}
              />

              <AuthButton
                title="Verify"
                onPress={handleVerify}
                buttonStyle={styles.verifyButton}
              />

              <AuthFooter
                question="Didn't receive the code?"
                actionText="Resend"
                onPress={handleResendCode}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <ErrorOverlay
        visible={!!error}
        message={error || ""}
        onRetry={() => setError(null)}
      />
      <LoadingOverlay visible={isLoading} />
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
  verifyButton: {
    marginTop: 24,
  },
});

export default ResetPasswordVerificationScreen;
