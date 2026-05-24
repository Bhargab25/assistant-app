import { ScrollView, SafeAreaView, StyleSheet, Text, View } from "react-native";

/*
|--------------------------------------------------------------------------
| Reminder Dashboard Screen
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - show reminder analytics
| - show workflow runtime stats
| - show assistant activity
| - show productivity insights
|
*/

export default function ReminderDashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reminder Dashboard</Text>

          <Text style={styles.headerSubtitle}>
            Intelligent productivity insights
          </Text>
        </View>

        {/* Hero Card */}

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>AI Productivity Score</Text>

          <Text style={styles.heroScore}>92%</Text>

          <Text style={styles.heroText}>
            Your reminder completion performance increased this week.
          </Text>
        </View>

        {/* Stats Grid */}

        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>24</Text>

            <Text style={styles.statLabel}>Active Reminders</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>148</Text>

            <Text style={styles.statLabel}>Workflows Executed</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>37h</Text>

            <Text style={styles.statLabel}>Focus Time</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>98%</Text>

            <Text style={styles.statLabel}>Runtime Health</Text>
          </View>
        </View>

        {/* Assistant Activity */}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Assistant Activity</Text>

          <View style={styles.activityRow}>
            <View>
              <Text style={styles.activityTitle}>Voice Reminders</Text>

              <Text style={styles.activitySubtitle}>
                Assistant spoken reminders
              </Text>
            </View>

            <Text style={styles.activityValue}>42</Text>
          </View>

          <View style={styles.activityRow}>
            <View>
              <Text style={styles.activityTitle}>Smart Notifications</Text>

              <Text style={styles.activitySubtitle}>
                AI optimized notifications
              </Text>
            </View>

            <Text style={styles.activityValue}>128</Text>
          </View>

          <View style={styles.activityRow}>
            <View>
              <Text style={styles.activityTitle}>Workflow Triggers</Text>

              <Text style={styles.activitySubtitle}>
                Automated runtime executions
              </Text>
            </View>

            <Text style={styles.activityValue}>312</Text>
          </View>
        </View>

        {/* AI Insights */}

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>AI Insights</Text>

          <Text style={styles.insightText}>
            Your highest productivity period is between 8 AM and 11 AM. The
            assistant recommends scheduling important reminders during this
            window.
          </Text>
        </View>

        {/* Runtime Card */}

        <View style={styles.runtimeCard}>
          <Text style={styles.runtimeTitle}>Runtime Status</Text>

          <View style={styles.runtimeGrid}>
            <View style={styles.runtimeItem}>
              <Text style={styles.runtimeValue}>ACTIVE</Text>

              <Text style={styles.runtimeLabel}>Assistant</Text>
            </View>

            <View style={styles.runtimeItem}>
              <Text style={styles.runtimeValue}>12</Text>

              <Text style={styles.runtimeLabel}>Queued Jobs</Text>
            </View>

            <View style={styles.runtimeItem}>
              <Text style={styles.runtimeValue}>4ms</Text>

              <Text style={styles.runtimeLabel}>Avg Latency</Text>
            </View>
          </View>
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

  heroCard: {
    marginHorizontal: 20,

    marginTop: 20,

    backgroundColor: "#2563eb",

    borderRadius: 26,

    padding: 24,
  },

  heroTitle: {
    fontSize: 18,

    fontWeight: "700",

    color: "#ffffff",
  },

  heroScore: {
    marginTop: 16,

    fontSize: 56,

    fontWeight: "800",

    color: "#ffffff",
  },

  heroText: {
    marginTop: 10,

    lineHeight: 22,

    color: "rgba(255,255,255,0.88)",
  },

  grid: {
    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "space-between",

    paddingHorizontal: 20,

    marginTop: 20,
  },

  statCard: {
    width: "48%",

    backgroundColor: "#ffffff",

    borderRadius: 20,

    padding: 20,

    marginBottom: 16,
  },

  statValue: {
    fontSize: 30,

    fontWeight: "700",

    color: "#111827",
  },

  statLabel: {
    marginTop: 8,

    lineHeight: 20,

    color: "#6b7280",
  },

  sectionCard: {
    marginHorizontal: 20,

    marginTop: 10,

    backgroundColor: "#ffffff",

    borderRadius: 22,

    padding: 20,
  },

  sectionTitle: {
    fontSize: 20,

    fontWeight: "700",

    color: "#111827",
  },

  activityRow: {
    marginTop: 24,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  activityTitle: {
    fontSize: 16,

    fontWeight: "600",

    color: "#111827",
  },

  activitySubtitle: {
    marginTop: 4,

    fontSize: 13,

    color: "#6b7280",
  },

  activityValue: {
    fontSize: 24,

    fontWeight: "700",

    color: "#2563eb",
  },

  insightCard: {
    marginHorizontal: 20,

    marginTop: 20,

    backgroundColor: "#111827",

    borderRadius: 22,

    padding: 22,
  },

  insightTitle: {
    fontSize: 20,

    fontWeight: "700",

    color: "#ffffff",
  },

  insightText: {
    marginTop: 12,

    lineHeight: 24,

    color: "rgba(255,255,255,0.85)",
  },

  runtimeCard: {
    marginHorizontal: 20,

    marginTop: 20,

    backgroundColor: "#ffffff",

    borderRadius: 22,

    padding: 20,
  },

  runtimeTitle: {
    fontSize: 20,

    fontWeight: "700",

    color: "#111827",
  },

  runtimeGrid: {
    marginTop: 24,

    flexDirection: "row",

    justifyContent: "space-between",
  },

  runtimeItem: {
    alignItems: "center",
  },

  runtimeValue: {
    fontSize: 22,

    fontWeight: "700",

    color: "#2563eb",
  },

  runtimeLabel: {
    marginTop: 6,

    fontSize: 13,

    color: "#6b7280",
  },
});
