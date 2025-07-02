import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import OpenStreetMapView from './OpenStreetMapView';

interface MapExampleProps {
  initialLatitude?: number;
  initialLongitude?: number;
}

const MapExample: React.FC<MapExampleProps> = ({
  initialLatitude = 25.2048, // Default to Dubai
  initialLongitude = 55.2708,
}) => {
  const [location, setLocation] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude,
  });

  const handleLocationSelected = (newLocation: { latitude: number; longitude: number }) => {
    setLocation(newLocation);
    console.log(`Location selected: Latitude = ${newLocation.latitude}, Longitude = ${newLocation.longitude}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OpenStreetMap Example</Text>
      
      <View style={styles.mapContainer}>
        <OpenStreetMapView
          latitude={location.latitude}
          longitude={location.longitude}
          zoom={14}
          showMarker={true}
          onLocationSelected={handleLocationSelected}
          style={styles.map}
        />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Selected Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </Text>
        <Text style={styles.helpText}>
          Tap on the map or drag the marker to select a location
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    borderRadius: 8,
  },
  infoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default MapExample;