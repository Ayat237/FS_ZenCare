import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import Colors from "@theme/colors";
import BackButton from "@components/layout/BackButton";
import AuthHeader from "@components/Auth/AuthHeader";
import SelectableButton from "@components/ui/buttons/SelectableButton";
import AuthButton from "@components/ui/buttons/AuthButton";
import AuthFooter from "@components/Auth/AuthFooter";
import patientIcon from "@assets/images/patient-icon.png";
import doctorIcon from "@assets/images/doctor-icon.png";


const RoleSelectionScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedRole, setSelectedRole] = useState<"patient" | "doctor" | null>(
    null
  );

  const handleRoleSelection = (role: "patient" | "doctor") => {
    setSelectedRole(role);
  };

  const handleNext = () => {
    if (selectedRole) {
      navigation.navigate("SignUpDetails", { role: selectedRole });
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
            title="Create your account"
            subtitle="Join ZenCare – Your Personal Health Companion"
          />

          <View style={styles.formOuterContainer}>
            <Text style={styles.roleLabel}>Choose Your Role</Text>
            <View style={styles.formContainer}>
              <SelectableButton
                selected={selectedRole === "patient"}
                icon={patientIcon}
                label="Patient"
                onPress={() => handleRoleSelection("patient")}
              />
              <SelectableButton
                selected={selectedRole === "doctor"}
                icon={doctorIcon}
                label="Doctor"
                onPress={() => handleRoleSelection("doctor")}
              />
            </View>
            <AuthButton
              title="Next"
              onPress={handleNext}
              disabled={!selectedRole}
            />
            <AuthFooter
              question="Already have an account?"
              actionText="Login"
              onPress={() => navigation.navigate("Login")}
            />
            <AuthFooter
              question="Need help?"
              actionText="Visit our help center"
              onPress={() => {}}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
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
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary400,
    textAlign: "center",
    marginBottom: 18,
  },
});

export default RoleSelectionScreen;
