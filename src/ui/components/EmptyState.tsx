// src/ui/components/EmptyState.tsx

import { StyleSheet, Text, View } from "react-native";

/*
|--------------------------------------------------------------------------
| Empty State Props
|--------------------------------------------------------------------------
*/

type Props = {
  title: string;

  description?: string;
};

/*
|--------------------------------------------------------------------------
| Empty State
|--------------------------------------------------------------------------
|
| Reusable empty-state component.
|
| Used for:
| - no workflows
| - no logs
| - no reminders
| - empty search results
|
*/

export default function EmptyState({
  title,

  description,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {description ? (
        <Text style={styles.description}>{description}</Text>
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
    fontSize: 20,

    fontWeight: "600",

    marginBottom: 10,

    textAlign: "center",
  },

  description: {
    fontSize: 15,

    color: "#777",

    textAlign: "center",

    lineHeight: 22,
  },
});
