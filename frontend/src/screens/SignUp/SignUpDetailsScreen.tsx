import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Checkbox } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/types/navigation";
import Colors from "@theme/colors";
import BackButton from "@components/layout/BackButton";
import AuthHeader from "@components/Auth/AuthHeader";
import InputField from "@components/ui/inputs/InputField";
import AuthButton from "@/components/ui/buttons/AuthButton";
import AuthFooter from "@components/Auth/AuthFooter";
import DatePickerModal from "./components/DatePickerModal";
import GenderSelectionModal from "./components/GenderSelectionModal";
import DoctorRegistrationFields from "./components/DoctorRegistrationFields";
import DocumentUpload from "./components/DocumentUpload";
import SearchableMapExample from "@/components/maps/SearchableMapExample";
import { useSignUpForm } from "./hooks/useSignUpForm";
import {
  useDoctorSignUpForm,
  INITIAL_DOCTOR_FORM_DATA,
} from "./hooks/useDoctorSignUpForm";
import { styles } from "./styles";
import { formattedDate } from "@/utils/formattedDate";
import ErrorOverlay from "@components/ui/feedback/ErrorOverlay";

type SignUpDetailsRouteProp = RouteProp<RootStackParamList, "SignUpDetails">;

const SignUpDetailsScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<SignUpDetailsRouteProp>();
  const { role, isExistingUser: routeIsExistingUser } = route.params;
  const isDoctor = role === "doctor";
  const isExistingUser = routeIsExistingUser || false;

  const {
    formData,
    setFormData,
    agreeToTerms,
    setAgreeToTerms,
    handleInputChange,
    validateForm,
    getFieldError,
  } = useSignUpForm();

  const {
    doctorFormData,
    handleDoctorFormChange,
    validateDoctorForm,
    validationErrors: doctorValidationErrors,
  } = useDoctorSignUpForm();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [datePickerState, setDatePickerState] = useState({
    day: new Date().getDate(),
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [errorOverlayMsg, setErrorOverlayMsg] = useState("");

  const handleDateConfirm = () => {
    const { day, month, year } = datePickerState;
    const formattedDate = `${year}-${String(month + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    setFormData((prev) => ({ ...prev, birthDate: formattedDate }));
    setShowDatePicker(false);
  };

  const handleLocationConfirmed = async (location: {
    latitude: number;
    longitude: number;
    displayName?: string;
  }) => {
    console.log("Location confirmed in SignUpDetailsScreen:", location);

    // Make sure we have the display name from the API
    if (!location.displayName) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=18&addressdetails=1`
        );
        console.log("Raw data from OpenStreetMap API:", response);

        if (response.ok) {
          const data = await response.json();
          console.log("OpenStreetMap API response:", data);

          if (data.display_name) {
            location.displayName = data.display_name;
            console.log("Using display name from API:", location.displayName);
          }
        }
      } catch (error) {
        console.error("Error fetching display name:", error);
      }
    }

    // Ensure we have a fallback display name if the API call failed
    if (!location.displayName) {
      location.displayName = `Location at ${location.latitude.toFixed(
        4
      )}, ${location.longitude.toFixed(4)}`;
      console.log("Using fallback display name:", location.displayName);
    }

    setFormData((prev) => ({
      ...prev,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        displayName: location.displayName || "",
      },
    }));

    setShowMapModal(false);
  };

  const handleNext = () => {
    console.log(
      "Validating form with role:",
      role,
      "isExistingUser:",
      isExistingUser
    );
    console.log("Gender value:", formData.gender);

    const basicFormValid = validateForm(role, isExistingUser);
    let doctorFormValid = true;

    // For doctors, always validate gender regardless of existing user status
    // For patients, only validate gender for new users
    if ((isDoctor || !isExistingUser) && !formData.gender) {
      setErrorOverlayMsg("Please select your gender");
      return;
    }

    // Continue with the rest of the validation
    if (isDoctor) {
      doctorFormValid = validateDoctorForm();
    }

    // For patients, check if location is selected
    if (
      !isDoctor &&
      (!formData.location.latitude || !formData.location.longitude)
    ) {
      setErrorOverlayMsg("Please select your location");
      return;
    }

    if (basicFormValid && (isDoctor ? doctorFormValid : true)) {
      // Ensure location values aren't null when submitting the form
      const locationWithDefaults = {
        latitude: formData.location.latitude || 0,
        longitude: formData.location.longitude || 0,
        displayName: formData.location.displayName || "",
      };

      navigation.navigate("PhotoUpload", {
        role,
        isExistingUser,
        userData: {
          ...formData,
          location: locationWithDefaults,
          ...(formData.birthDate && {
            birthDate: formattedDate(formData.birthDate),
          }),
          ...(isDoctor && { doctorData: doctorFormData }),
        },
      });
    } else {
      // Check for basic form errors first
      const fieldNames = Object.keys(formData) as (keyof typeof formData)[];
      let firstError = "";
      for (let i = 0; i < fieldNames.length; i++) {
        const errorMsg = getFieldError(fieldNames[i], role, isExistingUser);
        if (errorMsg) {
          firstError = errorMsg;
          break;
        }
      }

      // If no basic form errors but doctor form has errors
      if (!firstError && isDoctor) {
        const doctorErrors = Object.values(doctorValidationErrors);
        if (doctorErrors.length > 0) {
          firstError =
            doctorErrors[0] || "Please complete all doctor information fields.";
        }
      }

      setErrorOverlayMsg(firstError || "Please fix the errors above.");
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaTop}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={false}
          keyboardDismissMode="none"
        >
          <View style={styles.headerContainer}>
            <BackButton />
          </View>

          <AuthHeader
            title="Go ahead and setup your account"
            subtitle="Join ZenCare – Your Personal Health Companion"
          />

          <View style={styles.formOuterContainer}>
            <View style={styles.formContainer}>
              {/* For existing users, show minimal fields */}
              {isExistingUser ? (
                <>
                  <InputField
                    label="Email Address"
                    placeholder="Enter your existing account email"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange("email", value)}
                    error={getFieldError("email", role, isExistingUser)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  {/* Gender field - Only shown for existing users if they're doctors */}
                  {(!isExistingUser || isDoctor) && (
                    <View style={styles.inputWrapper}>
                      <TouchableOpacity
                        style={[
                          styles.selectionButton,
                          getFieldError("gender", role, isExistingUser) &&
                            styles.selectionButtonError,
                        ]}
                        onPress={() => setShowGenderModal(true)}
                      >
                        <Text
                          style={[
                            styles.selectionText,
                            !formData.gender && styles.placeholderText,
                          ]}
                        >
                          {formData.gender || "Select gender"}
                        </Text>
                        <Text style={styles.chevronDown}>▼</Text>
                      </TouchableOpacity>
                      {getFieldError("gender", role, isExistingUser) && (
                        <Text style={styles.errorText}>
                          {getFieldError("gender", role, isExistingUser)}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Role-specific fields for existing users */}
                  {isDoctor ? (
                    // Doctor-specific fields for existing users
                    <DoctorRegistrationFields
                      formData={doctorFormData}
                      onFormDataChange={handleDoctorFormChange}
                      errors={doctorValidationErrors}
                      isExistingUser={true}
                    />
                  ) : (
                    // Patient-specific fields for existing users
                    <>
                      <View style={styles.inputWrapper}>
                        <TouchableOpacity
                          style={styles.datePickerButton}
                          onPress={() => setShowDatePicker(true)}
                        >
                          <Text
                            style={[
                              styles.datePickerText,
                              !formData.birthDate && styles.placeholderText,
                            ]}
                          >
                            {formData.birthDate
                              ? formattedDate(formData.birthDate)
                              : "Select birth date"}
                          </Text>
                          <Text style={styles.calendarIcon}>📅</Text>
                        </TouchableOpacity>
                        {getFieldError("birthDate", role, isExistingUser) && (
                          <Text style={styles.errorText}>
                            {getFieldError("birthDate", role, isExistingUser)}
                          </Text>
                        )}
                      </View>

                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Location</Text>
                        <TouchableOpacity
                          style={styles.mapButton}
                          onPress={() => setShowMapModal(true)}
                        >
                          <Ionicons name="location" size={20} color="white" />
                          <Text style={styles.mapButtonText}>
                            {formData.location.latitude
                              ? "Change Location"
                              : "Select Location"}
                          </Text>
                        </TouchableOpacity>

                        {formData.location.latitude &&
                          formData.location.longitude && (
                            <View style={styles.addressPreview}>
                              <View style={styles.addressHeaderRow}>
                                <Ionicons
                                  name="location"
                                  size={20}
                                  color={Colors.primary500}
                                />
                                <Text style={styles.addressHeaderText}>
                                  Selected Location
                                </Text>
                              </View>
                              {formData.location.displayName ? (
                                <Text style={styles.addressText}>
                                  {formData.location.displayName}
                                </Text>
                              ) : (
                                <Text style={styles.addressText}>
                                  Location selected
                                </Text>
                              )}
                              <Text style={styles.coordsText}>
                                Lat: {formData.location.latitude.toFixed(6)},
                                Lng: {formData.location.longitude.toFixed(6)}
                              </Text>
                            </View>
                          )}
                      </View>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* For new users, show all fields */}
                  <InputField
                    label="First Name"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChangeText={(value) =>
                      handleInputChange("firstName", value)
                    }
                    error={getFieldError("firstName", role, isExistingUser)}
                  />

                  <InputField
                    label="Last Name"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChangeText={(value) =>
                      handleInputChange("lastName", value)
                    }
                    error={getFieldError("lastName", role, isExistingUser)}
                  />

                  <InputField
                    label="Username"
                    placeholder="Enter your username"
                    value={formData.userName}
                    onChangeText={(value) =>
                      handleInputChange("userName", value)
                    }
                    error={getFieldError("userName", role, isExistingUser)}
                  />

                  <InputField
                    label="Email Address"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange("email", value)}
                    error={getFieldError("email", role, isExistingUser)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <View style={styles.inputWrapper}>
                    <InputField
                      label="Mobile Number"
                      placeholder="Enter your mobile number"
                      value={formData.mobilePhone}
                      onChangeText={(value) =>
                        handleInputChange("mobilePhone", value)
                      }
                      error={getFieldError("mobilePhone", role, isExistingUser)}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                    />
                  </View>

                  {/* Gender selection - Only for non-existing users if they are patients */}
                  {(!isExistingUser || isDoctor) && (
                    <View style={styles.inputWrapper}>
                      <TouchableOpacity
                        style={[
                          styles.selectionButton,
                          getFieldError("gender", role, isExistingUser) &&
                            styles.selectionButtonError,
                        ]}
                        onPress={() => setShowGenderModal(true)}
                      >
                        <Text
                          style={[
                            styles.selectionText,
                            !formData.gender && styles.placeholderText,
                          ]}
                        >
                          {formData.gender || "Select gender"}
                        </Text>
                        <Text style={styles.chevronDown}>▼</Text>
                      </TouchableOpacity>
                      {getFieldError("gender", role, isExistingUser) && (
                        <Text style={styles.errorText}>
                          {getFieldError("gender", role, isExistingUser)}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Birth Date - Only for patients */}
                  {!isDoctor && (
                    <View style={styles.inputWrapper}>
                      <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Text
                          style={[
                            styles.datePickerText,
                            !formData.birthDate && styles.placeholderText,
                          ]}
                        >
                          {formData.birthDate
                            ? formattedDate(formData.birthDate)
                            : "Select birth date"}
                        </Text>
                        <Text style={styles.calendarIcon}>📅</Text>
                      </TouchableOpacity>
                      {getFieldError("birthDate", role, isExistingUser) && (
                        <Text style={styles.errorText}>
                          {getFieldError("birthDate", role, isExistingUser)}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Patient Location */}
                  {!isDoctor && (
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Location</Text>
                      <TouchableOpacity
                        style={styles.mapButton}
                        onPress={() => setShowMapModal(true)}
                      >
                        <Ionicons name="location" size={20} color="white" />
                        <Text style={styles.mapButtonText}>
                          {formData.location.latitude
                            ? "Change Location"
                            : "Select Location"}
                        </Text>
                      </TouchableOpacity>

                      {formData.location.latitude &&
                        formData.location.longitude && (
                          <View style={styles.addressPreview}>
                            <View style={styles.addressHeaderRow}>
                              <Ionicons
                                name="location"
                                size={20}
                                color={Colors.primary500}
                              />
                              <Text style={styles.addressHeaderText}>
                                Selected Location
                              </Text>
                            </View>
                            {formData.location.displayName ? (
                              <Text style={styles.addressText}>
                                {formData.location.displayName}
                              </Text>
                            ) : (
                              <Text style={styles.addressText}>
                                Location selected
                              </Text>
                            )}
                            <Text style={styles.coordsText}>
                              Lat: {formData.location.latitude.toFixed(6)}, Lng:{" "}
                              {formData.location.longitude.toFixed(6)}
                            </Text>
                          </View>
                        )}
                    </View>
                  )}

                  {/* Password fields for new users only */}
                  <InputField
                    label="Password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChangeText={(value) =>
                      handleInputChange("password", value)
                    }
                    secureTextEntry
                    error={getFieldError("password", role, isExistingUser)}
                  />
                  <InputField
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={formData.confirmedPassword}
                    onChangeText={(value) =>
                      handleInputChange("confirmedPassword", value)
                    }
                    secureTextEntry
                    error={getFieldError(
                      "confirmedPassword",
                      role,
                      isExistingUser
                    )}
                  />
                </>
              )}

              {/* Terms and Conditions Agreement */}
              <View style={styles.termsContainer}>
                <Checkbox
                  status={agreeToTerms ? "checked" : "unchecked"}
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                  color={Colors.primary500}
                />
                <AuthFooter
                  style={styles.termsText}
                  question="I agree with the"
                  actionText="terms and conditions"
                  onPress={() => {}}
                />
              </View>

              {/* Doctor fields for new users */}
              {isDoctor && !isExistingUser && (
                <>
                  <View style={styles.doctorFieldsContainer}>
                    <DoctorRegistrationFields
                      formData={doctorFormData}
                      onFormDataChange={handleDoctorFormChange}
                      errors={doctorValidationErrors}
                      isExistingUser={false}
                    />
                  </View>

                  <View style={styles.documentUploadContainer}>
                    <DocumentUpload
                      documentUri={doctorFormData.verificationId}
                      error={doctorValidationErrors.verificationId}
                      onDocumentSelected={(uri, type, name) => {
                        handleDoctorFormChange({
                          verificationId: uri,
                          verificationDocumentType: type,
                          verificationDocumentName: name,
                        });
                      }}
                    />
                  </View>
                </>
              )}

              <AuthButton title="Next" onPress={handleNext} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        datePickerState={datePickerState}
        setDatePickerState={setDatePickerState}
      />

      <GenderSelectionModal
        visible={showGenderModal}
        onClose={() => setShowGenderModal(false)}
        onSelect={(gender) => handleInputChange("gender", gender)}
        selectedGender={formData.gender}
      />

      {/* Map Modal - Only for patients */}
      {!isDoctor && (
        <Modal
          visible={showMapModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMapModal(false)}
        >
          <View style={styles.fullScreenModalContainer}>
            <View style={styles.fullScreenModalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowMapModal(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>

              <View style={styles.fullScreenMapContainer}>
                <SearchableMapExample
                  onConfirmLocation={handleLocationConfirmed}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      <ErrorOverlay
        visible={!!errorOverlayMsg}
        message={errorOverlayMsg}
        onRetry={() => {
          setErrorOverlayMsg("");
          validateForm(role, isExistingUser);
        }}
      />
    </View>
  );
};

export default SignUpDetailsScreen;
