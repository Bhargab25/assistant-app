import { useEffect, useState } from "react";

import {
  Animated,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import { Reminder } from "../../../core/reminders/reminder.types";

import { ReminderStorage } from "../../../core/reminders/reminder.storage";

import { ReminderRuntime } from "../../../core/reminders/reminder.runtime";

import { DeviceAudioService } from "../../../core/integrations/device-audio.service";

import { DeviceSpeechService } from "../../../core/integrations/device-speech.service";

import { colors } from "../../../shared/theme/colors";

import { RootStackParamList } from "../../navigation/types";

/*
|--------------------------------------------------------------------------
| Route Type
|--------------------------------------------------------------------------
*/

type Route = RouteProp<RootStackParamList, "ActiveAlarm">;

/*
|--------------------------------------------------------------------------
| Active Alarm Screen
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - full screen alarm runtime
| - ringing reminder UI
| - snooze handling
| - complete handling
| - skip handling
| - assistant voice runtime
| - active reminder rendering
|
| THIS IS THE REAL
| CORE APP EXPERIENCE
|
*/

export default function ActiveAlarmScreen() {
  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  const navigation = useNavigation();

  const route = useRoute<Route>();

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [reminder, setReminder] = useState<Reminder | null>(null);

  const [seconds, setSeconds] = useState(0);

  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Pulse Animation
  |--------------------------------------------------------------------------
  */

  const pulse = useState(new Animated.Value(1))[0];

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
      const data = await ReminderStorage.getById(route.params.reminderId);

      if (!data) {
        navigation.goBack();

        return;
      }

      setReminder(data);

      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Runtime Timer
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    /*
    |--------------------------------------------------------------------------
    | Timer
    |--------------------------------------------------------------------------
    */

    const timer = setInterval(() => {
      setSeconds((previous) => previous + 1);
    }, 1000);

    /*
    |--------------------------------------------------------------------------
    | Pulse Animation
    |--------------------------------------------------------------------------
    */

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,

          duration: 900,

          useNativeDriver: true,
        }),

        Animated.timing(pulse, {
          toValue: 1,

          duration: 900,

          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => {
      clearInterval(timer);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Complete Reminder
  |--------------------------------------------------------------------------
  */

  const completeReminder = async () => {
    try {
      await ReminderRuntime.completeReminder();

      navigation.goBack();
    } catch (error) {
      console.error(error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Snooze Reminder
  |--------------------------------------------------------------------------
  */

  const snoozeReminder = async () => {
    try {
      await ReminderRuntime.snoozeReminder();

      navigation.goBack();
    } catch (error) {
      console.error(error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Skip Reminder
  |--------------------------------------------------------------------------
  */

  const skipReminder = async () => {
    try {
      await ReminderRuntime.skipReminder();

      navigation.goBack();
    } catch (error) {
      console.error(error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Cleanup
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      DeviceSpeechService.stop();

      DeviceAudioService.stop();
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading || !reminder) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading alarm...</Text>
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
      {/* Content */}

      <Animated.View
        style={[
          styles.centerContent,

          {
            transform: [
              {
                scale: pulse,
              },
            ],
          },
        ]}
      >
        {/* Alarm Time */}

        <Text style={styles.time}>{reminder.schedule.time}</Text>

        {/* Reminder Title */}

        <Text style={styles.title}>{reminder.title}</Text>

        {/* Description */}

        {!!reminder.description && (
          <Text style={styles.description}>{reminder.description}</Text>
        )}

        {/* Place */}

        {reminder.place && (
          <View style={styles.placeBadge}>
            <Text style={styles.placeText}>{reminder.place.name}</Text>
          </View>
        )}

        {/* Runtime */}

        <Text style={styles.runtime}>Ringing for {seconds}s</Text>
      </Animated.View>

      {/* Actions */}

      <View style={styles.actions}>
        {/* Skip */}

        <Pressable
          style={[styles.actionButton, styles.skipButton]}
          onPress={skipReminder}
        >
          <Text style={styles.actionText}>Skip</Text>
        </Pressable>

        {/* Complete */}

        <Pressable style={[styles.completeButton]} onPress={completeReminder}>
          <Text style={styles.completeText}>Complete</Text>
        </Pressable>

        {/* Snooze */}

        <Pressable
          style={[styles.actionButton, styles.snoozeButton]}
          onPress={snoozeReminder}
        >
          <Text style={styles.actionText}>Snooze</Text>
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

    backgroundColor: "#111827",

    justifyContent: "space-between",

    paddingVertical: 80,

    paddingHorizontal: 24,
  },

  loadingContainer: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "#111827",
  },

  loadingText: {
    color: "#ffffff",

    fontSize: 18,
  },

  centerContent: {
    alignItems: "center",

    justifyContent: "center",

    marginTop: 80,
  },

  time: {
    fontSize: 82,

    fontWeight: "800",

    color: "#ffffff",
  },

  title: {
    marginTop: 30,

    fontSize: 34,

    fontWeight: "700",

    color: "#ffffff",

    textAlign: "center",
  },

  description: {
    marginTop: 18,

    fontSize: 17,

    color: "rgba(255,255,255,0.75)",

    textAlign: "center",

    lineHeight: 28,
  },

  placeBadge: {
    marginTop: 24,

    backgroundColor: "#1d4ed8",

    paddingHorizontal: 18,

    paddingVertical: 10,

    borderRadius: 999,
  },

  placeText: {
    color: "#ffffff",

    fontWeight: "700",
  },

  runtime: {
    marginTop: 40,

    color: "rgba(255,255,255,0.5)",

    fontSize: 15,
  },

  actions: {
    flexDirection: "row",

    justifyContent: "space-evenly",

    alignItems: "center",
  },

  actionButton: {
    width: 110,

    height: 110,

    borderRadius: 999,

    alignItems: "center",

    justifyContent: "center",
  },

  skipButton: {
    backgroundColor: "#374151",
  },

  snoozeButton: {
    backgroundColor: colors.primary,
  },

  completeButton: {
    width: 140,

    height: 140,

    borderRadius: 999,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "#16a34a",
  },

  actionText: {
    color: "#ffffff",

    fontWeight: "700",

    fontSize: 16,
  },

  completeText: {
    color: "#ffffff",

    fontWeight: "800",

    fontSize: 20,
  },
});
