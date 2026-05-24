import { useState } from "react";

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

/*
|--------------------------------------------------------------------------
| Settings Screen
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - manage assistant settings
| - manage runtime preferences
| - manage automation preferences
| - manage notification behavior
|
*/

export default function SettingsScreen() {
  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [voiceAssistant, setVoiceAssistant] = useState(true);

  const [backgroundRuntime, setBackgroundRuntime] = useState(true);

  const [smartRecommendations, setSmartRecommendations] = useState(true);

  const [notificationSounds, setNotificationSounds] = useState(true);

  const [focusMode, setFocusMode] = useState(false);

  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Render Setting Row
  |--------------------------------------------------------------------------
  */

  const renderSetting = (
    title: string,

    description: string,

    value: boolean,

    onChange: (value: boolean) => void,
  ) => {
    return (
      <View style={styles.settingCard}>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>

          <Text style={styles.settingDescription}>{description}</Text>
        </View>

        <Switch value={value} onValueChange={onChange} />
      </View>
    );
  };

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
          <Text style={styles.headerTitle}>Settings</Text>

          <Text style={styles.headerSubtitle}>
            Assistant runtime preferences
          </Text>
        </View>

        {/* Assistant Card */}

        <View style={styles.assistantCard}>
          <Text style={styles.assistantTitle}>
            Intelligent Assistant Runtime
          </Text>

          <Text style={styles.assistantText}>
            Configure AI assistant behavior, workflows, automation systems, and
            intelligent runtime services.
          </Text>
        </View>

        {/* Assistant Settings */}

        <Text style={styles.sectionTitle}>Assistant</Text>

        {renderSetting(
          "Voice Assistant",
          "Enable spoken assistant interactions",
          voiceAssistant,
          setVoiceAssistant,
        )}

        {renderSetting(
          "Smart Recommendations",
          "Allow AI productivity recommendations",
          smartRecommendations,
          setSmartRecommendations,
        )}

        {renderSetting(
          "Focus Mode",
          "Enable intelligent focus workflows",
          focusMode,
          setFocusMode,
        )}

        {/* Runtime Settings */}

        <Text style={styles.sectionTitle}>Runtime Engine</Text>

        {renderSetting(
          "Background Runtime",
          "Allow workflows in background execution",
          backgroundRuntime,
          setBackgroundRuntime,
        )}

        {renderSetting(
          "Analytics Collection",
          "Enable intelligent runtime analytics",
          analyticsEnabled,
          setAnalyticsEnabled,
        )}

        {/* Notification Settings */}

        <Text style={styles.sectionTitle}>Notifications</Text>

        {renderSetting(
          "Notification Sounds",
          "Play sounds for reminder events",
          notificationSounds,
          setNotificationSounds,
        )}

        {/* Runtime Status */}

        <View style={styles.runtimeCard}>
          <Text style={styles.runtimeTitle}>Runtime Status</Text>

          <View style={styles.runtimeRow}>
            <Text style={styles.runtimeLabel}>Assistant Runtime</Text>

            <Text style={styles.runtimeActive}>ACTIVE</Text>
          </View>

          <View style={styles.runtimeRow}>
            <Text style={styles.runtimeLabel}>Workflow Engine</Text>

            <Text style={styles.runtimeActive}>ONLINE</Text>
          </View>

          <View style={styles.runtimeRow}>
            <Text style={styles.runtimeLabel}>Background Services</Text>

            <Text style={styles.runtimeActive}>RUNNING</Text>
          </View>

          <View style={styles.runtimeRow}>
            <Text style={styles.runtimeLabel}>AI Recommendation Engine</Text>

            <Text style={styles.runtimeActive}>READY</Text>
          </View>
        </View>

        {/* Version */}

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            Intelligent Assistant Runtime v1.0
          </Text>
        </View>
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

  scrollContent: {
    paddingBottom: 80,
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

    fontSize: 15,

    color: "#6b7280",
  },

  assistantCard: {
    marginHorizontal: 20,

    marginTop: 22,

    borderRadius: 26,

    padding: 24,

    backgroundColor: "#2563eb",
  },

  assistantTitle: {
    fontSize: 22,

    fontWeight: "700",

    color: "#ffffff",
  },

  assistantText: {
    marginTop: 12,

    lineHeight: 24,

    color: "rgba(255,255,255,0.88)",
  },

  sectionTitle: {
    marginHorizontal: 20,

    marginTop: 28,

    marginBottom: 16,

    fontSize: 22,

    fontWeight: "700",

    color: "#111827",
  },

  settingCard: {
    marginHorizontal: 20,

    marginBottom: 16,

    borderRadius: 22,

    padding: 18,

    backgroundColor: "#ffffff",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  settingContent: {
    flex: 1,

    paddingRight: 16,
  },

  settingTitle: {
    fontSize: 16,

    fontWeight: "700",

    color: "#111827",
  },

  settingDescription: {
    marginTop: 6,

    lineHeight: 22,

    color: "#6b7280",
  },

  runtimeCard: {
    marginHorizontal: 20,

    marginTop: 24,

    borderRadius: 24,

    padding: 22,

    backgroundColor: "#111827",
  },

  runtimeTitle: {
    fontSize: 22,

    fontWeight: "700",

    color: "#ffffff",
  },

  runtimeRow: {
    marginTop: 22,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  runtimeLabel: {
    color: "rgba(255,255,255,0.88)",

    fontSize: 15,
  },

  runtimeActive: {
    fontWeight: "700",

    color: "#4ade80",
  },

  versionContainer: {
    marginTop: 30,

    alignItems: "center",
  },

  versionText: {
    color: "#6b7280",

    fontSize: 13,
  },
});
