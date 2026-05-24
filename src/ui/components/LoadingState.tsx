// src/ui/components/LoadingState.tsx

import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

/*
|--------------------------------------------------------------------------
| Loading State Props
|--------------------------------------------------------------------------
*/

type Props = {
  message?: string;
};

/*
|--------------------------------------------------------------------------
| Loading State
|--------------------------------------------------------------------------
|
| Standardized loading UI.
|
| Used for:
| - screen loading
| - workflow loading
| - parser loading
| - initialization loading
|
*/

export default function LoadingState({ message = "Loading..." }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />

      <Text style={styles.text}>{message}</Text>
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
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    padding: 24,
  },

  text: {
    marginTop: 14,

    fontSize: 16,

    color: "#666",
  },
});
