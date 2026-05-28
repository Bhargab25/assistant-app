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
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { LocationService } from "../../../core/geofence/location.service";
import * as Location from "expo-location";

type Props = NativeStackScreenProps<RootStackParamList, "MapSelection">;

export default function MapSelectionScreen({ route, navigation }: Props) {
  const { locationName } = route.params;
  const webviewRef = useRef<WebView>(null);
  const webviewReadyRef = useRef(false);
  const pendingLocationRef = useRef<{ latitude: number; longitude: number } | null>(null);
  // Track whether the user explicitly saved so we can emit a cancel event on unmount if not
  const savedRef = useRef(false);

  const [initialCoordinates] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });

  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });

  const [statusMessage, setStatusMessage] = useState("Locating you...");
  const [locating, setLocating] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  // On unmount, if the user never pressed Save, notify the orchestrator to abort
  useEffect(() => {
    return () => {
      if (!savedRef.current) {
        DeviceEventEmitter.emit('MAP_LOCATION_CANCELLED');
      }
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setStatusMessage(`Permission denied. Search or drag map to set ${locationName}.`);
          setLocating(false);
          return;
        }

        const updateWebViewLocation = (lat: number, lng: number) => {
          if (webviewReadyRef.current) {
            webviewRef.current?.injectJavaScript(
              `window.updateLocation(${lat}, ${lng}); true;`
            );
          } else {
            pendingLocationRef.current = { latitude: lat, longitude: lng };
          }
        };

        // 1. Try to get last known location first (almost instantaneous)
        let lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown) {
          setMarkerCoordinate({
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          });
          updateWebViewLocation(lastKnown.coords.latitude, lastKnown.coords.longitude);
        }

        // 2. Request balanced accuracy current position (fast & robust)
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setMarkerCoordinate({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        updateWebViewLocation(location.coords.latitude, location.coords.longitude);
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
        setMarkerCoordinate({
          latitude: firstResult.latitude,
          longitude: firstResult.longitude,
        });
        // Center Leaflet Map
        webviewRef.current?.injectJavaScript(
          `window.updateLocation(${firstResult.latitude}, ${firstResult.longitude}); true;`
        );
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
      
      // Mark as saved BEFORE navigating so the unmount effect doesn't fire a cancel
      savedRef.current = true;
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
    // savedRef remains false — unmount effect will emit MAP_LOCATION_CANCELLED
    navigation.goBack();
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "READY") {
        webviewReadyRef.current = true;
        if (pendingLocationRef.current) {
          webviewRef.current?.injectJavaScript(
            `window.updateLocation(${pendingLocationRef.current.latitude}, ${pendingLocationRef.current.longitude}); true;`
          );
          pendingLocationRef.current = null;
        }
      } else if (data.latitude !== undefined && data.longitude !== undefined) {
        setMarkerCoordinate({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    } catch (e) {
      console.warn("Failed to parse WebView message:", e);
    }
  };

  // Generate the Leaflet HTML centered at the initial coordinates
  const htmlSource = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <style>
    body { padding: 0; margin: 0; background-color: #f3f4f6; }
    html, body, #map { height: 100%; width: 100vw; }
    .leaflet-control-attribution { display: none !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([${initialCoordinates.latitude}, ${initialCoordinates.longitude}], 16);
    
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '&copy; Google Maps'
    }).addTo(map);

    var marker = L.marker([${initialCoordinates.latitude}, ${initialCoordinates.longitude}], { draggable: true }).addTo(map);

    function sendCoordinates(lat, lng) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: lat, longitude: lng }));
      }
    }

    marker.on('dragend', function(event) {
      var position = marker.getLatLng();
      sendCoordinates(position.lat, position.lng);
    });

    map.on('click', function(event) {
      var latlng = event.latlng;
      marker.setLatLng(latlng);
      sendCoordinates(latlng.lat, latlng.lng);
    });

    window.updateLocation = function(lat, lng) {
      var latlng = L.latLng(lat, lng);
      marker.setLatLng(latlng);
      map.setView(latlng, 16);
      sendCoordinates(lat, lng);
    };

    // Notify React Native that Leaflet script is fully initialized
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "READY" }));
    }
  </script>
</body>
</html>
  `;

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
        <WebView
          ref={webviewRef}
          originWhitelist={["*"]}
          source={{ html: htmlSource }}
          onMessage={handleWebViewMessage}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
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
    backgroundColor: "#e5e7eb",
  },
  map: {
    flex: 1,
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
