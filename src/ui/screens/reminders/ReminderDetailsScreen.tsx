import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import { ReminderService } from "../../../core/reminders/reminder.service";

import { Reminder } from "../../../core/reminders/reminder.types";

import { RootStackParamList } from "../../navigation/types";

/*
|--------------------------------------------------------------------------
| Route Prop Type
|--------------------------------------------------------------------------
*/

type Route = RouteProp<RootStackParamList, "ReminderDetails">;

/*
|--------------------------------------------------------------------------
| Reminder Details Screen
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - manage reminder runtime
| - manage reminder workflows
| - enable/disable automation
| - execute reminder actions
|
*/

export default function ReminderDetailsScreen() {
  /*
  |--------------------------------------------------------------------------
  | Navigation & Route
  |--------------------------------------------------------------------------
  */

  const navigation = useNavigation();

  const route = useRoute<Route>();

  const { reminderId } = route.params;

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [reminder, setReminder] = useState<Reminder | null>(null);

  const [loading, setLoading] = useState(true);

  const [enabled, setEnabled] = useState(true);

  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const [alarmEnabled, setAlarmEnabled] = useState(false);

  const [notificationEnabled, setNotificationEnabled] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Load Reminder
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadReminder();
  }, [reminderId]);

  const loadReminder = async () => {
    try {
      const data = await ReminderService.getById(reminderId);

      if (!data) {
        navigation.goBack();
        return;
      }

      setReminder(data);
      setEnabled(data.runtime.active);
      setVoiceEnabled(data.assistant.voiceEnabled);
      setAlarmEnabled(data.alarm.enabled);
      setNotificationEnabled(data.runtime.active);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load reminder details", error);
      navigation.goBack();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Action Handlers
  |--------------------------------------------------------------------------
  */

  const handleToggleActive = async (value: boolean) => {
    setEnabled(value);
    setNotificationEnabled(value);
    try {
      await ReminderService.toggleActive(reminderId, value);
    } catch (error) {
      Alert.alert("Error", "Failed updating active state");
    }
  };

  const handleToggleVoice = async (value: boolean) => {
    setVoiceEnabled(value);
    try {
      if (reminder) {
        await ReminderService.update(reminderId, {
          assistant: {
            ...reminder.assistant,
            voiceEnabled: value,
          },
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed updating assistant voice setting");
    }
  };

  const handleToggleAlarm = async (value: boolean) => {
    setAlarmEnabled(value);
    try {
      if (reminder) {
        await ReminderService.update(reminderId, {
          alarm: {
            ...reminder.alarm,
            enabled: value,
          },
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed updating alarm sound setting");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Execute Reminder
  |--------------------------------------------------------------------------
  */

  const runReminder = async () => {
    try {
      if (!reminder) return;
      const { ReminderRuntime } = require("../../../core/reminders/reminder.runtime");
      await ReminderRuntime.triggerReminder(reminder);
    } catch (error) {
      console.error("Reminder execution failed", error);
      Alert.alert("Error", "Failed executing reminder");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Reminder
  |--------------------------------------------------------------------------
  */

  const deleteReminder = async () => {
    Alert.alert(
      "Delete Reminder",
      "This reminder will be permanently removed.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete",

          style: "destructive",

          onPress: async () => {
            try {
              await ReminderService.delete(reminderId);
              Alert.alert("Deleted", "Reminder deleted successfully.", [
                {
                  text: "OK",
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              Alert.alert("Error", "Failed deleting reminder");
            }
          },
        },
      ],
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading || !reminder) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.headerTitle}>{reminder.title}</Text>

          <Text style={styles.headerSubtitle}>
            {reminder.schedule.repeat !== "none" ? `${reminder.schedule.repeat} • ` : ""}
            {reminder.schedule.time}
          </Text>
        </View>

        {/* Status Card */}

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusTitle}>Reminder Active</Text>

              <Text style={styles.statusDescription}>
                Intelligent workflow automation enabled
              </Text>
            </View>

            <Switch value={enabled} onValueChange={handleToggleActive} />
          </View>
        </View>

        {/* Assistant Automation */}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Assistant Automation</Text>

          <Text style={styles.sectionDescription}>
            Configure how the AI assistant handles this reminder workflow.
          </Text>

          {/* Voice */}

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Voice Assistant</Text>

              <Text style={styles.settingDescription}>
                Assistant speaks reminder
              </Text>
            </View>

            <Switch value={voiceEnabled} onValueChange={handleToggleVoice} />
          </View>

          {/* Notifications */}

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Push Notifications</Text>

              <Text style={styles.settingDescription}>
                Send smart notifications
              </Text>
            </View>

            <Switch
              value={notificationEnabled}
              onValueChange={handleToggleActive}
            />
          </View>

          {/* Alarm */}

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Alarm Sound</Text>

              <Text style={styles.settingDescription}>Play alert sound</Text>
            </View>

            <Switch value={alarmEnabled} onValueChange={handleToggleAlarm} />
          </View>
        </View>

        {/* Workflow Card */}

        <View style={styles.workflowCard}>
          <Text style={styles.workflowTitle}>Workflow Runtime</Text>

          <Text style={styles.workflowDescription}>
            This reminder is connected to intelligent automation workflows and
            background assistant execution.
          </Text>

          <View style={styles.workflowStats}>
            <View style={styles.workflowStat}>
              <Text style={styles.workflowStatValue}>{reminder.status.toUpperCase()}</Text>

              <Text style={styles.workflowStatLabel}>Runtime</Text>
            </View>

            <View style={styles.workflowStat}>
              <Text style={styles.workflowStatValue}>
                {reminder.schedule.repeat !== "none" ? "YES" : "NO"}
              </Text>

              <Text style={styles.workflowStatLabel}>Repeat</Text>
            </View>

            <View style={styles.workflowStat}>
              <Text style={styles.workflowStatValue}>AI</Text>

              <Text style={styles.workflowStatLabel}>Assistant</Text>
            </View>
          </View>
        </View>

        {/* Actions */}

        <Pressable style={styles.runButton} onPress={runReminder}>
          <Text style={styles.runButtonText}>Run Reminder Now</Text>
        </Pressable>

        <Pressable style={styles.deleteButton} onPress={deleteReminder}>
          <Text style={styles.deleteButtonText}>Delete Reminder</Text>
        </Pressable>
      </ScrollView>
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

  loadingContainer: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#f4f7fb",
  },

  scrollContent: {
    paddingBottom: 60,
  },

  header: {
    paddingHorizontal: 20,

    paddingTop: 20,
  },

  headerTitle: {
    fontSize: 30,

    fontWeight: "700",

    color: "#111827",
  },

  headerSubtitle: {
    marginTop: 6,

    fontSize: 16,

    color: "#6b7280",
  },

  statusCard: {
    marginHorizontal: 20,

    marginTop: 20,

    backgroundColor: "#ffffff",

    borderRadius: 22,

    padding: 18,
  },

  statusRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  statusTitle: {
    fontSize: 18,

    fontWeight: "700",

    color: "#111827",
  },

  statusDescription: {
    marginTop: 6,

    fontSize: 14,

    color: "#6b7280",
  },

  sectionCard: {
    marginHorizontal: 20,

    marginTop: 20,

    backgroundColor: "#ffffff",

    borderRadius: 22,

    padding: 18,
  },

  sectionTitle: {
    fontSize: 20,

    fontWeight: "700",

    color: "#111827",
  },

  sectionDescription: {
    marginTop: 8,

    fontSize: 14,

    lineHeight: 22,

    color: "#6b7280",
  },

  settingRow: {
    marginTop: 24,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  settingTitle: {
    fontSize: 16,

    fontWeight: "600",

    color: "#111827",
  },

  settingDescription: {
    marginTop: 4,

    fontSize: 13,

    color: "#6b7280",
  },

  workflowCard: {
    marginHorizontal: 20,

    marginTop: 20,

    borderRadius: 22,

    padding: 20,

    backgroundColor: "#2563eb",
  },

  workflowTitle: {
    fontSize: 20,

    fontWeight: "700",

    color: "#ffffff",
  },

  workflowDescription: {
    marginTop: 10,

    lineHeight: 22,

    color: "rgba(255,255,255,0.88)",
  },

  workflowStats: {
    marginTop: 24,

    flexDirection: "row",

    justifyContent: "space-between",
  },

  workflowStat: {
    alignItems: "center",
  },

  workflowStatValue: {
    fontSize: 18,

    fontWeight: "700",

    color: "#ffffff",
  },

  workflowStatLabel: {
    marginTop: 4,

    fontSize: 13,

    color: "rgba(255,255,255,0.8)",
  },

  runButton: {
    marginHorizontal: 20,

    marginTop: 24,

    backgroundColor: "#111827",

    borderRadius: 18,

    paddingVertical: 18,

    alignItems: "center",
  },

  runButtonText: {
    color: "#ffffff",

    fontSize: 16,

    fontWeight: "700",
  },

  deleteButton: {
    marginHorizontal: 20,

    marginTop: 14,

    borderRadius: 18,

    paddingVertical: 18,

    alignItems: "center",

    backgroundColor: "#fee2e2",
  },

  deleteButtonText: {
    color: "#dc2626",

    fontSize: 16,

    fontWeight: "700",
  },
});
