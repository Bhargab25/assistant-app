import { Pressable, StyleSheet, Text, View } from "react-native";

import { Reminder } from "../../../core/reminders/reminder.types";

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

interface Props {
  reminder: Reminder;

  onEdit(): void;

  onDelete(): void;

  onToggle(): void;
}

/*
|--------------------------------------------------------------------------
| Reminder Assistant Card
|--------------------------------------------------------------------------
|
| Conversational reminder card
| shown inside assistant chat.
|
*/

export default function ReminderAssistantCard({
  reminder,

  onEdit,

  onDelete,

  onToggle,
}: Props) {
  return (
    <View style={styles.card}>
      {/* Title */}

      <Text style={styles.title}>{reminder.title}</Text>

      {/* Description */}

      {!!reminder.description && (
        <Text style={styles.description}>{reminder.description}</Text>
      )}

      {/* Schedule */}

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Time</Text>

        <Text style={styles.metaValue}>{reminder.schedule.time}</Text>
      </View>

      {/* Repeat */}

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Repeat</Text>

        <Text style={styles.metaValue}>{reminder.schedule.repeat}</Text>
      </View>

      {/* Place */}

      {reminder.place && (
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Place</Text>

          <Text style={styles.metaValue}>{reminder.place.name}</Text>
        </View>
      )}

      {/* Status */}

      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,

            {
              backgroundColor: reminder.runtime.active ? "#16a34a" : "#dc2626",
            },
          ]}
        />

        <Text style={styles.statusText}>
          {reminder.runtime.active ? "Active" : "Paused"}
        </Text>
      </View>

      {/* Actions */}

      <View style={styles.actions}>
        {/* Edit */}

        <Pressable style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editText}>Edit</Text>
        </Pressable>

        {/* Toggle */}

        <Pressable style={styles.toggleButton} onPress={onToggle}>
          <Text style={styles.toggleText}>
            {reminder.runtime.active ? "Pause" : "Resume"}
          </Text>
        </Pressable>

        {/* Delete */}

        <Pressable style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </View>
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

    borderRadius: 22,

    padding: 18,

    marginTop: 10,

    width: "100%",
  },

  title: {
    fontSize: 20,

    fontWeight: "700",

    color: "#111827",
  },

  description: {
    marginTop: 10,

    color: "#6b7280",

    lineHeight: 22,
  },

  metaRow: {
    marginTop: 16,

    flexDirection: "row",

    justifyContent: "space-between",
  },

  metaLabel: {
    color: "#6b7280",

    fontWeight: "600",
  },

  metaValue: {
    color: "#111827",

    fontWeight: "700",

    textTransform: "capitalize",
  },

  statusContainer: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 18,
  },

  statusDot: {
    width: 10,

    height: 10,

    borderRadius: 999,
  },

  statusText: {
    marginLeft: 8,

    fontWeight: "700",

    color: "#111827",
  },

  actions: {
    flexDirection: "row",

    marginTop: 24,
  },

  editButton: {
    backgroundColor: "#dbeafe",

    paddingHorizontal: 16,

    paddingVertical: 12,

    borderRadius: 14,

    marginRight: 10,
  },

  editText: {
    color: "#2563eb",

    fontWeight: "700",
  },

  toggleButton: {
    backgroundColor: "#dcfce7",

    paddingHorizontal: 16,

    paddingVertical: 12,

    borderRadius: 14,

    marginRight: 10,
  },

  toggleText: {
    color: "#16a34a",

    fontWeight: "700",
  },

  deleteButton: {
    backgroundColor: "#fee2e2",

    paddingHorizontal: 16,

    paddingVertical: 12,

    borderRadius: 14,
  },

  deleteText: {
    color: "#dc2626",

    fontWeight: "700",
  },
});
