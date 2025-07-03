import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@theme/colors";
import { adminService, PendingDoctor } from "@/services/api/admin";

const { width } = Dimensions.get("window");

// Mock data for pending doctors
const mockPendingDoctors: PendingDoctor[] = [
  {
    id: "1",
    firstName: "Dr. Ahmed",
    lastName: "Hassan",
    email: "ahmed.hassan@example.com",
    specialty: "Cardiology",
    yearsOfExperience: 8,
    education: [
      {
        degree: "MD",
        institution: "Cairo University",
        graduationYear: 2015,
      },
    ],
    certifications: ["Board Certified Cardiologist", "ACLS Certified"],
    hospitalAffiliation: [
      {
        name: "Cairo Heart Hospital",
      },
    ],
    verificationDocument: {
      uri: "https://via.placeholder.com/400x600/FF6B6B/FFFFFF?text=Medical+License",
      type: "image/jpeg",
      name: "medical_license_ahmed.jpg",
    },
    profileImage: "https://via.placeholder.com/100x100/4ECDC4/FFFFFF?text=AH",
    submittedAt: "2025-01-02T10:30:00Z",
  },
  {
    id: "2",
    firstName: "Dr. Fatima",
    lastName: "Mahmoud",
    email: "fatima.mahmoud@example.com",
    specialty: "Pediatrics",
    yearsOfExperience: 5,
    education: [
      {
        degree: "MD",
        institution: "Alexandria University",
        graduationYear: 2018,
      },
    ],
    certifications: ["Pediatric Board Certification"],
    hospitalAffiliation: [
      {
        name: "Children's Hospital Alexandria",
      },
    ],
    verificationDocument: {
      uri: "https://via.placeholder.com/400x600/45B7D1/FFFFFF?text=Medical+Certificate",
      type: "image/png",
      name: "medical_certificate_fatima.png",
    },
    profileImage: "https://via.placeholder.com/100x100/96CEB4/FFFFFF?text=FM",
    submittedAt: "2025-01-01T14:20:00Z",
  },
  {
    id: "3",
    firstName: "Dr. Omar",
    lastName: "Saleh",
    email: "omar.saleh@example.com",
    specialty: "Orthopedics",
    yearsOfExperience: 12,
    education: [
      {
        degree: "MD",
        institution: "Ain Shams University",
        graduationYear: 2011,
      },
    ],
    certifications: [
      "Orthopedic Surgery Board",
      "Trauma Surgery Certification",
    ],
    hospitalAffiliation: [
      {
        name: "Ain Shams Specialized Hospital",
      },
    ],
    verificationDocument: {
      uri: "https://via.placeholder.com/400x600/F7DC6F/000000?text=License+Document",
      type: "application/pdf",
      name: "orthopedic_license_omar.pdf",
    },
    profileImage: "https://via.placeholder.com/100x100/FFEAA7/000000?text=OS",
    submittedAt: "2024-12-30T09:15:00Z",
  },
];

const AdminDoctorVerificationScreen: React.FC = () => {
  const [pendingDoctors, setPendingDoctors] = useState<PendingDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  useEffect(() => {
    // Use the admin service to fetch pending doctors
    const fetchPendingDoctors = async () => {
      setLoading(true);
      try {
        const doctors = await adminService.getPendingDoctors();
        setPendingDoctors(doctors);
      } catch (error) {
        console.error("Failed to fetch pending doctors:", error);
        Alert.alert(
          "Error",
          "Failed to load pending doctors. Please try again.",
          [{ text: "OK" }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPendingDoctors();
  }, []);

  const handleVerifyDoctor = (doctorId: string, doctorName: string) => {
    Alert.alert(
      "Verify Doctor",
      `Are you sure you want to verify ${doctorName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Verify",
          onPress: () => performVerification(doctorId, doctorName),
        },
      ]
    );
  };

  const performVerification = async (doctorId: string, doctorName: string) => {
    try {
      setLoading(true);
      await adminService.verifyDoctor(doctorId);

      // Remove verified doctor from pending list
      setPendingDoctors((prev) =>
        prev.filter((doctor) => doctor.id !== doctorId)
      );

      // Show success message
      Alert.alert("Success", `${doctorName} has been successfully verified!`, [
        { text: "OK" },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to verify doctor. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectDoctor = (doctorId: string, doctorName: string) => {
    Alert.alert(
      "Reject Doctor",
      `Are you sure you want to reject ${doctorName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reject",
          style: "destructive",
          onPress: () => performRejection(doctorId, doctorName),
        },
      ]
    );
  };

  const performRejection = async (doctorId: string, doctorName: string) => {
    try {
      setLoading(true);
      await adminService.rejectDoctor(doctorId);

      // Remove rejected doctor from pending list
      setPendingDoctors((prev) =>
        prev.filter((doctor) => doctor.id !== doctorId)
      );

      // Show success message
      Alert.alert("Rejected", `${doctorName} has been rejected.`, [
        { text: "OK" },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to reject doctor. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const viewDocument = (documentUri: string) => {
    setSelectedDocument(documentUri);
    setShowDocumentModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading pending doctors...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Doctor Verification</Text>
        <Text style={styles.headerSubtitle}>
          {pendingDoctors.length} doctors pending verification
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {pendingDoctors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="checkmark-circle"
              size={80}
              color={Colors.success500}
            />
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptySubtitle}>
              No doctors pending verification at the moment.
            </Text>
          </View>
        ) : (
          pendingDoctors.map((doctor) => (
            <View key={doctor.id} style={styles.doctorCard}>
              {/* Doctor Header */}
              <View style={styles.doctorHeader}>
                <Image
                  source={{ uri: doctor.profileImage }}
                  style={styles.profileImage}
                />
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>
                    {doctor.firstName} {doctor.lastName}
                  </Text>
                  <Text style={styles.doctorEmail}>{doctor.email}</Text>
                  <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                  <Text style={styles.submittedDate}>
                    Submitted: {formatDate(doctor.submittedAt)}
                  </Text>
                </View>
              </View>

              {/* Doctor Details */}
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Experience</Text>
                <Text style={styles.experienceText}>
                  {doctor.yearsOfExperience} years
                </Text>

                <Text style={styles.sectionTitle}>Education</Text>
                {doctor.education.map((edu, index) => (
                  <Text key={index} style={styles.educationText}>
                    {edu.degree} - {edu.institution} ({edu.graduationYear})
                  </Text>
                ))}

                <Text style={styles.sectionTitle}>Hospital Affiliation</Text>
                {doctor.hospitalAffiliation.map((hospital, index) => (
                  <Text key={index} style={styles.hospitalText}>
                    {hospital.name}
                  </Text>
                ))}

                {doctor.certifications.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Certifications</Text>
                    {doctor.certifications.map((cert, index) => (
                      <Text key={index} style={styles.certificationText}>
                        • {cert}
                      </Text>
                    ))}
                  </>
                )}
              </View>

              {/* Verification Document */}
              <View style={styles.documentSection}>
                <Text style={styles.sectionTitle}>Verification Document</Text>
                <TouchableOpacity
                  style={styles.documentButton}
                  onPress={() => viewDocument(doctor.verificationDocument.uri)}
                >
                  <Ionicons
                    name="document"
                    size={20}
                    color={Colors.primary500}
                  />
                  <Text style={styles.documentButtonText}>
                    {doctor.verificationDocument.name}
                  </Text>
                  <Ionicons name="eye" size={20} color={Colors.primary500} />
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() =>
                    handleRejectDoctor(
                      doctor.id,
                      `${doctor.firstName} ${doctor.lastName}`
                    )
                  }
                >
                  <Ionicons name="close" size={20} color="white" />
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={() =>
                    handleVerifyDoctor(
                      doctor.id,
                      `${doctor.firstName} ${doctor.lastName}`
                    )
                  }
                >
                  <Ionicons name="checkmark" size={20} color="white" />
                  <Text style={styles.verifyButtonText}>Verify</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Document Preview Modal */}
      <Modal
        visible={showDocumentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDocumentModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDocumentModal(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            {selectedDocument && (
              <Image
                source={{ uri: selectedDocument }}
                style={styles.documentImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text600,
  },
  header: {
    backgroundColor: Colors.primary500,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text800,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.text600,
    textAlign: "center",
  },
  doctorCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  doctorHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text800,
    marginBottom: 4,
  },
  doctorEmail: {
    fontSize: 14,
    color: Colors.text600,
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 16,
    color: Colors.primary500,
    fontWeight: "600",
    marginBottom: 4,
  },
  submittedDate: {
    fontSize: 12,
    color: Colors.text500,
  },
  detailsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text800,
    marginTop: 12,
    marginBottom: 8,
  },
  experienceText: {
    fontSize: 14,
    color: Colors.text700,
  },
  educationText: {
    fontSize: 14,
    color: Colors.text700,
    marginBottom: 4,
  },
  hospitalText: {
    fontSize: 14,
    color: Colors.text700,
    marginBottom: 4,
  },
  certificationText: {
    fontSize: 14,
    color: Colors.text700,
    marginBottom: 2,
  },
  documentSection: {
    marginBottom: 20,
  },
  documentButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary50,
    borderColor: Colors.primary200,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  documentButtonText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: Colors.primary600,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: Colors.error500,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  rejectButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
  verifyButton: {
    flex: 1,
    backgroundColor: Colors.success500,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  verifyButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.9,
    height: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 8,
    zIndex: 1,
  },
  documentImage: {
    width: "100%",
    height: "100%",
  },
});

export default AdminDoctorVerificationScreen;
