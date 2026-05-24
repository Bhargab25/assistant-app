import { useEffect, useState } from "react";

import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import { ReminderService } from "../../../core/reminders/reminder.service";

import {
  Reminder,
  ReminderPlace,
  ReminderPriority,
  ReminderRepeatType,
} from "../../../core/reminders/reminder.types";

import { colors } from "../../../shared/theme/colors";

/*
|--------------------------------------------------------------------------
| Route Params
|--------------------------------------------------------------------------
*/

type RouteParams = {
  params: {
    reminderId: string;
  };
};

/*
|--------------------------------------------------------------------------
| Places
|--------------------------------------------------------------------------
*/

const PLACES: ReminderPlace[] = [
  {
    id: "home",

    name: "Home",

    type: "home",
  },

  {
    id: "office",

    name: "Office",

    type: "office",
  },

  {
    id: "gym",

    name: "Gym",

    type: "gym",
  },

  {
    id: "school",

    name: "School",

    type: "school",
  },
];

/*
|--------------------------------------------------------------------------
| Priorities
|--------------------------------------------------------------------------
*/

const PRIORITIES: ReminderPriority[] = ["low", "medium", "high", "critical"];

/*
|--------------------------------------------------------------------------
| Repeat Types
|--------------------------------------------------------------------------
*/

const REPEAT_OPTIONS: ReminderRepeatType[] = [
  "none",

  "daily",

  "weekly",

  "monthly",
];

/*
|--------------------------------------------------------------------------
| Edit Reminder Screen
|--------------------------------------------------------------------------
*/

export default function EditReminderScreen() {
  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  const navigation = useNavigation();

  const route = useRoute<RouteProp<RouteParams, "params">>();

  /*
  |--------------------------------------------------------------------------
  | Reminder
  |--------------------------------------------------------------------------
  */

  const [reminder, setReminder] = useState<Reminder | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Form State
  |--------------------------------------------------------------------------
  */

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [date, setDate] = useState("");

  const [time, setTime] = useState("");

  const [priority, setPriority] = useState<ReminderPriority>("medium");

  const [repeat, setRepeat] = useState<ReminderRepeatType>("none");

  const [selectedPlace, setSelectedPlace] = useState<
    ReminderPlace | undefined
  >();

  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const [alarmEnabled, setAlarmEnabled] = useState(true);

  const [loading, setLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load Reminder
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadReminder();
  }, []);

  const loadReminder = async () => {
    try {
      const data = await ReminderService.getById(route.params.reminderId);

      if (!data) {
        Alert.alert("Error", "Reminder not found");

        navigation.goBack();

        return;
      }

      setReminder(data);

      /*
        |--------------------------------------------------------------------------
        | Populate Form
        |--------------------------------------------------------------------------
        */

      setTitle(data.title);

      setDescription(data.description ?? "");

      setDate(data.schedule.date);

      setTime(data.schedule.time);

      setPriority(data.priority);

      setRepeat(data.schedule.repeat);

      setSelectedPlace(data.place);

      setVoiceEnabled(data.assistant.voiceEnabled);

      setAlarmEnabled(data.alarm.enabled);
    } catch (error) {
      console.error(error);

      Alert.alert("Error", "Failed loading reminder");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Update Reminder
  |--------------------------------------------------------------------------
  */

  const updateReminder = async () => {
    try {
      if (!reminder) {
        return;
      }

      if (!title.trim()) {
        Alert.alert("Validation", "Reminder title required");

        return;
      }

      setLoading(true);

      /*
        |--------------------------------------------------------------------------
        | Update Reminder
        |--------------------------------------------------------------------------
        */

      await ReminderService.update(reminder.id, {
        title,

        description,

        priority,

        place: selectedPlace,

        schedule: {
          date,

          time,

          repeat,
        },

        assistant: {
          ...reminder.assistant,

          voiceEnabled,
        },

        alarm: {
          ...reminder.alarm,

          enabled: alarmEnabled,
        },
      });

      Alert.alert("Success", "Reminder updated successfully");

      navigation.goBack();
    } catch (error) {
      console.error(error);

      Alert.alert("Error", "Reminder update failed");
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (!reminder) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading reminder...</Text>
      </SafeAreaView>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}

        <Text style={styles.headerTitle}>Edit Reminder</Text>

        <Text style={styles.headerSubtitle}>
          Update intelligent alarm reminder
        </Text>

        {/* Title */}

        <Text style={styles.label}>Title</Text>

        <TextInput value={title} onChangeText={setTitle} style={styles.input} />

        {/* Description */}

        <Text style={styles.label}>Description</Text>

        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          style={[
            styles.input,
            {
              height: 120,
            },
          ]}
        />

        {/* Date */}

        <Text style={styles.label}>Date</Text>

        <TextInput value={date} onChangeText={setDate} style={styles.input} />

        {/* Time */}

        <Text style={styles.label}>Time</Text>

        <TextInput value={time} onChangeText={setTime} style={styles.input} />

        {/* Places */}

        <Text style={styles.label}>Place</Text>

        <View style={styles.wrap}>
          {PLACES.map((place) => {
            const active = selectedPlace?.id === place.id;

            return (
              <Pressable
                key={place.id}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => setSelectedPlace(place)}
              >
                <Text
                  style={[styles.optionText, active && styles.optionTextActive]}
                >
                  {place.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Repeat */}

        <Text style={styles.label}>Repeat</Text>

        <View style={styles.wrap}>
          {REPEAT_OPTIONS.map((item) => {
            const active = repeat === item;

            return (
              <Pressable
                key={item}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => setRepeat(item)}
              >
                <Text
                  style={[styles.optionText, active && styles.optionTextActive]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Priority */}

        <Text style={styles.label}>Priority</Text>

        <View style={styles.wrap}>
          {PRIORITIES.map((item) => {
            const active = priority === item;

            return (
              <Pressable
                key={item}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => setPriority(item)}
              >
                <Text
                  style={[styles.optionText, active && styles.optionTextActive]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Voice */}

        <View style={styles.switchCard}>
          <Text style={styles.switchLabel}>Voice Assistant</Text>

          <Switch value={voiceEnabled} onValueChange={setVoiceEnabled} />
        </View>

        {/* Alarm */}

        <View style={styles.switchCard}>
          <Text style={styles.switchLabel}>Full Screen Alarm</Text>

          <Switch value={alarmEnabled} onValueChange={setAlarmEnabled} />
        </View>

        {/* Update */}

        <Pressable
          style={styles.button}
          onPress={updateReminder}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Updating..." : "Update Reminder"}
          </Text>
        </Pressable>
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

    backgroundColor: colors.background,
  },

  scrollContent: {
    padding: 20,

    paddingBottom: 100,
  },

  loadingContainer: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 30,

    fontWeight: "700",

    color: colors.textPrimary,
  },

  headerSubtitle: {
    marginTop: 8,

    marginBottom: 24,

    color: colors.textSecondary,
  },

  label: {
    marginBottom: 10,

    marginTop: 18,

    fontSize: 15,

    fontWeight: "600",

    color: colors.textPrimary,
  },

  input: {
    backgroundColor: "#ffffff",

    borderRadius: 18,

    paddingHorizontal: 16,

    paddingVertical: 14,

    fontSize: 16,
  },

  wrap: {
    flexDirection: "row",

    flexWrap: "wrap",
  },

  option: {
    paddingHorizontal: 18,

    paddingVertical: 12,

    borderRadius: 14,

    backgroundColor: "#e5e7eb",

    marginRight: 10,

    marginBottom: 10,
  },

  optionActive: {
    backgroundColor: colors.primary,
  },

  optionText: {
    fontWeight: "600",

    color: colors.textPrimary,
  },

  optionTextActive: {
    color: "#ffffff",
  },

  switchCard: {
    marginTop: 18,

    padding: 18,

    borderRadius: 18,

    backgroundColor: "#ffffff",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  switchLabel: {
    fontSize: 16,

    fontWeight: "600",

    color: colors.textPrimary,
  },

  button: {
    marginTop: 30,

    backgroundColor: colors.primary,

    borderRadius: 18,

    paddingVertical: 18,

    alignItems: "center",
  },

  buttonText: {
    color: "#ffffff",

    fontWeight: "700",

    fontSize: 16,
  },
});
