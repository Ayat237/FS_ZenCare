import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { authService } from "@/services/api/auth";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import Colors from "@theme/colors";
import BackButton from "@components/layout/BackButton";
import AuthHeader from "@components/Auth/AuthHeader";
import InputField from "@components/ui/inputs/InputField";
import AuthButton from "@/components/ui/buttons/AuthButton";
import ErrorOverlay from "@components/ui/feedback/ErrorOverlay";
import SuccessOverlay from "@components/ui/feedback/SuccessOverlay";

type RouteProps = RouteProp<RootStackParamList, "NewPassword">;

const NewPasswordScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProps>();
  const { email, emailToken } = route.params;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const validatePassword = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) {
      return;
    }

    try {
      const { emailToken } = route.params;
      await authService.resetPassword(emailToken, {
        newPassword,
        confirmPassword,
      });
      setShowSuccess(true);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleContinue = () => {
    navigation.navigate("Login");
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
            title="New Password"
            subtitle="Please enter your new password"
          />

          <View style={styles.formOuterContainer}>
            <View style={styles.formContainer}>
              <InputField
                label="New Password"
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setErrors((prev) => ({ ...prev, newPassword: undefined }));
                }}
                error={errors.newPassword}
                secureTextEntry
              />

              <InputField
                label="Confirm Password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
                }}
                error={errors.confirmPassword}
                secureTextEntry
              />

              <AuthButton
                title="Reset Password"
                onPress={handleResetPassword}
                buttonStyle={styles.resetButton}
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
      <SuccessOverlay
        visible={showSuccess}
        title="Password Reset Successful!"
        message="Your password has been reset successfully. You can now login with your new password."
        onContinue={handleContinue}
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
  resetButton: {
    marginTop: 24,
  },
});

export default NewPasswordScreen;
