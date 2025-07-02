import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import OpenStreetMapView from './OpenStreetMapView';
import LocationSearchBar from './LocationSearchBar';

interface SearchableMapViewProps {
  initialLatitude?: number;
  initialLongitude?: number;
  zoom?: number;
  height?: number | string;
  width?: number | string;
  showMarker?: boolean;
  onLocationSelected?: (location: { latitude: number; longitude: number; displayName?: string }) => void;
  style?: any;
}

const SearchableMapView: React.FC<SearchableMapViewProps> = ({
  initialLatitude = 25.2048, // Default to Dubai
  initialLongitude = 55.2708,
  zoom = 15,
  height = '100%',
  width = '100%',
  showMarker = true,
  onLocationSelected,
  style,
}) => {
  const [mapLocation, setMapLocation] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude,
  });
  const [selectedLocationName, setSelectedLocationName] = useState<string | undefined>(undefined);

  const handleLocationSelected = (location: { latitude: number; longitude: number; displayName?: string }) => {
    setMapLocation({
      latitude: location.latitude,
      longitude: location.longitude,
    });
    
    if (location.displayName) {
      setSelectedLocationName(location.displayName);
    }
    
    if (onLocationSelected) {
      onLocationSelected(location);
    }
  };

  return (
    <View style={[styles.container, { height, width }, style]}>
      <View style={styles.searchBarContainer}>
        <LocationSearchBar 
          onLocationSelected={handleLocationSelected}
          style={styles.searchBar}
        />
      </View>
      
      {selectedLocationName && (
        <View style={styles.locationNameContainer}>
          <Text style={styles.locationNameText} numberOfLines={1}>
            {selectedLocationName.split(',')[0]}
          </Text>
        </View>
      )}
      
      <OpenStreetMapView
        latitude={mapLocation.latitude}
        longitude={mapLocation.longitude}
        zoom={zoom}
        height="100%"
        width="100%"
        showMarker={showMarker}
        onLocationSelected={(location) => handleLocationSelected(location)}
        style={styles.map}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  searchBarContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  searchBar: {
    width: '100%',
  },
  map: {
    flex: 1,
  },
  locationNameContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 10,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  locationNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default SearchableMapView;