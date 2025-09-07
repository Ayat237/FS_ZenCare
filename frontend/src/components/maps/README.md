# OpenStreetMap WebView Implementation

This directory contains components for displaying maps using OpenStreetMap via WebView, replacing the previous react-native-maps implementation. The implementation now includes a modern search interface for finding locations.

## Components

### OpenStreetMapView

A React Native component that renders an OpenStreetMap using WebView. It provides basic map functionality including markers, zoom, and pan support.

### LocationSearchBar

A modern search bar component that allows users to search for locations by name or address. It uses the Nominatim API (OpenStreetMap's geocoding service) to convert text queries into geographic coordinates.

### SearchableMapView

A component that combines OpenStreetMapView with LocationSearchBar to provide a complete map solution with search functionality. It displays a search bar at the top of the map and shows the selected location name at the bottom.

### SearchableMapExample

A ready-to-use example component that demonstrates how to implement the SearchableMapView component with location selection and confirmation functionality.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `latitude` | number | required | The latitude coordinate for the map center |
| `longitude` | number | required | The longitude coordinate for the map center |
| `zoom` | number | 15 | The initial zoom level (1-19) |
| `height` | number or string | '100%' | The height of the map container |
| `width` | number or string | '100%' | The width of the map container |
| `showMarker` | boolean | true | Whether to show a draggable marker at the specified coordinates |
| `onLocationSelected` | function | undefined | Callback function that receives the selected location coordinates when the map is clicked or the marker is dragged |
| `style` | object | undefined | Additional styles to apply to the map container |

#### Example Usage

```jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OpenStreetMapView } from '@/components/maps';

const MapScreen = () => {
  const [location, setLocation] = useState({
    latitude: 25.2048,  // Dubai coordinates
    longitude: 55.2708,
  });

  const handleLocationSelected = (newLocation) => {
    setLocation(newLocation);
    console.log(`Selected location: ${newLocation.latitude}, ${newLocation.longitude}`);
  };

  return (
    <View style={styles.container}>
      <OpenStreetMapView
        latitude={location.latitude}
        longitude={location.longitude}
        zoom={14}
        showMarker={true}
        onLocationSelected={handleLocationSelected}
        style={styles.map}
      />
      <Text style={styles.coordinates}>
        Selected: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  coordinates: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    fontSize: 14,
  },
});

export default MapScreen;
```

### MapExample

A ready-to-use example component that demonstrates how to implement the OpenStreetMapView component with location selection functionality.

### MapExample
#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialLatitude` | number | 25.2048 (Dubai) | The initial latitude coordinate |
| `initialLongitude` | number | 55.2708 (Dubai) | The initial longitude coordinate |

### LocationSearchBar
#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onLocationSelected` | function | required | Callback function that receives the selected location coordinates and display name |
| `placeholder` | string | 'Search for a location...' | Placeholder text for the search input |
| `style` | object | undefined | Additional styles to apply to the search bar container |

### SearchableMapView
#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialLatitude` | number | 25.2048 (Dubai) | The initial latitude coordinate |
| `initialLongitude` | number | 55.2708 (Dubai) | The initial longitude coordinate |
| `zoom` | number | 15 | The initial zoom level (1-19) |
| `height` | number or string | '100%' | The height of the map container |
| `width` | number or string | '100%' | The width of the map container |
| `showMarker` | boolean | true | Whether to show a draggable marker at the specified coordinates |
| `onLocationSelected` | function | undefined | Callback function that receives the selected location coordinates and display name |
| `style` | object | undefined | Additional styles to apply to the map container |

### SearchableMapExample
#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialLatitude` | number | 25.2048 (Dubai) | The initial latitude coordinate |
| `initialLongitude` | number | 55.2708 (Dubai) | The initial longitude coordinate |
| `onConfirmLocation` | function | undefined | Callback function that receives the confirmed location coordinates and display name |

#### Example Usage

##### Basic Map Example

```jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MapExample } from '@/components/maps';

const MyScreen = () => {
  return (
    <View style={styles.container}>
      <MapExample 
        initialLatitude={37.7749}
        initialLongitude={-122.4194}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default MyScreen;
```

##### Searchable Map Example

```jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SearchableMapExample } from '@/components/maps';

const MySearchableMapScreen = () => {
  const [location, setLocation] = useState(null);

  const handleLocationConfirmed = (coords, displayName) => {
    setLocation({ ...coords, displayName });
    console.log('Selected location:', coords, displayName);
    // Do something with the coordinates and display name
  };

  return (
    <View style={styles.container}>
      <SearchableMapExample onConfirmLocation={handleLocationConfirmed} />
      {location && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            Selected: {location.displayName || 'Custom location'}
          </Text>
          <Text style={styles.coordsText}>
            Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  locationInfo: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  coordsText: {
    fontSize: 14,
    color: '#666',
  },
});

export default MySearchableMapScreen;
```

##### Using SearchableMapView Directly

```jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SearchableMapView } from '@/components/maps';

const MyCustomMapScreen = () => {
  const [location, setLocation] = useState(null);

  const handleLocationSelected = (coords, displayName) => {
    setLocation({ ...coords, displayName });
  };

  const handleSaveLocation = () => {
    if (location) {
      console.log('Saving location:', location);
      // Save the location to your backend or state management
    }
  };

  return (
    <View style={styles.container}>
      <SearchableMapView
        initialLatitude={25.2048}
        initialLongitude={55.2708}
        zoom={14}
        showMarker={true}
        onLocationSelected={handleLocationSelected}
        style={styles.map}
      />
      
      {location && (
        <View style={styles.footer}>
          <Text style={styles.locationName}>
            {location.displayName || 'Selected location'}
          </Text>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSaveLocation}
          >
            <Text style={styles.saveButtonText}>Save Location</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationName: {
    flex: 1,
    fontSize: 16,
    marginRight: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MyCustomMapScreen;
```

## Benefits of WebView Implementation

1. **Expo Go Compatibility**: Works directly in Expo Go without requiring native builds
2. **No API Keys**: No need for Google Maps API keys or other credentials
3. **Lightweight**: Smaller bundle size compared to react-native-maps
4. **Cross-Platform**: Consistent behavior across iOS and Android
5. **Customizable**: Can be extended with additional OpenStreetMap features

## Implementation Details

The OpenStreetMapView component uses:

- react-native-webview to render web content
- Leaflet.js (loaded from CDN) for the map interface
- OpenStreetMap tiles for the map data
- JavaScript message passing between the WebView and React Native