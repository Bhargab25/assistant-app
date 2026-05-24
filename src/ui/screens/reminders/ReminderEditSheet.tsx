import { useEffect, useState } from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Reminder } from "../../../core/reminders/reminder.types";

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

interface Props {
  visible: boolean;

  reminder: Reminder | null;

  onClose(): void;

  onSave(updates: Partial<Reminder>): Promise<void>;
}

/*
|--------------------------------------------------------------------------
| Reminder Edit Sheet
|--------------------------------------------------------------------------
|
| Conversational inline
| reminder editing UI.
|
*/

export default function ReminderEditSheet({
  visible,

  reminder,

  onClose,

  onSave,
}: Props) {
  /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [time, setTime] = useState("");

  /*
    |--------------------------------------------------------------------------
    | Load Reminder
    |--------------------------------------------------------------------------
    */

  useEffect(() => {
    if (!reminder) {
      return;
    }

    setTitle(reminder.title);

    setDescription(reminder.description ?? "");

    setTime(reminder.schedule.time);
  }, [reminder]);

  /*
    |--------------------------------------------------------------------------
    | Save
    |--------------------------------------------------------------------------
    */

  const handleSave = async () => {
    if (!reminder) {
      return;
    }

    await onSave({
      title,

      description,

      schedule: {
        ...reminder.schedule,

        time,
      },
    });

    onClose();
  };

  /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}

          <Text style={styles.title}>Edit Reminder</Text>

          {/* Title */}

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Reminder title"
            style={styles.input}
          />

          {/* Description */}

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            style={styles.input}
          />

          {/* Time */}

          <TextInput
            value={time}
            onChangeText={setTime}
            placeholder="09:00 AM"
            style={styles.input}
          />

          {/* Actions */}

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  overlay: {
    flex: 1,

    backgroundColor: "rgba(0,0,0,0.45)",

    justifyContent: "flex-end",
  },

  sheet: {
    backgroundColor: "#ffffff",

    borderTopLeftRadius: 28,

    borderTopRightRadius: 28,

    padding: 24,
  },

  title: {
    fontSize: 24,

    fontWeight: "700",

    color: "#111827",

    marginBottom: 22,
  },

  input: {
    borderWidth: 1,

    borderColor: "#d1d5db",

    borderRadius: 16,

    paddingHorizontal: 16,

    paddingVertical: 14,

    marginBottom: 16,

    fontSize: 16,
  },

  actions: {
    flexDirection: "row",

    justifyContent: "flex-end",

    marginTop: 10,
  },

  cancelButton: {
    paddingHorizontal: 18,

    paddingVertical: 14,

    marginRight: 12,
  },

  cancelText: {
    color: "#6b7280",

    fontWeight: "700",
  },

  saveButton: {
    backgroundColor: "#2563eb",

    paddingHorizontal: 22,

    paddingVertical: 14,

    borderRadius: 16,
  },

  saveText: {
    color: "#ffffff",

    fontWeight: "700",
  },
});
