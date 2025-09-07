import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  KeyboardAvoidingView,
  Alert,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from "@react-native-community/datetimepicker";

// Theme
import Colors from "../../theme/colors";

// Types
import { TimeSlot } from "../../types/availability";

interface AddSlotModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (slot: TimeSlot) => void;
  selectedDate: string;
  loading?: boolean;
  editingSlot?: TimeSlot | null;
}

const AddSlotModal: React.FC<AddSlotModalProps> = ({
  visible,
  onClose,
  onSave,
  selectedDate,
  loading = false,
  editingSlot = null,
}) => {
  // State for the form
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(() => {
    const date = new Date();
    date.setHours(date.getHours() + 1);
    return date;
  });
  const [duration, setDuration] = useState<number>(30);
  const [type, setType] = useState<"telemedicine" | "inperson">("telemedicine");
  const [price, setPrice] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState(false);

  // State for time pickers
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Effect to populate form when editing
  useEffect(() => {
    if (editingSlot) {
      // Parse times from string format (HH:MM)
      const [startHour, startMin] = editingSlot.startTime
        .split(":")
        .map(Number);
      const [endHour, endMin] = editingSlot.endTime.split(":").map(Number);

      const startDate = new Date();
      startDate.setHours(startHour, startMin, 0, 0);

      const endDate = new Date();
      endDate.setHours(endHour, endMin, 0, 0);

      setStartTime(startDate);
      setEndTime(endDate);
      setDuration(editingSlot.duration);
      setType(editingSlot.type);
      setPrice(editingSlot.price.toString());
      setIsRecurring(editingSlot.isRecurring || false);
    } else {
      // Reset form for new slot
      const now = new Date();
      setStartTime(now);
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      setEndTime(oneHourLater);
      setDuration(30);
      setType("telemedicine");
      setPrice("");
      setIsRecurring(false);
    }
  }, [editingSlot, visible]);

  // Update duration when start or end time changes
  useEffect(() => {
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffMins = Math.round(diffMs / 60000);

    // Round to nearest valid duration
    if (diffMins <= 15) {
      setDuration(15);
    } else if (diffMins <= 30) {
      setDuration(30);
    } else if (diffMins <= 45) {
      setDuration(45);
    } else {
      setDuration(60);
    }
  }, [startTime, endTime]);

  // Handle start time change
  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setStartTime(selectedTime);

      // Ensure end time is after start time
      if (selectedTime >= endTime) {
        const newEndTime = new Date(selectedTime);
        newEndTime.setMinutes(selectedTime.getMinutes() + duration);
        setEndTime(newEndTime);
      }
    }
  };

  // Handle end time change
  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      // Ensure end time is after start time
      if (selectedTime > startTime) {
        setEndTime(selectedTime);
      } else {
        Alert.alert("Invalid Time", "End time must be after start time");
      }
    }
  };

  // Handle duration change
  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);

    // Update end time based on new duration
    const newEndTime = new Date(startTime);
    newEndTime.setMinutes(startTime.getMinutes() + newDuration);
    setEndTime(newEndTime);
  };

  // Format time for display
  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  // Format time for saving (24-hour format)
  const formatTimeForSave = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Handle save
  const handleSave = () => {
    // Validate times
    if (endTime <= startTime) {
      Alert.alert("Invalid Time", "End time must be after start time");
      return;
    }

    // Validate price
    const priceNumber = parseFloat(price);
    if (!price || isNaN(priceNumber) || priceNumber <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid price greater than 0");
      return;
    }

    // Create new slot
    const newSlot: TimeSlot = {
      id: "", // Will be set by the parent component
      day: selectedDate,
      startTime: formatTimeForSave(startTime),
      endTime: formatTimeForSave(endTime),
      duration,
      type,
      price: priceNumber,
      isRecurring,
    };

    onSave(newSlot);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingSlot ? "Edit Availability Slot" : "Add Availability Slot"}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color="#555" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Time Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Time Range</Text>
              <View style={styles.timeRangeContainer}>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Icon
                    name="clock-outline"
                    size={20}
                    color={Colors.primary500}
                    style={styles.timeIcon}
                  />
                  <Text style={styles.timeText}>{formatTime(startTime)}</Text>
                </TouchableOpacity>

                <Text style={styles.toText}>to</Text>

                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <Icon
                    name="clock-outline"
                    size={20}
                    color={Colors.primary500}
                    style={styles.timeIcon}
                  />
                  <Text style={styles.timeText}>{formatTime(endTime)}</Text>
                </TouchableOpacity>
              </View>

              {showStartTimePicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={handleStartTimeChange}
                />
              )}

              {showEndTimePicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={handleEndTimeChange}
                />
              )}
            </View>

            {/* Duration Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Duration</Text>
              <View style={styles.durationContainer}>
                {[15, 30, 45, 60].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.durationButton,
                      duration === value && styles.selectedDurationButton,
                    ]}
                    onPress={() =>
                      handleDurationChange(value as 15 | 30 | 45 | 60)
                    }
                  >
                    <Text
                      style={[
                        styles.durationButtonText,
                        duration === value && styles.selectedDurationButtonText,
                      ]}
                    >
                      {value} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Consultation Type */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Consultation Type</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === "telemedicine" && styles.selectedTypeButton,
                  ]}
                  onPress={() => setType("telemedicine")}
                >
                  <Icon
                    name="video"
                    size={20}
                    color={
                      type === "telemedicine" ? Colors.white : Colors.primary500
                    }
                    style={styles.typeIcon}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === "telemedicine" && styles.selectedTypeButtonText,
                    ]}
                  >
                    Telemedicine
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === "inperson" && styles.selectedTypeButton,
                  ]}
                  onPress={() => setType("inperson")}
                >
                  <Icon
                    name="hospital-building"
                    size={20}
                    color={
                      type === "inperson" ? Colors.white : Colors.primary500
                    }
                    style={styles.typeIcon}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === "inperson" && styles.selectedTypeButtonText,
                    ]}
                  >
                    In-Person
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Price Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Price (EGP)</Text>
              <TextInput
                style={styles.priceInput}
                value={price}
                onChangeText={setPrice}
                placeholder="Enter consultation price"
                keyboardType="numeric"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            {/* Recurring Option */}
            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Repeat Weekly</Text>
                <Switch
                  value={isRecurring}
                  onValueChange={setIsRecurring}
                  trackColor={{ false: "#D1D1D6", true: Colors.primary200 }}
                  thumbColor={isRecurring ? Colors.primary500 : "#F4F4F4"}
                />
              </View>
              {isRecurring && (
                <Text style={styles.helperText}>
                  This slot will be available every week on the same day and
                  time
                </Text>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledSaveButton]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading
                  ? editingSlot
                    ? "Updating..."
                    : "Creating..."
                  : editingSlot
                  ? "Update Slot"
                  : "Save Slot"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
  },
  timeRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    flex: 1,
  },
  timeIcon: {
    marginRight: 8,
  },
  timeText: {
    fontSize: 16,
    color: Colors.text,
  },
  toText: {
    marginHorizontal: 10,
    fontSize: 16,
    color: Colors.textLight,
  },
  durationContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  durationButton: {
    width: "23%",
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  selectedDurationButton: {
    backgroundColor: Colors.primary500,
  },
  durationButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  selectedDurationButtonText: {
    color: Colors.white,
  },
  typeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  selectedTypeButton: {
    backgroundColor: Colors.primary500,
  },
  typeIcon: {
    marginRight: 8,
  },
  typeButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  selectedTypeButtonText: {
    color: Colors.white,
  },
  priceInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  helperText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    borderRightWidth: 0.5,
    borderRightColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    backgroundColor: Colors.primary500,
  },
  disabledSaveButton: {
    backgroundColor: Colors.textLight,
  },
  saveButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: "600",
  },
});

export default AddSlotModal;
