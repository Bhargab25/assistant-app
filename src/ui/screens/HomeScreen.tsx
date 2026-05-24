// src/ui/screens/HomeScreen.tsx

import { useEffect } from "react";

import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../navigation/AppNavigator";

import WorkflowCard from "../components/WorkflowCard";

import EmptyState from "../components/EmptyState";

import LoadingState from "../components/LoadingState";

import ErrorState from "../components/ErrorState";

import { useWorkflowStore } from "../../shared/store/workflow.store";

import { useWorkflowActions } from "../hooks/useWorkflowActions";

import { Workflow } from "../../core/workflows/types";

/*
|--------------------------------------------------------------------------
| Navigation Type
|--------------------------------------------------------------------------
*/

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/*
|--------------------------------------------------------------------------
| Home Screen
|--------------------------------------------------------------------------
|
| Main workflow dashboard.
|
*/

export default function HomeScreen() {
  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  const navigation = useNavigation<Navigation>();

  /*
  |--------------------------------------------------------------------------
  | Store
  |--------------------------------------------------------------------------
  */

  const {
    workflows,

    loading,

    error,

    loadWorkflows,
  } = useWorkflowStore();

  /*
  |--------------------------------------------------------------------------
  | Workflow Actions
  |--------------------------------------------------------------------------
  */

  const {
    openWorkflow,

    openCreateWorkflow,

    toggleWorkflow,
  } = useWorkflowActions();

  /*
  |--------------------------------------------------------------------------
  | Load Workflows
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadWorkflows();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  if (loading && workflows.length === 0) {
    return <LoadingState message="Loading workflows..." />;
  }

  /*
  |--------------------------------------------------------------------------
  | Error State
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <ErrorState
        title="Workflow Error"
        message={error}
        actionLabel="Retry"
        onAction={loadWorkflows}
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render Workflow
  |--------------------------------------------------------------------------
  */

  const renderWorkflow = ({ item }: { item: Workflow }) => {
    return (
      <WorkflowCard
        workflow={item}
        onPress={openWorkflow}
        onToggle={toggleWorkflow}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Personal Assistant</Text>

        <Text style={styles.subtitle}>Intelligent workflow automation</Text>
      </View>

      <FlatList
        data={workflows}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkflow}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title="No workflows found"
            description="Create your first intelligent workflow automation."
          />
        }
      />

      <TouchableOpacity style={styles.fab} onPress={openCreateWorkflow}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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

  header: {
    padding: 24,

    paddingBottom: 10,
  },

  title: {
    fontSize: 30,

    fontWeight: "700",

    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,

    color: "#666",
  },

  list: {
    padding: 16,

    paddingBottom: 120,
  },

  fab: {
    position: "absolute",

    right: 24,

    bottom: 32,

    width: 64,

    height: 64,

    borderRadius: 999,

    backgroundColor: "#000",

    justifyContent: "center",

    alignItems: "center",

    elevation: 4,
  },

  fabText: {
    color: "#fff",

    fontSize: 34,

    fontWeight: "700",

    marginTop: -2,
  },
});
