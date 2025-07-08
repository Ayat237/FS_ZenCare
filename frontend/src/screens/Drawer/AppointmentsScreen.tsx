import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Colors from "@theme/colors";
import { DrawerScreenProps } from "@/types/navigation";

// Services
import {
  appointmentsService,
  AppointmentResponse,
} from "@/services/api/appointments";

interface AppointmentItem {
  id: string;
  doctorName: string;
  date: string;
  time: string;
  type: "telemedicine" | "in-person";
  status: "confirmed" | "completed";
  original: AppointmentResponse;
}

type Props = DrawerScreenProps<"Appointments">;

const AppointmentsScreen: React.FC<Props> = ({ navigation }) => {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "completed">(
    "upcoming"
  );

  // Convert backend appointment to UI format
  const convertAppointmentToUI = (
    appointment: AppointmentResponse
  ): AppointmentItem => {
    const startTime = appointment.slotId.startTime;
    const endTime = appointment.slotId.endTime;
    const appointmentDate = new Date(appointment.dateTime);
    const today = new Date();

    return {
      id: appointment._id,
      doctorName: `Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`,
      date: appointmentDate.toISOString().split("T")[0],
      time: `${startTime} - ${endTime}`,
      type: appointment.type,
      status: appointmentDate > today ? "confirmed" : "completed",
      original: appointment,
    };
  };

  // Fetch appointments from backend
  const fetchAppointments = async () => {
    try {
      const appointmentsData = await appointmentsService.getMyAppointments();
      const convertedAppointments = appointmentsData.map(
        convertAppointmentToUI
      );
      setAppointments(convertedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      Alert.alert("Error", "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  // Filter appointments based on selected tab
  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "confirmed"
  );
  const completedAppointments = appointments.filter(
    (apt) => apt.status === "completed"
  );

  const currentAppointments =
    selectedTab === "upcoming" ? upcomingAppointments : completedAppointments;

  // Handle join meeting
  const handleJoinMeeting = async (appointment: AppointmentItem) => {
    if (appointment.type !== "telemedicine") return;

    try {
      const meetingDetails = await appointmentsService.getJitsiMeetingDetails(
        appointment.id
      );
      // Navigate to Jitsi meeting screen with the details
      // This would be implemented based on your Jitsi integration
      console.log("Meeting details:", meetingDetails);
      Alert.alert("Meeting", `Join meeting: ${meetingDetails.roomName}`);
    } catch (error) {
      console.error("Error getting meeting details:", error);
      Alert.alert("Error", "Failed to get meeting details");
    }
  };

  // Render appointment item
  const renderAppointmentItem = ({ item }: { item: AppointmentItem }) => {
    const isUpcoming = item.status === "confirmed";
    const isTelemedicine = item.type === "telemedicine";

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View style={styles.appointmentInfo}>
            <Text style={styles.doctorName}>{item.doctorName}</Text>
            <View style={styles.appointmentDetails}>
              <Icon name="calendar" size={16} color={Colors.textSecondary} />
              <Text style={styles.appointmentDate}>{item.date}</Text>
              <Icon
                name="clock"
                size={16}
                color={Colors.textSecondary}
                style={styles.timeIcon}
              />
              <Text style={styles.appointmentTime}>{item.time}</Text>
            </View>
          </View>
          <View style={styles.appointmentType}>
            <Icon
              name={isTelemedicine ? "video" : "hospital-building"}
              size={20}
              color={isTelemedicine ? Colors.primary500 : Colors.secondary500}
            />
            <Text
              style={[
                styles.typeText,
                {
                  color: isTelemedicine
                    ? Colors.primary500
                    : Colors.secondary500,
                },
              ]}
            >
              {isTelemedicine ? "Video Call" : "In-Person"}
            </Text>
          </View>
        </View>

        {isUpcoming && isTelemedicine && (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => handleJoinMeeting(item)}
          >
            <Icon name="video" size={16} color={Colors.white} />
            <Text style={styles.joinButtonText}>Join Meeting</Text>
          </TouchableOpacity>
        )}

        {!isUpcoming && (
          <View style={styles.completedBadge}>
            <Icon name="check-circle" size={16} color={Colors.success500} />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary500} />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("BookAppointment" as any)}
          style={styles.addButton}
        >
          <Icon name="plus" size={24} color={Colors.primary500} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "upcoming" && styles.activeTab]}
          onPress={() => setSelectedTab("upcoming")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "upcoming" && styles.activeTabText,
            ]}
          >
            Upcoming ({upcomingAppointments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "completed" && styles.activeTab]}
          onPress={() => setSelectedTab("completed")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "completed" && styles.activeTabText,
            ]}
          >
            Completed ({completedAppointments.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentAppointments}
        keyExtractor={(item) => item.id}
        renderItem={renderAppointmentItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="calendar-blank" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No {selectedTab} appointments</Text>
            <Text style={styles.emptyText}>
              {selectedTab === "upcoming"
                ? "You don't have any upcoming appointments."
                : "You haven't completed any appointments yet."}
            </Text>
            {selectedTab === "upcoming" && (
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => navigation.navigate("BookAppointment" as any)}
              >
                <Text style={styles.bookButtonText}>Book Appointment</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  addButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: Colors.primary500,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.white,
  },
  listContent: {
    padding: 20,
  },
  appointmentCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  appointmentDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  appointmentDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  timeIcon: {
    marginLeft: 16,
  },
  appointmentTime: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  appointmentType: {
    alignItems: "center",
  },
  typeText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary500,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  joinButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  completedText: {
    color: Colors.success500,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  bookButton: {
    backgroundColor: Colors.primary500,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 24,
  },
  bookButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default AppointmentsScreen;
