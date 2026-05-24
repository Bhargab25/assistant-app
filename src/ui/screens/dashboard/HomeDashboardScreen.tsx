import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

/*
|--------------------------------------------------------------------------
| Home Dashboard Screen
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - app home screen
| - assistant overview
| - runtime overview
| - reminder summary
| - quick actions
|
*/

export default function HomeDashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome Back</Text>

            <Text style={styles.username}>Intelligent Assistant</Text>
          </View>

          <View style={styles.assistantBadge}>
            <Text style={styles.assistantBadgeText}>AI ACTIVE</Text>
          </View>
        </View>

        {/* Assistant Runtime */}

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Assistant Runtime Online</Text>

          <Text style={styles.heroDescription}>
            Workflows, notifications, automation, background tasks, and
            intelligent assistant systems are operational.
          </Text>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>12</Text>

              <Text style={styles.heroStatLabel}>Workflows</Text>
            </View>

            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>24</Text>

              <Text style={styles.heroStatLabel}>Reminders</Text>
            </View>

            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>AI</Text>

              <Text style={styles.heroStatLabel}>Assistant</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.quickGrid}>
          <Pressable style={styles.quickCard}>
            <Text style={styles.quickEmoji}>⏰</Text>

            <Text style={styles.quickTitle}>Create Reminder</Text>
          </Pressable>

          <Pressable style={styles.quickCard}>
            <Text style={styles.quickEmoji}>🤖</Text>

            <Text style={styles.quickTitle}>AI Assistant</Text>
          </Pressable>

          <Pressable style={styles.quickCard}>
            <Text style={styles.quickEmoji}>⚡</Text>

            <Text style={styles.quickTitle}>Automations</Text>
          </Pressable>

          <Pressable style={styles.quickCard}>
            <Text style={styles.quickEmoji}>📊</Text>

            <Text style={styles.quickTitle}>Insights</Text>
          </Pressable>
        </View>

        {/* Runtime Overview */}

        <Text style={styles.sectionTitle}>Runtime Overview</Text>

        <View style={styles.runtimeCard}>
          <View style={styles.runtimeRow}>
            <Text style={styles.runtimeLabel}>Workflow Runtime</Text>

            <Text style={styles.runtimeActive}>ACTIVE</Text>
          </View>

          <View style={styles.runtimeRow}>
            <Text style={styles.runtimeLabel}>Background Tasks</Text>

            <Text style={styles.runtimeActive}>RUNNING</Text>
          </View>

          <View style={styles.runtimeRow}>
            <Text style={styles.runtimeLabel}>Notification Engine</Text>

            <Text style={styles.runtimeActive}>ONLINE</Text>
          </View>

          <View style={styles.runtimeRow}>
            <Text style={styles.runtimeLabel}>AI Recommendation Engine</Text>

            <Text style={styles.runtimeActive}>READY</Text>
          </View>
        </View>

        {/* AI Insight */}

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>AI Insight</Text>

          <Text style={styles.insightText}>
            Your productivity has improved by 21% this week. The assistant
            recommends enabling focus-mode automations during morning hours.
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

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  greeting: {
    fontSize: 15,

    color: "#6b7280",
  },

  username: {
    marginTop: 4,

    fontSize: 28,

    fontWeight: "700",

    color: "#111827",
  },

  assistantBadge: {
    paddingHorizontal: 14,

    paddingVertical: 8,

    borderRadius: 999,

    backgroundColor: "#dcfce7",
  },

  assistantBadgeText: {
    color: "#16a34a",

    fontWeight: "700",

    fontSize: 12,
  },

  heroCard: {
    marginHorizontal: 20,

    marginTop: 22,

    borderRadius: 28,

    padding: 24,

    backgroundColor: "#2563eb",
  },

  heroTitle: {
    fontSize: 24,

    fontWeight: "700",

    color: "#ffffff",
  },

  heroDescription: {
    marginTop: 12,

    lineHeight: 24,

    color: "rgba(255,255,255,0.88)",
  },

  heroStats: {
    marginTop: 28,

    flexDirection: "row",

    justifyContent: "space-between",
  },

  heroStat: {
    alignItems: "center",
  },

  heroStatValue: {
    fontSize: 24,

    fontWeight: "800",

    color: "#ffffff",
  },

  heroStatLabel: {
    marginTop: 6,

    color: "rgba(255,255,255,0.82)",
  },

  sectionTitle: {
    marginTop: 28,

    marginHorizontal: 20,

    marginBottom: 16,

    fontSize: 22,

    fontWeight: "700",

    color: "#111827",
  },

  quickGrid: {
    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "space-between",

    paddingHorizontal: 20,
  },

  quickCard: {
    width: "48%",

    borderRadius: 22,

    padding: 22,

    marginBottom: 16,

    backgroundColor: "#ffffff",
  },

  quickEmoji: {
    fontSize: 30,
  },

  quickTitle: {
    marginTop: 18,

    fontSize: 16,

    fontWeight: "700",

    color: "#111827",
  },

  runtimeCard: {
    marginHorizontal: 20,

    borderRadius: 24,

    padding: 20,

    backgroundColor: "#ffffff",
  },

  runtimeRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 18,
  },

  runtimeLabel: {
    fontSize: 15,

    color: "#111827",
  },

  runtimeActive: {
    fontWeight: "700",

    color: "#16a34a",
  },

  insightCard: {
    marginHorizontal: 20,

    marginTop: 24,

    borderRadius: 24,

    padding: 24,

    backgroundColor: "#111827",
  },

  insightTitle: {
    fontSize: 22,

    fontWeight: "700",

    color: "#ffffff",
  },

  insightText: {
    marginTop: 14,

    lineHeight: 24,

    color: "rgba(255,255,255,0.85)",
  },
});
