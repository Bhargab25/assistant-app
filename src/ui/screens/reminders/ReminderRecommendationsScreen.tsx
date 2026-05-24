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
| Recommendation Item
|--------------------------------------------------------------------------
*/

type RecommendationItem = {
  id: string;

  title: string;

  description: string;

  category: string;

  confidence: number;
};

/*
|--------------------------------------------------------------------------
| Recommendations
|--------------------------------------------------------------------------
*/

const recommendations: RecommendationItem[] = [
  {
    id: "1",

    title: "Morning Deep Work",

    description:
      "AI detected high productivity between 8 AM and 11 AM. Create focused work reminders during this period.",

    category: "Productivity",

    confidence: 96,
  },

  {
    id: "2",

    title: "Hydration Reminder",

    description:
      "You frequently miss hydration reminders in the afternoon. Increase reminder priority.",

    category: "Health",

    confidence: 91,
  },

  {
    id: "3",

    title: "Sleep Optimization",

    description:
      "The assistant recommends reducing late-night reminder frequency for improved sleep consistency.",

    category: "Wellness",

    confidence: 88,
  },

  {
    id: "4",

    title: "Focus Session Workflow",

    description:
      "Enable AI voice mode and focus alarms during work sessions for better concentration.",

    category: "Automation",

    confidence: 94,
  },
];

/*
|--------------------------------------------------------------------------
| Reminder Recommendations Screen
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - show AI recommendations
| - show assistant insights
| - suggest workflows
| - suggest productivity optimization
|
*/

export default function ReminderRecommendationsScreen() {
  /*
  |--------------------------------------------------------------------------
  | Apply Recommendation
  |--------------------------------------------------------------------------
  */

  const applyRecommendation = (item: RecommendationItem) => {
    /*
      |--------------------------------------------------------------------------
      | TODO
      |--------------------------------------------------------------------------
      |
      | Later integrate:
      |
      | - workflow builder
      | - assistant runtime
      | - AI automation engine
      |
      */

    console.log("Applying recommendation:", item.title);
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Recommendations</Text>

          <Text style={styles.headerSubtitle}>
            Intelligent assistant productivity insights
          </Text>
        </View>

        {/* Assistant Card */}

        <View style={styles.assistantCard}>
          <Text style={styles.assistantTitle}>Assistant Analysis Active</Text>

          <Text style={styles.assistantText}>
            Your workflow patterns, productivity behavior, and reminder
            interactions are being analyzed by the intelligent assistant
            runtime.
          </Text>
        </View>

        {/* Recommendations */}

        {recommendations.map((item) => (
          <View key={item.id} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{item.category}</Text>
              </View>

              <Text style={styles.confidenceText}>{item.confidence}%</Text>
            </View>

            <Text style={styles.recommendationTitle}>{item.title}</Text>

            <Text style={styles.recommendationDescription}>
              {item.description}
            </Text>

            <Pressable
              style={styles.applyButton}
              onPress={() => applyRecommendation(item)}
            >
              <Text style={styles.applyButtonText}>Apply Recommendation</Text>
            </Pressable>
          </View>
        ))}

        {/* Runtime Insight */}

        <View style={styles.runtimeCard}>
          <Text style={styles.runtimeTitle}>Runtime Insight</Text>

          <Text style={styles.runtimeDescription}>
            AI assistant automation performance improved by 24% after adaptive
            workflow optimization.
          </Text>

          <View style={styles.runtimeStats}>
            <View style={styles.runtimeStat}>
              <Text style={styles.runtimeStatValue}>24%</Text>

              <Text style={styles.runtimeStatLabel}>Productivity Gain</Text>
            </View>

            <View style={styles.runtimeStat}>
              <Text style={styles.runtimeStatValue}>AI</Text>

              <Text style={styles.runtimeStatLabel}>Optimized</Text>
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

  assistantCard: {
    marginHorizontal: 20,

    marginTop: 20,

    borderRadius: 24,

    padding: 22,

    backgroundColor: "#111827",
  },

  assistantTitle: {
    fontSize: 20,

    fontWeight: "700",

    color: "#ffffff",
  },

  assistantText: {
    marginTop: 12,

    lineHeight: 24,

    color: "rgba(255,255,255,0.85)",
  },

  recommendationCard: {
    marginHorizontal: 20,

    marginTop: 20,

    borderRadius: 24,

    padding: 20,

    backgroundColor: "#ffffff",
  },

  recommendationHeader: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  categoryBadge: {
    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: 999,

    backgroundColor: "#dbeafe",
  },

  categoryBadgeText: {
    color: "#2563eb",

    fontWeight: "700",

    fontSize: 12,
  },

  confidenceText: {
    fontSize: 16,

    fontWeight: "700",

    color: "#16a34a",
  },

  recommendationTitle: {
    marginTop: 18,

    fontSize: 20,

    fontWeight: "700",

    color: "#111827",
  },

  recommendationDescription: {
    marginTop: 10,

    lineHeight: 24,

    color: "#6b7280",
  },

  applyButton: {
    marginTop: 22,

    borderRadius: 18,

    paddingVertical: 16,

    alignItems: "center",

    backgroundColor: "#2563eb",
  },

  applyButtonText: {
    color: "#ffffff",

    fontSize: 15,

    fontWeight: "700",
  },

  runtimeCard: {
    marginHorizontal: 20,

    marginTop: 20,

    borderRadius: 24,

    padding: 22,

    backgroundColor: "#2563eb",
  },

  runtimeTitle: {
    fontSize: 20,

    fontWeight: "700",

    color: "#ffffff",
  },

  runtimeDescription: {
    marginTop: 10,

    lineHeight: 24,

    color: "rgba(255,255,255,0.85)",
  },

  runtimeStats: {
    marginTop: 24,

    flexDirection: "row",

    justifyContent: "space-between",
  },

  runtimeStat: {
    alignItems: "center",
  },

  runtimeStatValue: {
    fontSize: 26,

    fontWeight: "800",

    color: "#ffffff",
  },

  runtimeStatLabel: {
    marginTop: 6,

    color: "rgba(255,255,255,0.85)",
  },
});
