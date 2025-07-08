import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import SearchableMapView from "./SearchableMapView";
import Colors from "@/theme/colors";

interface SearchableMapExampleProps {
  initialLatitude?: number;
  initialLongitude?: number;
  onConfirmLocation?: (location: {
    latitude: number;
    longitude: number;
    displayName?: string;
  }) => void;
}

const SearchableMapExample: React.FC<SearchableMapExampleProps> = ({
  initialLatitude = 25.2048, // Default to Dubai
  initialLongitude = 55.2708,
  onConfirmLocation,
}) => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    displayName: string | undefined;
  }>({
    latitude: initialLatitude,
    longitude: initialLongitude,
    displayName: undefined,
  });
  const [loading, setLoading] = useState(true);
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);

  // Get current location when component mounts
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.log("Location permission denied");
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

        console.log("Current location:", currentLocation.coords);
      } catch (error) {
        console.error("Error getting location:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLocationSelected = (newLocation: {
    latitude: number;
    longitude: number;
    displayName?: string;
  }) => {
    // Always ensure we have a displayName, even if it's a fallback
    const displayName =
      newLocation.displayName ||
      `Location at ${newLocation.latitude.toFixed(
        4
      )}, ${newLocation.longitude.toFixed(4)}`;

    setLocation({
      latitude: newLocation.latitude,
      longitude: newLocation.longitude,
      displayName: displayName,
    });

    console.log(
      `Location selected: ${JSON.stringify({
        ...newLocation,
        displayName: displayName,
      })}`
    );

    // If no displayName was provided by the map component, try to fetch it from the API
    if (!newLocation.displayName) {
      fetchDisplayName(newLocation.latitude, newLocation.longitude)
        .then((apiDisplayName) => {
          if (apiDisplayName && apiDisplayName !== displayName) {
            // Update with the API-provided name if different from our fallback
            setLocation((prev) => ({
              ...prev,
              displayName: apiDisplayName,
            }));
          }
        })
        .catch((err) => {
          console.warn("Could not fetch display name from API:", err);
          // We already have a fallback displayName set, so no further action needed
        });
    }
  };

  const fetchDisplayName = async (latitude: number, longitude: number) => {
    try {
      console.log(`Fetching display name for: ${latitude}, ${longitude}`);

      // Use a different approach with headers to avoid Nominatim blocking
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            // Provide a proper User-Agent as required by Nominatim's terms of use
            "User-Agent": "ZenCare-App/1.0",
            "Accept-Language": "en-US,en",
            "Content-Type": "application/json",
          },
          method: "GET",
        }
      );

      console.log("API request status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("OpenStreetMap API response:", data);
        console.log("Raw data from OpenStreetMap API:", data);
        const displayName =
          data.display_name ||
          `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

        console.log("Setting display name to:", displayName);

        setLocation((prev) => ({
          ...prev,
          displayName: displayName,
        }));

        // Return the display name in case it's needed elsewhere
        return displayName;
      } else {
        console.error(
          "Error response from OpenStreetMap API:",
          response.status
        );

        // Check if it's likely a headers/user-agent issue
        if (response.status === 403 || response.status === 429) {
          console.warn(
            "Possible User-Agent restrictions from Nominatim API. Using backup approach..."
          );

          // In a production app, you might want to use a proxy server or a different geocoding service
          // For now, we'll just use our fallback
        }

        const fallback = `Location at ${latitude.toFixed(
          4
        )}, ${longitude.toFixed(4)}`;

        setLocation((prev) => ({
          ...prev,
          displayName: fallback,
        }));

        return fallback;
      }
    } catch (error) {
      console.error("Error fetching display name:", error);

      // Provide detailed error logging to help diagnose API issues
      if (
        error instanceof TypeError &&
        error.message.includes("Network request failed")
      ) {
        console.warn(
          "Network request failed. This could be due to connectivity issues or CORS restrictions."
        );
      }

      const fallback = `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(
        4
      )}`;

      setLocation((prev) => ({
        ...prev,
        displayName: fallback,
      }));

      return fallback;
    }
  };

  const handleConfirmLocation = async () => {
    try {
      console.log("Confirming location, current state:", location);

      // Try to fetch the displayName if we don't already have one
      let displayName = location.displayName;
      if (!displayName) {
        displayName = await fetchDisplayName(
          location.latitude,
          location.longitude
        );
      }

      // Create a location object with a guaranteed displayName
      const locationWithDisplayName = {
        ...location,
        displayName:
          displayName ||
          `Location at ${location.latitude.toFixed(
            4
          )}, ${location.longitude.toFixed(4)}`,
      };

      console.log(
        "Confirming location with display name:",
        locationWithDisplayName.displayName
      );

      if (onConfirmLocation) {
        // Use the location with guaranteed displayName
        onConfirmLocation(locationWithDisplayName);
      }
    } catch (error) {
      console.error("Error confirming location:", error);

      // Even if fetching fails, ensure we provide a displayName
      const fallbackDisplayName = `Location at ${location.latitude.toFixed(
        4
      )}, ${location.longitude.toFixed(4)}`;

      if (onConfirmLocation) {
        onConfirmLocation({
          ...location,
          displayName: location.displayName || fallbackDisplayName,
        });
      }
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

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    position: "relative",
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.primary500,
  },
  mapContainer: {
    flex: 1,
    overflow: "hidden",
    width: "100%",
    height: "65%", // Use percentage instead of fixed height
  },
  map: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    backgroundColor: "white",
    margin: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.primary500,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  confirmButton: {
    backgroundColor: Colors.primary500,
    margin: 10,
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

// IMPORTANT: Nominatim API requires a proper User-Agent header.
// If you're experiencing blocks/errors from the API, consider these alternatives:
// 1. Use a proxy server that adds the required headers
// 2. Switch to a different geocoding service (Google Maps, Mapbox, etc.)
// 3. Consider hosting your own Nominatim instance for production use
//
// See Nominatim Usage Policy: https://operations.osmfoundation.org/policies/nominatim/

export default SearchableMapExample;
