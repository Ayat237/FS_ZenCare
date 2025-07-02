import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import Colors from "@theme/colors";
import BackButton from "@components/layout/BackButton";
import AuthHeader from "@components/Auth/AuthHeader";
import AuthButton from "@/components/ui/buttons/AuthButton";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RegistrationSubmittedScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleGoToLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaTop}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={false}
        >
          <View style={styles.headerContainer}>
            <BackButton />
          </View>

          <AuthHeader
            title="Registration Submitted!"
            subtitle="Thank you for registering as a doctor with ZenCare"
          />

          <View style={styles.formContainer}>
            {/* Success Icon */}
            <View style={styles.successIconContainer}>
              <View style={styles.successIcon}>
                <Icon name="check" size={40} color={Colors.white} />
              </View>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              Your application has been successfully submitted for review. Our
              administrative team will verify your credentials and approve your
              account within 24-48 hours.
            </Text>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <View style={styles.instructionItem}>
                <View style={styles.instructionIconContainer}>
                  <Icon
                    name="email-outline"
                    size={20}
                    color={Colors.primary600}
                  />
                </View>
                <Text style={styles.instructionText}>
                  Check your email for verification confirmation
                </Text>
              </View>

              <View style={styles.instructionItem}>
                <View style={styles.instructionIconContainer}>
                  <Icon
                    name="clock-outline"
                    size={20}
                    color={Colors.primary600}
                  />
                </View>
                <Text style={styles.instructionText}>
                  Wait for admin approval (24-48 hours)
                </Text>
              </View>

              <View style={styles.instructionItem}>
                <View style={styles.instructionIconContainer}>
                  <Icon
                    name="account-check-outline"
                    size={20}
                    color={Colors.primary600}
                  />
                </View>
                <Text style={styles.instructionText}>
                  Login once your account is approved
                </Text>
              </View>
            </View>

            {/* Action Button */}
            <AuthButton
              title="Go to Login"
              onPress={handleGoToLogin}
              buttonStyle={styles.loginButton}
            />

            {/* Footer */}
            <Text style={styles.footer}>
              Need help? Contact our support team at support@zencare.com
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeAreaTop: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  successIconContainer: {
    alignItems: "center",
    marginVertical: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.success,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  instructionsContainer: {
    marginBottom: 40,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: Colors.gray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary100,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  instructionText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  loginButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  footer: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default RegistrationSubmittedScreen;
