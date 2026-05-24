import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
  Keyboard,
  DeviceEventEmitter,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, UrlTile } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { LocationService } from "../../../core/geofence/location.service";
import * as Location from "expo-location";

type Props = NativeStackScreenProps<RootStackParamList, "MapSelection">;

export default function MapSelectionScreen({ route, navigation }: Props) {
  const { locationName, onSave } = route.params;
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });

  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });

  const [statusMessage, setStatusMessage] = useState("Locating you...");
  const [locating, setLocating] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setStatusMessage(`Permission denied. Search or drag map to set ${locationName}.`);
          setLocating(false);
          return;
        }

        // 1. Try to get last known location first (almost instantaneous)
        let lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown) {
          const targetRegion = {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setRegion(targetRegion);
          setMarkerCoordinate({
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          });
          mapRef.current?.animateToRegion(targetRegion, 800);
        }

        // 2. Request balanced accuracy current position (fast & robust)
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        setMarkerCoordinate({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        mapRef.current?.animateToRegion(newRegion, 1000);
        setStatusMessage(`Drag pin or search to set ${locationName}`);
      } catch (error) {
        console.warn("Failed to get current location for map:", error);
        setStatusMessage(`Search or drag map to set ${locationName}`);
      } finally {
        setLocating(false);
      }
    })();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }
    Keyboard.dismiss();
    setSearching(true);
    setStatusMessage("Searching location...");
    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results && results.length > 0) {
        const firstResult = results[0];
        const targetRegion = {
          latitude: firstResult.latitude,
          longitude: firstResult.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setMarkerCoordinate({
          latitude: firstResult.latitude,
          longitude: firstResult.longitude,
        });
        setRegion(targetRegion);
        mapRef.current?.animateToRegion(targetRegion, 1000);
        setStatusMessage(`Selected: ${searchQuery}`);
      } else {
        Alert.alert("No Results", `Could not find any coordinates for "${searchQuery}". Please try another search term.`);
        setStatusMessage(`Search or drag map to set ${locationName}`);
      }
    } catch (error) {
      console.warn("Geocoding failed:", error);
      Alert.alert("Search Error", "An error occurred while geocoding the address. Please try again.");
      setStatusMessage(`Search or drag map to set ${locationName}`);
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async () => {
    try {
      await LocationService.create({
        name: locationName,
        latitude: markerCoordinate.latitude,
        longitude: markerCoordinate.longitude,
      });
      
      navigation.goBack();
      
      // Trigger the callback to resume assistant conversation
      setTimeout(() => {
        DeviceEventEmitter.emit('MAP_LOCATION_SAVED');
      }, 300);
    } catch (error) {
      Alert.alert("Error", "Failed to save location");
      console.error(error);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerTexts}>
            <Text style={styles.headerTitle}>Select Location</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {statusMessage}
            </Text>
          </View>
          {(locating || searching) && (
            <ActivityIndicator size="small" color="#2563eb" style={styles.spinner} />
          )}
        </View>
      </View>

      {/* Search Bar Container */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search address, gym, market, or city...`}
          placeholderTextColor="#9ca3af"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <Pressable
          style={({ pressed }) => [
            styles.searchButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      {/* Map View Area */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          mapType="none"
          style={styles.map}
          initialRegion={region}
          onPress={(e) => setMarkerCoordinate(e.nativeEvent.coordinate)}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          <UrlTile 
            urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
          />
          <Marker
            coordinate={markerCoordinate}
            title={locationName}
            description="Drag to refine your geofenced area"
            draggable
            onDragEnd={(e) => setMarkerCoordinate(e.nativeEvent.coordinate)}
          />
        </MapView>
      </View>

      {/* Footer Controls */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Location</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTexts: {
    flex: 1,
    marginRight: 10,
  },
  spinner: {
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#6b7280",
    textTransform: "capitalize",
  },
  searchBarContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchButton: {
    marginLeft: 10,
    height: 44,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 16,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  searchButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#4b5563",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
