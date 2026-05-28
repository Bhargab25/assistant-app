import { useEffect, useMemo, useState } from "react";

import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import { RootStackParamList } from "../../navigation/types";

import { ReminderService } from "../../../core/reminders/reminder.service";

import { Reminder } from "../../../core/reminders/reminder.types";

import { ReminderRuntime } from "../../../core/reminders/reminder.runtime";

/*
|--------------------------------------------------------------------------
| Route
|--------------------------------------------------------------------------
*/

type AlarmRoute = RouteProp<RootStackParamList, "ReminderAlarm">;

/*
|--------------------------------------------------------------------------
| Reminder Alarm Screen
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - full screen reminder alarm
| - aggressive reminder interruption
| - snooze handling
| - complete handling
| - motivational assistant UI
| - alarm runtime experience
| - runtime lifecycle integration
|
*/

export default function ReminderAlarmScreen() {
  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  const navigation = useNavigation();

  const route = useRoute<AlarmRoute>();

  /*
  |--------------------------------------------------------------------------
  | Params
  |--------------------------------------------------------------------------
  */

  const { reminderId } = route.params;

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [reminder, setReminder] = useState<Reminder | null>(null);

  const [seconds, setSeconds] = useState(0);

  /*
  |--------------------------------------------------------------------------
  | Load Reminder
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadReminder();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Runtime Timer
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Load Reminder
  |--------------------------------------------------------------------------
  */

  const loadReminder = async () => {
    try {
      const loaded = await ReminderService.getById(reminderId);

      if (loaded) {
        setReminder(loaded);
      }
    } catch (error) {
      console.error("Alarm reminder load failed", error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Complete Reminder
  |--------------------------------------------------------------------------
  */

  const completeReminder = async () => {
    try {
      /*
        |--------------------------------------------------------------------------
        | Complete Runtime
        |--------------------------------------------------------------------------
        */

      await ReminderRuntime.completeReminder();

      /*
        |--------------------------------------------------------------------------
        | Close Alarm
        |--------------------------------------------------------------------------
        */

      navigation.goBack();
    } catch (error) {
      console.error("Reminder completion failed", error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Snooze Reminder
  |--------------------------------------------------------------------------
  */

  const snoozeReminder = async (minutes: number) => {
    try {
      /*
        |--------------------------------------------------------------------------
        | Snooze Runtime
        |--------------------------------------------------------------------------
        */

      await ReminderRuntime.snoozeReminder();

      /*
        |--------------------------------------------------------------------------
        | Close Alarm
        |--------------------------------------------------------------------------
        */

      navigation.goBack();
    } catch (error) {
      console.error("Reminder snooze failed", error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Skip Reminder
  |--------------------------------------------------------------------------
  */

  const skipReminder = async () => {
    try {
      /*
        |--------------------------------------------------------------------------
        | Skip Runtime
        |--------------------------------------------------------------------------
        */

      await ReminderRuntime.skipReminder();

      /*
        |--------------------------------------------------------------------------
        | Close Alarm
        |--------------------------------------------------------------------------
        */

      navigation.goBack();
    } catch (error) {
      console.error("Reminder skip failed", error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Duration Label
  |--------------------------------------------------------------------------
  */

  const durationLabel = useMemo(() => {
    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, [seconds]);

  /*
  |--------------------------------------------------------------------------
  | Empty Reminder
  |--------------------------------------------------------------------------
  */

  if (!reminder) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading reminder...</Text>
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
      <StatusBar hidden />

      {/* Glow */}

      <View style={styles.glow} />

      {/* Assistant */}

      <Text style={styles.assistantLabel}>AI Assistant Reminder</Text>

      {/* Title */}

      <Text style={styles.title}>{reminder.title}</Text>

      {/* Description */}

      {!!reminder.description && (
        <Text style={styles.description}>{reminder.description}</Text>
      )}

      {/* Timer */}

      <Text style={styles.timer}>{durationLabel}</Text>

      {/* Motivation */}

      <View style={styles.motivationCard}>
        <Text style={styles.motivationTitle}>Stay Consistent 🚀</Text>

        <Text style={styles.motivationText}>
          Small repeated actions build long-term transformation.
        </Text>
      </View>

      {/* Actions */}

      <View style={styles.actions}>
        {/* Complete */}

        <Pressable style={styles.completeButton} onPress={completeReminder}>
          <Text style={styles.completeText}>Complete</Text>
        </Pressable>

        {/* Snooze */}

        <Pressable
          style={styles.snoozeButton}
          onPress={() => snoozeReminder(5)}
        >
          <Text style={styles.snoozeText}>Snooze 5m</Text>
        </Pressable>

        {/* Skip */}

        <Pressable style={styles.skipButton} onPress={skipReminder}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>
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

    backgroundColor: "#0f172a",

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 24,
  },

  loadingContainer: {
    flex: 1,

    backgroundColor: "#0f172a",

    alignItems: "center",

    justifyContent: "center",
  },

  loadingText: {
    color: "#ffffff",

    fontSize: 18,
  },

  glow: {
    position: "absolute",

    width: 320,

    height: 320,

    borderRadius: 999,

    backgroundColor: "#2563eb",

    opacity: 0.2,
  },

  assistantLabel: {
    color: "#93c5fd",

    fontSize: 16,

    fontWeight: "700",

    letterSpacing: 1,
  },

  title: {
    marginTop: 20,

    fontSize: 42,

    fontWeight: "800",

    color: "#ffffff",

    textAlign: "center",
  },

  description: {
    marginTop: 16,

    color: "#cbd5e1",

    fontSize: 18,

    lineHeight: 28,

    textAlign: "center",
  },

  timer: {
    marginTop: 34,

    fontSize: 52,

    fontWeight: "800",

    color: "#ffffff",
  },

  motivationCard: {
    marginTop: 40,

    width: "100%",

    backgroundColor: "rgba(255,255,255,0.08)",

    borderRadius: 24,

    padding: 24,
  },

  motivationTitle: {
    color: "#ffffff",

    fontSize: 20,

    fontWeight: "700",
  },

  motivationText: {
    marginTop: 12,

    color: "#cbd5e1",

    fontSize: 16,

    lineHeight: 26,
  },

  actions: {
    marginTop: 48,

    width: "100%",
  },

  completeButton: {
    backgroundColor: "#22c55e",

    paddingVertical: 18,

    borderRadius: 22,

    alignItems: "center",
  },

  completeText: {
    color: "#ffffff",

    fontSize: 18,

    fontWeight: "700",
  },

  snoozeButton: {
    marginTop: 16,

    backgroundColor: "#2563eb",

    paddingVertical: 18,

    borderRadius: 22,

    alignItems: "center",
  },

  snoozeText: {
    color: "#ffffff",

    fontSize: 18,

    fontWeight: "700",
  },

  skipButton: {
    marginTop: 16,

    backgroundColor: "rgba(255,255,255,0.08)",

    paddingVertical: 18,

    borderRadius: 22,

    alignItems: "center",
  },

  skipText: {
    color: "#ffffff",

    fontSize: 18,

    fontWeight: "700",
  },
});
