import { useState } from "react";

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useTheme, useThemeStore } from "../../../shared/store/theme.store";

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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, mode } = useTheme();
  const { setMode } = useThemeStore();
  const styles = getStyles(colors);

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

        {/* Theme Settings */}

        <Text style={styles.sectionTitle}>Theme Mode</Text>

        <View style={styles.themeSelectorCard}>
          <TouchableOpacity
            style={[
              styles.themeOption,
              mode === "light" && styles.themeOptionActive,
            ]}
            onPress={() => setMode("light")}
          >
            <Text
              style={[
                styles.themeOptionText,
                mode === "light" && styles.themeOptionTextActive,
              ]}
            >
              Light
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              mode === "dark" && styles.themeOptionActive,
            ]}
            onPress={() => setMode("dark")}
          >
            <Text
              style={[
                styles.themeOptionText,
                mode === "dark" && styles.themeOptionTextActive,
              ]}
            >
              Dark
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              mode === "system" && styles.themeOptionActive,
            ]}
            onPress={() => setMode("system")}
          >
            <Text
              style={[
                styles.themeOptionText,
                mode === "system" && styles.themeOptionTextActive,
              ]}
            >
              System
            </Text>
          </TouchableOpacity>
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

        {/* Locations Section */}

        <Text style={styles.sectionTitle}>Locations</Text>

        <TouchableOpacity
          style={styles.navCard}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("ManageLocations")}
        >
          <View style={styles.navCardLeft}>
            <View style={styles.navCardIcon}>
              <Text style={styles.navCardIconText}>📍</Text>
            </View>
            <View style={styles.navCardTexts}>
              <Text style={styles.navCardTitle}>Manage Saved Locations</Text>
              <Text style={styles.navCardDescription}>
                View, and delete your registered geofence locations
              </Text>
            </View>
          </View>
          <Text style={styles.navCardChevron}>›</Text>
        </TouchableOpacity>

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

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: colors.background,
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

    color: colors.textPrimary,
  },

  headerSubtitle: {
    marginTop: 6,

    fontSize: 15,

    color: colors.textSecondary,
  },

  assistantCard: {
    marginHorizontal: 20,

    marginTop: 22,

    borderRadius: 26,

    padding: 24,

    backgroundColor: colors.primary,
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

    color: colors.textPrimary,
  },

  settingCard: {
    marginHorizontal: 20,

    marginBottom: 16,

    borderRadius: 22,

    padding: 18,

    backgroundColor: colors.surface,

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

    color: colors.textPrimary,
  },

  settingDescription: {
    marginTop: 6,

    lineHeight: 22,

    color: colors.textSecondary,
  },

  /* Theme selector card */
  themeSelectorCard: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  themeOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },

  themeOptionActive: {
    backgroundColor: colors.primary,
  },

  themeOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  themeOptionTextActive: {
    color: "#ffffff",
  },

  runtimeCard: {
    marginHorizontal: 20,

    marginTop: 24,

    borderRadius: 24,

    padding: 22,

    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  runtimeTitle: {
    fontSize: 22,

    fontWeight: "700",

    color: colors.textPrimary,
  },

  runtimeRow: {
    marginTop: 22,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  runtimeLabel: {
    color: colors.textSecondary,

    fontSize: 15,
  },

  runtimeActive: {
    fontWeight: "700",

    color: colors.success,
  },

  versionContainer: {
    marginTop: 30,

    alignItems: "center",
  },

  versionText: {
    color: colors.textMuted,

    fontSize: 13,
  },

  navCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 22,
    padding: 18,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  navCardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  navCardIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  navCardIconText: {
    fontSize: 22,
  },

  navCardTexts: {
    flex: 1,
    paddingRight: 8,
  },

  navCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  navCardDescription: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },

  navCardChevron: {
    fontSize: 24,
    color: colors.textMuted,
    fontWeight: "300",
  },
});
