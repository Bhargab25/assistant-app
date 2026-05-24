// src/ui/components/ErrorState.tsx

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/*
|--------------------------------------------------------------------------
| Error State Props
|--------------------------------------------------------------------------
*/

type Props = {
  title?: string;

  message: string;

  actionLabel?: string;

  onAction?: () => void;
};

/*
|--------------------------------------------------------------------------
| Error State
|--------------------------------------------------------------------------
|
| Standardized error UI.
|
| Used for:
| - initialization failures
| - parser failures
| - workflow errors
| - network/storage errors
|
*/

export default function ErrorState({
  title = "Something went wrong",

  message,

  actionLabel,

  onAction,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.message}>{message}</Text>

      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
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
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    padding: 32,
  },

  title: {
    fontSize: 22,

    fontWeight: "700",

    marginBottom: 12,

    textAlign: "center",
  },

  message: {
    fontSize: 15,

    color: "#666",

    textAlign: "center",

    lineHeight: 22,

    marginBottom: 24,
  },

  button: {
    minWidth: 140,

    height: 48,

    paddingHorizontal: 24,

    borderRadius: 14,

    backgroundColor: "#000",

    justifyContent: "center",

    alignItems: "center",
  },

  buttonText: {
    color: "#fff",

    fontSize: 15,

    fontWeight: "600",
  },
});
