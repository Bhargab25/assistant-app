import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ReminderScheduler } from "../../../core/reminders/reminder.scheduler";

import { ReminderService } from "../../../core/reminders/reminder.service";

import { Reminder } from "../../../core/reminders/reminder.types";

import { RootStackParamList } from "../../navigation/AppNavigator";

import { colors } from "../../../shared/theme/colors";

/*
|--------------------------------------------------------------------------
| Navigation Type
|--------------------------------------------------------------------------
*/

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/*
|--------------------------------------------------------------------------
| Reminder List Screen
|--------------------------------------------------------------------------
*/

export default function ReminderListScreen() {
  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  const navigation = useNavigation<Navigation>();

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [reminders, setReminders] = useState<Reminder[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load Reminders
  |--------------------------------------------------------------------------
  */

  const loadReminders = async () => {
    try {
      // Reconcile and clean up ghost/orphaned notifications in the OS queue
      await ReminderScheduler.restoreAll();

      const data = await ReminderService.getAll();

      const sorted = [...data].sort((a, b) => b.createdAt - a.createdAt);

      setReminders(sorted);
    } catch (error) {
      console.error("Reminder loading failed", error);
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadReminders();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Reload On Focus
  |--------------------------------------------------------------------------
  */

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, []),
  );

  /*
  |--------------------------------------------------------------------------
  | Refresh
  |--------------------------------------------------------------------------
  */

  const onRefresh = async () => {
    setRefreshing(true);

    await loadReminders();
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Reminder
  |--------------------------------------------------------------------------
  */

  const deleteReminder = (reminder: Reminder) => {
    Alert.alert("Delete Reminder", `Delete "${reminder.title}"?`, [
      {
        text: "Cancel",

        style: "cancel",
      },

      {
        text: "Delete",

        style: "destructive",

        onPress: async () => {
          try {
            await ReminderService.delete(reminder.id);

            await loadReminders();
          } catch (error) {
            Alert.alert("Error", "Failed deleting reminder");
          }
        },
      },
    ]);
  };

  /*
  |--------------------------------------------------------------------------
  | Toggle Reminder
  |--------------------------------------------------------------------------
  */

  const toggleReminder = async (
    reminder: Reminder,

    active: boolean,
  ) => {
    try {
      await ReminderService.toggleActive(
        reminder.id,

        active,
      );

      await loadReminders();
    } catch (error) {
      Alert.alert("Error", "Failed updating reminder");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Status Color
  |--------------------------------------------------------------------------
  */

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#16a34a";

      case "ringing":
        return "#dc2626";

      case "snoozed":
        return "#2563eb";

      case "missed":
        return "#f59e0b";

      default:
        return "#6b7280";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Render Reminder
  |--------------------------------------------------------------------------
  */

  const renderReminder = ({ item }: { item: Reminder }) => {
    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          navigation.navigate("ReminderDetails", {
            reminderId: item.id,
          })
        }
      >
        {/* Header */}

        <View style={styles.cardHeader}>
          <View style={styles.flex}>
            <Text style={styles.title}>{item.title}</Text>

            <Text style={styles.time}>{item.schedule.time}</Text>
          </View>

          <Switch
            value={item.runtime.active}
            onValueChange={(value) => toggleReminder(item, value)}
          />
        </View>

        {/* Description */}

        {!!item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}

        {/* Metadata */}

        <View style={styles.metaContainer}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: getStatusColor(item.status),
              },
            ]}
          >
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>

          <View style={styles.metaBadge}>
            <Text style={styles.metaText}>{item.priority}</Text>
          </View>

          <View style={styles.metaBadge}>
            <Text style={styles.metaText}>{item.schedule.repeat}</Text>
          </View>

          {item.place && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{item.place.name}</Text>
            </View>
          )}
        </View>

        {/* Runtime */}

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Completed: {item.runtime.completedCount}
          </Text>

          <Text style={styles.statsText}>
            Snoozed: {item.runtime.snoozedCount}
          </Text>
        </View>

        {/* Actions */}

        <View style={styles.actions}>
          <Pressable
            style={styles.editButton}
            onPress={() =>
              navigation.navigate("EditReminder", {
                reminderId: item.id,
              })
            }
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            onPress={() => deleteReminder(item)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Empty State
  |--------------------------------------------------------------------------
  */

  if (!loading && reminders.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>⏰</Text>

        <Text style={styles.emptyTitle}>No Reminders Yet</Text>

        <Text style={styles.emptySubtitle}>
          Create intelligent alarms, smart reminders, routines, and productivity
          schedules.
        </Text>

        <Pressable
          style={styles.emptyButton}
          onPress={() => navigation.navigate("AssistantChat")}
        >
          <Text style={styles.emptyButtonText}>Create Reminder</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Smart Reminders</Text>

          <Text style={styles.headerSubtitle}>AI-powered alarm assistant</Text>
        </View>

        {/* Dashboard */}

        <Pressable
          style={styles.dashboardButton}
          onPress={() => navigation.navigate("ReminderDashboard")}
        >
          <Text style={styles.dashboardButtonText}>Dashboard</Text>
        </Pressable>
      </View>

      {/* List */}

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={renderReminder}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Floating Create Button */}

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate("AssistantChat")}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
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

    backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: 20,

    paddingTop: 20,

    paddingBottom: 10,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  headerTitle: {
    fontSize: 30,

    fontWeight: "700",

    color: colors.textPrimary,
  },

  headerSubtitle: {
    marginTop: 6,

    fontSize: 15,

    color: colors.textSecondary,
  },

  dashboardButton: {
    backgroundColor: colors.primary,

    paddingHorizontal: 16,

    paddingVertical: 10,

    borderRadius: 14,
  },

  dashboardButtonText: {
    color: "#ffffff",

    fontWeight: "700",
  },

  listContent: {
    padding: 20,

    paddingBottom: 160,
  },

  card: {
    backgroundColor: "#ffffff",

    borderRadius: 24,

    padding: 18,

    marginBottom: 18,
  },

  cardHeader: {
    flexDirection: "row",

    alignItems: "center",
  },

  flex: {
    flex: 1,
  },

  title: {
    fontSize: 20,

    fontWeight: "700",

    color: colors.textPrimary,
  },

  time: {
    marginTop: 6,

    color: colors.primary,

    fontWeight: "600",

    fontSize: 15,
  },

  description: {
    marginTop: 14,

    color: colors.textSecondary,

    lineHeight: 22,
  },

  metaContainer: {
    flexDirection: "row",

    flexWrap: "wrap",

    marginTop: 18,
  },

  badge: {
    paddingHorizontal: 12,

    paddingVertical: 8,

    borderRadius: 999,

    marginRight: 10,

    marginBottom: 10,
  },

  badgeText: {
    color: "#ffffff",

    fontWeight: "700",

    textTransform: "capitalize",
  },

  metaBadge: {
    paddingHorizontal: 12,

    paddingVertical: 8,

    borderRadius: 999,

    backgroundColor: "#e5e7eb",

    marginRight: 10,

    marginBottom: 10,
  },

  metaText: {
    fontWeight: "600",

    textTransform: "capitalize",

    color: colors.textPrimary,
  },

  statsContainer: {
    flexDirection: "row",

    marginTop: 18,
  },

  statsText: {
    marginRight: 20,

    color: colors.textSecondary,

    fontSize: 13,
  },

  actions: {
    flexDirection: "row",

    justifyContent: "flex-end",

    marginTop: 22,
  },

  editButton: {
    paddingHorizontal: 18,

    paddingVertical: 12,

    borderRadius: 14,

    backgroundColor: "#dbeafe",

    marginRight: 12,
  },

  editButtonText: {
    color: colors.primary,

    fontWeight: "700",
  },

  deleteButton: {
    paddingHorizontal: 18,

    paddingVertical: 12,

    borderRadius: 14,

    backgroundColor: "#fee2e2",
  },

  deleteButtonText: {
    color: "#dc2626",

    fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: colors.background,

    paddingHorizontal: 40,
  },

  emptyEmoji: {
    fontSize: 72,

    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 28,

    fontWeight: "700",

    color: colors.textPrimary,
  },

  emptySubtitle: {
    marginTop: 12,

    textAlign: "center",

    color: colors.textSecondary,

    fontSize: 16,

    lineHeight: 26,
  },

  emptyButton: {
    marginTop: 28,

    backgroundColor: colors.primary,

    paddingHorizontal: 28,

    paddingVertical: 16,

    borderRadius: 18,
  },

  emptyButtonText: {
    color: "#ffffff",

    fontWeight: "700",

    fontSize: 16,
  },

  fab: {
    position: "absolute",

    right: 24,

    bottom: 40,

    width: 72,

    height: 72,

    borderRadius: 999,

    backgroundColor: colors.primary,

    alignItems: "center",

    justifyContent: "center",

    elevation: 10,

    shadowColor: "#000",

    shadowOpacity: 0.25,

    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 6,
    },
  },

  fabText: {
    color: "#ffffff",

    fontSize: 42,

    fontWeight: "300",

    marginTop: -2,
  },
});
