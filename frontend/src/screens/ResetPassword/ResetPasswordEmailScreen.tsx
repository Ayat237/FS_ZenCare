import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import Colors from "@theme/colors";
import BackButton from "@components/layout/BackButton";
import AuthHeader from "@components/Auth/AuthHeader";
import InputField from "@components/ui/inputs/InputField";
import AuthButton from "@/components/ui/buttons/AuthButton";
import { authService } from "@/services/api/auth";
import ErrorOverlay from "@components/ui/feedback/ErrorOverlay";
import LoadingOverlay from "@components/ui/feedback/LoadingOverlay";

const ResetPasswordEmailScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authService.forgetPassword({ email });
      
      const { emailToken } = response;
      navigation.navigate("ResetPasswordVerification", { email, emailToken });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
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
            title="Reset Password"
            subtitle="Enter your email address to reset your password"
          />

          <View style={styles.formOuterContainer}>
            <View style={styles.formContainer}>
              <InputField
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  // setError(undefined);
                }}
                
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <AuthButton
                title="Send "
                onPress={handleSubmit}
                buttonStyle={styles.submitButton}
                // loading={isLoading}
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
  submitButton: {
    marginTop: 24,
  },
});

export default ResetPasswordEmailScreen;
