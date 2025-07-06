import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { logout } from "@/store/auth/authSlice";
import Colors from "@theme/colors";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");

const DoctorHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  // Dashboard stats data (you can replace with real data later)
  const dashboardStats = [
    {
      title: "Today's Appointments",
      value: "8",
      icon: "calendar-today",
      color: Colors.primary500,
    },
    {
      title: "Total Patients",
      value: "124",
      icon: "account-group",
      color: "#4CAF50",
    },
    {
      title: "Pending Reviews",
      value: "3",
      icon: "clock-outline",
      color: "#FF9800",
    },
    
  ];

  const quickActions = [
    {
      title: "View Appointments",
      icon: "calendar-clock",
      route: "DoctorAppointments",
      color: Colors.primary500,
    },
    {
      title: "Manage Availability",
      icon: "calendar-edit",
      route: "Availability",
      color: "#4CAF50",
    },
    {
      title: "Patient Records",
      icon: "account-group",
      route: "PatientList",
      color: "#2196F3",
    },
    {
      title: "Prescriptions",
      icon: "file-document",
      route: "DoctorPrescriptions",
      color: "#FF9800",
    },
    {
      title: "Telemedicine",
      icon: "video",
      route: "TelemedicineSessions",
      color: "#9C27B0",
    },
    {
      title: "Profile Settings",
      icon: "account-edit",
      route: "DoctorProfile",
      color: "#607D8B",
    },
  ];

  const renderStatCard = (stat: any, index: number) => (
    <View
      key={index}
      style={[styles.statCard, { borderLeftColor: stat.color }]}
    >
      <View style={styles.statIconContainer}>
        <Icon name={stat.icon} size={24} color={stat.color} />
      </View>
      <View style={styles.statTextContainer}>
        <Text style={styles.statValue}>{stat.value}</Text>
        <Text style={styles.statTitle}>{stat.title}</Text>
      </View>
    </View>
  );

  const renderQuickAction = (action: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.actionCard}
      onPress={() => navigation.navigate(action.route)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.actionIconContainer,
          { backgroundColor: `${action.color}15` },
        ]}
      >
        <Icon name={action.icon} size={28} color={action.color} />
      </View>
      <Text style={styles.actionTitle}>{action.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Doctor Dashboard</Text>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Icon name="menu" size={28} color={Colors.primary600} />
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <Image
            source={{
              uri:
                user?.profileImage ||
                "https://dummyimage.com/200x200/007bff/ffffff",
            }}
            style={styles.profileImage}
          />
          <Text style={styles.welcomeText}>
            Welcome, Dr. {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.specialtyText}>{user?.specialty}</Text>
        </View>

        {/* Dashboard Statistics */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsContainer}>
            {dashboardStats.map((stat, index) => renderStatCard(stat, index))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            {quickActions.map((action, index) =>
              renderQuickAction(action, index)
            )}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary600,
  },
  welcomeContainer: {
    alignItems: "center",
    padding: 20,
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: Colors.primary500,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary700,
    textAlign: "center",
  },
  specialtyText: {
    fontSize: 16,
    color: Colors.primary500,
    marginTop: 5,
  },
  buttonsContainer: {
    padding: 20,
    gap: 15,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 15,
    color: Colors.primary700,
  },
  // New Dashboard Styles
  sectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary700,
    marginBottom: 15,
  },
  statsContainer: {
    gap: 12,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderLeftWidth: 4,
  },
  statIconContainer: {
    marginRight: 15,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary700,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.primary500,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 15,
  },
  actionCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    width: (width - 55) / 2, // 2 cards per row with gaps
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.primary700,
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: Colors.primary600,
    margin: 20,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
    color: "#fff",
  },
});

export default DoctorHomeScreen;
