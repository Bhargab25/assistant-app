// src/ui/screens/settings/ManageLocationsScreen.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { LocationService } from "../../../core/geofence/location.service";
import { SavedLocation } from "../../../core/geofence/location.repository";

type Props = NativeStackScreenProps<RootStackParamList, "ManageLocations">;

/*
|--------------------------------------------------------------------------
| Manage Locations Screen
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - display all user-registered saved locations
| - allow user to delete individual locations
| - premium UI with dynamic interaction
|
*/

export default function ManageLocationsScreen({ navigation }: Props) {
  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Load Locations
  |--------------------------------------------------------------------------
  */

  const loadLocations = useCallback(async () => {
    try {
      const all = await LocationService.findAll();
      setLocations(all);
    } catch (error) {
      console.error("Failed to load locations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const onRefresh = () => {
    setRefreshing(true);
    loadLocations();
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Location
  |--------------------------------------------------------------------------
  */

  const handleDelete = (location: SavedLocation) => {
    Alert.alert(
      "Remove Location",
      `Are you sure you want to remove "${location.name}"? Any reminders linked to this location will no longer trigger.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(location.id);
              await LocationService.delete(location.id);
              setLocations((prev) => prev.filter((l) => l.id !== location.id));
            } catch (error) {
              Alert.alert("Error", "Failed to remove location. Please try again.");
              console.error(error);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Render Location Card
  |--------------------------------------------------------------------------
  */

  const renderItem = ({ item }: { item: SavedLocation }) => {
    const isDeleting = deletingId === item.id;

    return (
      <View style={styles.locationCard}>
        {/* Icon + Info */}
        <View style={styles.cardLeft}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>📍</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.locationName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.locationCoords}>
              {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
            </Text>
            <View style={styles.radiusTag}>
              <Text style={styles.radiusText}>⬤ {item.radius}m radius</Text>
            </View>
          </View>
        </View>

        {/* Delete Button */}
        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.deleteButtonPressed,
          ]}
          onPress={() => handleDelete(item)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <Text style={styles.deleteIcon}>🗑️</Text>
          )}
        </Pressable>
      </View>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Empty State
  |--------------------------------------------------------------------------
  */

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🗺️</Text>
      <Text style={styles.emptyTitle}>No Saved Locations</Text>
      <Text style={styles.emptyDescription}>
        When you ask the assistant to create a location-based reminder, your saved locations will appear here.
      </Text>
    </View>
  );

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <View style={styles.headerTexts}>
          <Text style={styles.headerTitle}>Saved Locations</Text>
          <Text style={styles.headerSubtitle}>
            {locations.length > 0
              ? `${locations.length} location${locations.length !== 1 ? "s" : ""} registered`
              : "Manage your geofence locations"}
          </Text>
        </View>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerEmoji}>💡</Text>
        <Text style={styles.infoBannerText}>
          These locations trigger your smart reminders when you arrive or leave.
        </Text>
      </View>

      {/* Location List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading locations...</Text>
        </View>
      ) : (
        <FlatList
          data={locations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            locations.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2563eb"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fb",
  },

  /*
  | Header
  */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  backButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  backIcon: {
    fontSize: 20,
    color: "#111827",
    fontWeight: "700",
  },
  headerTexts: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },

  /*
  | Info Banner
  */
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  infoBannerEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#1d4ed8",
    lineHeight: 19,
    fontWeight: "500",
  },

  /*
  | List
  */
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: "center",
  },

  /*
  | Location Card
  */
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iconText: {
    fontSize: 22,
  },
  cardInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.2,
  },
  locationCoords: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 3,
    fontFamily: "monospace",
  },
  radiusTag: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  radiusText: {
    fontSize: 11,
    color: "#16a34a",
    fontWeight: "600",
  },

  /*
  | Delete Button
  */
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  deleteButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.92 }],
  },
  deleteIcon: {
    fontSize: 18,
  },

  /*
  | Loading
  */
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: "#6b7280",
  },

  /*
  | Empty
  */
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  emptyDescription: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 23,
  },
});
