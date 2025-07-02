import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Animated,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import Colors from "@theme/colors";
import AuthButton from "@/components/ui/buttons/AuthButton";
import { logout, setUser } from "@/store/auth/authSlice";
import { authService } from "@/services/api/auth";
import apiClient from "@/services/api/apiClient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import InputField from "@/components/ui/inputs/InputField";
import { RootState } from "@/store";
import BackButton from "@components/layout/BackButton";
import AuthHeader from "@components/Auth/AuthHeader";

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // Add null check for state.auth to prevent TypeError
  const user = useSelector((state: RootState) => state?.auth?.user);

  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);

  // State for user information
  const [userInfo, setUserInfo] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    userName: user?.userName || "",
    mobilePhone: user?.mobilePhone || "",
  });

  // State for image upload
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  const handleLogout = () => {
    // Dispatch logout action to clear auth state
    dispatch(logout());

    // Navigate to Login screen
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // If we're exiting edit mode, reset the form
      setUserInfo({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        userName: user?.userName || "",
        mobilePhone: user?.mobilePhone || "",
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handleChangePhoto = () => {
    // Show photo options modal with animation
    setShowPhotoOptions(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closePhotoOptions = () => {
    // Close photo options modal with animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPhotoOptions(false);
    });
  };

  const handleTakePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your camera"
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        await uploadProfileImage(result.assets[0].uri);
      }

      closePhotoOptions();
    } catch (error) {
      console.log("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
      closePhotoOptions();
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      // Request permission to access the photo library
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photos"
        );
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        await uploadProfileImage(result.assets[0].uri);
      }

      closePhotoOptions();
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
      closePhotoOptions();
    }
  };

  const handleRemovePhoto = async () => {
    try {
      if (!user) return;

      setIsUploading(true);
      closePhotoOptions();

      // Get the user's active role to determine the correct endpoint
      const role = user.activeRole?.toLowerCase() || "patient";

      // Call the API to remove the profile image with the correct role-based endpoint
      const response = await apiClient.patch(
        `/${role}/remove-profile-image`,
        {},
        {
          headers: {
            token: `Bearer_${user.token}`,
          },
        }
      );

      // Update the user in Redux with the complete data from the API response
      if (response && response.data && response.data.data) {
        // Extract the profile image URL string directly from the response
        const profileImage =
          response.data.data.profileImage?.URL?.secure_url || null;

        const updatedUser = {
          ...user,
          ...response.data.data,
          profileImage, // Explicitly set the profile image as a string or null
        };

        // This will be persisted to AsyncStorage via redux-persist
        dispatch(setUser(updatedUser));
        setSelectedImage(null);
        Alert.alert("Success", "Profile image removed successfully");
      }
    } catch (error: any) {
      console.log("Error removing image:", error);

      // Provide more specific error messages based on status code
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          Alert.alert(
            "Error",
            "Profile image removal endpoint not found. Please contact support."
          );
        } else if (status === 401) {
          Alert.alert(
            "Error",
            "You are not authorized to perform this action. Please log in again."
          );
        } else {
          Alert.alert(
            "Error",
            error.response.data?.message || "Failed to remove profile image"
          );
        }
      } else {
        Alert.alert(
          "Error",
          error.message ||
            "Failed to remove profile image. Please check your connection."
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    if (!user) return;

    try {
      setIsUploading(true);

      // Create form data for the image upload
      const formData = new FormData();
      const filename = imageUri.split("/").pop() || `image-${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename) || [null, "jpeg"];
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("profileImage", {
        uri: imageUri,
        name: filename,
        type,
      } as unknown as File);

      // Get the user's active role to determine the correct endpoint
      const role = user.activeRole?.toLowerCase() || "patient";

      console.log("token", user.token);

      // Call the API to update the profile image with the correct role-based endpoint
      const response = await apiClient.patch(
        `/${role}/edit-profile-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token: `Bearer_${user.token}`,
          },
        }
      );

      // Update the user in Redux with the complete data from the API response
      if (response && response.data && response.data.data) {
        // Extract the profile image URL string directly from the response
        const profileImage =
          response.data.data.profileImage?.URL?.secure_url || null;

        const updatedUser = {
          ...user,
          ...response.data.data,
          profileImage, // Explicitly set the profile image as a string or null
        };

        // This will be persisted to AsyncStorage via redux-persist
        dispatch(setUser(updatedUser));
        Alert.alert("Success", "Profile image updated successfully");
      }
    } catch (error: any) {
      console.log("Error uploading image:", error);

      // Provide more specific error messages based on status code
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          Alert.alert(
            "Error",
            "Profile image upload endpoint not found. Please contact support."
          );
        } else if (status === 401) {
          Alert.alert(
            "Error",
            "You are not authorized to perform this action. Please log in again."
          );
        } else if (status === 413) {
          Alert.alert(
            "Error",
            "The image file is too large. Please choose a smaller image."
          );
        } else {
          Alert.alert(
            "Error",
            error.response.data?.message || "Failed to upload profile image"
          );
        }
      } else {
        Alert.alert(
          "Error",
          error.message ||
            "Failed to upload profile image. Please check your connection."
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    console.log("token", user.token);

    try {
      // Show loading indicator
      setIsUploading(true);

      // Create an object to store only the changed fields
      const changedFields: Record<string, string> = {};

      // Compare each field and only include changed ones
      if (userInfo.firstName !== user.firstName && userInfo.firstName.trim())
        changedFields.firstName = userInfo.firstName.trim();
      if (userInfo.lastName !== user.lastName && userInfo.lastName.trim())
        changedFields.lastName = userInfo.lastName.trim();
      if (userInfo.userName !== user.userName && userInfo.userName.trim())
        changedFields.userName = userInfo.userName.trim();
      if (userInfo.email !== user.email && userInfo.email.trim())
        changedFields.email = userInfo.email.trim();
      if (
        userInfo.mobilePhone !== user.mobilePhone &&
        userInfo.mobilePhone.trim()
      )
        changedFields.mobilePhone = userInfo.mobilePhone.trim();

      // Only proceed with the update if there are changes
      if (Object.keys(changedFields).length > 0) {
        // Send PUT request to update user profile
        const response = await apiClient.put("/auth/update", changedFields, {
          headers: {
            "Content-Type": "application/json",
            token: `Bearer_${user.token}`,
          },
        });

        // Check if the update was successful
        if (response && response.data && response.data.success) {
          // Create updated user object with local changes
          const updatedUser = {
            ...user,
            ...changedFields, // Use the validated changes we sent to the API
          };

          // Update user in Redux store which will persist to AsyncStorage via redux-persist
          dispatch(setUser(updatedUser));

          // Show success message with visual feedback
          Alert.alert(
            "✅ Profile Updated",
            response.data.message ||
              "Your profile has been updated successfully",
            [
              {
                text: "OK",
                onPress: () => {
                  // Exit edit mode after user acknowledges
                  setIsEditMode(false);
                },
              },
            ],
            { cancelable: false }
          );
        }
      } else {
        // No changes were made - provide feedback
        Alert.alert(
          "ℹ️ No Changes",
          "No changes were detected in your profile",
          [
            {
              text: "OK",
              onPress: () => {
                setIsEditMode(false);
              },
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error: any) {
      console.log("Error updating profile:", error);

      // Provide more specific error messages based on status code
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          Alert.alert(
            "❌ Error",
            "Profile update endpoint not found. Please contact support.",
            [{ text: "OK" }],
            { cancelable: false }
          );
        } else if (status === 401) {
          Alert.alert(
            "❌ Error",
            "You are not authorized to perform this action. Please log in again.",
            [{ text: "OK" }],
            { cancelable: false }
          );
        } else {
          Alert.alert(
            "❌ Error",
            error.response.data?.message || "Failed to update profile",
            [{ text: "OK" }],
            { cancelable: false }
          );
        }
      } else {
        Alert.alert(
          "❌ Error",
          error.message ||
            "Failed to update profile. Please check your connection.",
          [{ text: "OK" }],
          { cancelable: false }
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setUserInfo({
      ...userInfo,
      [field]: value,
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaTop}>
        <View style={styles.headerContainer}>
          <BackButton />
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={toggleEditMode} style={styles.editButton}>
            <Icon
              name={isEditMode ? "close" : "pencil"}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
        >
          <View style={styles.formOuterContainer}>
            <View style={styles.profileImageContainer}>
              <View style={styles.avatarContainer}>
                <Image
                  source={
                    selectedImage
                      ? { uri: selectedImage }
                      : user?.profileImage
                      ? { uri: user.profileImage }
                      : require("@/assets/images/avatar-placeholder.png")
                  }
                  style={styles.profileImage}
                />
                {isEditMode && (
                  <TouchableOpacity
                    style={styles.cameraIconButton}
                    onPress={handleChangePhoto}
                    activeOpacity={0.7}
                  >
                    {isUploading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Icon name="camera" size={18} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Photo Options Modal */}
            <Modal
              visible={showPhotoOptions}
              transparent={true}
              animationType="none"
              onRequestClose={closePhotoOptions}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={closePhotoOptions}
              >
                <Animated.View
                  style={[
                    styles.modalContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={handleTakePhoto}
                  >
                    <Icon name="camera" size={24} color="#1E90FF" />
                    <Text style={styles.modalOptionText}>Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={handleChooseFromGallery}
                  >
                    <Icon name="image" size={24} color="#1E90FF" />
                    <Text style={styles.modalOptionText}>
                      Choose from Gallery
                    </Text>
                  </TouchableOpacity>

                  {(selectedImage || user?.profileImage) && (
                    <TouchableOpacity
                      style={styles.modalOption}
                      onPress={handleRemovePhoto}
                    >
                      <Icon
                        name="trash-can-outline"
                        size={24}
                        color="#FF3B30"
                      />
                      <Text style={[styles.modalOptionText, styles.removeText]}>
                        Remove Photo
                      </Text>
                    </TouchableOpacity>
                  )}
                </Animated.View>
              </TouchableOpacity>
            </Modal>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              {isEditMode ? (
                <View style={styles.formContainer}>
                  <InputField
                    label="First Name"
                    placeholder="Enter your first name"
                    value={userInfo.firstName}
                    onChangeText={(text) =>
                      handleInputChange("firstName", text)
                    }
                    style={styles.input}
                  />
                  <InputField
                    label="Last Name"
                    placeholder="Enter your last name"
                    value={userInfo.lastName}
                    onChangeText={(text) => handleInputChange("lastName", text)}
                    style={styles.input}
                  />
                  <InputField
                    label="Username"
                    placeholder="Enter your username"
                    value={userInfo.userName}
                    onChangeText={(text) => handleInputChange("userName", text)}
                    style={styles.input}
                  />
                </View>
              ) : (
                <View style={styles.infoContainer}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>First Name:</Text>
                    <Text style={styles.infoValue}>{user?.firstName}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Last Name:</Text>
                    <Text style={styles.infoValue}>{user?.lastName}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Username:</Text>
                    <Text style={styles.infoValue}>{user?.userName}</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Contact Information</Text>

              {isEditMode ? (
                <View style={styles.formContainer}>
                  <InputField
                    label="Email"
                    placeholder="Enter your email"
                    value={userInfo.email}
                    onChangeText={(text) => handleInputChange("email", text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                  <InputField
                    label="Mobile Phone"
                    placeholder="Enter your mobile number"
                    value={userInfo.mobilePhone}
                    onChangeText={(text) =>
                      handleInputChange("mobilePhone", text)
                    }
                    keyboardType="phone-pad"
                    style={styles.input}
                  />
                </View>
              ) : (
                <View style={styles.infoContainer}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValue}>{user?.email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mobile:</Text>
                    <Text style={styles.infoValue}>
                      {user?.mobilePhone || "Not provided"}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Account Information</Text>

              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Role:</Text>
                  <Text style={styles.infoValue}>{user?.activeRole}</Text>
                </View>
              </View>
            </View>

            {isEditMode && (
              <View style={styles.saveButtonContainer}>
                <AuthButton
                  title="Save Changes"
                  onPress={handleSaveChanges}
                  buttonStyle={styles.saveButton}
                />
              </View>
            )}

            {!isEditMode && (
              <View style={styles.logoutContainer}>
                <AuthButton
                  title="Logout"
                  onPress={handleLogout}
                  buttonStyle={styles.logoutButton}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary500,
  },
  safeAreaTop: {
    flex: 1,
    marginTop: 50,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  editButton: {
    padding: 8,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  formOuterContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingTop: 24,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  profileImageContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatarContainer: {
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary500,
  },
  cameraIconButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1E90FF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  changePhotoText: {
    color: Colors.primary500,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#333333",
  },
  removeText: {
    color: "#FF3B30",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary500,
    marginBottom: 15,
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  infoLabel: {
    fontSize: 16,
    color: "#666666",
  },
  infoValue: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  formContainer: {
    gap: 5,
  },
  input: {
    backgroundColor: "#F5F5F5",
    marginBottom: 15,
  },
  saveButtonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: Colors.primary500,
  },
  logoutContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: Colors.error500,
  },
});

export default ProfileScreen;
