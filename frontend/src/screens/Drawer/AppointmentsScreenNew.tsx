import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  Alert,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Modal,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Colors from "@theme/colors";
import { DrawerScreenProps } from "@/types/navigation";
import { format, addDays } from "date-fns";

// Services
import { doctorsService, DoctorResponse } from "@/services/api/doctors";
import { slotsService, SlotResponse } from "@/services/api/slots";

interface DoctorDetailsModalProps {
  visible: boolean;
  doctor: DoctorResponse | null;
  onClose: () => void;
}

const DoctorDetailsModal: React.FC<DoctorDetailsModalProps> = ({
  visible,
  doctor,
  onClose,
}) => {
  if (!visible || !doctor) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.detailsModalOverlay}>
        <View style={styles.detailsModalContent}>
          <View style={styles.detailsModalHeader}>
            <Text style={styles.detailsModalTitle}>Doctor Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.detailsScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Doctor Profile Section */}
            <View style={styles.detailsProfileSection}>
              <View style={styles.detailsImageContainer}>
                {doctor.profileImage?.URL?.secure_url ? (
                  <Image
                    source={{ uri: doctor.profileImage.URL.secure_url }}
                    style={styles.detailsImage}
                  />
                ) : (
                  <View style={styles.detailsDefaultImage}>
                    <Icon name="account" size={40} color={Colors.textMuted} />
                  </View>
                )}
              </View>
              <Text style={styles.detailsName}>
                Dr. {doctor.user?.firstName || "Unknown"}{" "}
                {doctor.user?.lastName || "Doctor"}
              </Text>
              <Text style={styles.detailsSpecialty}>
                {doctor.specialty || "General Practice"}
              </Text>
              {doctor.yearsOfExperience && (
                <Text style={styles.detailsExperience}>
                  {doctor.yearsOfExperience} years of experience
                </Text>
              )}
            </View>

            {/* Professional Info */}
            <View style={styles.detailsSection}>
              <Text style={styles.detailsSectionTitle}>
                Professional Information
              </Text>

              <View style={styles.detailsInfoCard}>
                <View style={styles.detailsInfoRow}>
                  <Icon name="briefcase" size={16} color={Colors.primary500} />
                  <View style={styles.detailsInfoContent}>
                    <Text style={styles.detailsInfoLabel}>Experience</Text>
                    <Text style={styles.detailsInfoValue}>
                      {doctor.yearsOfExperience || 0} years
                    </Text>
                  </View>
                </View>

                {doctor.rating && doctor.rating.average > 0 && (
                  <View style={styles.detailsInfoRow}>
                    <Icon name="star" size={16} color={Colors.warning} />
                    <View style={styles.detailsInfoContent}>
                      <Text style={styles.detailsInfoLabel}>Rating</Text>
                      <Text style={styles.detailsInfoValue}>
                        {doctor.rating.average.toFixed(1)} (
                        {doctor.rating.count || 0} reviews)
                      </Text>
                    </View>
                  </View>
                )}

                <View style={[styles.detailsInfoRow, { marginBottom: 0 }]}>
                  <Icon name="account" size={16} color={Colors.primary500} />
                  <View style={styles.detailsInfoContent}>
                    <Text style={styles.detailsInfoLabel}>Gender</Text>
                    <Text style={styles.detailsInfoValue}>
                      {doctor.user?.gender || "Not specified"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Certifications */}
            {doctor.certifications && doctor.certifications.length > 0 && (
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Certifications</Text>
                <View style={styles.detailsInfoCard}>
                  {doctor.certifications.map((cert, index) => (
                    <View key={index} style={styles.detailsInfoRow}>
                      <Icon
                        name="certificate"
                        size={16}
                        color={Colors.primary500}
                      />
                      <View style={styles.detailsInfoContent}>
                        <Text style={styles.detailsInfoValue}>{cert}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Hospital Affiliations */}
            {doctor.hospitalAffiliation &&
              doctor.hospitalAffiliation.length > 0 && (
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>
                    Hospital Affiliations
                  </Text>
                  {doctor.hospitalAffiliation.map((hospital, index) => (
                    <View key={index} style={styles.hospitalCard}>
                      <Icon
                        name="hospital-building"
                        size={16}
                        color={Colors.primary500}
                      />
                      <View style={styles.hospitalInfo}>
                        <Text style={styles.hospitalName}>{hospital.name}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

            {/* Clinic Locations */}
            {doctor.clinicBranches && doctor.clinicBranches.length > 0 && (
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Clinic Locations</Text>
                {doctor.clinicBranches.map((clinic, index) => (
                  <View key={index} style={styles.clinicCard}>
                    <Icon
                      name="map-marker"
                      size={18}
                      color={Colors.primary500}
                    />
                    <View style={styles.clinicInfo}>
                      <Text style={styles.clinicName}>
                        Clinic Branch {index + 1}
                      </Text>
                      {clinic.phoneNumber && (
                        <View style={styles.clinicContactRow}>
                          <Icon
                            name="phone"
                            size={14}
                            color={Colors.textMuted}
                          />
                          <Text style={styles.clinicPhone}>
                            {clinic.phoneNumber}
                          </Text>
                        </View>
                      )}
                      {clinic.address && (
                        <View style={styles.clinicContactRow}>
                          <Icon
                            name="map-marker-outline"
                            size={14}
                            color={Colors.textMuted}
                          />
                          <Text style={styles.clinicAddress}>
                            {typeof clinic.address === "object" &&
                            clinic.address?.displayName
                              ? clinic.address.displayName
                              : typeof clinic.address === "string"
                              ? clinic.address
                              : "Address details available"}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Contact Information */}
            <View style={styles.detailsSection}>
              <Text style={styles.detailsSectionTitle}>
                Contact Information
              </Text>

              <View style={styles.detailsInfoCard}>
                {doctor.user?.email && (
                  <View style={styles.detailsInfoRow}>
                    <Icon name="email" size={16} color={Colors.primary500} />
                    <View style={styles.detailsInfoContent}>
                      <Text style={styles.detailsInfoLabel}>Email</Text>
                      <Text style={styles.detailsInfoValue}>
                        {doctor.user.email}
                      </Text>
                    </View>
                  </View>
                )}

                {doctor.user?.mobilePhone && (
                  <View
                    style={[
                      styles.detailsInfoRow,
                      doctor.user?.email ? {} : { marginBottom: 0 },
                    ]}
                  >
                    <Icon name="phone" size={16} color={Colors.primary500} />
                    <View style={styles.detailsInfoContent}>
                      <Text style={styles.detailsInfoLabel}>Phone</Text>
                      <Text style={styles.detailsInfoValue}>
                        {doctor.user.mobilePhone}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Show message if no contact info available */}
                {!doctor.user?.email && !doctor.user?.mobilePhone && (
                  <View style={[styles.detailsInfoRow, { marginBottom: 0 }]}>
                    <Icon
                      name="information"
                      size={16}
                      color={Colors.textMuted}
                    />
                    <View style={styles.detailsInfoContent}>
                      <Text style={styles.detailsInfoValue}>
                        No contact information available
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Education */}
            {doctor.education && doctor.education.length > 0 && (
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Education</Text>
                {doctor.education.map((edu, index) => (
                  <View key={index} style={styles.educationCard}>
                    <Icon name="school" size={16} color={Colors.primary500} />
                    <View style={styles.educationInfo}>
                      <Text style={styles.educationDegree}>{edu.degree}</Text>
                      <Text style={styles.educationInstitution}>
                        {edu.institution}
                      </Text>
                      {edu.graduationYear && (
                        <Text style={styles.educationYear}>
                          Graduated: {edu.graduationYear}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* About section can be added when bio property is available */}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

interface DoctorSlotsModalProps {
  visible: boolean;
  doctor: DoctorResponse | null;
  onClose: () => void;
  navigation: any;
}

const DoctorSlotsModal: React.FC<DoctorSlotsModalProps> = ({
  visible,
  doctor,
  onClose,
  navigation,
}) => {
  const [slots, setSlots] = useState<SlotResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedType, setSelectedType] = useState<
    "all" | "telemedicine" | "inperson"
  >("all");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Generate next 14 days for horizontal date picker
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  useEffect(() => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      dates.push(addDays(new Date(), i));
    }
    setAvailableDates(dates);
  }, []);

  useEffect(() => {
    if (visible && doctor) {
      fetchDoctorSlots();
    }
  }, [visible, doctor, selectedDate]);

  const fetchDoctorSlots = async () => {
    if (!doctor) return;

    try {
      setLoading(true);
      const dateString = selectedDate.toISOString().split("T")[0];
      const doctorSlots = await doctorsService.getDoctorSlots(
        doctor._id,
        dateString
      );

      // Filter by type if not "all"
      let filteredSlots = doctorSlots;
      if (selectedType !== "all") {
        filteredSlots = doctorSlots.filter(
          (slot) => slot.type === selectedType
        );
      }

      setSlots(filteredSlots);
    } catch (error: any) {
      console.log("Error fetching doctor slots:", error);
      Alert.alert("Error", "Failed to fetch doctor slots");
      setSlots([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Update slots when type filter changes
  useEffect(() => {
    if (slots.length > 0) {
      fetchDoctorSlots();
    }
  }, [selectedType]);

  // Convert 24h time to AM/PM format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const renderSlotItem = ({ item }: { item: SlotResponse }) => (
    <View style={styles.slotItem}>
      <View style={styles.slotInfo}>
        <Text style={styles.slotDate}>
          {format(new Date(item.date), "MMM dd, yyyy")}
        </Text>
        <Text style={styles.slotTime}>
          {formatTime(item.startTime)} - {formatTime(item.endTime)}
        </Text>
        <View style={styles.slotDetails}>
          <View
            style={[
              styles.typeTag,
              item.type === "telemedicine"
                ? styles.telemedicineTag
                : styles.inpersonTag,
            ]}
          >
            <Text
              style={[
                styles.typeText,
                item.type === "telemedicine"
                  ? styles.telemedicineText
                  : styles.inpersonText,
              ]}
            >
              {item.type === "telemedicine" ? "Video Call" : "In-Person"}
            </Text>
          </View>
          <Text style={styles.slotPrice}>EGP {item.price}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.bookButton, item.isBooked && styles.bookedButton]}
        disabled={item.isBooked}
        onPress={() => {
          if (doctor) {
            navigation.navigate("BookAppointment", {
              doctor: doctor,
              slot: item,
            });
            onClose(); // Close the slots modal
          }
        }}
      >
        <Text
          style={[
            styles.bookButtonText,
            item.isBooked && styles.bookedButtonText,
          ]}
        >
          {item.isBooked ? "Booked" : "Book"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            Dr. {doctor?.user?.firstName} {doctor?.user?.lastName} - Available
            Slots
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Date and Type Filters */}
        <View style={styles.filtersContainer}>
          {/* Date Selector */}
          <View style={styles.dateContainer}>
            <Icon name="calendar" size={16} color={Colors.primary500} />
            <Text style={styles.filterLabel}>Date:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {format(selectedDate, "MMM dd")}
              </Text>
              <Icon name="chevron-down" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Horizontal Date Picker */}
          <View style={styles.horizontalDateContainer}>
            <FlatList
              data={availableDates}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.toISOString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.horizontalDateButton,
                    item.toDateString() === selectedDate.toDateString() &&
                      styles.selectedHorizontalDateButton,
                  ]}
                  onPress={() => setSelectedDate(item)}
                >
                  <Text
                    style={[
                      styles.horizontalDateText,
                      item.toDateString() === selectedDate.toDateString() &&
                        styles.selectedHorizontalDateText,
                    ]}
                  >
                    {format(item, "dd")}
                  </Text>
                  <Text
                    style={[
                      styles.horizontalDateDay,
                      item.toDateString() === selectedDate.toDateString() &&
                        styles.selectedHorizontalDateDay,
                    ]}
                  >
                    {format(item, "EEE")}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.horizontalDateList}
            />
          </View>

          {/* Type Filter */}
          <View style={styles.typeFilterContainer}>
            <Icon name="filter-variant" size={16} color={Colors.primary500} />
            <Text style={styles.filterLabel}>Type:</Text>
            <View style={styles.typeButtons}>
              {[
                { key: "all", label: "All", icon: "view-list" },
                { key: "telemedicine", label: "Video", icon: "video" },
                { key: "inperson", label: "Visit", icon: "hospital-building" },
              ].map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeButton,
                    selectedType === type.key && styles.selectedTypeButton,
                  ]}
                  onPress={() => setSelectedType(type.key as any)}
                >
                  <Icon
                    name={type.icon}
                    size={12}
                    color={
                      selectedType === type.key
                        ? Colors.white
                        : Colors.primary500
                    }
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === type.key &&
                        styles.selectedTypeButtonText,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Native Date Picker Modal */}
        {showDatePicker && (
          <Modal transparent animationType="slide">
            <View style={styles.datePickerOverlay}>
              <View style={styles.datePickerContainer}>
                <View style={styles.datePickerHeader}>
                  <Text style={styles.datePickerTitle}>Select Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.datePickerCloseButton}
                  >
                    <Icon name="close" size={24} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, date) => {
                    if (Platform.OS === "android") {
                      setShowDatePicker(false);
                    }
                    if (date) {
                      setSelectedDate(date);
                    }
                  }}
                  minimumDate={new Date()}
                  maximumDate={addDays(new Date(), 30)}
                />
                {Platform.OS === "ios" && (
                  <View style={styles.datePickerActions}>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      style={[
                        styles.datePickerButton,
                        styles.datePickerCancelButton,
                      ]}
                    >
                      <Text style={styles.datePickerCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      style={[
                        styles.datePickerButton,
                        styles.datePickerConfirmButton,
                      ]}
                    >
                      <Text style={styles.datePickerConfirmText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </Modal>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary500} />
            <Text style={styles.loadingText}>Loading slots...</Text>
          </View>
        ) : (
          <FlatList
            data={slots}
            renderItem={renderSlotItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.slotsContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon
                  name="calendar-remove"
                  size={48}
                  color={Colors.textMuted}
                />
                <Text style={styles.emptyText}>No available slots</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const AppointmentsScreen: React.FC<DrawerScreenProps<"Appointments">> = ({
  navigation,
}) => {
  const [activeTab, setActiveTab] = useState<
    "available" | "upcoming" | "history"
  >("available");
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorResponse | null>(
    null
  );
  const [showSlotsModal, setShowSlotsModal] = useState(false);
  const [showDoctorDetails, setShowDoctorDetails] = useState(false);
  const [selectedDoctorForDetails, setSelectedDoctorForDetails] =
    useState<DoctorResponse | null>(null);

  // Get unique specialties from doctors
  const specialties = [
    "All",
    ...Array.from(new Set(doctors.map((d) => d.specialty))),
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchQuery, selectedSpecialty]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const fetchedDoctors = await doctorsService.getAllDoctors();
      // Filter only approved doctors
      const availableDoctors = fetchedDoctors.filter(
        (doctor) => doctor.isAdminApproved && doctor.user?.isVerified
      );
      setDoctors(availableDoctors);
    } catch (error: any) {
      console.log("Error fetching doctors:", error);
      Alert.alert("Error", "Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    // Filter by specialty
    if (selectedSpecialty !== "All") {
      filtered = filtered.filter(
        (doctor) =>
          doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doctor) =>
          doctor.user?.firstName?.toLowerCase().includes(query) ||
          doctor.user?.lastName?.toLowerCase().includes(query) ||
          doctor.specialty.toLowerCase().includes(query)
      );
    }

    setFilteredDoctors(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDoctors();
    setRefreshing(false);
  };

  const handleViewSlots = (doctor: DoctorResponse) => {
    setSelectedDoctor(doctor);
    setShowSlotsModal(true);
  };

  const handleViewDoctorDetails = (doctor: DoctorResponse) => {
    setSelectedDoctorForDetails(doctor);
    setShowDoctorDetails(true);
  };

  const renderSpecialtyItem = ({ item }: { item: string }) => {
    // Get icon for specialty
    const getSpecialtyIcon = (specialty: string) => {
      switch (specialty.toLowerCase()) {
        case "all":
          return "view-list";
        case "cardiology":
          return "heart-pulse";
        case "neurology":
          return "brain";
        case "dermatology":
          return "hand-heart";
        case "pediatrics":
          return "baby-face";
        case "orthopedics":
          return "bone";
        case "psychiatry":
          return "head-lightbulb";
        case "gynecology":
          return "human-female";
        case "urology":
          return "water-circle";
        case "ophthalmology":
          return "eye";
        case "dentistry":
          return "tooth";
        case "radiology":
          return "radioactive";
        case "anesthesiology":
          return "sleep";
        case "emergency medicine":
          return "ambulance";
        case "family medicine":
          return "account-group";
        case "internal medicine":
          return "stethoscope";
        default:
          return "medical-bag";
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.specialtyChip,
          selectedSpecialty === item && styles.selectedSpecialtyChip,
        ]}
        onPress={() => setSelectedSpecialty(item)}
      >
        <Icon
          name={getSpecialtyIcon(item)}
          size={14}
          color={selectedSpecialty === item ? Colors.white : Colors.primary500}
          style={styles.specialtyIcon}
        />
        <Text
          style={[
            styles.specialtyText,
            selectedSpecialty === item && styles.selectedSpecialtyText,
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDoctorItem = ({ item }: { item: DoctorResponse }) => (
    <View style={styles.doctorCard}>
      <View style={styles.doctorInfo}>
        <View style={styles.doctorHeader}>
          <View style={styles.doctorImageContainer}>
            {item.profileImage?.URL?.secure_url ? (
              <Image
                source={{ uri: item.profileImage.URL.secure_url }}
                style={styles.doctorImage}
                defaultSource={require("@/assets/images/doctor-icon.png")}
              />
            ) : (
              <View style={styles.defaultImageContainer}>
                <Icon name="account" size={30} color={Colors.textMuted} />
              </View>
            )}
          </View>
          <View style={styles.doctorDetails}>
            <Text style={styles.doctorName}>
              Dr. {item.user?.firstName} {item.user?.lastName}
            </Text>
            <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
            <View style={styles.doctorStats}>
              <View style={styles.statItem}>
                <Icon name="briefcase" size={14} color={Colors.textMuted} />
                <Text style={styles.statText}>
                  {item.yearsOfExperience} years
                </Text>
              </View>
              {item.rating && item.rating.average > 0 && (
                <View style={styles.statItem}>
                  <Icon name="star" size={14} color={Colors.warning} />
                  <Text style={styles.statText}>
                    {item.rating.average.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {item.hospitalAffiliation && item.hospitalAffiliation.length > 0 && (
          <Text style={styles.doctorDescription} numberOfLines={2}>
            {item.hospitalAffiliation[0]?.name}
          </Text>
        )}

        {item.certifications && item.certifications.length > 0 && (
          <View style={styles.feesContainer}>
            <View style={styles.feeItem}>
              <Icon name="certificate" size={16} color={Colors.primary500} />
              <Text style={styles.feeText}>
                Certified in {item.certifications.slice(0, 2).join(", ")}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.doctorActions}>
        <TouchableOpacity
          style={styles.doctorDetailsButton}
          onPress={() => handleViewDoctorDetails(item)}
        >
          <Icon name="account-details" size={16} color={Colors.primary500} />
          <Text style={styles.doctorDetailsButtonText}>Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewSlotsButton}
          onPress={() => handleViewSlots(item)}
        >
          <Icon name="calendar-clock" size={18} color={Colors.white} />
          <Text style={styles.viewSlotsButtonText}>View Slots</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabContent = () => {
    if (activeTab === "available") {
      return (
        <View style={styles.availableDoctorsContainer}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctors..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textMuted}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Icon name="close" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Specialty Filter */}
          <View style={styles.specialtyFilterContainer}>
            <FlatList
              data={specialties}
              renderItem={renderSpecialtyItem}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.specialtiesContainer}
              style={styles.specialtyList}
            />
          </View>

          {/* Doctors List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary500} />
              <Text style={styles.loadingText}>Loading doctors...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredDoctors}
              renderItem={renderDoctorItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.doctorsContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon
                    name="account-search"
                    size={48}
                    color={Colors.textMuted}
                  />
                  <Text style={styles.emptyText}>
                    {searchQuery || selectedSpecialty !== "All"
                      ? "No doctors found matching your criteria"
                      : "No doctors available"}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      );
    }

    // Placeholder for upcoming and history tabs
    return (
      <View style={styles.comingSoonContainer}>
        <Icon name="construction" size={48} color={Colors.textMuted} />
        <Text style={styles.comingSoonText}>
          {activeTab === "upcoming"
            ? "Upcoming Appointments"
            : "Appointment History"}
        </Text>
        <Text style={styles.comingSoonSubtext}>Coming soon...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.primary500} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.menuButton}
        >
          <Icon name="menu" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointments</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {["available", "upcoming", "history"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab === "available"
                ? "Available Doctors"
                : tab === "upcoming"
                ? "Upcoming"
                : "History"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>{renderTabContent()}</View>

      {/* Doctor Slots Modal */}
      <DoctorSlotsModal
        visible={showSlotsModal}
        doctor={selectedDoctor}
        navigation={navigation}
        onClose={() => {
          setShowSlotsModal(false);
          setSelectedDoctor(null);
        }}
      />

      {/* Doctor Details Modal */}
      <DoctorDetailsModal
        visible={showDoctorDetails}
        doctor={selectedDoctorForDetails}
        onClose={() => {
          setShowDoctorDetails(false);
          setSelectedDoctorForDetails(null);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary500,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white,
  },
  headerRight: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary500,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary500,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  availableDoctorsContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  specialtiesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  specialtyFilterContainer: {
    height: 60,
    marginBottom: 8,
  },
  specialtyList: {
    flexGrow: 0,
  },
  specialtyChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  selectedSpecialtyChip: {
    backgroundColor: Colors.primary500,
  },
  specialtyIcon: {
    marginRight: 6,
  },
  specialtyText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  selectedSpecialtyText: {
    color: Colors.white,
  },
  doctorsContainer: {
    paddingHorizontal: 16,
  },
  doctorCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  doctorInfo: {
    marginBottom: 16,
  },
  doctorHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  doctorImageContainer: {
    marginRight: 12,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  defaultImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: Colors.primary500,
    fontWeight: "500",
    marginBottom: 8,
  },
  doctorStats: {
    flexDirection: "row",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  doctorDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  feesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  feeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  feeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: "500",
  },
  viewSlotsButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 12,
    textAlign: "center",
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  comingSoonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginTop: 16,
    textAlign: "center",
  },
  comingSoonSubtext: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: "center",
  },
  // Modal styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    elevation: 999,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  slotsContainer: {
    paddingBottom: 20,
  },
  slotItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.gray50,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  slotInfo: {
    flex: 1,
  },
  slotDate: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  slotTime: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  slotDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  telemedicineTag: {
    backgroundColor: Colors.primary100,
  },
  inpersonTag: {
    backgroundColor: Colors.success100,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  telemedicineText: {
    color: Colors.primary600,
  },
  inpersonText: {
    color: Colors.success600,
  },
  slotPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  bookButton: {
    backgroundColor: Colors.primary500,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  bookedButton: {
    backgroundColor: Colors.gray300,
  },
  bookButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  bookedButtonText: {
    color: Colors.textMuted,
  },
  // Filter styles
  filtersContainer: {
    backgroundColor: Colors.gray50,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginLeft: 8,
    marginRight: 12,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary500,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  dateButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "500",
  },
  typeFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeButtons: {
    flexDirection: "row",
    flex: 1,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.primary500,
  },
  selectedTypeButton: {
    backgroundColor: Colors.primary500,
  },
  typeButtonText: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.primary500,
    marginLeft: 4,
  },
  selectedTypeButtonText: {
    color: Colors.white,
  },
  // Doctor Details Modal Styles
  detailsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
  },
  detailsModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    width: "90%",
    height: "80%",
    margin: 20,
  },
  detailsModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    paddingBottom: 20,
  },
  detailsModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    flex: 1,
  },
  detailsScrollView: {
    flex: 1,
  },
  detailsProfileSection: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  detailsImageContainer: {
    marginBottom: 12,
  },
  detailsImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  detailsDefaultImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsName: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 6,
  },
  detailsSpecialty: {
    fontSize: 16,
    color: Colors.primary500,
    fontWeight: "600",
    textAlign: "center",
  },
  detailsExperience: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 4,
    fontStyle: "italic",
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    paddingBottom: 6,
  },
  detailsInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  detailsInfoCard: {
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  detailsInfoContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailsInfoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textMuted,
    marginBottom: 4,
  },
  detailsInfoValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: "400",
    lineHeight: 22,
  },
  hospitalCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.gray50,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  hospitalInfo: {
    flex: 1,
    marginLeft: 10,
  },
  hospitalName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  hospitalAddress: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  educationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.gray50,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  educationInfo: {
    flex: 1,
    marginLeft: 10,
  },
  educationDegree: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  educationInstitution: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  educationYear: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  detailsBio: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  // Doctor Actions Styles
  doctorActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  doctorDetailsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary500,
    paddingVertical: 10,
    borderRadius: 8,
  },
  doctorDetailsButtonText: {
    color: Colors.primary500,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  // Horizontal Date Picker Styles
  horizontalDateContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  horizontalDateList: {
    paddingHorizontal: 16,
  },
  horizontalDateButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    minWidth: 50,
  },
  selectedHorizontalDateButton: {
    backgroundColor: Colors.primary500,
    borderColor: Colors.primary500,
  },
  horizontalDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  selectedHorizontalDateText: {
    color: Colors.white,
  },
  horizontalDateDay: {
    fontSize: 11,
    fontWeight: "400",
    color: Colors.textMuted,
  },
  selectedHorizontalDateDay: {
    color: Colors.white,
  },
  // Enhanced Date Picker Styles
  datePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    margin: 20,
    width: "90%",
    maxWidth: 400,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    paddingBottom: 12,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  datePickerCloseButton: {
    padding: 4,
  },
  datePickerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  datePickerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  datePickerCancelButton: {
    backgroundColor: Colors.gray100,
  },
  datePickerConfirmButton: {
    backgroundColor: Colors.primary500,
  },
  datePickerCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  datePickerConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
  // Clinic Phone Style
  clinicPhone: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  // Updated View Slots Button
  viewSlotsButton: {
    flex: 1.5,
    backgroundColor: Colors.primary500,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  // Clinic Styles
  clinicCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.gray50,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary500,
  },
  clinicInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  clinicContactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  clinicAddress: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
    flex: 1,
  },
});

export default AppointmentsScreen;
