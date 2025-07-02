import React from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import Colors from "@theme/colors";
import AuthButton from "../buttons/AuthButton";

interface VerifiedOverlayProps {
  visible: boolean;
  onDashboard: () => void;
}

const VerifiedOverlay: React.FC<VerifiedOverlayProps> = ({
  visible,
  onDashboard,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.checkmarkContainer}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          </View>
          <Text style={styles.title}>Verified!</Text>
          <Text style={styles.message}>
            We have successfully verified the account
          </Text>
          <AuthButton
            title="Go to dashboard"
            onPress={onDashboard}
            buttonStyle={styles.dashboardButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    alignItems: "center",
  },
  checkmarkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F7EE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  checkmark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary600,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: Colors.primary400,
    marginBottom: 24,
    textAlign: "center",
  },
  dashboardButton: {
    width: "100%",
    marginTop: 16,
    backgroundColor: Colors.primary500,
    borderRadius: 8,
  },
});

export default VerifiedOverlay;
