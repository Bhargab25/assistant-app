// src/ui/components/ParserPreview.tsx

import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Intent } from "../../core/parser/intent.types";

import { Workflow } from "../../core/workflows/types";

/*
|--------------------------------------------------------------------------
| Parser Preview Props
|--------------------------------------------------------------------------
*/

type Props = {
  intent?: Intent | null;

  workflow?: Workflow | null;
};

/*
|--------------------------------------------------------------------------
| Parser Preview
|--------------------------------------------------------------------------
|
| Visualizes:
| - detected intent
| - parser confidence
| - generated workflow
| - workflow structure
|
*/

export default function ParserPreview({
  intent,

  workflow,
}: Props) {
  /*
  |--------------------------------------------------------------------------
  | Empty State
  |--------------------------------------------------------------------------
  */

  if (!intent && !workflow) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Parser Preview</Text>

      {intent ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intent</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{intent.intent}</Text>
          </View>

          <Text style={styles.meta}>
            Confidence: {Math.round(intent.confidence * 100)}%
          </Text>

          <Text style={styles.meta}>Original Input:</Text>

          <Text style={styles.originalInput}>{intent.originalText}</Text>
        </View>
      ) : null}

      {workflow ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generated Workflow</Text>

          <ScrollView horizontal style={styles.codeContainer}>
            <Text style={styles.codeText}>
              {JSON.stringify(workflow, null, 2)}
            </Text>
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },

  heading: {
    fontSize: 22,

    fontWeight: "700",

    marginBottom: 16,
  },

  section: {
    backgroundColor: "#f8fafc",

    borderRadius: 18,

    padding: 18,

    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 17,

    fontWeight: "600",

    marginBottom: 14,
  },

  badge: {
    alignSelf: "flex-start",

    backgroundColor: "#dbeafe",

    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: 999,
  },

  badgeText: {
    color: "#1d4ed8",

    fontWeight: "600",

    fontSize: 13,
  },

  meta: {
    marginTop: 12,

    fontSize: 14,

    color: "#555",
  },

  originalInput: {
    marginTop: 8,

    fontSize: 15,

    color: "#222",

    lineHeight: 22,
  },

  codeContainer: {
    marginTop: 10,

    backgroundColor: "#0f172a",

    borderRadius: 14,

    padding: 14,

    maxHeight: 320,
  },

  codeText: {
    color: "#e2e8f0",

    fontSize: 12,

    fontFamily: "monospace",

    lineHeight: 20,
  },
});
