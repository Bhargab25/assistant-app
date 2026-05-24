import { useState } from "react";

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

/*
|--------------------------------------------------------------------------
| Automation Rule
|--------------------------------------------------------------------------
*/

type AutomationRule = {
  id: string;

  title: string;

  description: string;

  enabled: boolean;
};

/*
|--------------------------------------------------------------------------
| Reminder Automation Screen
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - manage workflow automation
| - configure assistant behavior
| - configure runtime triggers
| - configure smart reminder actions
|
*/

export default function ReminderAutomationScreen() {
  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: "1",

      title: "Voice Assistant",

      description: "Assistant speaks reminder aloud",

      enabled: true,
    },

    {
      id: "2",

      title: "Smart Snooze",

      description: "AI dynamically adjusts snooze duration",

      enabled: true,
    },

    {
      id: "3",

      title: "Priority Escalation",

      description: "Increase notification intensity for missed reminders",

      enabled: false,
    },

    {
      id: "4",

      title: "Focus Mode Trigger",

      description: "Automatically activate focus workflows",

      enabled: true,
    },

    {
      id: "5",

      title: "Background Runtime",

      description: "Execute reminders during background execution",

      enabled: true,
    },
  ]);

  /*
  |--------------------------------------------------------------------------
  | Toggle Rule
  |--------------------------------------------------------------------------
  */

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === id
          ? {
              ...rule,

              enabled: !rule.enabled,
            }
          : rule,
      ),
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Execute Automation Test
  |--------------------------------------------------------------------------
  */

  const runAutomationTest = () => {
    /*
      |--------------------------------------------------------------------------
      | TODO
      |--------------------------------------------------------------------------
      |
      | Later integrate:
      |
      | - WorkflowRuntimeService
      | - Assistant runtime
      | - Notification runtime
      | - Device runtime
      |
      */

    console.log("Executing automation runtime test...");
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
          <Text style={styles.headerTitle}>Automation Engine</Text>

          <Text style={styles.headerSubtitle}>
            Intelligent reminder workflow runtime
          </Text>
        </View>

        {/* Runtime Status */}

        <View style={styles.runtimeCard}>
          <Text style={styles.runtimeTitle}>Assistant Runtime Active</Text>

          <Text style={styles.runtimeDescription}>
            Smart workflows, AI triggers, and automation services are currently
            running in the background.
          </Text>

          <View style={styles.runtimeStats}>
            <View style={styles.runtimeStat}>
              <Text style={styles.runtimeStatValue}>ACTIVE</Text>

              <Text style={styles.runtimeStatLabel}>Runtime</Text>
            </View>

            <View style={styles.runtimeStat}>
              <Text style={styles.runtimeStatValue}>12</Text>

              <Text style={styles.runtimeStatLabel}>Workflows</Text>
            </View>

            <View style={styles.runtimeStat}>
              <Text style={styles.runtimeStatValue}>AI</Text>

              <Text style={styles.runtimeStatLabel}>Assistant</Text>
            </View>
          </View>
        </View>

        {/* Automation Rules */}

        <View style={styles.rulesContainer}>
          <Text style={styles.sectionTitle}>Automation Rules</Text>

          {rules.map((rule) => (
            <View key={rule.id} style={styles.ruleCard}>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>{rule.title}</Text>

                <Text style={styles.ruleDescription}>{rule.description}</Text>
              </View>

              <Switch
                value={rule.enabled}
                onValueChange={() => toggleRule(rule.id)}
              />
            </View>
          ))}
        </View>

        {/* AI Optimization */}

        <View style={styles.optimizationCard}>
          <Text style={styles.optimizationTitle}>AI Runtime Optimization</Text>

          <Text style={styles.optimizationText}>
            The assistant continuously analyzes reminder execution patterns and
            dynamically optimizes workflow behavior for better productivity.
          </Text>
        </View>

        {/* Test Runtime */}

        <Pressable style={styles.testButton} onPress={runAutomationTest}>
          <Text style={styles.testButtonText}>Run Automation Test</Text>
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

  runtimeCard: {
    marginHorizontal: 20,

    marginTop: 20,

    backgroundColor: "#2563eb",

    borderRadius: 26,

    padding: 24,
  },

  runtimeTitle: {
    fontSize: 22,

    fontWeight: "700",

    color: "#ffffff",
  },

  runtimeDescription: {
    marginTop: 12,

    lineHeight: 24,

    color: "rgba(255,255,255,0.85)",
  },

  runtimeStats: {
    marginTop: 26,

    flexDirection: "row",

    justifyContent: "space-between",
  },

  runtimeStat: {
    alignItems: "center",
  },

  runtimeStatValue: {
    fontSize: 20,

    fontWeight: "800",

    color: "#ffffff",
  },

  runtimeStatLabel: {
    marginTop: 6,

    color: "rgba(255,255,255,0.8)",
  },

  rulesContainer: {
    marginHorizontal: 20,

    marginTop: 22,
  },

  sectionTitle: {
    fontSize: 22,

    fontWeight: "700",

    color: "#111827",

    marginBottom: 18,
  },

  ruleCard: {
    backgroundColor: "#ffffff",

    borderRadius: 22,

    padding: 18,

    marginBottom: 16,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  ruleContent: {
    flex: 1,

    paddingRight: 14,
  },

  ruleTitle: {
    fontSize: 16,

    fontWeight: "700",

    color: "#111827",
  },

  ruleDescription: {
    marginTop: 6,

    lineHeight: 22,

    color: "#6b7280",
  },

  optimizationCard: {
    marginHorizontal: 20,

    marginTop: 8,

    borderRadius: 24,

    padding: 22,

    backgroundColor: "#111827",
  },

  optimizationTitle: {
    fontSize: 20,

    fontWeight: "700",

    color: "#ffffff",
  },

  optimizationText: {
    marginTop: 12,

    lineHeight: 24,

    color: "rgba(255,255,255,0.85)",
  },

  testButton: {
    marginHorizontal: 20,

    marginTop: 24,

    backgroundColor: "#2563eb",

    borderRadius: 18,

    paddingVertical: 18,

    alignItems: "center",
  },

  testButtonText: {
    color: "#ffffff",

    fontSize: 16,

    fontWeight: "700",
  },
});
