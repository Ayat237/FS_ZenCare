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
  const { role } = route.params;
  const isDoctor = role === "doctor";

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
    const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    setFormData((prev) => ({ ...prev, birthDate: formattedDate }));
    setShowDatePicker(false);
  };

  const handleLocationConfirmed = (location: {
    latitude: number;
    longitude: number;
    displayName?: string;
  }) => {
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
    const basicFormValid = validateForm(role);
    let doctorFormValid = true;

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
      navigation.navigate("PhotoUpload", {
        role,
        userData: {
          ...formData,
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
        const errorMsg = getFieldError(fieldNames[i]);
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
              <InputField
                label="First Name"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChangeText={(value) => handleInputChange("firstName", value)}
                error={getFieldError("firstName")}
              />
              <InputField
                label="Last Name"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChangeText={(value) => handleInputChange("lastName", value)}
                error={getFieldError("lastName")}
              />

              <InputField
                label="Username"
                placeholder="Enter your username"
                value={formData.userName}
                onChangeText={(value) => handleInputChange("userName", value)}
                error={getFieldError("userName")}
              />

              <InputField
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                error={getFieldError("email")}
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
                  error={getFieldError("mobilePhone")}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <TouchableOpacity
                  style={[
                    styles.selectionButton,
                    getFieldError("gender", role) &&
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
                {getFieldError("gender", role) && (
                  <Text style={styles.errorText}>
                    {getFieldError("gender", role)}
                  </Text>
                )}
              </View>

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
                      {formData.birthDate || "Select birth date"}
                    </Text>
                    <Text style={styles.calendarIcon}>📅</Text>
                  </TouchableOpacity>
                  {getFieldError("birthDate", role) && (
                    <Text style={styles.errorText}>
                      {getFieldError("birthDate", role)}
                    </Text>
                  )}
                </View>
              )}

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

              <InputField
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                secureTextEntry
                error={getFieldError("password")}
              />
              <InputField
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmedPassword}
                onChangeText={(value) =>
                  handleInputChange("confirmedPassword", value)
                }
                secureTextEntry
                error={getFieldError("confirmedPassword")}
              />

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

              {isDoctor && (
                <>
                  <View style={styles.doctorFieldsContainer}>
                    <DoctorRegistrationFields
                      formData={doctorFormData}
                      onFormDataChange={handleDoctorFormChange}
                      errors={doctorValidationErrors}
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
          validateForm();
        }}
      />
    </View>
  );
};

export default SignUpDetailsScreen;
