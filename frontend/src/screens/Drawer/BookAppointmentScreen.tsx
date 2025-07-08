import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  InteractionManager,
  KeyboardAvoidingView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { format } from "date-fns";
import * as DocumentPicker from "expo-document-picker";
import Colors from "@theme/colors";
import { DrawerScreenProps } from "@/types/navigation";
import { useSelector } from "react-redux";
import { appointmentsService } from "@/services/api/appointments";

// Define constants
const BUTTON_CONTAINER_HEIGHT = 92; // Approximate height of button container with padding

interface AttachmentFile {
  id: string;
  file: string; // Path or URL after upload
  customId: string;
  name: string;
  type: string;
  size: number;
}

interface CardDetails {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
  isValid: boolean;
}

const BookAppointmentScreen: React.FC<DrawerScreenProps<"BookAppointment">> = ({
  navigation,
  route,
}) => {
  // Reference to track if component is mounted
  const isMounted = useRef(true);

  // Safe setState function to prevent UIFrameGuarded exceptions
  const safeSetState = useCallback((setter: () => void) => {
    if (!isMounted.current) return;

    if (Platform.OS === "ios") {
      // On iOS, use InteractionManager to ensure UI updates happen after animations
      InteractionManager.runAfterInteractions(() => {
        // Check again in case component unmounted during the wait
        if (isMounted.current) {
          // Use requestAnimationFrame to ensure updates happen on UI thread
          requestAnimationFrame(() => {
            if (isMounted.current) {
              setter();
            }
          });
        }
      });
    } else {
      // On Android, this is generally less of an issue, but still be careful
      setTimeout(() => {
        if (isMounted.current) {
          setter();
        }
      }, 0);
    }
  }, []);

  // Stripe setup
  // const { confirmPayment, createPaymentMethod } = useStripe();

  // Extract doctor and slot from route params with safety check
  const { doctor, slot } = route.params || {};

  // Prevent rendering if essential data is missing
  if (!doctor || !slot) {
    // Handle missing data with an error message and navigation
    React.useEffect(() => {
      Alert.alert(
        "Error",
        "Missing appointment information. Please try again.",
        [{ text: "Go Back", onPress: () => navigation.goBack() }]
      );
    }, []);

    // Return a loading state or minimal UI while redirecting
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <View style={styles.headerRight} />
        </View>
        <View
          style={[
            styles.content,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text>Loading appointment details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get current user from Redux store
  const currentUser = useSelector((state: any) => state.auth.user);

  // Debug logging
  console.log(
    "🔍 Redux state.auth:",
    useSelector((state: any) => state.auth)
  );
  console.log("🔍 currentUser from selector:", currentUser);

  // Form state
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [medicalHistoryShared, setMedicalHistoryShared] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Custom card input state
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
    isValid: false,
  });
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Calculate costs - only consultation fee (no platform fee)
  const consultationFee = slot?.price ?? 0;
  const totalAmount = consultationFee; // Only consultation fee

  // Tracking state changes and pending operations
  const pendingTimeouts = useRef<number[]>([]);
  const pendingAnimationFrames = useRef<number[]>([]);
  const pendingInteractions = useRef<any[]>([]);

  // Clean up on unmount
  useEffect(() => {
    // Set the mounted flag on component mount
    isMounted.current = true;

    // Cleanup function that runs when component unmounts
    return () => {
      // Clear the mounted flag when unmounting
      isMounted.current = false;

      // Clear any pending timeouts
      pendingTimeouts.current.forEach((id) => clearTimeout(id));
      pendingTimeouts.current = [];

      // Cancel any pending animations
      if (Platform.OS === "ios") {
        pendingAnimationFrames.current.forEach((id) =>
          cancelAnimationFrame(id)
        );
        pendingAnimationFrames.current = [];
      }

      // Cancel any pending interactions
      pendingInteractions.current.forEach((subscription) =>
        subscription.cancel()
      );
      pendingInteractions.current = [];
    };
  }, []);

  // Safe timeout function that gets cleaned up automatically
  const safeTimeout = useCallback((callback: () => void, ms: number) => {
    if (!isMounted.current) return;

    const id = setTimeout(() => {
      // Remove this timeout from tracking array
      pendingTimeouts.current = pendingTimeouts.current.filter((t) => t !== id);

      // Only execute if component is still mounted
      if (isMounted.current) {
        callback();
      }
    }, ms);

    // Track this timeout for cleanup
    pendingTimeouts.current.push(id);
    return id;
  }, []);

  // Format functions
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return "file-image";
    if (type.includes("pdf")) return "file-pdf-box";
    if (type.includes("document") || type.includes("word")) return "file-word";
    return "file-document";
  };

  // Handle file upload with document picker
  const handleFileUpload = async () => {
    if (!isMounted.current) return;

    try {
      setUploadingFile(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "image/*",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (!isMounted.current) return;

      if (result.canceled) {
        safeSetState(() => setUploadingFile(false));
        return;
      }

      const file = result.assets[0];

      // Create new attachment object
      const newAttachment: AttachmentFile = {
        id: Date.now().toString(),
        file: file.uri,
        customId: `attachment_${Date.now()}`,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
        size: file.size || 0,
      };

      // Update attachments list
      safeSetState(() => setAttachments((prev) => [...prev, newAttachment]));
      safeSetState(() => setUploadingFile(false));
    } catch (error) {
      console.error("Error picking document:", error);
      if (isMounted.current) {
        safeSetState(() => setUploadingFile(false));
        setTimeout(() => {
          if (isMounted.current) {
            Alert.alert("Error", "Failed to upload file. Please try again.");
          }
        }, 100);
      }
    }
  };

  // Remove attachment
  const removeAttachment = (id: string) => {
    if (!isMounted.current) return;
    safeSetState(() =>
      setAttachments((prev) => prev.filter((att) => att.id !== id))
    );
  };

  // Debounced validation for performance
  const validationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const debouncedValidation = useCallback(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    validationTimeoutRef.current = setTimeout(() => {
      setCardDetails((prev) => ({
        ...prev,
        isValid: validateCardDetails(prev),
      }));
    }, 300); // Validate 300ms after user stops typing
  }, []);

  // Cleanup validation timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  // Handle card input changes - optimized for smooth typing
  const handleCardNumberChange = useCallback(
    (text: string) => {
      // Remove any non-numeric characters
      const formattedText = text.replace(/\D/g, "");

      // Format with spaces every 4 digits
      let formatted = "";
      for (let i = 0; i < formattedText.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formatted += " ";
        }
        formatted += formattedText[i];
      }

      // Limit to 16 digits (19 characters with spaces)
      if (formattedText.length <= 16) {
        // Update immediately without validation for smooth typing
        setCardDetails((prev) => ({
          ...prev,
          number: formatted,
          // Skip validation during typing for performance
          isValid: prev.isValid,
        }));

        // Trigger debounced validation
        debouncedValidation();
      }
    },
    [debouncedValidation]
  );

  const handleCardExpiryChange = useCallback(
    (text: string) => {
      // Remove any non-numeric characters
      const formattedText = text.replace(/\D/g, "");

      // Format as MM/YY
      let formatted = formattedText;
      if (formattedText.length > 2) {
        formatted =
          formattedText.substring(0, 2) + "/" + formattedText.substring(2);
      }

      // Limit to 4 digits (5 characters with slash)
      if (formattedText.length <= 4) {
        // Update immediately without validation for smooth typing
        setCardDetails((prev) => ({
          ...prev,
          expiry: formatted,
          // Skip validation during typing for performance
          isValid: prev.isValid,
        }));

        // Trigger debounced validation
        debouncedValidation();
      }
    },
    [debouncedValidation]
  );

  const handleCardCVCChange = useCallback(
    (text: string) => {
      // Remove any non-numeric characters
      const formattedText = text.replace(/\D/g, "");

      // Limit to 3-4 digits
      if (formattedText.length <= 4) {
        // Update immediately without validation for smooth typing
        setCardDetails((prev) => ({
          ...prev,
          cvc: formattedText,
          // Skip validation during typing for performance
          isValid: prev.isValid,
        }));

        // Trigger debounced validation
        debouncedValidation();
      }
    },
    [debouncedValidation]
  );

  const handleCardNameChange = useCallback(
    (text: string) => {
      // Update immediately without validation for smooth typing
      setCardDetails((prev) => ({
        ...prev,
        name: text,
        // Skip validation during typing for performance
        isValid: prev.isValid,
      }));

      // Trigger debounced validation
      debouncedValidation();
    },
    [debouncedValidation]
  );

  // Validate all card details - optimized for performance
  const validateCardDetails = (details: CardDetails): boolean => {
    // Skip heavy validation if clearly incomplete
    if (!details.number || !details.expiry || !details.cvc || !details.name) {
      return false;
    }

    // Basic validation
    const numberValid = details.number.replace(/\s/g, "").length === 16;
    if (!numberValid) return false;

    const expiryParts = details.expiry.split("/");
    const expiryValid =
      expiryParts.length === 2 &&
      expiryParts[0].length === 2 &&
      expiryParts[1].length === 2;
    if (!expiryValid) return false;

    const cvcValid = details.cvc.length >= 3;
    if (!cvcValid) return false;

    const nameValid = details.name.trim().length > 0;
    return nameValid;
  };

  // Simulate card type detection
  const getCardType = (): string => {
    const number = cardDetails.number.replace(/\s/g, "");
    if (number.startsWith("4")) return "VISA";
    if (number.startsWith("5")) return "MASTERCARD";
    if (number.startsWith("3")) return "AMEX";
    if (number.startsWith("6")) return "DISCOVER";
    return "CARD";
  };

  // Get last 4 digits
  const getLastFourDigits = (): string => {
    const number = cardDetails.number.replace(/\s/g, "");
    return number.slice(-4);
  };

  // Handle notes changes
  const handleNotesChange = (text: string) => {
    if (!isMounted.current) return;
    if (text.length <= 500) {
      safeSetState(() => setNotes(text));
    }
  };

  // Toggle medical history shared
  const toggleMedicalHistoryShared = () => {
    if (!isMounted.current) return;
    safeSetState(() => setMedicalHistoryShared((prev) => !prev));
  };

  // Book appointment with backend integration
  const handleBookAppointment = async () => {
    // Validate card details
    if (!cardDetails.isValid) {
      Alert.alert(
        "Card Details Required",
        "Please complete all card details before proceeding with the booking."
      );
      return;
    } // Validate user is logged in
    const userId = currentUser?.id || currentUser?._id;
    console.log("🔍 Booking: userId found:", userId);

    if (!currentUser || !userId) {
      Alert.alert(
        "Authentication Required",
        "Please log in to book an appointment."
      );
      return;
    }

    if (!isMounted.current) return;
    safeSetState(() => setPaymentProcessing(true));

    try {
      // Generate a dummy payment intent ID (simulating Stripe payment)
      const dummyPaymentIntentId = `pi_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      console.log("Processing payment with card:", {
        type: getCardType(),
        last4: getLastFourDigits(),
        expiry: cardDetails.expiry,
        name: cardDetails.name,
        paymentIntentId: dummyPaymentIntentId,
      });

      // Prepare appointment data for backend
      const appointmentType =
        slot.type === "inperson" ? "inperson" : "telemedicine";

      const appointmentData = {
        doctorId: doctor._id,
        patientId: userId, // Use current logged-in user as patient
        slotId: slot._id,
        type: appointmentType as "telemedicine" | "inperson",
        notes: notes.trim() || undefined,
        price: totalAmount,
        paymentIntentId: dummyPaymentIntentId,
      };

      console.log("Creating appointment with data:", appointmentData);

      // Call backend to create appointment
      const createdAppointment = await appointmentsService.createAppointment(
        appointmentData
      );

      console.log("Appointment created successfully:", createdAppointment);

      if (!isMounted.current) return;
      safeSetState(() => setPaymentProcessing(false));

      // Show success alert with appointment details
      const appointmentTypeDisplay =
        slot.type === "telemedicine" ? "Video Call" : "In-Person Visit";
      const jitsiInfo = createdAppointment.jitsiMeeting
        ? `\n\n🎥 Video Meeting: ${createdAppointment.jitsiMeeting.roomName}`
        : "";

      Alert.alert(
        "Booking Confirmed! 🎉",
        `Your appointment has been successfully booked.\n\nBooking Details:\n• Doctor: Dr. ${
          doctor.user.firstName
        } ${doctor.user.lastName}\n• Date: ${format(
          new Date(slot.date),
          "MMM dd, yyyy"
        )}\n• Time: ${slot.startTime} - ${
          slot.endTime
        }\n• Type: ${appointmentTypeDisplay}\n• Amount: EGP ${totalAmount.toFixed(
          2
        )}\n• Card: ${getCardType()} ****${getLastFourDigits()}${jitsiInfo}`,
        [
          {
            text: "View Appointments",
            onPress: () => {
              if (isMounted.current) {
                // Navigate to appointments screen to see the created appointment
                navigation.navigate("Appointments" as any);
              }
            },
          },
          {
            text: "OK",
            onPress: () => {
              if (isMounted.current) {
                navigation.goBack();
              }
            },
            style: "default",
          },
        ]
      );
    } catch (error: any) {
      console.error("Appointment booking error:", error);

      if (!isMounted.current) return;
      safeSetState(() => setPaymentProcessing(false));

      // Show appropriate error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to book appointment. Please try again.";

      Alert.alert("Booking Failed", errorMessage, [
        { text: "OK", style: "default" },
      ]);
    }
  };

  // Get doctor profile image or placeholder
  const getDoctorImage = () => {
    if (
      doctor.profileImage &&
      doctor.profileImage.URL &&
      doctor.profileImage.URL.secure_url
    ) {
      return doctor.profileImage.URL.secure_url;
    }
    return "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=faces";
  };

  // Format appointment type
  const formatAppointmentType = (type: string) => {
    if (type === "telemedicine") return "Video Call";
    if (type === "inperson") return "In-Person Visit";
    return type;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 20}
        >
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Doctor Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Doctor Information</Text>
              <View style={styles.doctorCard}>
                <View style={styles.doctorHeader}>
                  <View style={styles.doctorImageContainer}>
                    <Image
                      source={{ uri: getDoctorImage() }}
                      style={styles.doctorImage}
                    />
                  </View>
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>
                      {doctor.user.firstName} {doctor.user.lastName}
                    </Text>
                    <Text style={styles.doctorSpecialty}>
                      {doctor.specialty}
                    </Text>
                    <View style={styles.doctorStats}>
                      <View style={styles.statItem}>
                        <Icon
                          name="briefcase"
                          size={14}
                          color={Colors.textMuted}
                        />
                        <Text style={styles.statText}>
                          {doctor.yearsOfExperience} years
                        </Text>
                      </View>
                      {doctor.rating && (
                        <View style={styles.statItem}>
                          <Icon name="star" size={14} color={Colors.warning} />
                          <Text style={styles.statText}>
                            {doctor.rating.average.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Appointment Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Appointment Details</Text>
              <View style={styles.appointmentCard}>
                <View style={styles.appointmentRow}>
                  <Icon name="calendar" size={20} color={Colors.primary500} />
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentLabel}>Date</Text>
                    <Text style={styles.appointmentValue}>
                      {format(new Date(slot.date), "EEEE, MMMM dd, yyyy")}
                    </Text>
                  </View>
                </View>

                <View style={styles.appointmentRow}>
                  <Icon name="clock" size={20} color={Colors.primary500} />
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentLabel}>Time</Text>
                    <Text style={styles.appointmentValue}>
                      {slot.startTime}
                    </Text>
                  </View>
                </View>

                <View style={styles.appointmentRow}>
                  <Icon
                    name={
                      slot.type === "telemedicine"
                        ? "video"
                        : "hospital-building"
                    }
                    size={20}
                    color={Colors.primary500}
                  />
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentLabel}>Type</Text>
                    <Text style={styles.appointmentValue}>
                      {formatAppointmentType(slot.type)}
                    </Text>
                  </View>
                </View>

                <View style={styles.appointmentRow}>
                  <Icon name="timer" size={20} color={Colors.primary500} />
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentLabel}>Duration</Text>
                    <Text style={styles.appointmentValue}>
                      {slot.duration} minutes
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Notes Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              <Text style={styles.sectionDescription}>
                Share any symptoms, concerns, or questions you'd like to discuss
              </Text>
              <View style={styles.notesContainer}>
                <TextInput
                  style={styles.notesInput}
                  multiline
                  numberOfLines={4}
                  placeholder="Describe your symptoms, concerns, or any specific questions you have for the doctor..."
                  value={notes}
                  onChangeText={handleNotesChange}
                  placeholderTextColor={Colors.textMuted}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={styles.characterCount}>{notes.length}/500</Text>
              </View>
            </View>

            {/* File Attachments */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medical Documents</Text>
              <Text style={styles.sectionDescription}>
                Upload any relevant medical reports, test results, or images
              </Text>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleFileUpload}
                disabled={uploadingFile}
              >
                {uploadingFile ? (
                  <ActivityIndicator size="small" color={Colors.primary500} />
                ) : (
                  <Icon
                    name="file-upload"
                    size={20}
                    color={Colors.primary500}
                  />
                )}
                <Text style={styles.uploadButtonText}>
                  {uploadingFile ? "Uploading..." : "Upload Documents"}
                </Text>
              </TouchableOpacity>

              {/* Attachment List */}
              {attachments.length > 0 && (
                <View style={styles.attachmentsList}>
                  {attachments.map((attachment) => (
                    <View key={attachment.id} style={styles.attachmentItem}>
                      <Icon
                        name={getFileIcon(attachment.type)}
                        size={24}
                        color={Colors.primary500}
                      />
                      <View style={styles.attachmentInfo}>
                        <Text style={styles.attachmentName} numberOfLines={1}>
                          {attachment.name}
                        </Text>
                        <Text style={styles.attachmentSize}>
                          {formatFileSize(attachment.size)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => removeAttachment(attachment.id)}
                        style={styles.removeButton}
                      >
                        <Icon name="close" size={20} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Medical History Sharing */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medical History</Text>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={toggleMedicalHistoryShared}
              >
                <View
                  style={[
                    styles.checkbox,
                    medicalHistoryShared && styles.checkboxChecked,
                  ]}
                >
                  {medicalHistoryShared && (
                    <Icon name="check" size={16} color={Colors.white} />
                  )}
                </View>
                <View style={styles.checkboxTextContainer}>
                  <Text style={styles.checkboxText}>
                    Share my medical history with the doctor
                  </Text>
                  <Text style={styles.checkboxDescription}>
                    This will give the doctor access to your previous
                    consultations and medical records
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Payment Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Summary</Text>
              <View style={styles.paymentCard}>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentTotalLabel}>Consultation Fee</Text>
                  <Text style={styles.paymentTotalValue}>
                    EGP {consultationFee.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Payment Method - Custom Implementation */}
            <View style={styles.section}>
              <View style={styles.paymentMethodHeader}>
                <Text
                  style={[styles.sectionTitle, { color: Colors.primary600 }]}
                >
                  Payment Method
                </Text>
                <View style={styles.paymentSecurityBadge}>
                  <Icon name="shield-check" size={14} color="#00d924" />
                  <Text style={styles.paymentSecurityText}>Secure Payment</Text>
                </View>
              </View>

              {/* Custom Card Container */}
              <View style={styles.modernCardContainer}>
                <View style={styles.cardFieldHeader}>
                  <Text style={styles.modernCardLabel}>Card information</Text>
                  <View style={styles.cardBrandContainer}>
                    {cardDetails.number.length > 0 && (
                      <View style={styles.cardBrandBadge}>
                        <Text style={styles.cardBrandText}>
                          {getCardType()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Card Number Input - Optimized for performance */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Card Number</Text>
                  <TextInput
                    style={styles.cardInput}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor="#a3a8b8"
                    keyboardType="numeric"
                    value={cardDetails.number}
                    onChangeText={handleCardNumberChange}
                    maxLength={19} // 16 digits + 3 spaces
                    returnKeyType="next"
                    autoComplete="cc-number"
                    textContentType="creditCardNumber"
                    importantForAutofill="yes"
                    enablesReturnKeyAutomatically={false}
                    clearButtonMode="never"
                    autoCorrect={false}
                    spellCheck={false}
                    contextMenuHidden={true}
                  />
                </View>

                {/* Expiry and CVC row */}
                <View style={styles.cardRowInputs}>
                  <View
                    style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}
                  >
                    <Text style={styles.inputLabel}>Expiry Date</Text>
                    <TextInput
                      style={styles.cardInput}
                      placeholder="MM/YY"
                      placeholderTextColor="#a3a8b8"
                      keyboardType="numeric"
                      value={cardDetails.expiry}
                      onChangeText={handleCardExpiryChange}
                      maxLength={5} // MM/YY
                      returnKeyType="next"
                      autoComplete="cc-exp"
                      textContentType="none"
                      autoCorrect={false}
                      spellCheck={false}
                      contextMenuHidden={true}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>CVC</Text>
                    <TextInput
                      style={styles.cardInput}
                      placeholder="123"
                      placeholderTextColor="#a3a8b8"
                      keyboardType="numeric"
                      value={cardDetails.cvc}
                      onChangeText={handleCardCVCChange}
                      maxLength={4} // Some cards have 4-digit CVC
                      returnKeyType="next"
                      autoComplete="cc-csc"
                      textContentType="none"
                      autoCorrect={false}
                      spellCheck={false}
                      contextMenuHidden={true}
                      secureTextEntry={true}
                    />
                  </View>
                </View>

                {/* Card Holder Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Cardholder Name</Text>
                  <TextInput
                    style={styles.cardInput}
                    placeholder="Name on card"
                    placeholderTextColor="#a3a8b8"
                    value={cardDetails.name}
                    onChangeText={handleCardNameChange}
                    autoCapitalize="words"
                    returnKeyType="done"
                    autoComplete="cc-name"
                    textContentType="name"
                    autoCorrect={false}
                    spellCheck={false}
                    contextMenuHidden={false}
                  />
                </View>

                {/* Card Status Indicator */}
                {cardDetails.isValid && (
                  <View style={styles.cardSuccessIndicator}>
                    <View style={styles.cardSuccessContent}>
                      <Icon name="check-circle" size={18} color="#00d924" />
                      <Text style={styles.cardSuccessText}>
                        {getCardType()} •••• {getLastFourDigits()}
                      </Text>
                      <Text style={styles.cardExpiryBadge}>
                        {cardDetails.expiry}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Modern Security Notice */}
                <View style={styles.modernSecurityNotice}>
                  <Icon name="shield-check-outline" size={16} color="#00d924" />
                  <Text style={styles.modernSecurityText}>
                    Your payment information is encrypted and secure
                  </Text>
                </View>
              </View>
            </View>

            {/* Terms and Conditions */}
            <View style={styles.section}>
              <View style={styles.termsContainer}>
                <Icon name="information" size={16} color={Colors.textMuted} />
                <Text style={styles.termsText}>
                  By booking this appointment, you agree to our Terms of Service
                  and Privacy Policy
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Book Button */}
      <SafeAreaView style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            (paymentProcessing || !cardDetails.isValid) &&
              styles.bookButtonDisabled,
          ]}
          onPress={handleBookAppointment}
          activeOpacity={0.7}
          disabled={paymentProcessing || !cardDetails.isValid}
        >
          {paymentProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="calendar-plus" size={18} color="#FFFFFF" />
              <Text style={styles.bookButtonText}>
                {!cardDetails.isValid
                  ? "Complete Card Details"
                  : `Confirm Booking • EGP ${totalAmount.toFixed(2)}`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </SafeAreaView>
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
  backButton: {
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: BUTTON_CONTAINER_HEIGHT, // Use the constant to ensure enough space
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },

  // Doctor Card
  doctorCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  doctorHeader: {
    flexDirection: "row",
  },
  doctorImageContainer: {
    marginRight: 12,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  doctorInfo: {
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
    color: Colors.textSecondary,
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
    fontSize: 13,
    color: Colors.textMuted,
    marginLeft: 4,
  },

  // Appointment Card
  appointmentCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  appointmentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  appointmentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  appointmentLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  appointmentValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: "500",
  },

  // Notes
  notesContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.gray300,
    marginTop: 8,
  },
  notesInput: {
    padding: 12,
    minHeight: 120,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.textMuted,
    alignSelf: "flex-end",
    marginRight: 12,
    marginBottom: 8,
  },

  // File Upload
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary500,
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  uploadButtonText: {
    color: Colors.primary500,
    marginLeft: 8,
    fontWeight: "500",
  },
  attachmentsList: {
    marginTop: 8,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray100,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  attachmentName: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  attachmentSize: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  removeButton: {
    padding: 4,
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary500,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.primary500,
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "500",
    marginBottom: 4,
  },
  checkboxDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },

  // Payment Summary
  paymentCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  paymentValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  paymentDivider: {
    height: 1,
    backgroundColor: Colors.gray200,
    marginVertical: 12,
  },
  paymentTotalLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "bold",
  },
  paymentTotalValue: {
    fontSize: 18,
    color: Colors.primary600,
    fontWeight: "bold",
  },
  stripeInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  stripeText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginLeft: 8,
  },

  // Modern Payment UI
  paymentMethodHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  paymentSecurityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 217, 36, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  paymentSecurityText: {
    fontSize: 12,
    color: "#00d924",
    marginLeft: 4,
  },
  modernCardContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    marginBottom: 8,
  },
  cardFieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modernCardLabel: {
    fontSize: 16,
    color: "#1a1f36",
    fontWeight: "700",
  },
  cardBrandContainer: {
    minWidth: 48,
    alignItems: "flex-end",
  },
  cardBrandBadge: {
    backgroundColor: "#f7fafc",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardBrandText: {
    fontSize: 12,
    color: "#4f566b",
    fontWeight: "600",
  },
  modernCardField: {
    height: 50,
    borderWidth: 1,
    borderColor: "#e6e8eb",
    borderRadius: 8,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: "#4f566b",
    marginBottom: 6,
    fontWeight: "500",
  },
  cardInput: {
    height: 48,
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#e6e8eb",
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#1a1f36",
  },
  cardRowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modernCardFieldComplete: {
    borderColor: "#00d924",
  },
  modernCardFieldError: {
    borderColor: "#df1b41",
  },
  cardSuccessIndicator: {
    marginBottom: 12,
  },
  cardSuccessContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardSuccessText: {
    fontSize: 14,
    color: "#00d924",
    fontWeight: "500",
    marginLeft: 6,
  },
  cardExpiryBadge: {
    marginLeft: 8,
    backgroundColor: "#f7fafc",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    color: "#4f566b",
  },
  cardErrorIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardErrorText: {
    fontSize: 14,
    color: "#df1b41",
    marginLeft: 6,
  },
  testCardNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(99, 91, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  testCardText: {
    fontSize: 13,
    color: "#635bff",
    marginLeft: 8,
    lineHeight: 18,
    flex: 1,
  },
  modernSecurityNotice: {
    flexDirection: "row",
    alignItems: "center",
  },
  modernSecurityText: {
    fontSize: 13,
    color: "#697386",
    marginLeft: 8,
  },

  // Terms
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.gray50,
    borderRadius: 8,
    padding: 12,
  },
  termsText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginLeft: 8,
    lineHeight: 18,
    flex: 1,
  },

  // Bottom Button
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 2,
    borderTopColor: Colors.gray300,
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    zIndex: 9999,
  },
  bookButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    height: 56,
    width: "100%",
    borderWidth: 1,
    borderColor: "#0056CC",
  },
  bookButtonDisabled: {
    backgroundColor: "#9CA3AF",
    borderColor: "#6B7280",
    elevation: 2,
    shadowOpacity: 0.1,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    textAlign: "center",
  },
});

export default BookAppointmentScreen;
