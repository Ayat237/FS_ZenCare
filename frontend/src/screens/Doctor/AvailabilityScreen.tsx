/**
 * AvailabilityScreen - Doctor's Schedule Management
 *
 * This screen allows doctors to:
 * 1. View their weekly availability schedule
 * 2. Add new time slots with price and type (telemedicine/in-person)
 * 3. Delete existing slots (if not booked)
 * 4. Navigate between weeks
 *
 * Backend Integration:
 * - GET /slots - Fetch all doctor's slots
 * - POST /slots - Create new slot
 * - DELETE /slots/:id - Delete a slot
 *
 * Auth Requirements:
 * - User must be logged in as a doctor
 * - doctorId from user.roleData.doctor._id is used for API calls
 * - Backend validates that the requesting user owns the slots
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  format,
  addDays,
  parseISO,
  isAfter,
  isBefore,
  isEqual,
} from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

// Components
import TimeSlotItem from "../../components/doctor/TimeSlotItem";
import AddSlotModal from "../../components/doctor/AddSlotModal";

// Services
import {
  slotsService,
  CreateSlotData,
  SlotResponse,
} from "../../services/api/slots";

// Theme
import Colors from "../../theme/colors";

// Types
import {
  TimeSlot,
  DayAvailability,
  WeekAvailability,
} from "../../types/availability";

const AvailabilityScreen: React.FC = () => {
  // Get user data from Redux
  const { user } = useSelector((state: RootState) => state.auth);
  const doctorId = user?.roleData?.doctor?._id;

  // State for loading
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // State for the current week
  const [currentWeek, setCurrentWeek] = useState<WeekAvailability>(() => {
    const today = new Date();
    // Start the week on Saturday (day 6)
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 6 ? 0 : 6 - dayOfWeek - 7;
    const startDate = addDays(today, diff);

    // Generate the week days
    const days: DayAvailability[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(startDate, i);
      days.push({
        date: format(date, "yyyy-MM-dd"),
        dayName: format(date, "EEEE"),
        dayOfMonth: date.getDate(),
        month: format(date, "MMMM"),
        slots: [],
      });
    }

    return {
      days,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(addDays(startDate, 6), "yyyy-MM-dd"),
    };
  });

  // State for the selected day
  const [selectedDay, setSelectedDay] = useState<DayAvailability>(
    currentWeek.days[0]
  );

  // State for the add slot modal
  const [isAddSlotModalVisible, setIsAddSlotModalVisible] = useState(false);

  // State for time slots - now connected to backend
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Fetch slots for the current doctor
  const fetchDoctorSlots = async () => {
    console.log("🔍 fetchDoctorSlots called");
    console.log("🔍 user:", user);
    console.log("🔍 user.roleData:", user?.roleData);
    console.log("🔍 user.roleData.doctor:", user?.roleData?.doctor);
    console.log("🔍 doctorId:", doctorId);

    if (!doctorId) {
      console.log("❌ No doctor ID available");
      Alert.alert(
        "Error",
        "Doctor profile not available. Please make sure you are logged in as a doctor."
      );
      return;
    }

    try {
      setLoading(true);
      console.log("✅ Fetching slots for doctor:", doctorId);
      const slots: SlotResponse[] = await slotsService.getDoctorSlots(doctorId);

      // Convert backend slots to frontend format and deduplicate
      const convertedSlots: TimeSlot[] = slots.map((slot) => {
        // Safely handle date conversion
        let dateStr = "";
        if (slot.date) {
          try {
            dateStr = String(slot.date).split("T")[0];
          } catch (error) {
            console.warn("Error processing slot date:", slot.date, error);
            dateStr = "";
          }
        }

        return {
          _id: slot._id,
          id: slot._id, // For backward compatibility
          doctorId: slot.doctorId,
          day: dateStr, // Convert to YYYY-MM-DD
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: slot.duration,
          type: slot.type,
          price: slot.price,
          isBooked: slot.isBooked,
          isRecurring: false, // Default value
          createdAt: slot.createdAt,
          updatedAt: slot.updatedAt,
        };
      });

      // Deduplicate slots by _id to prevent React key warnings
      const uniqueSlots = convertedSlots.filter(
        (slot, index, self) =>
          index === self.findIndex((s) => s._id === slot._id)
      );

      setTimeSlots(uniqueSlots);
      console.log("Fetched slots:", uniqueSlots);
    } catch (error: any) {
      console.log("Error fetching slots:", error.message);
      Alert.alert("Error", "Failed to load your availability slots");
    } finally {
      setLoading(false);
    }
  };

  // Initial load of slots
  useEffect(() => {
    if (doctorId) {
      fetchDoctorSlots();
    }
  }, [doctorId]);

  // Effect to update the slots for all days when timeSlots change
  useEffect(() => {
    console.log("🔍 Updating days with slots. Total slots:", timeSlots.length);
    console.log(
      "🔍 Current week days:",
      currentWeek.days.map((d) => d.date)
    );

    const updatedDays = currentWeek.days.map((day) => {
      // Filter slots for this specific day
      const daySlots = timeSlots.filter((slot) => {
        const slotDate =
          slot.day || (slot.date ? String(slot.date).split("T")[0] : "");
        console.log(
          `🔍 Checking slot date: ${slotDate} against day: ${day.date}`
        );
        return slotDate === day.date;
      });

      console.log(`🔍 Day ${day.date} has ${daySlots.length} slots:`, daySlots);

      return {
        ...day,
        slots: daySlots,
      };
    });

    setCurrentWeek((prev) => ({
      ...prev,
      days: updatedDays,
    }));

    // Update selected day if it's one of the updated days
    const updatedSelectedDay = updatedDays.find(
      (day) => day.date === selectedDay.date
    );
    if (updatedSelectedDay) {
      setSelectedDay(updatedSelectedDay);
    }
  }, [timeSlots, currentWeek.startDate]); // Remove selectedDay.date dependency to avoid infinite loop

  // Handle day selection
  const handleDaySelect = (day: DayAvailability) => {
    console.log(
      "🔍 Day selected:",
      day.date,
      "with",
      day.slots.length,
      "slots"
    );
    setSelectedDay(day);
  };

  // Handle adding a new slot
  const handleAddSlot = async (newSlot: TimeSlot) => {
    console.log("🔍 handleAddSlot called with:", newSlot);
    console.log("🔍 Current doctorId:", doctorId);
    console.log("🔍 Current user:", user);

    if (!doctorId) {
      Alert.alert(
        "Error",
        "Doctor information not available. Please make sure you are logged in properly."
      );
      return;
    }

    // Check for overlapping slots
    const isOverlapping = timeSlots.some((slot) => {
      if (slot.day !== newSlot.day) return false;

      const newSlotStart = parseISO(`${newSlot.day}T${newSlot.startTime}:00`);
      const newSlotEnd = parseISO(`${newSlot.day}T${newSlot.endTime}:00`);
      const existingSlotStart = parseISO(`${slot.day}T${slot.startTime}:00`);
      const existingSlotEnd = parseISO(`${slot.day}T${slot.endTime}:00`);

      // Check if the new slot overlaps with an existing slot
      return (
        (isAfter(newSlotStart, existingSlotStart) &&
          isBefore(newSlotStart, existingSlotEnd)) ||
        (isAfter(newSlotEnd, existingSlotStart) &&
          isBefore(newSlotEnd, existingSlotEnd)) ||
        (isBefore(newSlotStart, existingSlotStart) &&
          isAfter(newSlotEnd, existingSlotEnd)) ||
        isEqual(newSlotStart, existingSlotStart) ||
        isEqual(newSlotEnd, existingSlotEnd)
      );
    });

    if (isOverlapping) {
      Alert.alert(
        "Time Conflict",
        "This slot overlaps with an existing slot. Please choose a different time."
      );
      return;
    }

    try {
      setLoading(true);

      // Prepare data for backend
      const slotData: CreateSlotData = {
        doctorId,
        date:
          newSlot.day ||
          (newSlot.date ? String(newSlot.date).split("T")[0] : "") ||
          "",
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        duration: newSlot.duration,
        type: newSlot.type,
        price: newSlot.price,
      };

      console.log("🔍 Creating new slot with data:", slotData);
      console.log("🔍 doctorId being sent:", doctorId);
      console.log("🔍 newSlot received:", newSlot);

      // Call backend API
      const createdSlot = await slotsService.createSlot(slotData);

      setIsAddSlotModalVisible(false);

      // Refresh slots from backend to get the latest state
      await fetchDoctorSlots();

      Alert.alert("Success", "Time slot created successfully");
    } catch (error: any) {
      console.log("❌ Error creating slot:", error);
      console.log("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      Alert.alert("Error", error.message || "Failed to create time slot");
    } finally {
      setLoading(false);
    }
  };

  // State for editing slot
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);

  // Handle editing a slot
  const handleEditSlot = (slotId: string) => {
    const slotToEdit = timeSlots.find(
      (slot) => slot._id === slotId || slot.id === slotId
    );
    if (slotToEdit) {
      console.log("🔍 Editing slot:", slotToEdit);
      setEditingSlot(slotToEdit);
      setIsAddSlotModalVisible(true);
    } else {
      Alert.alert("Error", "Slot not found");
    }
  };

  // Handle updating an existing slot
  const handleUpdateSlot = async (updatedSlot: TimeSlot) => {
    if (!editingSlot || !doctorId) {
      Alert.alert("Error", "Invalid slot or doctor information");
      return;
    }

    try {
      setLoading(true);

      console.log("🔍 Updating slot - creating new slot instead of updating");

      // Create the new slot with updated data
      const slotData: CreateSlotData = {
        doctorId,
        date:
          updatedSlot.day ||
          (updatedSlot.date ? String(updatedSlot.date).split("T")[0] : "") ||
          "",
        startTime: updatedSlot.startTime,
        endTime: updatedSlot.endTime,
        duration: updatedSlot.duration,
        type: updatedSlot.type,
        price: updatedSlot.price,
      };

      const createdSlot = await slotsService.createSlot(slotData);

      // Try to delete old slot in background (don't fail if it doesn't work)
      try {
        await slotsService.deleteSlot(editingSlot._id || editingSlot.id || "");
        console.log("🔍 Old slot deleted successfully");
      } catch (deleteError: any) {
        console.log(
          "🔍 Failed to delete old slot, but new slot created:",
          deleteError.message
        );
        // Don't fail the operation, just log the error
      }

      setEditingSlot(null);
      setIsAddSlotModalVisible(false);

      // Refresh slots from backend to get the latest state
      await fetchDoctorSlots();

      Alert.alert("Success", "Time slot updated successfully");
    } catch (error: any) {
      console.log("❌ Error updating slot:", error);
      console.log("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      Alert.alert("Error", error.message || "Failed to update time slot");
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a slot
  const handleDeleteSlot = (slotId: string) => {
    Alert.alert(
      "Delete Slot",
      "Are you sure you want to delete this time slot?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              console.log("Deleting slot:", slotId);

              // Call backend API
              await slotsService.deleteSlot(slotId);

              // Refresh slots from backend to get the latest state
              await fetchDoctorSlots();

              Alert.alert("Success", "Time slot deleted successfully");
            } catch (error: any) {
              console.log("❌ Error deleting slot:", error);
              console.log("❌ Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
              });
              Alert.alert(
                "Error",
                error.message || "Failed to delete time slot"
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const startDate = parseISO(currentWeek.startDate);
    const newStartDate = addDays(startDate, -7);

    const days: DayAvailability[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(newStartDate, i);
      days.push({
        date: format(date, "yyyy-MM-dd"),
        dayName: format(date, "EEEE"),
        dayOfMonth: date.getDate(),
        month: format(date, "MMMM"),
        slots: [],
      });
    }

    setCurrentWeek({
      days,
      startDate: format(newStartDate, "yyyy-MM-dd"),
      endDate: format(addDays(newStartDate, 6), "yyyy-MM-dd"),
    });
    setSelectedDay(days[0]);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const startDate = parseISO(currentWeek.startDate);
    const newStartDate = addDays(startDate, 7);

    const days: DayAvailability[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(newStartDate, i);
      days.push({
        date: format(date, "yyyy-MM-dd"),
        dayName: format(date, "EEEE"),
        dayOfMonth: date.getDate(),
        month: format(date, "MMMM"),
        slots: [],
      });
    }

    setCurrentWeek({
      days,
      startDate: format(newStartDate, "yyyy-MM-dd"),
      endDate: format(addDays(newStartDate, 6), "yyyy-MM-dd"),
    });
    setSelectedDay(days[0]);
  };

  // Render day item for the week view
  const renderDayItem = ({ item }: { item: DayAvailability }) => {
    const isSelected = item.date === selectedDay.date;
    const isToday = item.date === format(new Date(), "yyyy-MM-dd");

    return (
      <TouchableOpacity
        style={[
          styles.dayItem,
          isSelected && styles.selectedDayItem,
          isToday && styles.todayItem,
        ]}
        onPress={() => handleDaySelect(item)}
      >
        <Text style={[styles.dayName, isSelected && styles.selectedDayText]}>
          {item.dayName.substring(0, 3)}
        </Text>
        <View
          style={[
            styles.dayNumber,
            isSelected && styles.selectedDayNumber,
            isToday && styles.todayNumber,
          ]}
        >
          <Text
            style={[
              styles.dayNumberText,
              isSelected && styles.selectedDayNumberText,
              isToday && styles.todayNumberText,
            ]}
          >
            {item.dayOfMonth}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary600} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.primary500 }]}>
        <Text style={styles.headerTitle}>Availability Schedule</Text>
        <Text style={styles.headerSubtitle}>
          Configure your weekly availability for consultations
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Week Navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity
            style={styles.weekNavButton}
            onPress={goToPreviousWeek}
          >
            <Icon name="chevron-left" size={24} color={Colors.primary500} />
          </TouchableOpacity>

          <Text style={styles.weekRangeText}>
            {format(parseISO(currentWeek.startDate), "MMM d")} -{" "}
            {format(parseISO(currentWeek.endDate), "MMM d, yyyy")}
          </Text>

          <TouchableOpacity style={styles.weekNavButton} onPress={goToNextWeek}>
            <Icon name="chevron-right" size={24} color={Colors.primary500} />
          </TouchableOpacity>
        </View>

        {/* Week Days */}
        <FlatList
          data={currentWeek.days}
          renderItem={renderDayItem}
          keyExtractor={(item) => item.date}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysContainer}
        />

        {/* Selected Day Slots */}
        <View style={styles.slotsSection}>
          <View style={styles.slotsSectionHeader}>
            <Text style={styles.slotsSectionTitle}>
              {format(parseISO(selectedDay.date), "EEEE, MMMM d, yyyy")}
            </Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={[styles.refreshButton, { marginRight: 8 }]}
                onPress={() => {
                  setRefreshing(true);
                  fetchDoctorSlots().finally(() => setRefreshing(false));
                }}
                disabled={loading || refreshing}
              >
                <Icon
                  name={refreshing ? "loading" : "refresh"}
                  size={16}
                  color={Colors.primary500}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addButton, { opacity: loading ? 0.6 : 1 }]}
                onPress={() => setIsAddSlotModalVisible(true)}
                disabled={loading}
              >
                <Icon name="plus" size={16} color={Colors.white} />
                <Text style={styles.addButtonText}>Add Slot</Text>
              </TouchableOpacity>
            </View>
          </View>

          {loading && timeSlots.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Icon name="loading" size={32} color={Colors.primary500} />
              <Text style={styles.loadingText}>
                Loading your availability...
              </Text>
            </View>
          ) : selectedDay.slots.length > 0 ? (
            <>
              {/* Debug info */}

              {selectedDay.slots.map((slot, index) => (
                <TimeSlotItem
                  key={`${slot._id || slot.id || index}-${slot.startTime}-${
                    slot.endTime
                  }`}
                  slot={slot}
                  onEdit={() => handleEditSlot(slot._id || slot.id || "")}
                  onDelete={() => handleDeleteSlot(slot._id || slot.id || "")}
                />
              ))}
            </>
          ) : (
            <View style={styles.emptySlots}>
              <Icon name="calendar-clock" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>
                No time slots available for this day
              </Text>
              <Text style={styles.emptySubtext}>
                Tap the "Add Slot" button to create a new time slot
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Slot Modal */}
      <AddSlotModal
        visible={isAddSlotModalVisible}
        onClose={() => {
          setIsAddSlotModalVisible(false);
          setEditingSlot(null);
        }}
        onSave={editingSlot ? handleUpdateSlot : handleAddSlot}
        selectedDate={selectedDay.date}
        editingSlot={editingSlot}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  weekNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  weekNavButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  weekRangeText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  daysContainer: {
    paddingVertical: 8,
  },
  dayItem: {
    width: 70,
    height: 90,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedDayItem: {
    backgroundColor: Colors.primary100,
    borderColor: Colors.primary500,
    borderWidth: 1,
  },
  todayItem: {
    borderColor: Colors.primary300,
    borderWidth: 1,
  },
  dayName: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  selectedDayText: {
    color: Colors.primary600,
    fontWeight: "600",
  },
  dayNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDayNumber: {
    backgroundColor: Colors.primary500,
  },
  todayNumber: {
    backgroundColor: Colors.primary300,
  },
  dayNumberText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  selectedDayNumberText: {
    color: Colors.white,
  },
  todayNumberText: {
    color: Colors.white,
  },
  slotsSection: {
    marginTop: 24,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  slotsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  slotsSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: Colors.primary100,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary500,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: "600",
    marginLeft: 4,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 8,
  },
  debugText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginVertical: 2,
  },
  emptySlots: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textLight,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
});

export default AvailabilityScreen;
