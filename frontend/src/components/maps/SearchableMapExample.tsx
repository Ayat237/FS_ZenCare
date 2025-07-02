import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import SearchableMapView from './SearchableMapView';
import Colors from '@/theme/colors';

interface SearchableMapExampleProps {
  initialLatitude?: number;
  initialLongitude?: number;
  onConfirmLocation?: (location: { latitude: number; longitude: number; displayName?: string }) => void;
}

const SearchableMapExample: React.FC<SearchableMapExampleProps> = ({
  initialLatitude = 25.2048, // Default to Dubai
  initialLongitude = 55.2708,
  onConfirmLocation,
}) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number; displayName: string | undefined }>({
    latitude: initialLatitude,
    longitude: initialLongitude,
    displayName: undefined,
  });
  const [loading, setLoading] = useState(true);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  
  // Get current location when component mounts
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          console.log('Location permission denied');
          setLocationPermissionDenied(true);
          setLoading(false);
          return;
        }
        
        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        // Update location state
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          displayName: undefined,
        });
        
        console.log('Current location:', currentLocation.coords);
      } catch (error) {
        console.error('Error getting location:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLocationSelected = (newLocation: { latitude: number; longitude: number; displayName?: string }) => {
    setLocation({
      latitude: newLocation.latitude,
      longitude: newLocation.longitude,
      displayName: newLocation.displayName || undefined
    });
    console.log(`Location selected: ${JSON.stringify(newLocation)}`);
  };

  const handleConfirmLocation = () => {
    if (onConfirmLocation) {
      onConfirmLocation(location);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary500} />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      ) : (
        <>
          <View style={styles.mapContainer}>
            <SearchableMapView
              initialLatitude={location.latitude}
              initialLongitude={location.longitude}
              onLocationSelected={handleLocationSelected}
              height="100%"
              width="100%"
              style={styles.map}
            />
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Selected Location</Text>
            <Text style={styles.infoText}>
              Latitude: {location.latitude.toFixed(6)}
            </Text>
            <Text style={styles.infoText}>
              Longitude: {location.longitude.toFixed(6)}
            </Text>
            {location.displayName && (
              <Text style={styles.infoText} numberOfLines={2}>
                Address: {location.displayName}
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={handleConfirmLocation}
          >
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    position: 'relative',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.primary500,
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    width: '100%',
    height: '65%', // Use percentage instead of fixed height
  },
  map: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.primary500,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  confirmButton: {
    backgroundColor: Colors.primary500,
    margin: 10,
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchableMapExample;