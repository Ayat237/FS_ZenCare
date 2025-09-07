import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Text,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import Colors from "@theme/colors";
import BackButton from "@components/layout/BackButton";
import AuthHeader from "@components/Auth/AuthHeader";
import AuthButton from "@/components/ui/buttons/AuthButton";
import AuthFooter from "@components/Auth/AuthFooter";
import SuccessOverlay from "@components/ui/feedback/SuccessOverlay";
import LoadingOverlay from "@components/ui/feedback/LoadingOverlay";
import ErrorOverlay from "@components/ui/feedback/ErrorOverlay";
import userIcon from "@assets/images/user.png";
import * as ImagePicker from "expo-image-picker";
import { authService } from "@/services/api/auth";

type PhotoUploadRouteProp = RouteProp<RootStackParamList, "PhotoUpload">;

const PhotoUploadScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<PhotoUploadRouteProp>();
  const { role, userData, isExistingUser = false } = route.params;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailToken, setEmailToken] = useState<string | null>(null);

  const handleUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error picking image:", error);
    }
  };

  // Helper function to create a valid file object for FormData
  const createFileObject = (uri: string, name?: string, type?: string): any => {
    if (!uri) return null;

    const uriParts = uri.split(".");
    const fileType = uriParts[uriParts.length - 1].toLowerCase();

    // Default name if not provided
    const fileName = name || `file-${Date.now()}.${fileType}`;

    // Determine MIME type based on file extension if not provided
    let mimeType = type || "application/octet-stream"; // default fallback
    if (!type) {
      if (["jpg", "jpeg"].includes(fileType)) {
        mimeType = "image/jpeg";
      } else if (fileType === "png") {
        mimeType = "image/png";
      } else if (fileType === "gif") {
        mimeType = "image/gif";
      } else if (fileType === "pdf") {
        mimeType = "application/pdf";
      } else if (fileType === "webp") {
        mimeType = "image/webp";
      }
    }

    console.log(`Creating file object: ${fileName} (${mimeType})`);
    return {
      uri,
      name: fileName,
      type: mimeType,
    };
  };

  // Format clinic branches to match the backend expected structure
  const formatClinicBranches = (branches: any[], mobilePhone: string) => {
    if (!branches || branches.length === 0) {
      return [
        {
          address: {
            displayName: "Default Address",
            coordinates: {
              latitude: 30.0444,
              longitude: 31.2357,
            },
          },
          phoneNumber: mobilePhone || "To be updated",
        },
      ];
    }

    return branches.map((clinic: any) => ({
      address: {
        displayName: clinic.address?.displayName || "Selected Location",
        coordinates: {
          latitude: clinic.address?.coordinates?.latitude || 30.0444,
          longitude: clinic.address?.coordinates?.longitude || 31.2357,
        },
      },
      phoneNumber: clinic.phoneNumber || mobilePhone || "To be updated",
    }));
  };

  const handleRegistration = async (withPhoto: boolean) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Starting registration with data:", {
        role,
        isExistingUser,
        hasPhoto: withPhoto && !!selectedImage,
        email: userData.email,
      });

      // Special handling for doctor verification ID
      const handleVerificationId = (
        verificationUri: string,
        docType?: string,
        docName?: string
      ) => {
        if (!verificationUri) return null;
        return createFileObject(verificationUri, docName, docType);
      };

      const formData = new FormData();

      // Log registration type
      console.log(
        `Starting ${
          isExistingUser ? "existing" : "new"
        } user registration as ${role}`
      );
      console.log(
        "Registration data:",
        JSON.stringify({
          email: userData.email,
          gender: userData.gender,
          role: role,
          isExistingUser: isExistingUser,
          hasPhoto: withPhoto && !!selectedImage,
        })
      );

      if (isExistingUser) {
        // For existing users, only send minimal required fields
        formData.append("email", userData.email);

        // Only include gender if it's defined
        if (userData.gender) {
          formData.append("gender", userData.gender);
        }

        if (role === "doctor") {
          // For existing user becoming doctor
          if (userData.doctorData) {
            const doctorData = userData.doctorData;
            formData.append("specialty", doctorData.specialty);
            formData.append(
              "yearsOfExperience",
              doctorData.yearsOfExperience.toString()
            );
            formData.append("education", JSON.stringify(doctorData.education));
            formData.append(
              "certifications",
              JSON.stringify(doctorData.certifications || [])
            );

            let validHospitalAffiliations =
              doctorData.hospitalAffiliations?.filter(
                (hospital: any) => hospital.name && hospital.name.trim() !== ""
              ) || [];
            if (validHospitalAffiliations.length === 0) {
              validHospitalAffiliations = [{ name: "To be updated" }];
            }
            formData.append(
              "hospitalAffiliation",
              JSON.stringify(validHospitalAffiliations)
            );

            // Format clinic branches properly for backend
            const clinicBranches = formatClinicBranches(
              doctorData.clinicBranches,
              userData.mobilePhone
            );

            // Send clinicBranches as JSON string
            formData.append("clinicBranches", JSON.stringify(clinicBranches));

            if (doctorData.verificationId) {
              const fileObject = handleVerificationId(
                doctorData.verificationId,
                doctorData.verificationDocumentType,
                doctorData.verificationDocumentName
              );

              if (fileObject) {
                // Create a proper object for FormData
                formData.append("verificationId", fileObject as any);
                console.log(
                  "Added verification document to form data:",
                  fileObject
                );
              }
            }
          } else {
            // Default values if no doctor data
            formData.append(
              "clinicBranches",
              JSON.stringify([
                {
                  address: {
                    displayName: "Default Address",
                    coordinates: {
                      longitude: 31.2357,
                      latitude: 30.0444,
                    },
                  },
                  phoneNumber: userData.mobilePhone || "To be updated",
                },
              ])
            );
          }
        } else {
          // For existing user becoming patient
          if (userData.birthDate) {
            formData.append("birthDate", userData.birthDate);
          } else {
            // Provide a default birthDate if not present to avoid backend errors
            formData.append(
              "birthDate",
              new Date().toISOString().split("T")[0]
            );
          }

          if (userData.location) {
            // Ensure coordinates are valid numbers before stringifying
            const longitude = userData.location.longitude || 0;
            const latitude = userData.location.latitude || 0;

            formData.append(
              "coordinates",
              JSON.stringify({
                longitude,
                latitude,
              })
            );

            // Ensure we always have a displayName value
            const displayName =
              userData.location.displayName || "Selected location";
            formData.append("address", displayName);
          } else {
            // Provide default location data if missing
            formData.append(
              "coordinates",
              JSON.stringify({
                longitude: 31.2357,
                latitude: 30.0444,
              })
            );
            formData.append("address", "Default location");
          }
        }
      } else {
        // For new users, send all user data
        formData.append("userName", userData.userName || "");
        formData.append("email", userData.email);
        formData.append("password", userData.password || "");
        formData.append("confirmedPassword", userData.confirmedPassword || "");
        formData.append("firstName", userData.firstName || "");
        formData.append("lastName", userData.lastName || "");
        formData.append("mobilePhone", userData.mobilePhone || "");
        formData.append("gender", userData.gender);

        if (role === "doctor") {
          // Doctor registration - role should be an array
          formData.append("role", JSON.stringify(["doctor"]));

          if (userData.doctorData) {
            const doctorData = userData.doctorData;
            formData.append("specialty", doctorData.specialty);
            formData.append(
              "yearsOfExperience",
              doctorData.yearsOfExperience.toString()
            );
            formData.append("education", JSON.stringify(doctorData.education));
            formData.append(
              "certifications",
              JSON.stringify(doctorData.certifications || [])
            );

            let validHospitalAffiliations =
              doctorData.hospitalAffiliations?.filter(
                (hospital: any) => hospital.name && hospital.name.trim() !== ""
              ) || [];
            if (validHospitalAffiliations.length === 0) {
              validHospitalAffiliations = [{ name: "To be updated" }];
            }
            formData.append(
              "hospitalAffiliation",
              JSON.stringify(validHospitalAffiliations)
            );

            // Format clinic branches properly for backend
            const clinicBranches = formatClinicBranches(
              doctorData.clinicBranches,
              userData.mobilePhone
            );

            // Send clinicBranches as JSON string
            formData.append("clinicBranches", JSON.stringify(clinicBranches));

            if (doctorData.verificationId) {
              const fileObject = handleVerificationId(
                doctorData.verificationId,
                doctorData.verificationDocumentType,
                doctorData.verificationDocumentName
              );

              if (fileObject) {
                formData.append("verificationId", fileObject as any);
                console.log(
                  "Added verification document to form data:",
                  fileObject
                );
              }
            }
          } else {
            // Default values if no doctor data
            formData.append(
              "clinicBranches",
              JSON.stringify([
                {
                  address: {
                    displayName: "Default Address",
                    coordinates: {
                      longitude: 31.2357,
                      latitude: 30.0444,
                    },
                  },
                  phoneNumber: userData.mobilePhone || "To be updated",
                },
              ])
            );
          }
        } else {
          // Patient registration
          formData.append("role", "patient");
          if (userData.birthDate) {
            formData.append("birthDate", userData.birthDate);
          } else {
            // Provide a default birthDate if not present to avoid backend errors
            formData.append(
              "birthDate",
              new Date().toISOString().split("T")[0]
            );
          }

          if (userData.location) {
            // Ensure coordinates are valid numbers before stringifying
            const longitude = userData.location.longitude || 0;
            const latitude = userData.location.latitude || 0;

            formData.append(
              "coordinates",
              JSON.stringify({
                longitude,
                latitude,
              })
            );

            // Ensure we always have a displayName value
            const displayName =
              userData.location.displayName || "Selected location";
            formData.append("address", displayName);
          } else {
            // Provide default location data if missing
            formData.append(
              "coordinates",
              JSON.stringify({
                longitude: 31.2357,
                latitude: 30.0444,
              })
            );
            formData.append("address", "Default location");
          }
        }
      }

      // Add profile image if selected
      if (withPhoto && selectedImage) {
        try {
          const fileObject = createFileObject(
            selectedImage,
            `profile-${Date.now()}`
          );

          if (fileObject) {
            console.log(
              `Adding profile image: ${fileObject.name} (${fileObject.type})`
            );
            formData.append("profileImage", fileObject as any);
            console.log("Added profile image to form data");
          }
        } catch (error) {
          console.error("Error adding profile image to form data:", error);
          // Continue with registration even if image handling fails
        }
      }

      let response;
      console.log(
        `Sending registration request for ${role} (${
          isExistingUser ? "existing" : "new"
        } user)`
      );

      if (role === "doctor") {
        if (isExistingUser) {
          response = await authService.signupExistingDoctorFormData(formData);
        } else {
          response = await authService.signupDoctorFormData(formData);
        }
      } else {
        if (isExistingUser) {
          response = await authService.signupExistingPatientFormData(formData);
        } else {
          response = await authService.signupPatientFormData(formData);
        }
      }

      console.log("Registration response:", response);

      if (response.success) {
        if (isExistingUser) {
          // For existing users, show success message and navigate to appropriate screen
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            });
          }, 2000);
        } else {
          // For new users, proceed to email verification
          const emailToken = response.emailToken || response.data?.emailToken;
          setEmailToken(emailToken);

          setTimeout(() => {
            navigation.navigate("EmailVerification", {
              emailToken,
              userRole: role,
              email: userData.email,
            });
          }, 500);
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      // Extract the most useful error message
      let errorMessage = "Registration failed. Please try again.";
      if (error.message && typeof error.message === "string") {
        if (
          error.message.includes("first argument must be of type string") ||
          error.message.includes("undefined")
        ) {
          errorMessage =
            "Missing required data. Please complete all required fields and try again.";
          console.error(
            "Likely FormData error with undefined values:",
            error.message
          );
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    handleRegistration(false);
  };

  const handleDone = () => {
    handleRegistration(true);
  };

  const handleContinue = () => {
    if (role === "doctor") {
      navigation.navigate("RegistrationSubmitted");
    } else {
      setTimeout(() => {
        navigation.navigate("EmailVerification", {
          emailToken,
          userRole: role,
          email: userData.email,
        });
      }, 500);
    }
  };

  const handleTryAnotherEmail = () => {
    setError(null);
    setShowSuccess(false);
    setEmailToken(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <BackButton />
        </View>

        <AuthHeader
          title={`${isExistingUser ? "Add" : "Upload"} your photo`}
          subtitle={`${
            isExistingUser ? "Add" : "Upload"
          } a profile picture to personalize your account`}
        />

        <View style={styles.contentContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={selectedImage ? { uri: selectedImage } : userIcon}
              style={styles.profileImage}
            />
          </View>

          <View style={styles.buttonContainer}>
            {!selectedImage ? (
              <AuthButton
                title="Upload Photo"
                onPress={handleUpload}
                buttonStyle={styles.uploadButton}
                textButtonStyle={styles.uploadButtonText}
              />
            ) : (
              <AuthButton
                title="Done"
                onPress={handleDone}
                buttonStyle={styles.doneButton}
                textButtonStyle={styles.uploadButtonText}
              />
            )}

            <AuthButton
              title={
                isExistingUser
                  ? "Complete Registration"
                  : "Continue without Photo"
              }
              onPress={handleSkip}
              buttonStyle={styles.skipButton}
              textButtonStyle={styles.skipButtonText}
            />
          </View>

          <AuthFooter
            question={
              isExistingUser
                ? "Already have both roles?"
                : "Already have an account?"
            }
            actionText="Sign In"
            onPress={() => navigation.navigate("Login")}
          />
        </View>
      </ScrollView>

      {isLoading && <LoadingOverlay visible={true} />}

      {error && (
        <ErrorOverlay
          visible={true}
          message={error}
          onRetry={() => setError(null)}
        />
      )}

      {showSuccess && (
        <SuccessOverlay
          visible={true}
          title="Success!"
          message={
            isExistingUser
              ? `${
                  role === "doctor" ? "Doctor" : "Patient"
                } role added successfully!`
              : "Account created successfully!"
          }
          onContinue={handleContinue}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary500,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingTop: 48,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    alignItems: "center",
  },
  imageContainer: {
    marginBottom: 40,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: Colors.primary100,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
    marginBottom: 40,
  },
  uploadButton: {
    backgroundColor: Colors.primary500,
  },
  uploadButtonText: {
    color: "#fff",
  },
  skipButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.primary500,
  },
  skipButtonText: {
    color: Colors.primary500,
  },
  doneButton: {
    backgroundColor: Colors.success500,
  },
});

export default PhotoUploadScreen;
