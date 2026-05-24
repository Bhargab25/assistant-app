// src/ui/components/WorkflowCard.tsx

import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

import { Workflow } from "../../core/workflows/types";

/*
|--------------------------------------------------------------------------
| Workflow Card Props
|--------------------------------------------------------------------------
*/

type Props = {
  workflow: Workflow;

  onToggle?: (workflow: Workflow) => void;

  onPress?: (workflow: Workflow) => void;
};

/*
|--------------------------------------------------------------------------
| Workflow Card
|--------------------------------------------------------------------------
|
| Reusable workflow UI component.
|
| Responsibilities:
| - display workflow summary
| - show workflow state
| - enable/disable workflow
|
*/

export default function WorkflowCard({
  workflow,

  onToggle,

  onPress,
}: Props) {
  /*
  |--------------------------------------------------------------------------
  | Handle Press
  |--------------------------------------------------------------------------
  */

  const handlePress = () => {
    onPress?.(workflow);
  };

  /*
  |--------------------------------------------------------------------------
  | Handle Toggle
  |--------------------------------------------------------------------------
  */

  const handleToggle = () => {
    onToggle?.(workflow);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={handlePress}
    >
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.title}>{workflow.name}</Text>

          <Text style={styles.trigger}>Trigger: {workflow.trigger.type}</Text>

          <Text style={styles.state}>State: {workflow.state}</Text>
        </View>

        <Switch value={workflow.enabled} onValueChange={handleToggle} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.actionCount}>
          Actions: {workflow.actions.length}
        </Text>

        <Text style={styles.status}>
          {workflow.enabled ? "Active" : "Disabled"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",

    borderRadius: 18,

    padding: 18,

    marginBottom: 14,
  },

  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  info: {
    flex: 1,

    marginRight: 16,
  },

  title: {
    fontSize: 18,

    fontWeight: "700",

    marginBottom: 8,
  },

  trigger: {
    fontSize: 14,

    color: "#666",

    marginBottom: 4,
  },

  state: {
    fontSize: 13,

    color: "#999",
  },

  footer: {
    marginTop: 16,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  actionCount: {
    fontSize: 13,

    color: "#666",
  },

  status: {
    fontSize: 13,

    fontWeight: "600",

    color: "#1d4ed8",
  },
});
