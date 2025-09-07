import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/theme/colors';

interface LocationSearchBarProps {
  onLocationSelected: (location: { latitude: number; longitude: number; displayName?: string }) => void;
  placeholder?: string;
  style?: any;
}

interface SearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

const LocationSearchBar: React.FC<LocationSearchBarProps> = ({
  onLocationSelected,
  placeholder = 'Search for a location...',
  style,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setShowResults(true);

    try {
      // Using Nominatim API for geocoding (OpenStreetMap's geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'ZenCare App', // It's good practice to identify your app
          },
        }
      );

      if (response.ok) {
        const data: SearchResult[] = await response.json();
        setSearchResults(data);
      } else {
        console.error('Error searching for location:', response.statusText);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching for location:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLocation = (result: SearchResult) => {
    onLocationSelected({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
    });
    setSearchQuery(result.display_name.split(',')[0]); // Set the search input to the selected location name
    setShowResults(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.primary500} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            if (text.length > 2) {
              // Only search if there are at least 3 characters
              searchLocation(text);
            } else if (text.length === 0) {
              setSearchResults([]);
              setShowResults(false);
            }
          }}
          placeholderTextColor="#888"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {showResults && (
        <View style={styles.resultsContainer}>
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.primary500} style={styles.loader} />
          ) : searchResults.length > 0 ? (
            <View style={styles.list}>
              {searchResults.map((item) => (
                <TouchableOpacity
                  key={item.place_id.toString()}
                  style={styles.resultItem}
                  onPress={() => handleSelectLocation(item)}
                >
                  <Ionicons name="location" size={16} color={Colors.primary500} style={styles.locationIcon} />
                  <Text style={styles.resultText} numberOfLines={2}>
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : searchQuery.length > 2 ? (
            <Text style={styles.noResults}>No locations found</Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  clearButton: {
    padding: 5,
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 20,
  },
  list: {
    width: '100%',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationIcon: {
    marginRight: 10,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  loader: {
    padding: 15,
  },
  noResults: {
    padding: 15,
    textAlign: 'center',
    color: '#888',
  },
});

export default LocationSearchBar;