// src/ui/screens/WorkflowDetailsScreen.tsx

import { useMemo } from "react";

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../navigation/types";

import { useWorkflowStore } from "../../shared/store/workflow.store";

/*
|--------------------------------------------------------------------------
| Route Types
|--------------------------------------------------------------------------
*/

type WorkflowDetailsRoute = RouteProp<RootStackParamList, "WorkflowDetails">;

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/*
|--------------------------------------------------------------------------
| Workflow Details Screen
|--------------------------------------------------------------------------
|
| Responsibilities:
| - inspect workflow runtime data
| - enable/disable workflow
| - debug workflow configuration
| - display workflow structure
|
*/

export default function WorkflowDetailsScreen() {
  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  const route = useRoute<WorkflowDetailsRoute>();

  const navigation = useNavigation<Navigation>();

  /*
  |--------------------------------------------------------------------------
  | Params
  |--------------------------------------------------------------------------
  */

  const { workflowId } = route.params;

  /*
  |--------------------------------------------------------------------------
  | Store
  |--------------------------------------------------------------------------
  */

  const {
    workflows,

    enableWorkflow,

    disableWorkflow,

    deleteWorkflow,
  } = useWorkflowStore();

  /*
  |--------------------------------------------------------------------------
  | Workflow
  |--------------------------------------------------------------------------
  */

  const workflow = useMemo(() => {
    return workflows.find((item) => item.id === workflowId);
  }, [workflowId, workflows]);

  /*
  |--------------------------------------------------------------------------
  | Missing Workflow
  |--------------------------------------------------------------------------
  */

  if (!workflow) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Workflow not found</Text>
      </SafeAreaView>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Toggle Workflow
  |--------------------------------------------------------------------------
  */

  const toggleWorkflow = async () => {
    if (workflow.enabled) {
      await disableWorkflow(workflow.id);
    } else {
      await enableWorkflow(workflow.id);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Workflow
  |--------------------------------------------------------------------------
  */

  const handleDelete = async () => {
    await deleteWorkflow(workflow.id);

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.title}>{workflow.name}</Text>

              <Text style={styles.subtitle}>Workflow ID: {workflow.id}</Text>
            </View>

            <Switch value={workflow.enabled} onValueChange={toggleWorkflow} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Trigger</Text>

          <Text style={styles.codeText}>
            {JSON.stringify(workflow.trigger, null, 2)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Conditions</Text>

          <Text style={styles.codeText}>
            {JSON.stringify(workflow.conditions, null, 2)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <Text style={styles.codeText}>
            {JSON.stringify(workflow.actions, null, 2)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Retry Policy</Text>

          <Text style={styles.codeText}>
            {JSON.stringify(workflow.retryPolicy, null, 2)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Runtime State</Text>

          <Text style={styles.metaText}>State: {workflow.state}</Text>

          <Text style={styles.metaText}>Created: {workflow.createdAt}</Text>

          <Text style={styles.metaText}>Updated: {workflow.updatedAt}</Text>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete Workflow</Text>
        </TouchableOpacity>
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

    backgroundColor: "#f5f5f5",
  },

  centered: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",
  },

  content: {
    padding: 16,

    paddingBottom: 48,
  },

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

  headerInfo: {
    flex: 1,

    marginRight: 16,
  },

  title: {
    fontSize: 24,

    fontWeight: "700",

    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,

    color: "#666",
  },

  sectionTitle: {
    fontSize: 18,

    fontWeight: "600",

    marginBottom: 12,
  },

  codeText: {
    fontSize: 13,

    fontFamily: "monospace",

    color: "#333",

    lineHeight: 20,
  },

  metaText: {
    fontSize: 14,

    color: "#444",

    marginBottom: 8,
  },

  deleteButton: {
    height: 56,

    borderRadius: 16,

    backgroundColor: "#dc2626",

    justifyContent: "center",

    alignItems: "center",

    marginTop: 12,
  },

  deleteText: {
    color: "#fff",

    fontSize: 16,

    fontWeight: "700",
  },

  errorText: {
    color: "red",

    fontSize: 16,
  },
});
