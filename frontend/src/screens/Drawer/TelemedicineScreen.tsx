import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Alert,
  SafeAreaView,
  SectionList,
  Animated,
  TextInput,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@theme/colors';
import { DrawerScreenProps } from '@/types/navigation';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  experience: string;
  availability: string;
  image: any;
  price: string;
  availableSlots?: TimeSlot[];
}

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "telemedicine" | "in-person";
}

interface Appointment {
  id: string;
  doctorName: string;
  date: string;
  time: string;
  type: "telemedicine" | "in-person";
  status: "confirmed" | "pending" | "cancelled" | "completed";
  joinUrl?: string;
  doctorImage: any;
}

const dummyDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    rating: 4.8,
    reviewCount: 124,
    experience: '10 years',
    availability: 'Available today',
    image: require('@/assets/images/doctor1.png'),
    price: '$50',
    availableSlots: [
      { id: "s1", date: "2023-07-01", startTime: "10:00", endTime: "10:30", type: "telemedicine" },
      { id: "s2", date: "2023-07-01", startTime: "11:00", endTime: "11:30", type: "telemedicine" },
      { id: "s3", date: "2023-07-02", startTime: "14:00", endTime: "14:30", type: "telemedicine" },
    ],
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Dermatologist',
    rating: 4.7,
    reviewCount: 98,
    experience: '8 years',
    availability: 'Available tomorrow',
    image: require('@/assets/images/doctor2.png'),
    price: '$45',
    availableSlots: [
      { id: "s4", date: "2023-07-01", startTime: "09:00", endTime: "09:30", type: "telemedicine" },
      { id: "s5", date: "2023-07-01", startTime: "13:00", endTime: "13:30", type: "telemedicine" },
    ],
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Neurologist',
    rating: 4.9,
    reviewCount: 156,
    experience: '12 years',
    availability: 'Available today',
    image: require('@/assets/images/doctor1.png'),
    price: '$55',
    availableSlots: [
      { id: "s6", date: "2023-07-02", startTime: "10:00", endTime: "10:30", type: "telemedicine" },
      { id: "s7", date: "2023-07-03", startTime: "15:00", endTime: "15:30", type: "telemedicine" },
    ],
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    specialty: 'Orthopedist',
    rating: 4.6,
    reviewCount: 87,
    experience: '7 years',
    availability: 'Available in 2 days',
    image: require('@/assets/images/doctor2.png'),
    price: '$40',
    availableSlots: [
      { id: "s8", date: "2023-07-01", startTime: "11:00", endTime: "11:30", type: "telemedicine" },
      { id: "s9", date: "2023-07-02", startTime: "14:00", endTime: "14:30", type: "telemedicine" },
    ],
  },
];

// Dummy appointments for the current patient
const dummyAppointments: Appointment[] = [
  // Upcoming appointments
  {
    id: "a1",
    doctorName: "Dr. Sarah Johnson",
    date: "2023-07-01",
    time: "10:00 - 10:30",
    type: "telemedicine",
    status: "confirmed",
    joinUrl: "https://zoom.us/j/123456",
    doctorImage: require("@/assets/images/doctor1.png"),
  },
  {
    id: "a2",
    doctorName: "Dr. Michael Chen",
    date: "2023-07-02",
    time: "14:00 - 14:30",
    type: "telemedicine",
    status: "confirmed",
    joinUrl: "https://zoom.us/j/789012",
    doctorImage: require("@/assets/images/doctor2.png"),
  },
  {
    id: "a3",
    doctorName: "Dr. Emily Rodriguez",
    date: "2023-07-03",
    time: "11:00 - 11:30",
    type: "telemedicine",
    status: "pending",
    doctorImage: require("@/assets/images/doctor1.png"),
  },
  
  // History appointments
  {
    id: "a4",
    doctorName: "Dr. James Wilson",
    date: "2023-06-28",
    time: "10:00 - 10:30",
    type: "telemedicine",
    status: "completed",
    doctorImage: require("@/assets/images/doctor2.png"),
  },
  {
    id: "a5",
    doctorName: "Dr. Lisa Patel",
    date: "2023-06-25",
    time: "15:30 - 16:00",
    type: "telemedicine",
    status: "cancelled",
    doctorImage: require("@/assets/images/doctor1.png"),
  },
];

const specialties = [
  { id: '1', name: 'Cardiology', icon: 'heart-pulse' },
  { id: '2', name: 'Dermatology', icon: 'face-man' },
  { id: '3', name: 'Neurology', icon: 'brain' },
  { id: '4', name: 'Orthopedics', icon: 'bone' },
  { id: '5', name: 'Pediatrics', icon: 'baby-face-outline' },
  { id: '6', name: 'Psychiatry', icon: 'head-cog-outline' },
];

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

  return (
    <View style={styles.doctorCard}>
      <View style={styles.doctorHeader}>
        <Image source={doctor.image} style={styles.doctorImage} />
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFC107" />
            <Text style={styles.ratingText}>
              {doctor.rating.toFixed(1)}
              <Text style={styles.ratingTotal}>/5.0</Text>
            </Text>
          </View>
          <View style={styles.experienceContainer}>
            <Icon name="briefcase-outline" size={14} color="#666" />
            <Text style={styles.experienceText}>{doctor.experience}</Text>
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
                    selectedSlot?.id === slot.id && styles.selectedTimeSlot
                  ]}
                  onPress={() => handleSlotPress(slot)}
                >
                  <Text style={styles.timeSlotText}>
                    {slot.startTime} - {slot.endTime}
                  </Text>
                  <View style={styles.slotTypeIndicator}>
                    <Icon name="video" size={12} color={Colors.primary500} />
                    <Text style={styles.slotTypeText}>Telemedicine</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noSlotsContainer}>
              <Text style={styles.noSlotsText}>Select a date to see available slots</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// Appointment item component
const AppointmentItem = ({ item }: { item: Appointment }) => {
  const isUpcoming = item.status === "confirmed" || item.status === "pending";
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return Colors.primary500;
      case "pending":
        return Colors.warning;
      case "completed":
        return Colors.success;
      case "cancelled":
        return Colors.error500;
      default:
        return Colors.primary500;
    }
  };
  
  const handleJoinMeeting = () => {
    if (item.joinUrl) {
      Linking.openURL(item.joinUrl);
    }
  };
  
  return (
    <View style={[styles.appointmentCardContainer, !isUpcoming && styles.pastAppointment]}>
      <View style={styles.appointmentCard}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
        <View style={styles.appointmentHeader}>
          <Image source={item.doctorImage} style={styles.doctorImage} />
          <View style={styles.appointmentInfo}>
            <Text style={[styles.doctorName, !isUpcoming && styles.pastText]}>{item.doctorName}</Text>
            <View style={styles.appointmentDetails}>
              <Icon name="calendar" size={14} color={isUpcoming ? Colors.primary400 : Colors.textMuted} />
              <Text style={[styles.detailText, !isUpcoming && styles.pastText]}>
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              <Icon
                name="clock-outline"
                size={14}
                color={isUpcoming ? Colors.primary400 : Colors.textMuted}
                style={styles.icon}
              />
              <Text style={[styles.detailText, !isUpcoming && styles.pastText]}>{item.time}</Text>
            </View>
            <View style={styles.appointmentType}>
              <Icon
                name="video"
                size={14}
                color={isUpcoming ? Colors.primary400 : Colors.textMuted}
              />
              <Text style={[styles.detailText, !isUpcoming && styles.pastText]}>Telemedicine</Text>
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
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
        
        {isUpcoming && item.status === "confirmed" && item.joinUrl && (
          <TouchableOpacity 
            style={styles.joinMeetingButton}
            onPress={handleJoinMeeting}
          >
            <Icon name="video" size={16} color={Colors.white} />
            <Text style={styles.joinMeetingText}>Join Meeting</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const SpecialtyCard = ({ item }: { item: { id: string; name: string; icon: string } }) => {
  return (
    <TouchableOpacity style={styles.specialtyCard}>
      <View style={styles.specialtyIconContainer}>
        <Icon name={item.icon} size={24} color={Colors.primary500} />
      </View>
      <Text style={styles.specialtyName}>{item.name}</Text>
    </TouchableOpacity>
  );
};

type SectionType = {
  title: string;
  data: any[];
  renderItem: (info: { item: any }) => React.ReactElement;
};

const TelemedicineScreen: React.FC<DrawerScreenProps<'Telemedicine'>> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  
  // Filter doctors by specialty and search query
  const filteredDoctors = dummyDoctors.filter(doctor => {
    const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty;
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });
  
  // Split appointments into upcoming and history
  const upcomingAppointments = dummyAppointments.filter(
    app => app.status === "confirmed" || app.status === "pending"
  );
  
  const appointmentHistory = dummyAppointments.filter(
    app => app.status === "completed" || app.status === "cancelled"
  );
  
  // Handle time slot selection
  const handleSlotSelect = (doctor: Doctor, slot: TimeSlot) => {
    // In a real app, this would open a booking confirmation modal or navigate to a booking screen
    Alert.alert(
      'Book Telemedicine Appointment',
      `Would you like to book a telemedicine appointment with ${doctor.name} on ${new Date(slot.date).toLocaleDateString()} at ${slot.startTime}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            // Show success message
            Alert.alert(
              'Appointment Booked',
              `Your telemedicine appointment with ${doctor.name} has been scheduled. You will receive a confirmation shortly.`,
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };
  
  // Prepare data for section list
  const sections: SectionType[] = [
    {
      title: "Available Doctors",
      data: [filteredDoctors],
      renderItem: () => (
        <View style={styles.doctorsSection}>
          {/* Specialties filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.specialtiesContainer}
          >
            {specialties.map((specialty) => (
              <TouchableOpacity 
                key={specialty.id}
                style={[
                  styles.specialtyChip, 
                  selectedSpecialty === specialty.name && styles.activeSpecialtyChip
                ]}
                onPress={() => setSelectedSpecialty(specialty.name)}
              >
                <Icon name={specialty.icon} size={16} color={selectedSpecialty === specialty.name ? Colors.white : Colors.primary500} />
                <Text 
                  style={[
                    styles.specialtyChipText, 
                    selectedSpecialty === specialty.name && styles.activeSpecialtyChipText
                  ]}
                >
                  {specialty.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Doctors list */}
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map(doctor => (
              <DoctorCard 
                key={doctor.id} 
                doctor={doctor} 
                onSlotSelect={handleSlotSelect} 
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="doctor" size={60} color={Colors.primary200} />
              <Text style={styles.emptyText}>No doctors found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters or search</Text>
            </View>
          )}
        </View>
      ),
    },
    {
      title: "My Appointments",
      data: upcomingAppointments,
      renderItem: ({ item }: { item: Appointment }) => <AppointmentItem item={item} />,
    },
    {
      title: "Appointment History",
      data: appointmentHistory,
      renderItem: ({ item }: { item: Appointment }) => <AppointmentItem item={item} />,
    },
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { transform: [{ translateY: headerAnim }] }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.menuButton}
          >
            <Icon name="menu" size={24} color={Colors.primary600} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Telemedicine</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="bell-outline" size={24} color={Colors.primary600} />
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
      </Animated.View>
      
      <SectionList<any, SectionType>
        sections={sections}
        keyExtractor={(item, index) => item?.id || index.toString()}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sectionListContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
    </SafeAreaView>
  );
};

export default TelemedicineScreen;

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
  notificationButton: {
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 12,
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
  specialtyChipIcon: {
    marginRight: 4,
  },
  specialtyChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary500,
    marginLeft: 4,
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
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    fontWeight: '700',
    color: Colors.primary600,
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: Colors.primary400,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experienceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  viewAvailabilityButton: {
    backgroundColor: Colors.primary500,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  viewAvailabilityText: {
    color: '#FFF',
    fontSize: 12,
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
    backgroundColor: Colors.primary500,
    borderColor: Colors.primary500,
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
    borderColor: Colors.primary500,
    borderWidth: 2,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  slotTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignSelf: 'center',
  },
  slotTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary500,
    marginLeft: 2,
  },
  noSlotsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  noSlotsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Appointment Card
  appointmentCardContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  pastAppointment: {
    opacity: 0.7,
  },
  appointmentCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: "hidden",
  },
  statusIndicator: {
    position: "absolute",
    left: 0,
    top: 16,
    bottom: 16,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  appointmentHeader: {
    flexDirection: "row",
  },
  appointmentInfo: {
    flex: 1,
    justifyContent: "center",
  },
  appointmentDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  appointmentType: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginLeft: 8,
  },
  detailText: {
    fontSize: 12,
    color: Colors.primary400,
    marginLeft: 4,
    marginRight: 8,
  },
  pastText: {
    color: Colors.textMuted,
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  joinMeetingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary500,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 12,
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
  
  // Legacy styles (keeping for compatibility)
  specialtyCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  specialtyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  specialtyName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary500,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },
});