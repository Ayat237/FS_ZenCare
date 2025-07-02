import React, { useState, useRef, useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  FlatList, 
  ScrollView,
  Animated,
  Dimensions,
  StatusBar
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Colors from "@theme/colors";
import { Card } from "@components/ui";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'appointment' | 'medication' | 'reminder';
  details: string;
}

// Get today's date and next few days for realistic dummy data
const getTodayPlusDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const today = getTodayPlusDays(0);
const tomorrow = getTodayPlusDays(1);
const dayAfterTomorrow = getTodayPlusDays(2);
const nextWeek = getTodayPlusDays(7);

const dummyEvents: { [date: string]: CalendarEvent[] } = {
  [today]: [
    {
      id: '1',
      title: 'Dr. Sarah Johnson',
      time: '10:30 AM',
      type: 'appointment',
      details: 'Cardiology checkup - Annual heart examination',
    },
    {
      id: '2',
      title: 'Take Medication',
      time: '8:00 AM',
      type: 'medication',
      details: 'Amoxicillin 500mg - Take with food',
    },
    {
      id: '3',
      title: 'Blood Pressure Check',
      time: '7:00 PM',
      type: 'reminder',
      details: 'Record readings in health app',
    },
  ],
  [tomorrow]: [
    {
      id: '4',
      title: 'Lab Test Results',
      time: '2:00 PM',
      type: 'reminder',
      details: 'Check online portal for blood test results',
    },
    {
      id: '5',
      title: 'Take Medication',
      time: '9:00 AM',
      type: 'medication',
      details: 'Lisinopril 10mg - Take on empty stomach',
    },
  ],
  [dayAfterTomorrow]: [
    {
      id: '6',
      title: 'Dr. Michael Chen',
      time: '3:30 PM',
      type: 'appointment',
      details: 'Dermatology consultation - Skin rash follow-up',
    },
    {
      id: '7',
      title: 'Physical Therapy',
      time: '11:00 AM',
      type: 'appointment',
      details: 'Shoulder rehabilitation session',
    },
  ],
  [nextWeek]: [
    {
      id: '8',
      title: 'Dr. Emily Rodriguez',
      time: '1:15 PM',
      type: 'appointment',
      details: 'Annual physical examination',
    },
    {
      id: '9',
      title: 'Dental Cleaning',
      time: '10:00 AM',
      type: 'appointment',
      details: 'Regular 6-month cleaning with Dr. Wilson',
    },
  ],
};

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const EventItem = ({ item }: { item: CalendarEvent }) => {
  const [expanded, setExpanded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  
  const getIconName = () => {
    switch (item.type) {
      case 'appointment':
        return 'doctor';
      case 'medication':
        return 'pill';
      case 'reminder':
        return 'bell';
      default:
        return 'calendar';
    }
  };
  
  const getTypeColor = () => {
    switch (item.type) {
      case 'appointment':
        return Colors.primary300;
      case 'medication':
        return '#4CAF50';
      case 'reminder':
        return '#FF9800';
      default:
        return Colors.primary300;
    }
  };
  
  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  
  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  
  const toggleExpand = () => {
    setExpanded(!expanded);
    Animated.timing(expandAnim, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  
  const maxHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 120]
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={toggleExpand}
    >
      <Animated.View style={[styles.eventCard, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.eventTypeIndicator, { backgroundColor: getTypeColor() }]} />
        <View style={styles.eventContent}>
          <View style={[styles.eventIcon, { backgroundColor: getTypeColor() }]}>
            <Icon name={getIconName()} size={20} color="#FFF" />
          </View>
          <View style={styles.eventDetails}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventTime}>{item.time}</Text>
            <Text 
              style={[styles.eventDescription, expanded && {marginBottom: 8}]}
              numberOfLines={expanded ? undefined : 1}
            >
              {item.details}
            </Text>
          </View>
        </View>
        
        {expanded && (
          <View style={styles.eventActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="pencil" size={16} color={Colors.primary500} />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="trash-can-outline" size={16} color={Colors.error500} />
              <Text style={[styles.actionButtonText, {color: Colors.error500}]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const CalendarScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const scrollViewRef = useRef<ScrollView>(null);
  const headerAnim = useRef(new Animated.Value(0)).current;
  
  // Format the selected date for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Function to handle date selection
  const handleDateSelect = (date: string, index: number) => {
    setSelectedDate(date);
    
    // Scroll to the selected date
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * 72, animated: true });
    }
  };

  // Get available dates that have events
  const availableDates = Object.keys(dummyEvents);
  
  // Get event count by type
  const getEventCountByType = () => {
    const events = dummyEvents[selectedDate] || [];
    const appointmentCount = events.filter(e => e.type === 'appointment').length;
    const medicationCount = events.filter(e => e.type === 'medication').length;
    const reminderCount = events.filter(e => e.type === 'reminder').length;
    
    return { appointmentCount, medicationCount, reminderCount };
  };
  
  const { appointmentCount, medicationCount, reminderCount } = getEventCountByType();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <Animated.View style={[styles.header, { transform: [{ translateY: headerAnim }] }]}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Calendar</Text>
          <TouchableOpacity 
            style={styles.appointmentsButton}
            onPress={() => navigation.navigate('Drawer', { screen: 'Appointments' })}
          >
            <Text style={styles.appointmentsButtonText}>View All</Text>
            <Icon name="chevron-right" size={20} color={Colors.primary600} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.eventSummary}>
          <TouchableOpacity style={styles.eventTypeCount}>
            <View style={[styles.eventTypeIcon, { backgroundColor: Colors.primary300 }]}>
              <Icon name="doctor" size={14} color="#FFF" />
            </View>
            <Text style={styles.eventTypeText}>{appointmentCount} Appointments</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.eventTypeCount}>
            <View style={[styles.eventTypeIcon, { backgroundColor: '#4CAF50' }]}>
              <Icon name="pill" size={14} color="#FFF" />
            </View>
            <Text style={styles.eventTypeText}>{medicationCount} Medications</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.eventTypeCount}>
            <View style={[styles.eventTypeIcon, { backgroundColor: '#FF9800' }]}>
              <Icon name="bell" size={14} color="#FFF" />
            </View>
            <Text style={styles.eventTypeText}>{reminderCount} Reminders</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Date selector */}
      <View style={styles.dateSelector}>
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.dateSelectorContent}
          decelerationRate="fast"
          snapToInterval={72}
        >
          {availableDates.map((date, index) => {
            const isSelected = date === selectedDate;
            const dateObj = new Date(date);
            const day = dateObj.getDate();
            const month = dateObj.toLocaleString('default', { month: 'short' });
            const weekday = dateObj.toLocaleString('default', { weekday: 'short' });
            const isToday = date === today;
            
            return (
              <TouchableOpacity 
                key={date} 
                style={[styles.dateItem, isSelected && styles.selectedDateItem]}
                onPress={() => handleDateSelect(date, index)}
              >
                <Text style={[styles.dateItemWeekday, isSelected && styles.selectedDateText]}>{weekday}</Text>
                <Text style={[styles.dateItemDay, isSelected && styles.selectedDateText]}>{day}</Text>
                <Text style={[styles.dateItemMonth, isSelected && styles.selectedDateText]}>{month}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.calendarPlaceholder}>
        <Text style={styles.dateText}>Schedule for</Text>
        <Text style={styles.dateSubtext}>{formatDisplayDate(selectedDate)}</Text>
      </View>
      
      <FlatList
        data={dummyEvents[selectedDate] || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventItem item={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="calendar-blank" size={50} color={Colors.primary300} />
            <Text style={styles.emptyText}>No events scheduled for today</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary600,
  },
  appointmentsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  appointmentsButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.primary600,
    marginRight: 4,
  },
  eventSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventTypeCount: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventTypeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  eventTypeText: {
    fontSize: 12,
    color: "#6B7280",
  },
  // Date selector styles
  dateSelector: {
    backgroundColor: "#FFF",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  dateSelectorContent: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    alignItems: 'center',
    gap: 8,
  },
  dateItem: {
    width: 64,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 6,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  selectedDateItem: {
    backgroundColor: Colors.primary600,
    elevation: 4,
    shadowColor: Colors.primary600,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  dateItemWeekday: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
    textTransform: "uppercase",
    textAlign: 'center',
  },
  dateItemMonth: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    textAlign: 'center',
  },
  dateItemDay: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#374151",
    textAlign: 'center',
  },
  selectedDateText: {
    color: "#FFFFFF",
  },
  todayIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary300,
    position: "absolute",
    bottom: 8,
  },
  calendarPlaceholder: {
    padding: 16,
    backgroundColor: Colors.primary100,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary600,
  },
  dateSubtext: {
    fontSize: 14,
    color: Colors.primary400,
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  eventCard: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  eventTypeIndicator: {
    height: 4,
    width: "100%",
  },
  eventContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  eventIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary600,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: Colors.primary400,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  eventActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.primary500,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default CalendarScreen;
