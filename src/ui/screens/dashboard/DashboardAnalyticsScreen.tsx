import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

/*
|--------------------------------------------------------------------------
| Dashboard Analytics Screen
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - show assistant analytics
| - show runtime performance
| - show productivity metrics
| - show workflow execution stats
|
*/

export default function DashboardAnalyticsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>

          <Text style={styles.headerSubtitle}>
            Intelligent assistant runtime insights
          </Text>
        </View>

        {/* Performance Card */}

        <View style={styles.performanceCard}>
          <Text style={styles.performanceTitle}>Weekly Productivity</Text>

          <Text style={styles.performanceScore}>+21%</Text>

          <Text style={styles.performanceText}>
            AI assistant workflows improved your completion efficiency this
            week.
          </Text>
        </View>

        {/* Metrics Grid */}

        <View style={styles.grid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>312</Text>

            <Text style={styles.metricLabel}>Workflow Runs</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>94%</Text>

            <Text style={styles.metricLabel}>Success Rate</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>42</Text>

            <Text style={styles.metricLabel}>Voice Actions</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>18</Text>

            <Text style={styles.metricLabel}>AI Suggestions</Text>
          </View>
        </View>

        {/* Runtime Health */}

        <View style={styles.runtimeCard}>
          <Text style={styles.sectionTitle}>Runtime Health</Text>

          <View style={styles.runtimeRow}>
            <Text style={styles.runtimeLabel}>Workflow Engine</Text>

            <Text style={styles.runtimeValue}>HEALTHY</Text>
          </View>

          <View style={styles.runtimeRow}>
            <Text style={styles.runtimeLabel}>Background Runtime</Text>

            <Text style={styles.runtimeValue}>ACTIVE</Text>
          </View>

          <View style={styles.runtimeRow}>
            <Text style={styles.runtimeLabel}>Notification Queue</Text>

            <Text style={styles.runtimeValue}>STABLE</Text>
          </View>

          <View style={styles.runtimeRow}>
            <Text style={styles.runtimeLabel}>AI Assistant Runtime</Text>

            <Text style={styles.runtimeValue}>READY</Text>
          </View>
        </View>

        {/* AI Insight */}

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>AI Optimization Insight</Text>

          <Text style={styles.insightText}>
            Your reminder completion rate is highest during focused work
            sessions. The assistant recommends enabling adaptive workflow
            scheduling.
          </Text>
        </View>

        {/* Assistant Usage */}

        <View style={styles.usageCard}>
          <Text style={styles.sectionTitle}>Assistant Usage</Text>

          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>Smart Reminders</Text>

            <Text style={styles.usageValue}>148</Text>
          </View>

          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>AI Recommendations</Text>

            <Text style={styles.usageValue}>36</Text>
          </View>

          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>Automation Rules</Text>

            <Text style={styles.usageValue}>12</Text>
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

  performanceCard: {
    marginHorizontal: 20,

    marginTop: 22,

    borderRadius: 28,

    padding: 24,

    backgroundColor: "#2563eb",
  },

  performanceTitle: {
    fontSize: 20,

    fontWeight: "700",

    color: "#ffffff",
  },

  performanceScore: {
    marginTop: 18,

    fontSize: 58,

    fontWeight: "800",

    color: "#ffffff",
  },

  performanceText: {
    marginTop: 12,

    lineHeight: 24,

    color: "rgba(255,255,255,0.88)",
  },

  grid: {
    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "space-between",

    paddingHorizontal: 20,

    marginTop: 20,
  },

  metricCard: {
    width: "48%",

    backgroundColor: "#ffffff",

    borderRadius: 22,

    padding: 22,

    marginBottom: 16,
  },

  metricValue: {
    fontSize: 30,

    fontWeight: "800",

    color: "#111827",
  },

  metricLabel: {
    marginTop: 8,

    lineHeight: 20,

    color: "#6b7280",
  },

  runtimeCard: {
    marginHorizontal: 20,

    marginTop: 10,

    borderRadius: 24,

    padding: 22,

    backgroundColor: "#ffffff",
  },

  sectionTitle: {
    fontSize: 22,

    fontWeight: "700",

    color: "#111827",
  },

  runtimeRow: {
    marginTop: 22,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  runtimeLabel: {
    fontSize: 15,

    color: "#111827",
  },

  runtimeValue: {
    fontWeight: "700",

    color: "#16a34a",
  },

  insightCard: {
    marginHorizontal: 20,

    marginTop: 20,

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

  usageCard: {
    marginHorizontal: 20,

    marginTop: 20,

    borderRadius: 24,

    padding: 22,

    backgroundColor: "#ffffff",
  },

  usageRow: {
    marginTop: 22,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  usageLabel: {
    fontSize: 15,

    color: "#111827",
  },

  usageValue: {
    fontSize: 18,

    fontWeight: "700",

    color: "#2563eb",
  },
});
