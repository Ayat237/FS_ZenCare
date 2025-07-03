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
      console.log("Starting image upload from library...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      console.log(
        "Image picker result:",
        result.canceled ? "Canceled" : "Image selected"
      );

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log("Setting selected image:", result.assets[0].uri);
        setSelectedImage(result.assets[0].uri);
        // Force UI refresh after image selection
        setTimeout(() => {
          console.log("Selected image state after update:", !!selectedImage);
        }, 100);
      }
    } catch (error) {
      console.log("Error picking image:", error);
    }
  };

  // Helper function to create a valid file object for FormData
  const createFileObject = (uri: string, name?: string, type?: string): any => {
    if (!uri) {
      console.warn("Empty URI provided to createFileObject");
      return null;
    }

    try {
      // Extract file extension
      const uriParts = uri.split(".");
      const fileType =
        uriParts.length > 1
          ? uriParts[uriParts.length - 1].toLowerCase()
          : "jpg";

      // Default name if not provided, ensure it has an extension
      const fileName = name || `file-${Date.now()}.${fileType}`;

      // Make sure fileName has an extension
      const hasExtension = fileName.includes(".");
      const finalName = hasExtension ? fileName : `${fileName}.${fileType}`;

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

      console.log(`Creating file object: ${finalName} (${mimeType})`);
      return {
        uri: uri,
        name: finalName,
        type: mimeType,
      };
    } catch (error) {
      console.error("Error in createFileObject:", error);
      // Return a default image object as fallback
      return {
        uri: uri,
        name: `fallback-${Date.now()}.jpg`,
        type: "image/jpeg",
      };
    }
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

  // Utility function to safely append data to FormData, avoiding undefined values
  const safeAppend = (formData: FormData, key: string, value: any) => {
    // Skip undefined/null values
    if (value === undefined || value === null) {
      console.log(`Skipping undefined/null value for key: ${key}`);
      return;
    }

    // Convert non-string primitives to strings
    if (
      typeof value !== "string" &&
      !(value instanceof Blob) &&
      typeof value !== "object"
    ) {
      value = String(value);
    }

    // Handle objects by JSON stringifying them
    if (typeof value === "object" && !(value instanceof Blob)) {
      value = JSON.stringify(value);
    }

    console.log(
      `Appending to FormData - ${key}: ${
        typeof value === "object" ? "Object/File" : value
      }`
    );
    formData.append(key, value);
  };

  const handleRegistration = async (withPhoto: boolean) => {
    // Prevent multiple simultaneous registration attempts
    if (isLoading) {
      console.log("Registration already in progress, ignoring duplicate call");
      return;
    }

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
        if (!verificationUri) {
          console.error(
            "⛔ No verification URI provided, skipping verification ID"
          );
          return null;
        }

        console.log("Processing verification document:", {
          uri: verificationUri,
          type: docType || "Detecting from extension...",
          name: docName || "Unknown document name",
        });

        try {
          const fileObj = createFileObject(verificationUri, docName, docType);
          console.log("Created verification file object:", fileObj);
          return fileObj;
        } catch (error) {
          console.error(
            "Error creating file object for verification ID:",
            error
          );
          return null;
        }
      };

      // Add this function to help create more detailed debug logging
      const logVerificationDetails = (fileObject: any) => {
        try {
          // Check if we have a valid file object
          if (!fileObject || typeof fileObject !== "object") {
            console.error("Invalid file object for verification:", fileObject);
            return;
          }

          // Log essential file properties
          console.log("VERIFICATION FILE DETAILS:");
          console.log(`- URI: ${fileObject.uri || "MISSING"}`);
          console.log(`- Name: ${fileObject.name || "MISSING"}`);
          console.log(`- Type: ${fileObject.type || "MISSING"}`);
          console.log(
            `- Object type: ${Object.prototype.toString.call(fileObject)}`
          );

          // Create React Native FormData compatible object
          const fileForFormData = {
            uri: fileObject.uri,
            type: fileObject.type || "application/octet-stream",
            name: fileObject.name || "document.jpg",
          };

          console.log(
            "Properly formatted file object for FormData:",
            fileForFormData
          );
          return fileForFormData;
        } catch (error) {
          console.error("Error in logVerificationDetails:", error);
          return null;
        }
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
        safeAppend(formData, "email", userData.email);

        // Only include gender if it's defined
        if (userData.gender) {
          safeAppend(formData, "gender", userData.gender);
        }

        if (role === "doctor") {
          // For existing user becoming doctor
          if (userData.doctorData) {
            const doctorData = userData.doctorData;
            safeAppend(formData, "specialty", doctorData.specialty);
            safeAppend(
              formData,
              "yearsOfExperience",
              doctorData.yearsOfExperience
                ? doctorData.yearsOfExperience.toString()
                : "1"
            );

            // Ensure education is a valid array and properly stringified
            const education = doctorData.education || [];
            safeAppend(formData, "education", JSON.stringify(education));

            // Ensure certifications is a valid array
            const certifications = doctorData.certifications || [];
            safeAppend(
              formData,
              "certifications",
              JSON.stringify(certifications)
            );

            let validHospitalAffiliations =
              doctorData.hospitalAffiliations?.filter(
                (hospital: any) => hospital.name && hospital.name.trim() !== ""
              ) || [];
            if (validHospitalAffiliations.length === 0) {
              validHospitalAffiliations = [{ name: "To be updated" }];
            }
            safeAppend(
              formData,
              "hospitalAffiliation",
              JSON.stringify(validHospitalAffiliations)
            );

            // Format clinic branches properly for backend
            const clinicBranches = formatClinicBranches(
              doctorData.clinicBranches || [],
              userData.mobilePhone || "To be updated"
            );

            // Send clinicBranches as JSON string
            safeAppend(
              formData,
              "clinicBranches",
              JSON.stringify(clinicBranches)
            );

            if (doctorData.verificationId) {
              const fileObject = handleVerificationId(
                doctorData.verificationId,
                doctorData.verificationDocumentType,
                doctorData.verificationDocumentName
              );

              if (fileObject) {
                // Create a proper object for FormData
                console.log(
                  "Appending to FormData - verificationId:",
                  fileObject
                );

                // IMPORTANT: The backend expects files.verificationId[0] to be a proper file
                // For React Native, we need to structure the object correctly for the FormData
                // The key name must exactly match what the backend multer middleware expects
                try {
                  formData.append("verificationId", {
                    uri: fileObject.uri,
                    type: fileObject.type,
                    name: fileObject.name,
                  } as any);

                  console.log(
                    "Added verification document to form data:",
                    fileObject
                  );
                } catch (appendError) {
                  console.error(
                    "Error appending verification ID:",
                    appendError
                  );
                }
              }
            }
          } else {
            // Default values if no doctor data
            safeAppend(
              formData,
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
            safeAppend(formData, "birthDate", userData.birthDate);
          } else {
            // Provide a default birthDate if not present to avoid backend errors
            safeAppend(
              formData,
              "birthDate",
              new Date().toISOString().split("T")[0]
            );
          }

          if (userData.location) {
            // Ensure coordinates are valid numbers before stringifying
            const longitude = userData.location.longitude || 0;
            const latitude = userData.location.latitude || 0;

            safeAppend(
              formData,
              "coordinates",
              JSON.stringify({
                longitude,
                latitude,
              })
            );

            // Ensure we always have a displayName value
            const displayName =
              userData.location.displayName || "Selected location";
            safeAppend(formData, "address", displayName);
          } else {
            // Provide default location data if missing
            safeAppend(
              formData,
              "coordinates",
              JSON.stringify({
                longitude: 31.2357,
                latitude: 30.0444,
              })
            );
            safeAppend(formData, "address", "Default location");
          }
        }
      } else {
        // For new users, send all user data
        safeAppend(formData, "userName", userData.userName || "");
        safeAppend(formData, "email", userData.email);
        safeAppend(formData, "password", userData.password || "");
        safeAppend(
          formData,
          "confirmedPassword",
          userData.confirmedPassword || ""
        );
        safeAppend(formData, "firstName", userData.firstName || "");
        safeAppend(formData, "lastName", userData.lastName || "");
        safeAppend(formData, "mobilePhone", userData.mobilePhone || "");
        safeAppend(formData, "gender", userData.gender);

        if (role === "doctor") {
          // Doctor registration - role should be an array
          safeAppend(formData, "role", JSON.stringify(["doctor"]));

          if (userData.doctorData) {
            const doctorData = userData.doctorData;
            safeAppend(
              formData,
              "specialty",
              doctorData.specialty || "General"
            );
            safeAppend(
              formData,
              "yearsOfExperience",
              doctorData.yearsOfExperience
                ? doctorData.yearsOfExperience.toString()
                : "1"
            );

            // Ensure education is a valid array
            const education = doctorData.education || [];
            safeAppend(formData, "education", JSON.stringify(education));

            // Ensure certifications is a valid array
            const certifications = doctorData.certifications || [];
            safeAppend(
              formData,
              "certifications",
              JSON.stringify(certifications)
            );

            let validHospitalAffiliations =
              doctorData.hospitalAffiliations?.filter(
                (hospital: any) => hospital.name && hospital.name.trim() !== ""
              ) || [];

            if (validHospitalAffiliations.length === 0) {
              validHospitalAffiliations = [{ name: "To be updated" }];
            }

            safeAppend(
              formData,
              "hospitalAffiliation",
              JSON.stringify(validHospitalAffiliations)
            );

            // Format clinic branches properly for backend
            const clinicBranches = formatClinicBranches(
              doctorData.clinicBranches,
              userData.mobilePhone
            );

            // Send clinicBranches as JSON string
            safeAppend(
              formData,
              "clinicBranches",
              JSON.stringify(clinicBranches)
            );

            if (doctorData.verificationId) {
              console.log(
                "Found verificationId in doctorData:",
                doctorData.verificationId
              );
              const fileObject = handleVerificationId(
                doctorData.verificationId,
                doctorData.verificationDocumentType,
                doctorData.verificationDocumentName
              );

              if (fileObject) {
                console.log(
                  "Appending to FormData - verificationId:",
                  fileObject
                );

                // IMPORTANT: The backend expects files.verificationId[0] to be a proper file
                // For React Native, we need to structure the object correctly for the FormData
                try {
                  formData.append("verificationId", {
                    uri: fileObject.uri,
                    type: fileObject.type,
                    name: fileObject.name,
                  } as any);

                  console.log(
                    "✅ Added verification document to form data:",
                    fileObject
                  );
                } catch (appendError) {
                  console.error(
                    "Error appending verification ID:",
                    appendError
                  );
                }
              } else {
                console.error(
                  "❌ Failed to create verification document file object"
                );
              }
            } else {
              console.error("❌ No verificationId found in doctorData");
            }
          } else {
            // Default values if no doctor data
            safeAppend(
              formData,
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
          safeAppend(formData, "role", "patient");

          if (userData.birthDate) {
            safeAppend(formData, "birthDate", userData.birthDate);
          } else {
            // Provide a default birthDate if not present to avoid backend errors
            safeAppend(
              formData,
              "birthDate",
              new Date().toISOString().split("T")[0]
            );
          }

          if (userData.location) {
            // Ensure coordinates are valid numbers before stringifying
            const longitude = userData.location.longitude || 0;
            const latitude = userData.location.latitude || 0;

            safeAppend(
              formData,
              "coordinates",
              JSON.stringify({
                longitude,
                latitude,
              })
            );

            // Ensure we always have a displayName value
            const displayName =
              userData.location.displayName || "Selected location";
            safeAppend(formData, "address", displayName);
          } else {
            // Provide default location data if missing
            safeAppend(
              formData,
              "coordinates",
              JSON.stringify({
                longitude: 31.2357,
                latitude: 30.0444,
              })
            );
            safeAppend(formData, "address", "Default location");
          }
        }
      } // Add profile image if selected
      if (withPhoto && selectedImage) {
        try {
          console.log("Processing profile image from:", selectedImage);

          const fileObject = createFileObject(
            selectedImage,
            `profile-${Date.now()}.jpg`
          );

          if (fileObject) {
            console.log(
              `Adding profile image: ${fileObject.name} (${fileObject.type})`
            );
            safeAppend(formData, "profileImage", fileObject as any);
            console.log("Added profile image to form data");
          } else {
            console.warn("Failed to create file object for profile image");
          }
        } catch (error) {
          console.error("Error adding profile image to form data:", error);
          // Continue with registration even if image handling fails
        }
      }

      // Check if we have verification ID in FormData (for existing doctor registration)
      if (role === "doctor" && isExistingUser) {
        try {
          const formDataEntries: [string, any][] = [];
          // @ts-ignore - Access internal structure for debugging
          if (formData._parts && Array.isArray(formData._parts)) {
            // @ts-ignore
            formDataEntries.push(...formData._parts);
            const hasVerificationId = formDataEntries.some(
              (entry) => entry[0] === "verificationId"
            );

            if (!hasVerificationId) {
              console.error(
                "❌ CRITICAL: verificationId is missing from FormData"
              );
              setError(
                "Verification document is missing. Please go back and try again."
              );
              setIsLoading(false);
              return;
            } else {
              console.log("✅ Verification ID is included in FormData");
            }
          }
        } catch (e) {
          console.error("Error checking FormData:", e);
        }
      }

      let response;
      console.log(
        `Sending registration request for ${role} (${
          isExistingUser ? "existing" : "new"
        } user)`
      );

      // Debug form data keys
      try {
        const formDataEntries: [string, any][] = [];
        // @ts-ignore - Access internal structure for debugging
        if (formData._parts && Array.isArray(formData._parts)) {
          // @ts-ignore
          formDataEntries.push(...formData._parts);

          // Debug if verification ID is in form data
          const hasVerificationId = formDataEntries.some(
            (entry) => entry[0] === "verificationId"
          );
          console.log(
            "Form data verification status:",
            hasVerificationId ? "✅ INCLUDED" : "❌ MISSING"
          );

          // Check the type of verification ID value
          const verificationEntry = formDataEntries.find(
            (entry) => entry[0] === "verificationId"
          );
          if (verificationEntry) {
            console.log(
              "Verification ID value type:",
              typeof verificationEntry[1],
              Object.prototype.toString.call(verificationEntry[1])
            );
          }
        }
        console.log(
          "Form data keys to be submitted:",
          formDataEntries.map((entry) => entry[0])
        );
      } catch (e) {
        console.log("Could not log form data keys:", e);
      }

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
            if (!showSuccess) return; // Prevent duplicate navigation
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
            if (isLoading) return; // Prevent duplicate navigation
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
        console.error("Full error message:", error.message);

        if (error.response?.data) {
          console.error(
            "Server error response data:",
            JSON.stringify(error.response.data)
          );
        }

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
        } else if (error.message.includes("verification")) {
          errorMessage = "Please upload a verification document and try again.";
          console.error("Verification document error:", error.message);

          // Try to get more information about the error
          if (error.response?.data) {
            console.error(
              "Server verification error details:",
              JSON.stringify(error.response.data)
            );
          }

          // Log the verification document status
          try {
            // Note: formData is not in scope here, so we'll log what we can
            console.error(
              "Error occurred during verification document handling"
            );
          } catch (e) {
            console.error("Could not check verification status:", e);
          }
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
          console.error("Server error:", error.response.data);
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

  // Add a more visible console log for debugging the Done button
  const handleDone = () => {
    console.log(
      "✅ Done button pressed - continuing with registration and uploading selected image"
    );
    handleRegistration(true);
  };

  const handleContinue = () => {
    if (isLoading) return; // Prevent navigation during loading

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
                textButtonStyle={styles.doneButtonText}
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
    backgroundColor: Colors.primary500,
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  doneButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PhotoUploadScreen;
