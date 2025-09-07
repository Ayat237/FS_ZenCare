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
import { doctorsService, DoctorResponse } from "@/services/api/doctors";
import { slotsService, SlotResponse } from "@/services/api/slots";

interface DoctorWithSlots extends DoctorResponse {
  availableSlots?: SlotResponse[];
}

interface AppointmentItem {
  id: string;
  doctorName: string;
  date: string;
  time: string;
  type: "telemedicine" | "in-person";
  status: "confirmed" | "completed";
  joinUrl?: string;
  doctorImage?: any;
}

// Dummy appointments data for now (will be replaced with backend data later)
const dummyAppointments: AppointmentItem[] = [
  // Upcoming appointments
  {
    id: "a1",
    doctorName: "Dr. Sarah Johnson",
    date: "2025-07-07",
    time: "10:00 - 10:30",
    type: "telemedicine",
    status: "confirmed",
    joinUrl: "https://zoom.us/j/123456",
  },
  {
    id: "a2",
    doctorName: "Dr. Michael Chen",
    date: "2025-07-08",
    time: "14:00 - 14:30",
    type: "in-person",
    status: "confirmed",
  },
  // History appointments
  {
    id: "a3",
    doctorName: "Dr. Emily Wilson",
    date: "2025-07-01",
    time: "11:00 - 11:30",
    type: "telemedicine",
    status: "completed",
  },
  {
    id: "a4",
    doctorName: "Dr. James Rodriguez",
    date: "2025-06-28",
    time: "10:00 - 10:30",
    type: "in-person",
    status: "completed",
  },
];

type Props = DrawerScreenProps<"Appointments">;

const AppointmentsScreen: React.FC<Props> = ({ navigation }) => {
  const [doctors, setDoctors] = useState<DoctorWithSlots[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "available" | "myAppointments"
  >("available");
  const [expandedDoctorId, setExpandedDoctorId] = useState<string | null>(null);
  const [loadingSlotsFor, setLoadingSlotsFor] = useState<string | null>(null);

  // Split appointments into upcoming and completed
  const upcomingAppointments = dummyAppointments.filter(
    (apt) => apt.status === "confirmed"
  );
  const completedAppointments = dummyAppointments.filter(
    (apt) => apt.status === "completed"
  );

  // Render appointment item
  const renderAppointmentItem = ({ item }: { item: AppointmentItem }) => {
    const isUpcoming = item.status === "confirmed";
    const isTelemedicine = item.type === "telemedicine";

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View style={styles.appointmentInfo}>
            <Text style={styles.appointmentDoctorName}>{item.doctorName}</Text>
            <View style={styles.appointmentDetails}>
              <View style={styles.appointmentDetailItem}>
                <Icon name="calendar" size={14} color={Colors.textMuted} />
                <Text style={styles.appointmentDetailText}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.appointmentDetailItem}>
                <Icon name="clock-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.appointmentDetailText}>{item.time}</Text>
              </View>
              <View style={styles.appointmentDetailItem}>
                <Icon
                  name={isTelemedicine ? "video" : "hospital-building"}
                  size={14}
                  color={isTelemedicine ? Colors.success500 : Colors.primary500}
                />
                <Text
                  style={[
                    styles.appointmentDetailText,
                    {
                      color: isTelemedicine
                        ? Colors.success500
                        : Colors.primary500,
                    },
                  ]}
                >
                  {isTelemedicine ? "Video Call" : "In-Person"}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isUpcoming
                    ? Colors.primary100
                    : Colors.success100,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: isUpcoming ? Colors.primary700 : Colors.success700 },
                ]}
              >
                {isUpcoming ? "Upcoming" : "Completed"}
              </Text>
            </View>
          </View>

          {isUpcoming && isTelemedicine && item.joinUrl && (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => {
                Alert.alert(
                  "Join Meeting",
                  "This would open the video call in a real implementation",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Join",
                      onPress: () => console.log("Joining meeting..."),
                    },
                  ]
                );
              }}
            >
              <Icon name="video" size={16} color={Colors.white} />
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Fetch all doctors
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const doctorsData = await doctorsService.getAllDoctors();
      setDoctors(doctorsData);
    } catch (error: any) {
      console.error("Error fetching doctors:", error);
      Alert.alert("Error", error.message || "Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  // Fetch slots for a specific doctor
  const fetchDoctorSlots = async (doctorId: string) => {
    try {
      setLoadingSlotsFor(doctorId);
      const slots = await doctorsService.getDoctorSlots(doctorId);

      // Update the doctor's slots in the state
      setDoctors((prev) =>
        prev.map((doctor) =>
          doctor._id === doctorId
            ? { ...doctor, availableSlots: slots }
            : doctor
        )
      );
    } catch (error: any) {
      console.error("Error fetching doctor slots:", error);
      Alert.alert("Error", error.message || "Failed to fetch doctor slots");
    } finally {
      setLoadingSlotsFor(null);
    }
  };

  // Handle view slots button press
  const handleViewSlots = async (doctorId: string) => {
    if (expandedDoctorId === doctorId) {
      // Close if already open
      setExpandedDoctorId(null);
    } else {
      // Open and fetch slots
      setExpandedDoctorId(doctorId);
      await fetchDoctorSlots(doctorId);
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDoctors();
    setRefreshing(false);
  };

  // Initial load
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Render doctor item
  const renderDoctorItem = ({ item: doctor }: { item: DoctorWithSlots }) => {
    const isExpanded = expandedDoctorId === doctor._id;
    const isLoadingSlots = loadingSlotsFor === doctor._id;

    return (
      <View style={styles.doctorCard}>
        <View style={styles.doctorHeader}>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>
              Dr. {doctor.user?.firstName}{" "}
              {doctor.user?.lastName || "Unknown Doctor"}
            </Text>
            <Text style={styles.specialty}>{doctor.specialty}</Text>
            <Text style={styles.experience}>
              {doctor.yearsOfExperience} years experience
            </Text>
            {doctor.hospitalAffiliation &&
              doctor.hospitalAffiliation.length > 0 && (
                <Text style={styles.hospital}>
                  {doctor.hospitalAffiliation[0]?.name}
                </Text>
              )}
            {doctor.rating && (
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color={Colors.warning} />
                <Text style={styles.rating}>
                  {doctor.rating.average.toFixed(1)} ({doctor.rating.count}{" "}
                  reviews)
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.viewSlotsButton}
            onPress={() => handleViewSlots(doctor._id)}
            disabled={isLoadingSlots}
          >
            {isLoadingSlots ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Icon
                  name={isExpanded ? "chevron-up" : "eye"}
                  size={20}
                  color={Colors.white}
                />
                <Text style={styles.viewSlotsText}>
                  {isExpanded ? "Hide" : "View"} Slots
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Slots Section */}
        {isExpanded && (
          <View style={styles.slotsContainer}>
            <Text style={styles.slotsTitle}>Available Slots</Text>
            {doctor.availableSlots && doctor.availableSlots.length > 0 ? (
              <FlatList
                data={doctor.availableSlots}
                renderItem={({ item: slot }) => (
                  <View style={styles.slotItem}>
                    <View style={styles.slotInfo}>
                      <Text style={styles.slotDate}>
                        {new Date(slot.date).toLocaleDateString()}
                      </Text>
                      <Text style={styles.slotTime}>
                        {slot.startTime} - {slot.endTime}
                      </Text>
                      <Text
                        style={[
                          styles.slotType,
                          slot.type === "telemedicine"
                            ? styles.telemedicineType
                            : styles.inPersonType,
                        ]}
                      >
                        {slot.type === "telemedicine"
                          ? "Video Call"
                          : "In-Person"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.bookButton}
                      onPress={() => {
                        // TODO: Implement booking functionality
                        Alert.alert(
                          "Coming Soon",
                          "Booking functionality will be implemented next"
                        );
                      }}
                    >
                      <Text style={styles.bookButtonText}>Book</Text>
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(slot) => slot._id}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.noSlotsContainer}>
                <Icon
                  name="calendar-remove"
                  size={48}
                  color={Colors.textMuted}
                />
                <Text style={styles.noSlotsText}>
                  No available slots for this doctor
                </Text>
              </View>
            )}
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
          <Text style={styles.loadingText}>Loading doctors...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.menuButton}
        >
          <Icon name="menu" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Appointments</Text>
        <TouchableOpacity
          onPress={onRefresh}
          style={styles.refreshButton}
          disabled={refreshing}
        >
          <Icon
            name={refreshing ? "loading" : "refresh"}
            size={24}
            color={Colors.primary500}
          />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "available" && styles.activeTab]}
          onPress={() => setSelectedTab("available")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "available" && styles.activeTabText,
            ]}
          >
            Available Doctors
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === "myAppointments" && styles.activeTab,
          ]}
          onPress={() => setSelectedTab("myAppointments")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "myAppointments" && styles.activeTabText,
            ]}
          >
            My Appointments
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {selectedTab === "available" ? (
        <FlatList
          data={doctors}
          renderItem={renderDoctorItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.doctorsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="doctor" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No doctors available</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchDoctors}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <View style={styles.appointmentsContainer}>
          {/* Upcoming Appointments Section */}
          <Text style={styles.appointmentsSectionTitle}>
            Upcoming Appointments
          </Text>
          {upcomingAppointments.length > 0 ? (
            <FlatList
              data={upcomingAppointments}
              renderItem={renderAppointmentItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          ) : (
            <View style={styles.emptyAppointmentsContainer}>
              <Icon name="calendar-plus" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyAppointmentsText}>
                No upcoming appointments
              </Text>
            </View>
          )}

          {/* Completed Appointments Section */}
          <Text style={styles.appointmentsSectionTitle}>
            Appointment History
          </Text>
          {completedAppointments.length > 0 ? (
            <FlatList
              data={completedAppointments}
              renderItem={renderAppointmentItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          ) : (
            <View style={styles.emptyAppointmentsContainer}>
              <Icon name="calendar-clock" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyAppointmentsText}>
                No appointment history
              </Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textMuted,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  activeTab: {
    backgroundColor: Colors.primary500,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textMuted,
  },
  activeTabText: {
    color: Colors.white,
  },
  doctorsList: {
    padding: 16,
  },
  doctorCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  doctorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  doctorInfo: {
    flex: 1,
    marginRight: 12,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: Colors.primary500,
    marginBottom: 4,
  },
  experience: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  hospital: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  feesContainer: {
    marginBottom: 8,
  },
  fees: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  viewSlotsButton: {
    backgroundColor: Colors.primary500,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 100,
    justifyContent: "center",
  },
  viewSlotsText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  slotsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  slotsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  slotItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  slotInfo: {
    flex: 1,
  },
  slotDate: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  slotTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  slotType: {
    fontSize: 10,
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  telemedicineType: {
    backgroundColor: Colors.success100,
    color: Colors.success700,
  },
  inPersonType: {
    backgroundColor: Colors.primary100,
    color: Colors.primary700,
  },
  bookButton: {
    backgroundColor: Colors.success500,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  bookButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "500",
  },
  noSlotsContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  noSlotsText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary500,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "500",
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginTop: 12,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
  },
  // Appointment styles
  appointmentsContainer: {
    flex: 1,
    padding: 16,
  },
  appointmentsSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  appointmentCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  appointmentInfo: {
    flex: 1,
    marginRight: 12,
  },
  appointmentDoctorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  appointmentDetails: {
    marginBottom: 8,
  },
  appointmentDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  appointmentDetailText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
  },
  joinButton: {
    backgroundColor: Colors.success500,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  joinButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  emptyAppointmentsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  emptyAppointmentsText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
  },
});

export default AppointmentsScreen;
