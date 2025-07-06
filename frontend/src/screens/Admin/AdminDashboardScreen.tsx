import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Colors from "@theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("adminToken");
    await AsyncStorage.removeItem("userData");
    navigation.navigate("AdminLogin" as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>🏥 Admin Dashboard</Text>
          <Text style={styles.subtitle}>ZenCare Healthcare Management</Text>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>✅ Admin Login Successful!</Text>
          <Text style={styles.welcomeText}>
            You have successfully logged in to the ZenCare Admin Panel.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📋 Current Status</Text>
          <Text style={styles.infoText}>
            • Admin authentication: Working ✅{"\n"}• Role verification: Active
            ✅{"\n"}• Dashboard access: Granted ✅
          </Text>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>📝 Development Note</Text>
          <Text style={styles.noteText}>
            A separate web-based admin application will be created for full
            administrative functionality including doctor verification, user
            management, and system monitoring.
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary50,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary500,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.primary400,
  },
  welcomeCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.success500,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary500,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  noteCard: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning500,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.warning600,
    marginBottom: 10,
  },
  noteText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: Colors.error500,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AdminDashboardScreen;
