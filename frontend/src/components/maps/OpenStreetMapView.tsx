import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface OpenStreetMapViewProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: number | string;
  width?: number | string;
  showMarker?: boolean;
  onLocationSelected?: (location: { latitude: number; longitude: number }) => void;
  style?: any;
}

const OpenStreetMapView: React.FC<OpenStreetMapViewProps> = ({
  latitude,
  longitude,
  zoom = 15,
  height = '100%',
  width = '100%',
  showMarker = true,
  onLocationSelected,
  style,
}) => {
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  // Create HTML content for OpenStreetMap
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <style>
          body {
            margin: 0;
            padding: 0;
          }
          #map {
            width: 100%;
            height: 100vh;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Initialize the map
          const map = L.map('map').setView([${latitude}, ${longitude}], ${zoom});
          
          // Add OpenStreetMap tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          
          // Add marker if showMarker is true
          ${showMarker ? `const marker = L.marker([${latitude}, ${longitude}], { draggable: true }).addTo(map);` : ''}
          
          // Handle map click events
          map.on('click', function(e) {
            const { lat, lng } = e.latlng;
            
            // Update marker position if it exists
            ${showMarker ? 'marker.setLatLng(e.latlng);' : ''}
            
            // Send message to React Native
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapClick',
              latitude: lat,
              longitude: lng
            }));
          });
          
          // Handle marker drag events if marker exists
          ${showMarker ? `
          marker.on('dragend', function(e) {
            const position = marker.getLatLng();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markerDrag',
              latitude: position.lat,
              longitude: position.lng
            }));
          });` : ''}
        </script>
      </body>
    </html>
  `;

  // Handle messages from WebView
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapClick' || data.type === 'markerDrag') {
        onLocationSelected && onLocationSelected({
          latitude: data.latitude,
          longitude: data.longitude
        });
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <View style={[styles.container, { height, width }, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        onLoadEnd={() => setLoading(false)}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

export default OpenStreetMapView;