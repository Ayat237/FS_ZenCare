import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Colors from "@theme/colors";
import { OpenStreetMapView, SearchableMapView } from "@/components/maps";
import { ClinicBranch } from "@/types/doctor";

interface LocationData {
  latitude: number;
  longitude: number;
  displayName?: string;
}

const DoctorClinicLocationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.auth.user);

  // Get doctor's clinic branches from user profile (memoized to prevent infinite loops)
  const existingBranches = useMemo((): ClinicBranch[] => {
    // Debug logging to see user structure
    console.log(
      "🏥 DoctorClinicLocation: User data:",
      JSON.stringify(user, null, 2)
    );

    // Check if user has roleData (from backend profile) or direct clinicBranches (from auth state)
    const doctorData = (user as any)?.roleData?.doctor;
    const branches = doctorData?.clinicBranches || user?.clinicBranches || [];

    console.log("🏥 DoctorClinicLocation: Found branches:", branches);

    const mappedBranches = branches.map((branch: any) => ({
      address: {
        displayName:
          branch.address?.displayName ||
          `${branch.address?.street || ""}, ${branch.address?.city || ""}, ${
            branch.address?.country || ""
          }`
            .trim()
            .replace(/^,|,$/g, "") ||
          "Unknown Location",
        coordinates: {
          latitude: branch.address?.coordinates?.latitude || 0,
          longitude: branch.address?.coordinates?.longitude || 0,
        },
      },
      phoneNumber: branch.phoneNumber || "",
    }));

    // If no branches found, add some dummy data for testing (remove this in production)
    if (mappedBranches.length === 0 && user?.activeRole === "doctor") {
      return [
        {
          address: {
            displayName: "Main Clinic - Downtown Dubai, UAE",
            coordinates: {
              latitude: 25.2048,
              longitude: 55.2708,
            },
          },
          phoneNumber: "+971 4 123 4567",
        },
        {
          address: {
            displayName: "Branch Clinic - Dubai Marina, UAE",
            coordinates: {
              latitude: 25.0772,
              longitude: 55.1392,
            },
          },
          phoneNumber: "+971 4 987 6543",
        },
      ];
    }

    return mappedBranches;
  }, [user]);

  const [clinicBranches, setClinicBranches] =
    useState<ClinicBranch[]>(existingBranches);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newBranchLocation, setNewBranchLocation] =
    useState<LocationData | null>(null);
  const [newBranchPhone, setNewBranchPhone] = useState("");
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [loading, setLoading] = useState(false);

  // Default location (Dubai)
  const defaultLocation = {
    latitude: 25.2048,
    longitude: 55.2708,
  };

  useEffect(() => {
    // Update local state when user data changes
    setClinicBranches(existingBranches);
  }, [existingBranches]);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  };

  const getCurrentLocation = async (): Promise<LocationData> => {
    const hasPermission = await requestLocationPermission();

    if (hasPermission) {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      } catch (error) {
        console.log("Error getting location:", error);
      }
    }

    // Fall back to default location
    return defaultLocation;
  };

  const fetchAddressFromCoordinates = async (
    latitude: number,
    longitude: number
  ): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "ZenCare-App/1.0 (contact@zencare.app)",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();

      // Check if response is HTML (error page) instead of JSON
      if (text.trim().startsWith("<")) {
        console.warn(
          "Received HTML response instead of JSON, using coordinates as fallback"
        );
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }

      const data = JSON.parse(text);
      return (
        data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      );
    } catch (error) {
      console.error("Error fetching address:", error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  };

  const handleAddBranchPress = async () => {
    setIsAddModalVisible(true);
    setIsSelectingLocation(true);

    // Get current location for initial map position
    const currentLocation = await getCurrentLocation();
    setNewBranchLocation(currentLocation);
  };

  const handleLocationSelected = async (coords: {
    latitude: number;
    longitude: number;
  }) => {
    setLoading(true);
    try {
      // Add a small delay to respect API rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const displayName = await fetchAddressFromCoordinates(
        coords.latitude,
        coords.longitude
      );
      setNewBranchLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        displayName,
      });
      setIsSelectingLocation(false);
    } catch (error) {
      Alert.alert("Error", "Failed to get address information");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNewBranch = () => {
    if (!newBranchLocation || !newBranchPhone.trim()) {
      Alert.alert(
        "Required Fields",
        "Please select a location and enter a phone number."
      );
      return;
    }

    const newBranch: ClinicBranch = {
      address: {
        displayName:
          newBranchLocation.displayName ||
          `${newBranchLocation.latitude}, ${newBranchLocation.longitude}`,
        coordinates: {
          latitude: newBranchLocation.latitude,
          longitude: newBranchLocation.longitude,
        },
      },
      phoneNumber: newBranchPhone.trim(),
    };

    // Add to local state (in a real app, you'd save to the backend)
    setClinicBranches([...clinicBranches, newBranch]);

    // Reset form
    setNewBranchLocation(null);
    setNewBranchPhone("");
    setIsAddModalVisible(false);

    Alert.alert("Success", "New clinic branch added successfully!");
  };

  const handleDeleteBranch = (index: number) => {
    Alert.alert(
      "Delete Branch",
      "Are you sure you want to delete this clinic branch?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedBranches = clinicBranches.filter(
              (_, i) => i !== index
            );
            setClinicBranches(updatedBranches);
          },
        },
      ]
    );
  };

  const renderClinicBranch = ({
    item,
    index,
  }: {
    item: ClinicBranch;
    index: number;
  }) => (
    <View style={styles.branchCard}>
      <View style={styles.branchInfo}>
        <View style={styles.branchHeader}>
          <Icon name="map-marker" size={20} color={Colors.primary500} />
          <Text style={styles.branchTitle}>Clinic Branch {index + 1}</Text>
        </View>
        <Text style={styles.branchAddress}>{item.address.displayName}</Text>
        <View style={styles.branchDetails}>
          <Icon name="phone" size={16} color={Colors.primary400} />
          <Text style={styles.branchPhone}>{item.phoneNumber}</Text>
        </View>
        <View style={styles.branchDetails}>
          <Icon name="map" size={16} color={Colors.primary400} />
          <Text style={styles.coordinates}>
            {item.address.coordinates.latitude.toFixed(6)},{" "}
            {item.address.coordinates.longitude.toFixed(6)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteBranch(index)}
      >
        <Icon name="delete" size={20} color="#FF5252" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={Colors.primary600} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clinic Locations</Text>
        <TouchableOpacity
          onPress={handleAddBranchPress}
          style={styles.addButton}
        >
          <Icon name="plus" size={24} color={Colors.primary600} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {clinicBranches.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="map-marker-off" size={64} color={Colors.primary300} />
            <Text style={styles.emptyTitle}>No Clinic Branches</Text>
            <Text style={styles.emptyDescription}>
              Add your first clinic branch to let patients know where to find
              you.
            </Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={handleAddBranchPress}
            >
              <Icon name="plus" size={20} color="#fff" />
              <Text style={styles.addFirstButtonText}>Add First Branch</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={clinicBranches}
            renderItem={renderClinicBranch}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Add Branch Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setIsAddModalVisible(false);
                setNewBranchLocation(null);
                setNewBranchPhone("");
                setIsSelectingLocation(false);
              }}
            >
              <Icon name="close" size={24} color={Colors.primary600} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Branch</Text>
            <TouchableOpacity
              onPress={handleSaveNewBranch}
              disabled={!newBranchLocation || !newBranchPhone.trim()}
              style={[
                styles.saveButton,
                (!newBranchLocation || !newBranchPhone.trim()) &&
                  styles.saveButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  (!newBranchLocation || !newBranchPhone.trim()) &&
                    styles.saveButtonTextDisabled,
                ]}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>

          {isSelectingLocation ? (
            <View style={styles.mapContainer}>
              
              {newBranchLocation && (
                <SearchableMapView
                  initialLatitude={newBranchLocation.latitude}
                  initialLongitude={newBranchLocation.longitude}
                  zoom={15}
                  showMarker={true}
                  onLocationSelected={handleLocationSelected}
                  style={styles.map}
                />
              )}
              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={Colors.primary600} />
                  <Text style={styles.loadingText}>Getting address...</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.formContainer}>
              <View style={styles.selectedLocationCard}>
                <Icon
                  name="map-marker-check"
                  size={24}
                  color={Colors.success}
                />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationTitle}>Selected Location</Text>
                  <Text style={styles.locationAddress}>
                    {newBranchLocation?.displayName}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsSelectingLocation(true)}
                  style={styles.changeLocationButton}
                >
                  <Text style={styles.changeLocationText}>Change</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.phoneInput}
                  value={newBranchPhone}
                  onChangeText={setNewBranchPhone}
                  placeholder="Enter clinic phone number"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary700,
  },
  addButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  // List Styles
  listContainer: {
    padding: 20,
  },
  branchCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  branchInfo: {
    flex: 1,
  },
  branchHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  branchTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary700,
    marginLeft: 8,
  },
  branchAddress: {
    fontSize: 14,
    color: Colors.primary600,
    marginBottom: 8,
    lineHeight: 20,
  },
  branchDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  branchPhone: {
    fontSize: 14,
    color: Colors.primary500,
    marginLeft: 6,
  },
  coordinates: {
    fontSize: 12,
    color: Colors.primary400,
    marginLeft: 6,
  },
  deleteButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primary700,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.primary500,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: Colors.primary500,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  addFirstButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary700,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary500,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.primary200,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  saveButtonTextDisabled: {
    color: Colors.primary400,
  },
  // Map Container Styles
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapInstruction: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 12,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 14,
    color: Colors.primary700,
    zIndex: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.primary600,
  },
  // Form Styles
  formContainer: {
    flex: 1,
    padding: 20,
  },
  selectedLocationCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary700,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: Colors.primary500,
    lineHeight: 20,
  },
  changeLocationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.primary100,
  },
  changeLocationText: {
    color: Colors.primary600,
    fontSize: 14,
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary700,
    marginBottom: 8,
  },
  phoneInput: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.primary200,
  },
});

export default DoctorClinicLocationScreen;
