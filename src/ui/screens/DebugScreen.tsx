// src/ui/screens/DebugScreen.tsx

import { useEffect, useState } from "react";

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { EventBus } from "../../core/events/event-bus";

import { WorkflowService } from "../../core/workflows/workflow.service";

import { RetryService } from "../../core/scheduler/retry.service";

import { Workflow } from "../../core/workflows/types";

/*
|--------------------------------------------------------------------------
| Debug Screen
|--------------------------------------------------------------------------
|
| Runtime observability screen.
|
| VERY IMPORTANT:
| This screen becomes critical later for:
| - debugging
| - QA
| - AI tuning
| - parser analysis
| - scheduler inspection
| - workflow verification
|
*/

export default function DebugScreen() {
  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  const [events, setEvents] = useState<string[]>([]);

  const [retryCount, setRetryCount] = useState(0);

  /*
  |--------------------------------------------------------------------------
  | Load Runtime State
  |--------------------------------------------------------------------------
  */

  const loadRuntime = async () => {
    try {
      const loadedWorkflows = await WorkflowService.findAll();

      setWorkflows(loadedWorkflows);

      setRetryCount(RetryService.getQueue().length);

      const registeredEvents = Object.keys(EventBus.getEvents());

      setEvents(registeredEvents);
    } catch (error) {
      console.error(error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Lifecycle
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadRuntime();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Runtime Debugger</Text>

        <Text style={styles.subtitle}>Internal runtime inspection tools</Text>

        {/* Runtime Metrics */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Runtime Metrics</Text>

          <Text style={styles.metric}>Workflows: {workflows.length}</Text>

          <Text style={styles.metric}>Retry Queue: {retryCount}</Text>

          <Text style={styles.metric}>Event Channels: {events.length}</Text>
        </View>

        {/* Workflows */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Workflows</Text>

          {workflows.map((workflow) => (
            <View key={workflow.id} style={styles.item}>
              <Text style={styles.itemTitle}>{workflow.name}</Text>

              <Text style={styles.itemMeta}>
                Trigger: {workflow.trigger.type}
              </Text>

              <Text style={styles.itemMeta}>State: {workflow.state}</Text>
            </View>
          ))}
        </View>

        {/* Events */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Registered Events</Text>

          {events.map((event) => (
            <View key={event} style={styles.eventBadge}>
              <Text style={styles.eventText}>{event}</Text>
            </View>
          ))}
        </View>

        {/* Refresh */}

        <TouchableOpacity style={styles.refreshButton} onPress={loadRuntime}>
          <Text style={styles.refreshText}>Refresh Runtime</Text>
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

  content: {
    padding: 24,

    paddingBottom: 48,
  },

  title: {
    fontSize: 30,

    fontWeight: "700",

    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,

    color: "#666",

    marginBottom: 24,
  },

  card: {
    backgroundColor: "#fff",

    borderRadius: 18,

    padding: 18,

    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 18,

    fontWeight: "700",

    marginBottom: 14,
  },

  metric: {
    fontSize: 15,

    marginBottom: 10,

    color: "#333",
  },

  item: {
    paddingVertical: 10,

    borderBottomWidth: 1,

    borderBottomColor: "#eee",
  },

  itemTitle: {
    fontSize: 16,

    fontWeight: "600",

    marginBottom: 4,
  },

  itemMeta: {
    fontSize: 13,

    color: "#666",
  },

  eventBadge: {
    alignSelf: "flex-start",

    backgroundColor: "#dbeafe",

    borderRadius: 999,

    paddingHorizontal: 12,

    paddingVertical: 6,

    marginBottom: 10,
  },

  eventText: {
    color: "#1d4ed8",

    fontSize: 13,

    fontWeight: "600",
  },

  refreshButton: {
    height: 56,

    borderRadius: 16,

    backgroundColor: "#000",

    justifyContent: "center",

    alignItems: "center",
  },

  refreshText: {
    color: "#fff",

    fontSize: 16,

    fontWeight: "600",
  },
});
