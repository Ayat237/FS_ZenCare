import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, addDays, parseISO, isAfter, isBefore, isEqual } from 'date-fns';

// Components
import TimeSlotItem from '../../components/doctor/TimeSlotItem';
import AddSlotModal from '../../components/doctor/AddSlotModal';

// Theme
import Colors from '../../theme/colors';

// Types
import { TimeSlot, DayAvailability, WeekAvailability } from '../../types/availability';

const AvailabilityScreen: React.FC = () => {
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
        date: format(date, 'yyyy-MM-dd'),
        dayName: format(date, 'EEEE'),
        dayOfMonth: date.getDate(),
        month: format(date, 'MMMM'),
        slots: [],
      });
    }
    
    return {
      days,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(addDays(startDate, 6), 'yyyy-MM-dd'),
    };
  });

  // State for the selected day
  const [selectedDay, setSelectedDay] = useState<DayAvailability>(currentWeek.days[0]);
  
  // State for the add slot modal
  const [isAddSlotModalVisible, setIsAddSlotModalVisible] = useState(false);

  // Mock data for time slots (in a real app, this would come from an API)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    {
      id: '1',
      day: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '09:30',
      duration: 30,
      type: 'telemedicine',
      isRecurring: true,
    },
    {
      id: '2',
      day: format(new Date(), 'yyyy-MM-dd'),
      startTime: '10:00',
      endTime: '10:30',
      duration: 30,
      type: 'in-person',
      isRecurring: false,
    },
  ]);

  // Effect to update the slots for the selected day
  useEffect(() => {
    // In a real app, you would fetch the slots for the selected day from an API
    const updatedDays = currentWeek.days.map(day => {
      if (day.date === selectedDay.date) {
        return {
          ...day,
          slots: timeSlots.filter(slot => slot.day === day.date),
        };
      }
      return day;
    });

    setCurrentWeek(prev => ({
      ...prev,
      days: updatedDays,
    }));
  }, [timeSlots, selectedDay.date]);

  // Handle day selection
  const handleDaySelect = (day: DayAvailability) => {
    setSelectedDay(day);
  };

  // Handle adding a new slot
  const handleAddSlot = (newSlot: TimeSlot) => {
    // Check for overlapping slots
    const isOverlapping = timeSlots.some(slot => {
      if (slot.day !== newSlot.day) return false;
      
      const newSlotStart = parseISO(`${newSlot.day}T${newSlot.startTime}:00`);
      const newSlotEnd = parseISO(`${newSlot.day}T${newSlot.endTime}:00`);
      const existingSlotStart = parseISO(`${slot.day}T${slot.startTime}:00`);
      const existingSlotEnd = parseISO(`${slot.day}T${slot.endTime}:00`);
      
      // Check if the new slot overlaps with an existing slot
      return (
        (isAfter(newSlotStart, existingSlotStart) && isBefore(newSlotStart, existingSlotEnd)) ||
        (isAfter(newSlotEnd, existingSlotStart) && isBefore(newSlotEnd, existingSlotEnd)) ||
        (isBefore(newSlotStart, existingSlotStart) && isAfter(newSlotEnd, existingSlotEnd)) ||
        isEqual(newSlotStart, existingSlotStart) ||
        isEqual(newSlotEnd, existingSlotEnd)
      );
    });

    if (isOverlapping) {
      Alert.alert('Time Conflict', 'This slot overlaps with an existing slot. Please choose a different time.');
      return;
    }

    // Add the new slot
    setTimeSlots(prev => [...prev, { ...newSlot, id: `slot-${Date.now()}` }]);
    setIsAddSlotModalVisible(false);
  };

  // Handle editing a slot
  const handleEditSlot = (slotId: string) => {
    const slotToEdit = timeSlots.find(slot => slot.id === slotId);
    if (slotToEdit) {
      // In a real app, you would open the edit modal with the slot data
      Alert.alert('Edit Slot', 'Edit slot functionality would be implemented here.');
    }
  };

  // Handle deleting a slot
  const handleDeleteSlot = (slotId: string) => {
    Alert.alert(
      'Delete Slot',
      'Are you sure you want to delete this time slot?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTimeSlots(prev => prev.filter(slot => slot.id !== slotId));
          },
        },
      ],
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
        date: format(date, 'yyyy-MM-dd'),
        dayName: format(date, 'EEEE'),
        dayOfMonth: date.getDate(),
        month: format(date, 'MMMM'),
        slots: [],
      });
    }
    
    setCurrentWeek({
      days,
      startDate: format(newStartDate, 'yyyy-MM-dd'),
      endDate: format(addDays(newStartDate, 6), 'yyyy-MM-dd'),
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
        date: format(date, 'yyyy-MM-dd'),
        dayName: format(date, 'EEEE'),
        dayOfMonth: date.getDate(),
        month: format(date, 'MMMM'),
        slots: [],
      });
    }
    
    setCurrentWeek({
      days,
      startDate: format(newStartDate, 'yyyy-MM-dd'),
      endDate: format(addDays(newStartDate, 6), 'yyyy-MM-dd'),
    });
    setSelectedDay(days[0]);
  };

  // Render day item for the week view
  const renderDayItem = ({ item }: { item: DayAvailability }) => {
    const isSelected = item.date === selectedDay.date;
    const isToday = item.date === format(new Date(), 'yyyy-MM-dd');
    
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
          <TouchableOpacity style={styles.weekNavButton} onPress={goToPreviousWeek}>
            <Icon name="chevron-left" size={24} color={Colors.primary500} />
          </TouchableOpacity>
          
          <Text style={styles.weekRangeText}>
            {format(parseISO(currentWeek.startDate), 'MMM d')} - {format(parseISO(currentWeek.endDate), 'MMM d, yyyy')}
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
              {format(parseISO(selectedDay.date), 'EEEE, MMMM d, yyyy')}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsAddSlotModalVisible(true)}
            >
              <Icon name="plus" size={16} color={Colors.white} />
              <Text style={styles.addButtonText}>Add Slot</Text>
            </TouchableOpacity>
          </View>
          
          {selectedDay.slots.length > 0 ? (
            selectedDay.slots.map((slot) => (
              <TimeSlotItem
                key={slot.id}
                slot={slot}
                onEdit={() => handleEditSlot(slot.id)}
                onDelete={() => handleDeleteSlot(slot.id)}
              />
            ))
          ) : (
            <View style={styles.emptySlots}>
              <Icon name="calendar-clock" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No time slots available for this day</Text>
              <Text style={styles.emptySubtext}>Tap the "Add Slot" button to create a new time slot</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Add Slot Modal */}
      <AddSlotModal
        visible={isAddSlotModalVisible}
        onClose={() => setIsAddSlotModalVisible(false)}
        onSave={handleAddSlot}
        selectedDate={selectedDay.date}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  weekNavButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  weekRangeText: {
    fontSize: 16,
    fontWeight: '600',
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
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
    fontWeight: '600',
  },
  dayNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayNumber: {
    backgroundColor: Colors.primary500,
  },
  todayNumber: {
    backgroundColor: Colors.primary300,
  },
  dayNumberText: {
    fontSize: 16,
    fontWeight: '600',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  slotsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  slotsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary500,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptySlots: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textLight,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default AvailabilityScreen;