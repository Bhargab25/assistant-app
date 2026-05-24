// src/ui/screens/CreateWorkflowScreen.tsx

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import LoadingState from "../components/LoadingState";

import ErrorState from "../components/ErrorState";

import ParserPreview from "../components/ParserPreview";

import { useParser } from "../hooks/useParser";

/*
|--------------------------------------------------------------------------
| Create Workflow Screen
|--------------------------------------------------------------------------
|
| Responsibilities:
| - natural language workflow input
| - parser execution
| - workflow preview
| - workflow persistence
|
*/

export default function CreateWorkflowScreen() {
  /*
  |--------------------------------------------------------------------------
  | Parser Hook
  |--------------------------------------------------------------------------
  */

  const {
    input,

    loading,

    error,

    intent,

    workflow,

    setInput,

    parse,

    saveWorkflow,

    clearError,
  } = useParser();

  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return <LoadingState message="Processing workflow..." />;
  }

  /*
  |--------------------------------------------------------------------------
  | Error State
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <ErrorState
        title="Parser Error"
        message={error}
        actionLabel="Dismiss"
        onAction={clearError}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Workflow</Text>

        <Text style={styles.description}>
          Describe your automation in natural language.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Automation Instruction</Text>

          <TextInput
            style={styles.input}
            multiline
            placeholder="Example: Every 1 hour remind me to drink water"
            value={input}
            onChangeText={setInput}
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={parse}>
          <Text style={styles.buttonText}>Parse Workflow</Text>
        </TouchableOpacity>

        <ParserPreview intent={intent} workflow={workflow} />

        {workflow ? (
          <TouchableOpacity style={styles.saveButton} onPress={saveWorkflow}>
            <Text style={styles.buttonText}>Save Workflow</Text>
          </TouchableOpacity>
        ) : null}
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

    backgroundColor: "#ffffff",
  },

  content: {
    padding: 24,

    paddingBottom: 48,
  },

  title: {
    fontSize: 30,

    fontWeight: "700",

    marginBottom: 10,
  },

  description: {
    fontSize: 16,

    color: "#666",

    lineHeight: 24,

    marginBottom: 24,
  },

  card: {
    backgroundColor: "#f8fafc",

    borderRadius: 20,

    padding: 18,

    marginBottom: 18,
  },

  label: {
    fontSize: 15,

    fontWeight: "600",

    marginBottom: 12,
  },

  input: {
    minHeight: 150,

    fontSize: 16,

    lineHeight: 24,

    textAlignVertical: "top",
  },

  primaryButton: {
    height: 56,

    borderRadius: 16,

    backgroundColor: "#000",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 12,
  },

  saveButton: {
    height: 56,

    borderRadius: 16,

    backgroundColor: "#2563eb",

    justifyContent: "center",

    alignItems: "center",

    marginTop: 8,
  },

  buttonText: {
    color: "#fff",

    fontSize: 16,

    fontWeight: "600",
  },
});
