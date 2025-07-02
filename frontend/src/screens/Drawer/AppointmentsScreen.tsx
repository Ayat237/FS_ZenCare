import React, { useState, useRef, useEffect, ReactElement } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
  TextInput,
  ScrollView,
  StatusBar,
  Dimensions,
  SectionList,
  Linking,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Colors from "@theme/colors";
import { DrawerScreenProps } from "@/types/navigation";
import { format } from "date-fns";

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: "Virtual" | "In-person";
  status: "Upcoming" | "Completed" | "Cancelled";
  image: any;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: any;
  rating: number;
  availableSlots?: TimeSlot[];
}

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "telemedicine" | "in-person";
}

interface NewAppointment {
  id: string;
  doctorName: string;
  date: string;
  time: string;
  type: "telemedicine" | "in-person";
  status: "confirmed" | "completed";
  joinUrl?: string;
  doctorImage: any;
}

// Dummy specialties
const specialties = [
  "All",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Ophthalmology",
  "Gynecology",
  "General Medicine",
  "Endocrinology",
  "Gastroenterology",
];

// Dummy doctors with specialties
const dummyDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    image: require("@/assets/images/doctor1.png"),
    rating: 4.8,
    availableSlots: [
      { id: "s1", date: "2025-07-01", startTime: "10:00", endTime: "10:30", type: "telemedicine" },
      { id: "s2", date: "2025-07-01", startTime: "11:00", endTime: "11:30", type: "telemedicine" },
      { id: "s3", date: "2025-07-02", startTime: "14:00", endTime: "14:30", type: "in-person" },
    ],
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialty: "Dermatology",
    image: require("@/assets/images/doctor2.png"),
    rating: 4.7,
    availableSlots: [
      { id: "s4", date: "2025-07-01", startTime: "09:00", endTime: "09:30", type: "in-person" },
      { id: "s5", date: "2025-07-01", startTime: "13:00", endTime: "13:30", type: "telemedicine" },
    ],
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    specialty: "Neurology",
    image: require("@/assets/images/doctor1.png"),
    rating: 4.9,
    availableSlots: [
      { id: "s6", date: "2025-07-02", startTime: "10:00", endTime: "10:30", type: "telemedicine" },
      { id: "s7", date: "2025-07-03", startTime: "15:00", endTime: "15:30", type: "telemedicine" },
    ],
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    specialty: "Orthopedics",
    image: require("@/assets/images/doctor2.png"),
    rating: 4.6,
    availableSlots: [
      { id: "s8", date: "2025-07-01", startTime: "11:00", endTime: "11:30", type: "in-person" },
      { id: "s9", date: "2025-07-02", startTime: "14:00", endTime: "14:30", type: "in-person" },
    ],
  },
  {
    id: "5",
    name: "Dr. Lisa Patel",
    specialty: "Pediatrics",
    image: require("@/assets/images/doctor1.png"),
    rating: 4.9,
    availableSlots: [
      { id: "s10", date: "2025-07-01", startTime: "09:00", endTime: "09:30", type: "telemedicine" },
      { id: "s11", date: "2025-07-01", startTime: "10:00", endTime: "10:30", type: "telemedicine" },
    ],
  },
];

// Dummy appointments for the current patient
const dummyNewAppointments: NewAppointment[] = [
  // Upcoming appointments
  {
    id: "a1",
    doctorName: "Dr. Sarah Johnson",
    date: "2025-07-01",
    time: "10:00 - 10:30",
    type: "telemedicine",
    status: "confirmed",
    joinUrl: "https://zoom.us/j/123456",
    doctorImage: require("@/assets/images/doctor1.png"),
  },
  {
    id: "a2",
    doctorName: "Dr. Michael Chen",
    date: "2025-07-02",
    time: "14:00 - 14:30",
    type: "in-person",
    status: "confirmed",
    doctorImage: require("@/assets/images/doctor2.png"),
  },
  {
    id: "a3",
    doctorName: "Dr. Emily Wilson",
    date: "2025-07-03",
    time: "11:00 - 11:30",
    type: "telemedicine",
    status: "completed",
    doctorImage: require("@/assets/images/doctor2.png"),
  },
  
  // History appointments
  {
    id: "a4",
    doctorName: "Dr. James Rodriguez",
    date: "2025-06-28",
    time: "10:00 - 10:30",
    type: "telemedicine",
    status: "completed",
    joinUrl: "https://zoom.us/j/789012",
    doctorImage: require("@/assets/images/doctor1.png"),
  },
  {
    id: "4",
    doctorName: "Dr. James Wilson",
    date: "2025-06-25",
    time: "15:30 - 16:00",
    type: "in-person",
    status: "completed",
    doctorImage: require("@/assets/images/doctor2.png"),
  },
];

// Legacy dummy appointments (keeping for reference)
const dummyAppointments: Appointment[] = [
  {
    id: "1",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    date: "May 15, 2023",
    time: "10:30 AM",
    type: "Virtual",
    status: "Upcoming",
    image: require("@/assets/images/doctor1.png"),
  },
  {
    id: "2",
    doctorName: "Dr. Michael Chen",
    specialty: "Dermatologist",
    date: "May 18, 2023",
    time: "2:00 PM",
    type: "In-person",
    status: "Upcoming",
    image: require("@/assets/images/doctor2.png"),
  },
  {
    id: "3",
    doctorName: "Dr. Emily Rodriguez",
    specialty: "Neurologist",
    date: "May 10, 2023",
    time: "9:15 AM",
    type: "Virtual",
    status: "Completed",
    image: require("@/assets/images/doctor1.png"),
  },
  {
    id: "4",
    doctorName: "Dr. James Wilson",
    specialty: "Orthopedist",
    date: "May 5, 2023",
    time: "3:45 PM",
    type: "In-person",
    status: "Cancelled",
    image: require("@/assets/images/doctor2.png"),
  },
];

const AppointmentItem = ({ item }: { item: Appointment }) => {
  const [expanded, setExpanded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return Colors.primary500;
      case "Completed":
        return "#4CAF50";
      case "Cancelled":
        return Colors.error500;
      default:
        return Colors.primary500;
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
    outputRange: [100, 180]
  });

  return (
    <TouchableOpacity 
      style={styles.appointmentCardContainer}
      activeOpacity={0.9}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={toggleExpand}
    >
      <Animated.View 
        style={[
          styles.appointmentCard, 
          { 
            transform: [{ scale: scaleAnim }],
            height: expanded ? maxHeight : undefined
          }
        ]}
      >
        <View style={styles.appointmentHeader}>
          <Image source={item.image} style={styles.doctorImage} />
          <View style={styles.appointmentInfo}>
            <Text style={styles.doctorName}>{item.doctorName}</Text>
            <Text style={styles.specialty}>{item.specialty}</Text>
            <View style={styles.appointmentDetails}>
              <Icon name="calendar" size={14} color={Colors.primary400} />
              <Text style={styles.detailText}>{item.date}</Text>
              <Icon
                name="clock-outline"
                size={14}
                color={Colors.primary400}
                style={styles.icon}
              />
              <Text style={styles.detailText}>{item.time}</Text>
            </View>
            <View style={styles.appointmentType}>
              <Icon
                name={item.type === "Virtual" ? "video" : "hospital-building"}
                size={14}
                color={Colors.primary400}
              />
              <Text style={styles.detailText}>{item.type}</Text>
            </View>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status}
          </Text>
        </View>
        
        {expanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            <View style={styles.actionButtons}>
              {item.status === "Upcoming" && (
                <>
                  <TouchableOpacity style={[styles.actionButton, styles.rescheduleButton]}>
                    <Icon name="calendar-clock" size={16} color={Colors.primary500} />
                    <Text style={styles.rescheduleButtonText}>Reschedule</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
                    <Icon name="close-circle-outline" size={16} color={Colors.error500} />
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
              
              {item.status === "Completed" && (
                <TouchableOpacity style={[styles.actionButton, styles.reviewButton]}>
                  <Icon name="star-outline" size={16} color={"#FF9800"} />
                  <Text style={[styles.actionButtonText, {color: "#FF9800"}]}>Leave Review</Text>
                </TouchableOpacity>
              )}
              
              {item.status === "Cancelled" && (
                <TouchableOpacity style={[styles.actionButton, styles.rescheduleButton]}>
                  <Icon name="refresh" size={16} color={Colors.primary500} />
                  <Text style={styles.rescheduleButtonText}>Book Again</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Doctor card component with expandable time slots
interface DoctorCardProps {
  doctor: Doctor;
  onSlotSelect: (doctor: Doctor, slot: TimeSlot) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onSlotSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const toggleExpand = () => {
    setExpanded(!expanded);
    if (!expanded) {
      setSelectedDate(null);
      setSelectedSlot(null);
    }
  };

  const handleSlotPress = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    onSlotSelect(doctor, slot);
  };

  // Group slots by date
  const slotsByDate = doctor.availableSlots?.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const dates = slotsByDate ? Object.keys(slotsByDate).sort() : [];
  const slotsForSelectedDate = selectedDate && slotsByDate ? slotsByDate[selectedDate] || [] : [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleBookAppointment = () => {
    if (selectedSlot) {
      onSlotSelect(doctor, selectedSlot);
    } else if (slotsForSelectedDate?.length) {
      onSlotSelect(doctor, slotsForSelectedDate[0]);
    }
  };

  return (
    <View style={styles.doctorCard}>
      <View style={styles.doctorHeader}>
        <Image source={doctor.image} style={styles.doctorImage} />
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFC107" />
            <Text style={styles.ratingText}>
              {doctor.rating.toFixed(1)}
              <Text style={styles.ratingTotal}>/5.0</Text>
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.viewAvailabilityButton}
          onPress={toggleExpand}
        >
          <Text style={styles.viewAvailabilityText}>
            {expanded ? 'Hide' : 'View Slots'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {expanded && (
        <View style={styles.timeSlotsContainer}>
          <Text style={styles.timeSlotsTitle}>Available Time Slots</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateSelector}
          >
            {dates.map((date) => (
              <TouchableOpacity
                key={date}
                style={[
                  styles.dateButton,
                  selectedDate === date && styles.selectedDateButton
                ]}
                onPress={() => handleDateSelect(date)}
              >
                <Text
                  style={[
                    styles.dateButtonText,
                    selectedDate === date && styles.selectedDateText
                  ]}
                >
                  {formatDate(date)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {selectedDate ? (
            <View style={styles.timeSlotsGrid}>
              {slotsForSelectedDate.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.timeSlotButton,
                    selectedSlot?.id === slot.id && styles.selectedTimeSlot,
                    {
                      backgroundColor: slot.type === 'telemedicine' 
                        ? 'rgba(59, 130, 246, 0.1)' 
                        : 'rgba(16, 185, 129, 0.1)'
                    }
                  ]}
                  onPress={() => handleSlotPress(slot)}
                >
                  <Text style={styles.timeSlotText}>
                    {slot.startTime} - {slot.endTime}
                  </Text>
                  <View 
                    style={[
                      styles.slotTypeBadge,
                      {
                        backgroundColor: selectedSlot?.id === slot.id
                          ? slot.type === 'telemedicine' ? '#3B82F6' : '#10B981'
                          : 'transparent',
                        borderColor: slot.type === 'telemedicine' ? '#3B82F6' : '#10B981'
                      }
                    ]}
                  >
                    <Icon 
                      name={slot.type === 'telemedicine' ? 'video' : 'hospital-building'} 
                      size={12} 
                      color={selectedSlot?.id === slot.id ? '#FFF' : (slot.type === 'telemedicine' ? '#3B82F6' : '#10B981')} 
                    />
                    <Text 
                      style={[
                        styles.slotTypeText,
                        {
                          color: selectedSlot?.id === slot.id 
                            ? '#FFF' 
                            : slot.type === 'telemedicine' ? '#3B82F6' : '#10B981'
                        }
                      ]}
                    >
                      {slot.type === 'telemedicine' ? 'Video' : 'In-Person'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.selectDateText}>Select a date to see available time slots</Text>
          )}
        </View>
      )}
    </View>
  );
};

// New appointment item component with modern design
const NewAppointmentItem = ({ item }: { item: NewAppointment }) => {
  const isUpcoming = item.status === "confirmed";
  const isTelemedicine = item.type === "telemedicine";
  const isPast = item.status === "completed";
  
  const getStatusColor = (status: string) => {
    return status === "confirmed" ? "#4F46E5" : "#10B981"; // Indigo-600 for confirmed, Emerald-500 for completed
  };
  
  const statusColor = getStatusColor(item.status);
  const statusText = item.status.charAt(0).toUpperCase() + item.status.slice(1);
  
  const handleJoinMeeting = () => {
    if (item.joinUrl) {
      Linking.openURL(item.joinUrl);
    }
  };
  
  return (
    <View style={[styles.appointmentCardContainer, isPast && styles.pastAppointment]}>
      <View style={[
        styles.appointmentCard,
        {
          borderLeftWidth: 4,
          borderLeftColor: statusColor,
          backgroundColor: isPast ? '#F9FAFB' : '#FFF',
        }
      ]}>
        <View style={styles.appointmentHeader}>
          <View style={styles.doctorImageContainer}>
            <Image 
              source={item.doctorImage} 
              style={[
                styles.doctorImage,
                isPast && { opacity: 0.7 }
              ]} 
            />

          </View>
          
          <View style={styles.appointmentInfo}>
            <Text style={[
              styles.doctorName, 
              isPast && styles.pastText
            ]}>
              {item.doctorName}
            </Text>
            
            <View style={styles.appointmentDetails}>
              <View style={styles.detailItem}>
                <Icon 
                  name="calendar" 
                  size={14} 
                  color={isPast ? '#9CA3AF' : '#6B7280'} 
                />
                <Text style={[
                  styles.detailText, 
                  isPast && styles.pastText
                ]}>
                  {format(new Date(item.date), "MMM d, yyyy")}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Icon 
                  name="clock-outline" 
                  size={14} 
                  color={isPast ? '#9CA3AF' : '#6B7280'}
                />
                <Text style={[
                  styles.detailText, 
                  isPast && styles.pastText
                ]}>
                  {item.time}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Icon
                  name={isTelemedicine ? "video" : "hospital-building"}
                  size={14}
                  color={isPast ? '#9CA3AF' : '#6B7280'}
                />
                <Text style={[
                  styles.detailText, 
                  isPast && styles.pastText
                ]}>
                  {isTelemedicine ? "Video Consultation" : "In-person Visit"}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {isUpcoming && isTelemedicine && item.status === "confirmed" && (
          <TouchableOpacity 
            style={styles.joinMeetingButton}
            onPress={handleJoinMeeting}
            activeOpacity={0.8}
          >
            <Icon name="video" size={16} color="#FFF" />
            <Text style={styles.joinMeetingText}>Join Meeting</Text>
            <Icon name="arrow-right" size={16} color="#FFF" style={styles.joinMeetingIcon} />
          </TouchableOpacity>
        )}
        
        {isPast && (
          <View style={styles.pastAppointmentOverlay}>
            <Text style={styles.pastAppointmentText}>Completed</Text>
          </View>
        )}
      </View>
    </View>
  );
};

type SectionType = {
  title: string;
  data: any[];
  renderItem: (info: { item: any }) => ReactElement;
};

const AppointmentsScreen: React.FC<DrawerScreenProps<"Appointments">> = ({
  navigation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [activeTab, setActiveTab] = useState('Available Doctors');
  const headerAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Animate header on scroll
  useEffect(() => {
    const headerTranslateY = scrollY.interpolate({
      inputRange: [0, 50],
      outputRange: [0, -5],
      extrapolate: 'clamp',
    });
    
    Animated.spring(headerAnim, {
      toValue: headerTranslateY,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, []);
  
  // Filter doctors by specialty and search query
  const filteredDoctors = dummyDoctors.filter(doctor => {
    const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty;
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });
  
  // Split appointments into upcoming and history
  const upcomingAppointments = dummyNewAppointments.filter(
    app => app.status === "confirmed"
  );
  
  const appointmentHistory = dummyNewAppointments.filter(
    app => app.status === "completed"
  );
  
  // Handle time slot selection
  const handleSlotSelect = (doctor: Doctor, slot: TimeSlot) => {
    // In a real app, this would open a booking confirmation modal or navigate to a booking screen
    console.log(`Selected ${slot.startTime}-${slot.endTime} with ${doctor.name} on ${slot.date}`);
    // For now, just show an alert
    Alert.alert(`Appointment slot selected: ${slot.startTime}-${slot.endTime} with ${doctor.name}`);
  };
  
  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Available Doctors':
        return (
          <View style={styles.doctorsSection}>
            {/* Specialties filter */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.specialtiesContainer}
            >
              {specialties.map((specialty) => (
                <TouchableOpacity 
                  key={specialty}
                  style={[
                    styles.specialtyChip, 
                    selectedSpecialty === specialty && styles.activeSpecialtyChip
                  ]}
                  onPress={() => setSelectedSpecialty(specialty)}
                >
                  <Text 
                    style={[
                      styles.specialtyChipText, 
                      selectedSpecialty === specialty && styles.activeSpecialtyChipText
                    ]}
                  >
                    {specialty}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Doctors list */}
            {filteredDoctors.length > 0 ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {filteredDoctors.map(doctor => (
                  <DoctorCard 
                    key={doctor.id} 
                    doctor={doctor} 
                    onSlotSelect={handleSlotSelect} 
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="doctor" size={60} color={Colors.primary200} />
                <Text style={styles.emptyText}>No doctors found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your filters or search</Text>
              </View>
            )}
          </View>
        );
      case 'My Appointments':
        return (
          <FlatList
            data={upcomingAppointments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <NewAppointmentItem item={item} />}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="calendar-clock" size={60} color={Colors.primary200} />
                <Text style={styles.emptyText}>No upcoming appointments</Text>
                <Text style={styles.emptySubtext}>Book an appointment with a doctor</Text>
              </View>
            }
          />
        );
      case 'Appointment History':
        return (
          <FlatList
            data={appointmentHistory}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <NewAppointmentItem item={item} />}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="history" size={60} color={Colors.primary200} />
                <Text style={styles.emptyText}>No appointment history</Text>
                <Text style={styles.emptySubtext}>Your past appointments will appear here</Text>
              </View>
            }
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <Animated.View style={[styles.header, { transform: [{ translateY: headerAnim }] }]}>
        <View style={styles.headerTop}>
        <TouchableOpacity style={styles.addButton}>
            <Icon name="bell-outline" size={24} color={Colors.primary600} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Appointments</Text>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.menuButton}
          >
            <Icon name="menu" size={24} color={Colors.primary600} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color={Colors.primary400} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors or specialties"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.primary300}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={16} color={Colors.primary400} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Available Doctors" && styles.activeTab]}
            onPress={() => setActiveTab("Available Doctors")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Available Doctors" && styles.activeTabText,
              ]}
            >
              Available Doctors
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "My Appointments" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("My Appointments")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "My Appointments" && styles.activeTabText,
              ]}
            >
              My Appointments
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "Appointment History" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("Appointment History")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Appointment History" && styles.activeTabText,
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {renderTabContent()}
    </SafeAreaView>
  );
};

export default AppointmentsScreen;

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  
  // Header
  header: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary600,
    letterSpacing: -0.5,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
  },
  
  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary600,
    paddingVertical: 0,
  },
  
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary500,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: Colors.primary500,
    fontWeight: '500',
  },
  
  // Section List
  sectionListContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary600,
  },
  
  // Specialties Filter
  specialtiesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
  },
  specialtyChip: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.primary100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  activeSpecialtyChip: {
    backgroundColor: Colors.primary500,
    borderColor: Colors.primary500,
  },
  specialtyChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary500,
  },
  activeSpecialtyChipText: {
    color: "#FFF",
  },
  
  // Doctor Card
  doctorsSection: {
    marginBottom: 16,
  },
  doctorCard: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doctorCardContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: "hidden",
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#F5F7FA",
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    maxWidth: '80%',
  },
  specialty: {
    fontSize: 14,
    color: Colors.primary400,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: Colors.primary600,
    marginLeft: 4,
  },
  ratingTotal: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 2,
  },
  viewAvailabilityButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  viewAvailabilityText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Time Slots
  timeSlotsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  timeSlotsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary600,
    marginBottom: 12,
  },
  dateSelector: {
    paddingVertical: 4,
    paddingRight: 16,
  },
  dateButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  selectedDateButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#4B5563',
  },
  selectedDateText: {
    color: '#FFF',
    fontWeight: '500',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 12,
  },
  timeSlotButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  selectedTimeSlot: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  slotTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'center',
    marginTop: 4,
  },
  slotTypeText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  selectDateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 12,
  },
  bookButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  bookButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Appointment Card
  appointmentCardContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  pastAppointment: {
    opacity: 0.85,
  },
  appointmentCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },

  doctorImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  appointmentTypeBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  appointmentHeader: {
    flexDirection: "row",
    position: 'relative',
  },
  doctorInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentDetails: {
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  appointmentType: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginLeft: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 8,
    fontWeight: '400',
  },
  pastText: {
    color: Colors.textMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  joinMeetingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  joinMeetingIcon: {
    marginLeft: 8,
  },
  pastAppointmentOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  pastAppointmentText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  joinMeetingText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
    marginLeft: 8,
  },
  
  // Empty States
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.primary400,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: Colors.primary500,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  filterChipIcon: {
    marginRight: 4,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary500,
    textAlign: 'center',
  },
  activeFilterChipText: {
    color: "#FFF",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  expandedContent: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  rescheduleButton: {
    backgroundColor: Colors.primary50,
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: Colors.error500 + "10",
  },
  reviewButton: {
    backgroundColor: "#FFF9C4",
  },
  rescheduleButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary500,
    marginLeft: 4,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.error500,
    marginLeft: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
});
