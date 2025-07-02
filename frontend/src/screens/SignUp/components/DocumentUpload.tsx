import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@theme/colors';

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
  const [documentType, setDocumentType] = useState<string>('');
  const [documentName, setDocumentName] = useState<string>('');

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const mimeType = asset.mimeType || 'application/octet-stream';
        const name = asset.name || 'document';
        const uri = asset.uri;
        
        setDocumentType(mimeType);
        setDocumentName(name);
        onDocumentSelected(uri, mimeType, name);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Sorry, we need camera permissions to make this work!');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const fileName = asset.uri.split('/').pop() || 'document.jpg';
        setDocumentType('image/jpeg');
        setDocumentName(fileName);
        onDocumentSelected(asset.uri, 'image/jpeg', fileName);
      }
    } catch (err) {
      console.error('Error taking photo:', err);
    }
  };

  const renderDocumentPreview = () => {
    if (!documentUri) return null;

    if (documentType.startsWith('image/')) {
      return (
        <Image 
          source={{ uri: documentUri }} 
          style={styles.documentPreview} 
          resizeMode="cover"
        />
      );
    } else {
      return (
        <View style={styles.pdfPreview}>
          <Ionicons name="document-text" size={40} color={Colors.primary500} />
          <Text style={styles.documentName} numberOfLines={1}>
            {documentName}
          </Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Verification Document</Text>
      <Text style={styles.description}>
        Please upload a document that verifies your medical credentials
      </Text>

      {documentUri ? (
        <View style={styles.documentContainer}>
          {renderDocumentPreview()}
          <TouchableOpacity 
            style={styles.changeButton}
            onPress={pickDocument}
          >
            <Text style={styles.changeButtonText}>Change Document</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.uploadContainer}>
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={pickDocument}
          >
            <Ionicons name="document-outline" size={24} color="white" />
            <Text style={styles.uploadButtonText}>Select Document</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={takePhoto}
          >
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
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.primary400,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  uploadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uploadButton: {
    backgroundColor: Colors.primary500,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  documentContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  documentPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  pdfPreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  documentName: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    maxWidth: '80%',
  },
  changeButton: {
    backgroundColor: Colors.primary100,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  changeButtonText: {
    color: Colors.primary500,
    fontWeight: 'bold',
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 5,
  },
});

export default DocumentUpload;