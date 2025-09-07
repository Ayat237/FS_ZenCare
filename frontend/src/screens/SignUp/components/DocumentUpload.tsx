import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Colors from "@theme/colors";

interface DocumentUploadProps {
  onDocumentSelected: (uri: string, type: string, name: string) => void;
  documentUri?: string;
  error?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onDocumentSelected,
  documentUri,
  error,
}) => {
  const [documentName, setDocumentName] = useState<string>("");

  // Debugging effect to track documentUri changes
  React.useEffect(() => {
    console.log("DocumentUpload - Current document URI:", documentUri);
  }, [documentUri]);

  // Function to pick image from library
  const pickImage = async () => {
    try {
      console.log("Opening image picker...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log(
        "Image picker result:",
        result.canceled ? "Canceled" : "Image selected"
      );

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.uri.split("/").pop() || "image.jpg";
        const uri = asset.uri;

        // Determine mime type based on file extension
        let mimeType = "image/jpeg";
        if (fileName.toLowerCase().endsWith(".png")) {
          mimeType = "image/png";
        } else if (fileName.toLowerCase().endsWith(".gif")) {
          mimeType = "image/gif";
        } else if (fileName.toLowerCase().endsWith(".webp")) {
          mimeType = "image/webp";
        }

        console.log(`Selected image: ${fileName} (${mimeType})`);
        setDocumentName(fileName);
        console.log("Calling onDocumentSelected with:", {
          uri,
          mimeType,
          fileName,
        });

        // Make sure we have a valid mime type for the backend
        if (!mimeType) {
          mimeType = "image/jpeg"; // Default to JPEG if no mime type can be determined
        }

        // Call the callback with the document information
        onDocumentSelected(uri, mimeType, fileName);
      }
    } catch (err) {
      console.error("Error picking image:", err);
    }
  };

  // Function to take photo with camera
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Sorry, we need camera permissions to make this work!");
        return;
      }

      console.log("Opening camera...");
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log(
        "Camera result:",
        result.canceled ? "Canceled" : "Photo taken"
      );

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.uri.split("/").pop() || "image.jpg";
        const mimeType = "image/jpeg";

        console.log(`Captured photo: ${fileName} (${mimeType})`);
        setDocumentName(fileName);
        console.log("Calling onDocumentSelected with:", {
          uri: asset.uri,
          mimeType,
          fileName,
        });
        onDocumentSelected(asset.uri, mimeType, fileName);
      }
    } catch (err) {
      console.error("Error taking photo:", err);
    }
  };

  // Render photo preview
  const renderPhotoPreview = () => {
    if (!documentUri) return null;

    return (
      <Image
        source={{ uri: documentUri }}
        style={styles.documentPreview}
        resizeMode="cover"
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Medical License Document{" "}
        <Text style={styles.requiredFlag}>(Required)</Text>
      </Text>
      <Text style={styles.description}>
        Please upload a photo or scan of your medical license or other
        professional credentials
      </Text>

      {documentUri ? (
        <View style={styles.documentContainer}>
          {renderPhotoPreview()}

          <TouchableOpacity style={styles.changeButton} onPress={pickImage}>
            <Text style={styles.changeButtonText}>Change Document</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.uploadContainer}>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color="white" />
            <Text style={styles.uploadButtonText}>Select Document</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={24} color="white" />
            <Text style={styles.uploadButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.primary400,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  uploadContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  uploadButton: {
    backgroundColor: Colors.primary500,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  documentContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  documentPreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  changeButton: {
    backgroundColor: Colors.primary100,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  changeButtonText: {
    color: Colors.primary500,
    fontWeight: "bold",
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 5,
  },
  requiredFlag: {
    color: Colors.error,
    fontWeight: "bold",
  },
});

export default DocumentUpload;
