import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
import { useSelector, useDispatch } from "react-redux";

// Components
import TimeSlotItem from "../../components/doctor/TimeSlotItem";
import AddSlotModal from "../../components/doctor/AddSlotModal";

// Services
import { slotService, CreateSlotRequest } from "../../services/api/slotService";

// Theme
import Colors from "../../theme/colors";

// Types
import {
  TimeSlot,
  DayAvailability,
  WeekAvailability,
} from "../../types/availability";
import { RootState, AppDispatch } from "../../store";
import { setUser, loadUserProfile } from "../../store/auth/authSlice";

const AvailabilityScreen: React.FC = () => {
  // All hooks must be at the top, before any conditional logic
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state?.auth?.user);
  const profileLoading = useSelector(
    (state: RootState) => state?.auth?.profileLoading
  );

  // Try to get doctorId from the user object or any nested structure
  // Using type assertion to safely access possible nested properties
  const doctorId = user?.doctorId || (user as any)?.doctorID?._id;

  console.log(
    "🔍 AvailabilityScreen: User object keys:",
    user ? Object.keys(user) : "no user"
  );
  console.log("🔍 AvailabilityScreen: doctorId:", doctorId);
  console.log("🔍 AvailabilityScreen: user.doctorId:", user?.doctorId);
  console.log(
    "🔍 AvailabilityScreen: user.doctorID?._id:",
    (user as any)?.doctorID?._id
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [profileLoadAttempted, setProfileLoadAttempted] =
    useState<boolean>(false);
  const [authError, setAuthError] = useState<boolean>(false);

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

  // State for the selected day index (instead of the full day object)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Derive selectedDay from currentWeek.days to avoid sync issues
  const selectedDay = currentWeek.days[selectedDayIndex];

  // State for the add slot modal
  const [isAddSlotModalVisible, setIsAddSlotModalVisible] = useState(false);

  // Remove the mock timeSlots state - we'll use selectedDay.slots instead
  // const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([...]); // REMOVED

  // Monitor currentWeek state changes
  useEffect(() => {
    console.log("🔍 AvailabilityScreen: Current week state:", {
      startDate: currentWeek.startDate,
      endDate: currentWeek.endDate,
      daysCount: currentWeek.days.length,
      selectedDayIndex,
      selectedDay: selectedDay?.date,
      days: currentWeek.days.map((d) => ({ date: d.date, dayName: d.dayName })),
    });
  }, [currentWeek, selectedDayIndex, selectedDay]);

  // Load user profile if doctorId is not available and not already loading/attempted
  useEffect(() => {
    console.log("🔍 AvailabilityScreen useEffect triggered:", {
      user: !!user,
      doctorId: doctorId,
      loading: loading,
      profileLoading: profileLoading,
      profileLoadAttempted: profileLoadAttempted,
      userActiveRole: user?.activeRole,
      userToken: !!user?.token,
    });

    // Only attempt to load the profile if:
    // 1. We have a user with a valid token
    // 2. The user is a doctor
    // 3. We don't have the doctorId yet
    // 4. We're not currently loading the profile
    // 5. We haven't already attempted to load the profile
    // 6. We haven't encountered an auth error
    if (
      user &&
      user.token && // Make sure we have a token
      user.activeRole === "doctor" &&
      !doctorId &&
      !profileLoading &&
      !profileLoadAttempted &&
      !authError // Don't try if we've had auth errors
    ) {
      console.log(
        "🔍 AvailabilityScreen: Doctor ID not found, attempting to load user profile..."
      );

      // Set the flag immediately to prevent multiple attempts
      setProfileLoadAttempted(true);

      // Dispatch loadUserProfile (with no delay, since we have improved the logic)
      dispatch(loadUserProfile())
        .unwrap()
        .then((result) => {
          console.log("🔍 AvailabilityScreen: Profile loaded:", result);
        })
        .catch((error) => {
          console.error("🔍 AvailabilityScreen: Error loading profile:", error);
          // If profile loading fails due to auth error, set auth error flag
          if (
            (typeof error === "string" &&
              (error.includes("401") ||
                error.includes("unauthorized") ||
                error.includes("Authentication failed"))) ||
            (error?.message &&
              (error.message.includes("401") ||
                error.message.includes("unauthorized")))
          ) {
            console.log(
              "🔍 AvailabilityScreen: Auth error detected, setting auth error flag"
            );
            setAuthError(true);
          }
        });
    }
  }, [user, doctorId, profileLoading, profileLoadAttempted, dispatch]);

  // Reset profile load attempt when user changes (e.g., different user logs in)
  useEffect(() => {
    if (!user || !user.token) {
      setProfileLoadAttempted(false);
      setAuthError(false); // Reset auth error when user changes
    }
  }, [user?.token]); // Watch for token changes specifically

  // Monitor doctorId changes
  useEffect(() => {
    console.log("🔍 AvailabilityScreen: DoctorId changed:", {
      doctorId: doctorId,
      loading: loading,
      profileLoadAttempted: profileLoadAttempted,
    });
  }, [doctorId, loading, profileLoadAttempted]);

  // Debug: Test token validity when component mounts
  useEffect(() => {
    console.log("🔍 AvailabilityScreen: Component mounted, testing token...");
    console.log(
      "🔍 AvailabilityScreen: Current user token exists:",
      !!user?.token
    );
    if (user?.token) {
      console.log("🔍 AvailabilityScreen: Token details:", {
        tokenLength: user.token.length,
        tokenStart: user.token.substring(0, 20) + "...",
        tokenEnd: "..." + user.token.substring(user.token.length - 10),
        isDummyToken: user.token === "dummy-doctor-token",
      });
    }
  }, []); // Run only once when component mounts

  // Remove the doctor ID fetching effect since we get it from Redux now
  // This improves performance by avoiding unnecessary API calls

  // Load slots from backend for a specific date
  const loadSlotsForDate = useCallback(
    async (targetDate: string) => {
      if (!doctorId) return;

      try {
        setLoading(true);

        console.log(
          "🔍 Loading slots for doctor:",
          doctorId,
          "date:",
          targetDate
        );
        console.log("🔍 User token:", user?.token ? "present" : "missing");

        // Get all slots for the doctor
        const allSlots = await slotService.getDoctorSlots(doctorId);
        console.log("🔍 All slots from backend:", allSlots);

        // Filter slots for the target date and format them
        const daySlots = allSlots
          .filter((slot) => {
            const slotDate = format(
              new Date(slot.date || slot.day || new Date()),
              "yyyy-MM-dd"
            );
            console.log(
              "🔍 Comparing slot date:",
              slotDate,
              "with target date:",
              targetDate
            );
            return slotDate === targetDate;
          })
          .map((slot) => ({
            ...slot,
            id: slot._id || slot.id || `slot-${Date.now()}-${Math.random()}`,
            day: format(
              new Date(slot.date || slot.day || new Date()),
              "yyyy-MM-dd"
            ),
            isRecurring: false, // Default value for frontend
          }));

        console.log("🔍 Filtered day slots:", daySlots);

        // Update the current week with the loaded slots
        setCurrentWeek((prev) => ({
          ...prev,
          days: prev.days.map((day) => {
            if (day.date === targetDate) {
              console.log(
                "🔍 Updating day slots for:",
                day.date,
                "with slots:",
                daySlots
              );
              return {
                ...day,
                slots: daySlots,
              };
            }
            return day;
          }),
        }));
      } catch (error: any) {
        console.error("🔍 Failed to load slots:", error);
        console.error("🔍 Error message:", error.message);
        Alert.alert("Error", "Failed to load appointment slots");
      } finally {
        setLoading(false);
      }
    },
    [doctorId, user?.token]
  ); // Stable dependencies

  // Helper function to load slots for the currently selected day
  const loadSlotsForSelectedDay = useCallback(async () => {
    if (selectedDay) {
      await loadSlotsForDate(selectedDay.date);
    }
  }, [selectedDay?.date, loadSlotsForDate]);

  // Effect to load slots when doctor ID is available or when selected day changes
  useEffect(() => {
    if (doctorId && selectedDay) {
      loadSlotsForSelectedDay();
    }
  }, [doctorId, selectedDay?.date, loadSlotsForSelectedDay]);

  // Early return if user is not loaded or auth error occurred
  if (!user) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={styles.emptyText}>Loading user information...</Text>
      </View>
    );
  }

  if (authError) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={styles.emptyText}>
          Authentication error. Please login again.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={styles.emptyText}>Loading doctor profile...</Text>
      </View>
    );
  }

  if (!doctorId) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={styles.emptyText}>Doctor profile not found...</Text>
      </View>
    );
  }

  // Handle day selection
  const handleDaySelect = (day: DayAvailability) => {
    console.log("🔍 Day selected:", day.date);
    const dayIndex = currentWeek.days.findIndex((d) => d.date === day.date);
    setSelectedDayIndex(dayIndex);
    // loadSlotsForSelectedDay will be called by useEffect due to selectedDay change
  };

  // Remove the sync useEffect since we're now using derived state

  // Handle adding a new slot
  const handleAddSlot = async (newSlot: TimeSlot) => {
    try {
      setLoading(true);

      // Check for overlapping slots locally first
      const isOverlapping = selectedDay.slots.some((slot: TimeSlot) => {
        const slotDay =
          slot.day || format(slot.date || new Date(), "yyyy-MM-dd");
        const newSlotDay =
          newSlot.day || format(newSlot.date || new Date(), "yyyy-MM-dd");

        if (slotDay !== newSlotDay) return false;

        const newSlotStart = parseISO(`${newSlotDay}T${newSlot.startTime}:00`);
        const newSlotEnd = parseISO(`${newSlotDay}T${newSlot.endTime}:00`);
        const existingSlotStart = parseISO(`${slotDay}T${slot.startTime}:00`);
        const existingSlotEnd = parseISO(`${slotDay}T${slot.endTime}:00`);

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

      // Prepare data for backend
      const slotData: CreateSlotRequest = {
        doctorId,
        date: newSlot.day || format(newSlot.date || new Date(), "yyyy-MM-dd"),
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        duration: newSlot.duration,
        type: newSlot.type,
        price: newSlot.price,
      };

      // Create slots via API
      const response = await slotService.createSlots(slotData);

      if (response.success && response.data) {
        setIsAddSlotModalVisible(false);
        Alert.alert("Success", "Time slots created successfully!");

        console.log("🔍 Slot created, reloading slots for selected day...");
        // Reload slots from backend to ensure UI is up to date
        await loadSlotsForSelectedDay();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create time slots");
    } finally {
      setLoading(false);
    }
  };

  // Handle editing a slot
  const handleEditSlot = (slotId: string) => {
    const slotToEdit = selectedDay.slots.find(
      (slot: TimeSlot) => slot.id === slotId
    );
    if (slotToEdit) {
      // In a real app, you would open the edit modal with the slot data
      Alert.alert(
        "Edit Slot",
        "Edit slot functionality would be implemented here."
      );
    }
  };

  // Handle deleting a slot
  const handleDeleteSlot = async (slotId: string) => {
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

              // Find the slot to get the backend ID
              const slotToDelete = selectedDay.slots.find(
                (slot: TimeSlot) => slot.id === slotId
              );
              const backendId = slotToDelete?._id || slotToDelete?.id;

              if (backendId) {
                // Delete from backend
                await slotService.deleteSlot(backendId);

                Alert.alert("Success", "Time slot deleted successfully!");

                // Reload slots from backend to ensure UI is up to date
                await loadSlotsForSelectedDay();
              } else {
                Alert.alert("Error", "Could not find slot to delete");
              }
            } catch (error: any) {
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
    setSelectedDayIndex(0); // Reset to first day of new week
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
    setSelectedDayIndex(0); // Reset to first day of new week
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

      <View style={styles.content}>
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysContainer}
        >
          {currentWeek.days.map((item, index) => {
            const isSelected = item.date === selectedDay.date;
            const isToday = item.date === format(new Date(), "yyyy-MM-dd");

            console.log(`🔍 Rendering day ${index}:`, {
              date: item.date,
              dayName: item.dayName,
              isSelected,
              isToday,
              selectedDayDate: selectedDay.date,
            });

            return (
              <TouchableOpacity
                key={item.date}
                style={[
                  styles.dayItem,
                  isSelected && styles.selectedDayItem,
                  isToday && styles.todayItem,
                ]}
                onPress={() => handleDaySelect(item)}
              >
                <Text
                  style={[styles.dayName, isSelected && styles.selectedDayText]}
                >
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
          })}
        </ScrollView>

        {/* Selected Day Slots */}
        <View style={styles.slotsSection}>
          <View style={styles.slotsSectionHeader}>
            <Text style={styles.slotsSectionTitle}>
              {format(parseISO(selectedDay.date), "EEEE, MMMM d, yyyy")}
            </Text>
            <TouchableOpacity
              style={[styles.addButton, loading && styles.disabledButton]}
              onPress={() => setIsAddSlotModalVisible(true)}
              disabled={loading}
            >
              <Icon name="plus" size={16} color={Colors.white} />
              <Text style={styles.addButtonText}>
                {loading ? "Loading..." : "Add Slot"}
              </Text>
            </TouchableOpacity>
          </View>

          {selectedDay.slots.length > 0 ? (
            <ScrollView
              style={styles.slotsContainer}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {selectedDay.slots.map((slot, index) => {
                console.log(
                  "🔍 Rendering slot:",
                  index,
                  "ID:",
                  slot.id,
                  "Time:",
                  slot.startTime,
                  "-",
                  slot.endTime
                );
                return (
                  <TimeSlotItem
                    key={slot.id || `slot-${index}-${Math.random()}`}
                    slot={slot}
                    onEdit={() => slot.id && handleEditSlot(slot.id)}
                    onDelete={() => slot.id && handleDeleteSlot(slot.id)}
                  />
                );
              })}
            </ScrollView>
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
      </View>

      {/* Add Slot Modal */}
      <AddSlotModal
        visible={isAddSlotModalVisible}
        onClose={() => setIsAddSlotModalVisible(false)}
        onSave={handleAddSlot}
        selectedDate={selectedDay.date}
        loading={loading}
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
    padding: 8,
  },
  weekNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8, // Further reduced from 12
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
    paddingHorizontal: 8,
    marginBottom: 0, // Reduced to work with the positive marginTop in slotsSection
    minHeight: 90, // Increased minimum height for better visibility
  },
  dayItem: {
    width: 65,
    height: 70,
    marginHorizontal: 3,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
    elevation: 2, // Add slight elevation for visibility
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedDayItem: {
    backgroundColor: Colors.primary500,
    borderColor: Colors.primary600,
    borderWidth: 2,
    elevation: 0, // Remove elevation/shadow on selected item
    shadowOpacity: 0, // Remove shadow completely
  },
  todayItem: {
    borderColor: Colors.primary300,
    borderWidth: 1,
  },
  dayName: {
    fontSize: 12, // Slightly smaller font
    color: Colors.textLight,
    marginBottom: 4, // Reduced from 8
  },
  selectedDayText: {
    color: Colors.white, // Changed to white for visibility on primary background
    fontWeight: "600",
  },
  dayNumber: {
    width: 32, // Slightly smaller
    height: 32, // Slightly smaller
    borderRadius: 16,
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
    fontSize: 14, // Slightly smaller font
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
    marginTop: 10, // Changed from negative margin to positive margin
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flex: 1, // Add flex: 1 to make it fill available space
  },
  slotsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4, // Further reduced from 12
  },
  slotsSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary500,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: Colors.textLight,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: "600",
    marginLeft: 4,
  },
  emptySlots: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 40, // Add more space at the top to center the content
    marginBottom: 40, // Add space at bottom as well
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
  slotsContainer: {
   
    maxHeight: 700, // Limit height to prevent taking too much space
    paddingVertical: 2, // Minimal padding
    // marginTop: -8, // Reduced margin for better spacing
  },
});

export default AvailabilityScreen;
