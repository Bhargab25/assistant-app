// App.tsx

import React, { useEffect, useState } from "react";

import {
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

import FuturisticSplashScreen from "./src/ui/components/FuturisticSplashScreen";

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
    return () => {
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
      <FuturisticSplashScreen
        onFinish={(err) => {
          if (err) {
            setError(err);
          } else {
            setIsReady(true);
          }
        }}
      />
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
