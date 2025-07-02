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
  const { role, userData } = route.params;
  // console.log("Role:", role);
  // console.log("User Data:", userData);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailToken, setEmailToken] = useState<string | null>(null);

  const handleRegistration = async (withPhoto: boolean) => {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();

      // Add user data to FormData
      formData.append("userName", userData.userName);
      formData.append("email", userData.email);
      formData.append("password", userData.password);
      formData.append("confirmedPassword", userData.confirmedPassword);
      formData.append("firstName", userData.firstName);
      formData.append("lastName", userData.lastName);
      formData.append("role", role);
      formData.append("mobilePhone", userData.mobilePhone);
      formData.append("gender", userData.gender);
      formData.append("birthDate", userData.birthDate);
      
      // Add doctor-specific data if role is doctor
      if (role === "doctor" && userData.doctorData) {
        const doctorData = userData.doctorData;
        
        formData.append("specialty", doctorData.specialty);
        formData.append("yearsOfExperience", doctorData.yearsOfExperience.toString());
        
        // Add education data
        formData.append("education", JSON.stringify(doctorData.education));
        
        // Add certifications
        formData.append("certifications", JSON.stringify(doctorData.certifications));
        
        // Add hospital affiliations
        formData.append("hospitalAffiliations", JSON.stringify(doctorData.hospitalAffiliations));
        
        // Add clinic branches
        formData.append("clinicBranches", JSON.stringify(doctorData.clinicBranches));
        
        // Add verification document if available
        if (doctorData.verificationId) {
          const verificationUri = doctorData.verificationId;
          const filename = verificationUri.split("/").pop() || `verification-${Date.now()}`;
          const isPdf = doctorData.verificationDocumentType?.includes('pdf');
          const type = isPdf ? 'application/pdf' : doctorData.verificationDocumentType || 'application/octet-stream';
          
          formData.append("verificationDocument", {
            uri: verificationUri,
            name: doctorData.verificationDocumentName || filename,
            type,
          } as unknown as File);
        }
      }

      // Add profile image if selected
      if (withPhoto && selectedImage) {
        const imageUri = selectedImage;
        const filename = imageUri.split("/").pop() || `image-${Date.now()}.jpg`;
        const match = /\.([\w]+)$/.exec(filename) || [null, "jpeg"];
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("profileImage", {
          uri: imageUri,
          name: filename,
          type,
        } as unknown as File);
      }

      // Send data to API
      const response = await authService.signupFormData(formData);
      const { emailToken } = response;
      setEmailToken(emailToken);
      setShowSuccess(true);
      // Don't navigate immediately, let the SuccessOverlay handle navigation
    } catch (error: any) {
      setError(error.message);
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
      navigation.navigate("Login");
    } else {
      navigation.navigate("EmailVerification", { emailToken });
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaTop}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={false}
        >
          <View style={styles.headerContainer}>
            <BackButton />
          </View>

          <AuthHeader
            title="Create your account"
            subtitle="Join ZenCare – Your Personal Health Companion"
          />

          <View style={styles.formOuterContainer}>
            <View style={styles.formContainer}>
              <View style={styles.photoContainer}>
                <Image
                  source={selectedImage ? { uri: selectedImage } : userIcon}
                  style={styles.photoPlaceholder}
                />
              </View>

              <Text style={styles.uploadText}>
                Upload Photo from your phone
              </Text>

              <View style={styles.uploadContainer}>
                <AuthButton
                  title="Upload"
                  onPress={handleUpload}
                  buttonStyle={styles.uploadButton}
                  textButtonStyle={styles.uploadButtonText}
                />
                <View style={styles.buttonSpacer} />
                <AuthButton
                  title="Skip"
                  onPress={handleSkip}
                  buttonStyle={styles.skipButton}
                  textButtonStyle={styles.skipButtonText}
                />
              </View>

              {selectedImage && (
                <AuthButton
                  title="Done"
                  onPress={handleDone}
                  buttonStyle={styles.doneButton}
                />
              )}
            </View>

            <AuthFooter
              question="Need help?"
              actionText="Visit our help center"
              onPress={() => {}}
              style={styles.footerContainer}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      <SuccessOverlay
        visible={showSuccess}
        title="Registration Successful!"
        message={role === "doctor" 
          ? "Thank you for registering as a doctor. An administrator will verify your account before you can log in. Please check your email for further instructions."
          : "We have sent you a verification code by email"}
        onContinue={handleContinue}
      />
      <LoadingOverlay visible={isLoading} />
      <ErrorOverlay
        visible={!!error}
        message={error || ""}
        onRetry={() => setError(null)}
      />
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
  scrollViewContent: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  formOuterContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingTop: 48,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  formContainer: {
    gap: 20,
    alignItems: "center",
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  uploadContainer: {
    width: "80%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  uploadButton: {
    backgroundColor: Colors.primary500,
    width: 100,
  },
  uploadButtonText: {
    color: "white",
    fontFamily: "open-sans-bold",
  },
  skipButton: {
    backgroundColor: "white",
    color: Colors.primary500,
    borderWidth: 1,
    borderColor: Colors.primary500,
    width: 100,
  },
  skipButtonText: {
    color: Colors.primary500,
    fontFamily: "open-sans-bold",
  },
  buttonSpacer: {
    width: 16,
  },
  uploadText: {
    fontSize: 16,
    fontFamily: "open-sans",
    marginTop: 16,
    color: Colors.primary600,
  },
  doneButton: {
    width: "80%",
  },
  footerContainer: {
    marginTop: "auto",
    marginBottom: 32,
  },
});

export default PhotoUploadScreen;
