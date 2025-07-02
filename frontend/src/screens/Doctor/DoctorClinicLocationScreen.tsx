import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@theme/colors';
import { OpenStreetMapView, SearchableMapView } from '@/components/maps';

const DoctorClinicLocationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  
  // Default location (Dubai)
  const defaultLocation = {
    latitude: 25.2048,
    longitude: 55.2708,
  };

  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: defaultLocation.latitude,
    longitude: defaultLocation.longitude,
  });
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status === 'granted') {
      getCurrentLocation();
    } else {
      handlePermissionDenied();
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      const { latitude, longitude } = location.coords;
      
      setMarkerCoordinate({ latitude, longitude });
      setLoading(false);
    } catch (error) {
      console.log('Error getting location:', error);
      setLoading(false);
      // Fall back to default location
      setMarkerCoordinate({
        latitude: defaultLocation.latitude,
        longitude: defaultLocation.longitude,
      });
    }
  };

  const handlePermissionDenied = () => {
    setLoading(false);
    setPermissionDenied(true);
    // Show alert in English and Arabic
    Alert.alert(
      'Location Permission Required / مطلوب إذن الموقع',
      'Please enable location services to use this feature. / يرجى تمكين خدمات الموقع لاستخدام هذه الميزة.',
      [{ text: 'OK / حسنًا', onPress: () => {} }]
    );
    // Fall back to default location
    setMarkerCoordinate({
      latitude: defaultLocation.latitude,
      longitude: defaultLocation.longitude,
    });
  };

  const handleLocationSelected = (coords: { latitude: number; longitude: number }, displayName?: string) => {
    setMarkerCoordinate(coords);
    console.log(`Selected Clinic Location: Latitude = ${coords.latitude}, Longitude = ${coords.longitude}${displayName ? `, Address: ${displayName}` : ''}`);
    // You can store the displayName in state if needed
    // For example: setLocationName(displayName || 'Selected Location');
  };

  const handleConfirmLocation = () => {
    console.log(`Confirmed Clinic Location: Latitude = ${markerCoordinate.latitude}, Longitude = ${markerCoordinate.longitude}`);
    // Here you would typically save this to the user's profile or state
    // For now, we're just logging to console as per requirements
    Alert.alert(
      'Location Confirmed',
      'Your clinic location has been confirmed.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={Colors.primary600} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Clinic Location</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary600} />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <SearchableMapView
            initialLatitude={markerCoordinate.latitude}
            initialLongitude={markerCoordinate.longitude}
            zoom={15}
            showMarker={true}
            onLocationSelected={handleLocationSelected}
            style={styles.map}
          />

          {permissionDenied && (
            <View style={styles.permissionWarning}>
              <Icon name="alert-circle" size={20} color="#FFF" />
              <Text style={styles.permissionWarningText}>Location services disabled</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={handleConfirmLocation}
          >
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 24,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  instructionContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
  confirmButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionWarning: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  permissionWarningText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
});

export default DoctorClinicLocationScreen;