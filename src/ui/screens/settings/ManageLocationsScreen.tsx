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
import { RootStackParamList } from "../../navigation/types";
import { LocationService } from "../../../core/geofence/location.service";
import { SavedLocation } from "../../../core/geofence/location.repository";
import { useTheme } from "../../../shared/store/theme.store";
import Ionicons from "@expo/vector-icons/Ionicons";

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
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

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
            <Ionicons name="location-sharp" size={22} color={colors.primary} />
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
            <ActivityIndicator size="small" color={colors.danger} />
          ) : (
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
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
      <Ionicons name="map-outline" size={60} color={colors.textMuted} style={{ marginBottom: 20 }} />
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
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
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
        <Ionicons name="bulb-outline" size={18} color={colors.primary} style={{ marginRight: 10 }} />
        <Text style={styles.infoBannerText}>
          These locations trigger your smart reminders when you arrive or leave.
        </Text>
      </View>

      {/* Location List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
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
              tintColor={colors.primary}
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

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  backButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  backIcon: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  headerTexts: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
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
    backgroundColor: isDark ? "rgba(59, 130, 246, 0.12)" : "#eff6ff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? "rgba(59, 130, 246, 0.3)" : "#bfdbfe",
  },
  infoBannerEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: colors.primary,
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
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.06,
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
    backgroundColor: colors.primaryLight,
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
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  locationCoords: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
    fontFamily: "monospace",
  },
  radiusTag: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: isDark ? "rgba(16, 185, 129, 0.12)" : "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  radiusText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: "600",
  },

  /*
  | Delete Button
  */
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: isDark ? "rgba(239, 68, 68, 0.12)" : "#fef2f2",
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
    color: colors.textSecondary,
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
    color: colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  emptyDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 23,
  },
});
