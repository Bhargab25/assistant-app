// App.tsx

import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

/*
|--------------------------------------------------------------------------
| Bootstrap Engine
|--------------------------------------------------------------------------
*/

import { AppBootstrap } from "./src/core/app/bootstrap";

/*
|--------------------------------------------------------------------------
| Navigation
|--------------------------------------------------------------------------
*/

import AppNavigator from "./src/ui/navigation/AppNavigator";

/*
|--------------------------------------------------------------------------
| App
|--------------------------------------------------------------------------
|
| ROOT APPLICATION ENTRY
|
| RESPONSIBILITIES:
|
| - bootstrap intelligent platform
| - initialize reminder runtime
| - initialize alarm runtime
| - initialize AI systems
| - initialize scheduler
| - initialize storage runtime
| - initialize assistant systems
| - initialize audio/speech runtime
| - initialize recovery runtime
| - mount navigation layer
|
| THIS IS THE REAL
| APPLICATION ROOT
|
*/

export default function App() {
  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [isReady, setIsReady] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Bootstrap Application
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        /*
          |--------------------------------------------------------------------------
          | Initialize Platform
          |--------------------------------------------------------------------------
          */

        await AppBootstrap.initialize();

        /*
          |--------------------------------------------------------------------------
          | Application Ready
          |--------------------------------------------------------------------------
          */

        if (mounted) {
          setIsReady(true);
        }
      } catch (err) {
        console.error("Application startup failed:", err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to initialize application",
          );
        }
      }
    };

    void bootstrap();

    /*
    |--------------------------------------------------------------------------
    | Cleanup
    |--------------------------------------------------------------------------
    */

    return () => {
      mounted = false;

      void AppBootstrap.shutdown();
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Error State
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" />

        <Text style={styles.errorTitle}>Startup Failed</Text>

        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  if (!isReady) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />

        <ActivityIndicator size="large" color="#22C55E" />

        <Text style={styles.loadingTitle}>
          Initializing Intelligent Platform
        </Text>

        <Text style={styles.loadingSubtitle}>
          Bootstrapping Reminder Runtime, AI Assistant, Alarm Engine, Scheduler,
          Storage, Audio Runtime, Speech Runtime, Adaptive Learning, and
          Recovery Systems...
        </Text>

        {/* Runtime Status */}

        <View style={styles.statusCard}>
          <Text style={styles.statusItem}>• Runtime Engine</Text>

          <Text style={styles.statusItem}>• Reminder Runtime</Text>

          <Text style={styles.statusItem}>• Full Screen Alarm Engine</Text>

          <Text style={styles.statusItem}>• Scheduler Runtime</Text>

          <Text style={styles.statusItem}>• AI Assistant Runtime</Text>

          <Text style={styles.statusItem}>• Notification Runtime</Text>

          <Text style={styles.statusItem}>• Audio Runtime</Text>

          <Text style={styles.statusItem}>• Speech Runtime</Text>

          <Text style={styles.statusItem}>• SQLite Persistence</Text>

          <Text style={styles.statusItem}>• Adaptive Learning</Text>

          <Text style={styles.statusItem}>• Recovery Engine</Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Application Runtime
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <StatusBar barStyle="light-content" />

      <AppNavigator />
    </>
  );
}

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

  loadingContainer: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    padding: 24,

    backgroundColor: "#020617",
  },

  loadingTitle: {
    marginTop: 24,

    fontSize: 24,

    fontWeight: "700",

    color: "#F8FAFC",

    textAlign: "center",
  },

  loadingSubtitle: {
    marginTop: 14,

    fontSize: 15,

    lineHeight: 25,

    color: "#CBD5E1",

    textAlign: "center",
  },

  /*
    |--------------------------------------------------------------------------
    | Runtime Status Card
    |--------------------------------------------------------------------------
    */

  statusCard: {
    marginTop: 36,

    width: "100%",

    padding: 22,

    borderRadius: 18,

    backgroundColor: "#111827",
  },

  statusItem: {
    color: "#E5E7EB",

    fontSize: 15,

    marginBottom: 10,
  },

  /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

  errorContainer: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    padding: 24,

    backgroundColor: "#111827",
  },

  errorTitle: {
    fontSize: 26,

    fontWeight: "700",

    color: "#EF4444",

    marginBottom: 16,
  },

  errorText: {
    fontSize: 16,

    lineHeight: 24,

    color: "#F3F4F6",

    textAlign: "center",
  },
});
