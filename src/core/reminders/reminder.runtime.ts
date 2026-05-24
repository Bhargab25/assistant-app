// src/core/reminders/reminder.runtime.ts

import {
    Reminder,
} from "./reminder.types";

import {
    ReminderStorage,
} from "./reminder.storage";

import {
    ReminderScheduler,
} from "./reminder.scheduler";

import {
    DeviceAudioService,
} from "../integrations/device-audio.service";

import {
    DeviceSpeechService,
} from "../integrations/device-speech.service";

import {
    DeviceNotificationService,
} from "../integrations/device-notification.service";

import {
    NavigationService,
} from "../../ui/navigation/navigation.service";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Reminder Runtime
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - active reminder execution
| - alarm runtime management
| - snooze runtime
| - completion runtime
| - skip runtime
| - assistant speech runtime
| - active alarm lifecycle
|
| THIS IS THE CORE
| ALARM EXECUTION ENGINE
|
*/

export class ReminderRuntime {
    /*
    |--------------------------------------------------------------------------
    | Active Reminder
    |--------------------------------------------------------------------------
    */

    private static activeReminder:
        Reminder | null =
        null;

    /*
    |--------------------------------------------------------------------------
    | Alarm Loop Control State
    |--------------------------------------------------------------------------
    */

    private static alarmLoopActive: boolean = false;

    /*
    |--------------------------------------------------------------------------
    | Alarm Loop Runner
    |--------------------------------------------------------------------------
    |
    | Centralized ringing, looping speech, and music in an alternating cycle
    | to ensure the user hears the alarm even if away from the phone.
    |
    */

    private static async runAlarmLoop(reminderId: string): Promise<void> {
        if (
            !this.alarmLoopActive ||
            !this.activeReminder ||
            this.activeReminder.id !== reminderId
        ) {
            logInfo("Alarm loop terminated or inactive", { reminderId });
            return;
        }

        try {
            logInfo("Alarm loop tick started", { reminderId });

            const hasAlarm = this.activeReminder.alarm.enabled;
            const hasVoice = this.activeReminder.assistant.voiceEnabled;

            if (hasVoice) {
                if (hasAlarm) {
                    // Start the audio if not already playing, so it's initialized
                    const audioState = DeviceAudioService.getState();
                    if (!audioState.currentSound) {
                        logInfo("Alarm loop: Initializing alarm audio");
                        await DeviceAudioService.playAlarm();
                    }
                    // Pause the audio alarm during speech
                    logInfo("Alarm loop: Pausing audio for speech");
                    await DeviceAudioService.pause();
                }

                logInfo("Alarm loop: Speaking motivational text");
                // Wait for speech to complete (our Promise wrapper will wait until done or 10s timeout)
                await DeviceSpeechService.motivationalAlarm(this.activeReminder.title);

                if (hasAlarm && this.alarmLoopActive && this.activeReminder?.id === reminderId) {
                    // Resume audio alarm after speech finishes
                    logInfo("Alarm loop: Resuming audio after speech");
                    await DeviceAudioService.resume();
                }
            } else if (hasAlarm) {
                // If only alarm music is enabled, make sure it is playing and looping
                if (!DeviceAudioService.isPlaying()) {
                    logInfo("Alarm loop: Starting/Restarting looping audio");
                    await DeviceAudioService.playAlarm();
                }
            }

            // Schedule the next check/speech cycle in 15 seconds
            setTimeout(async () => {
                await this.runAlarmLoop(reminderId);
            }, 15000);

        } catch (error) {
            logError("Error in runAlarmLoop, retrying loop in 15s", error);
            setTimeout(async () => {
                await this.runAlarmLoop(reminderId);
            }, 15000);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Trigger Reminder
    |--------------------------------------------------------------------------
    */

    static async triggerReminder(
        reminder:
            Reminder
    ): Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Idempotency Guard
            |--------------------------------------------------------------------------
            |
            | If this exact reminder is already actively ringing, skip re-trigger.
            | Prevents the JS timer and notification listener from both firing.
            |
            */

            if (
                this.activeReminder &&
                this.activeReminder.id === reminder.id
            ) {
                logInfo(
                    "triggerReminder: already active for this reminder, skipping",
                    {
                        reminderId:
                            reminder.id,
                    }
                );

                return;
            }

            logInfo(
                "Triggering reminder",
                {
                    reminderId:
                        reminder.id,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Persist Active Reminder
            |--------------------------------------------------------------------------
            */

            this.activeReminder =
                reminder;

            await ReminderStorage.setActiveReminder(
                reminder
            );

            /*
            |--------------------------------------------------------------------------
            | Update Reminder Status
            |--------------------------------------------------------------------------
            */

            await ReminderStorage.updateStatus(
                reminder.id,
                "ringing"
            );

            /*
            |--------------------------------------------------------------------------
            | Start Alarm Loop
            |--------------------------------------------------------------------------
            |
            | Starts the repeating sequence of voice and/or audio alerts.
            |
            */

            this.alarmLoopActive = true;
            this.runAlarmLoop(reminder.id);

            NavigationService.openAlarm(
                reminder.id
            );

            logInfo(
                "Reminder triggered successfully"
            );
        } catch (error) {
            logError(
                "Reminder trigger failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Complete Reminder
    |--------------------------------------------------------------------------
    */

    static async completeReminder(
        reminderInput?:
            Reminder
    ): Promise<void> {
        try {
            let reminder =
                reminderInput ||
                this.activeReminder;

            if (
                !reminder
            ) {
                reminder =
                    await ReminderStorage.getActiveReminder();
            }

            if (
                !reminder
            ) {
                logWarn(
                    "completeReminder: No active reminder found"
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Stop Runtime
            |--------------------------------------------------------------------------
            */

            await this.stopRuntime();

            /*
            |--------------------------------------------------------------------------
            | Update Runtime Stats
            |--------------------------------------------------------------------------
            */

            await ReminderStorage.update(
                reminder.id,
                {
                    status:
                        "completed",

                    runtime:
                    {
                        ...reminder.runtime,

                        completedCount:
                            reminder.runtime
                                .completedCount + 1,

                        lastTriggeredAt:
                            Date.now(),
                    },
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Reschedule
            |--------------------------------------------------------------------------
            */

            if (
                reminder.schedule
                    .repeat !==
                "none"
            ) {
                await ReminderScheduler.reschedule(
                    reminder
                );
            }

            logInfo(
                "Reminder completed"
            );
        } catch (error) {
            logError(
                "Reminder completion failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Snooze Reminder
    |--------------------------------------------------------------------------
    */

    static async snoozeReminder(
        reminderInput?:
            Reminder
    ): Promise<void> {
        try {
            let reminder =
                reminderInput ||
                this.activeReminder;

            if (
                !reminder
            ) {
                reminder =
                    await ReminderStorage.getActiveReminder();
            }

            if (
                !reminder
            ) {
                logWarn(
                    "snoozeReminder: No active reminder found"
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Stop Runtime
            |--------------------------------------------------------------------------
            */

            await this.stopRuntime();

            /*
            |--------------------------------------------------------------------------
            | Update Reminder
            |--------------------------------------------------------------------------
            */

            await ReminderStorage.update(
                reminder.id,
                {
                    status:
                        "snoozed",

                    runtime:
                    {
                        ...reminder.runtime,

                        snoozedCount:
                            reminder.runtime
                                .snoozedCount + 1,
                    },
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Schedule Snooze
            |--------------------------------------------------------------------------
            */

            const snoozeTime =
                Date.now() +
                5 * 60 * 1000;

            await DeviceNotificationService.schedule(
                {
                    title:
                        reminder.title,

                    body:
                        "Snoozed reminder",

                    triggerAt:
                        snoozeTime,

                    sound:
                        true,

                    priority:
                        "max",

                    fullScreen:
                        true,

                    data: {
                        reminderId:
                            reminder.id,
                    },
                }
            );

            logInfo(
                "Reminder snoozed"
            );
        } catch (error) {
            logError(
                "Reminder snooze failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Skip Reminder
    |--------------------------------------------------------------------------
    */

    static async skipReminder(
        reminderInput?:
            Reminder
    ): Promise<void> {
        try {
            let reminder =
                reminderInput ||
                this.activeReminder;

            if (
                !reminder
            ) {
                reminder =
                    await ReminderStorage.getActiveReminder();
            }

            if (
                !reminder
            ) {
                logWarn(
                    "skipReminder: No active reminder found"
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Stop Runtime
            |--------------------------------------------------------------------------
            */

            await this.stopRuntime();

            /*
            |--------------------------------------------------------------------------
            | Update Reminder
            |--------------------------------------------------------------------------
            */

            await ReminderStorage.update(
                reminder.id,
                {
                    status:
                        "missed",

                    runtime:
                    {
                        ...reminder.runtime,

                        skippedCount:
                            reminder.runtime
                                .skippedCount + 1,
                    },
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Reschedule Repeating
            |--------------------------------------------------------------------------
            */

            if (
                reminder.schedule
                    .repeat !==
                "none"
            ) {
                await ReminderScheduler.reschedule(
                    reminder
                );
            }

            logInfo(
                "Reminder skipped"
            );
        } catch (error) {
            logError(
                "Reminder skip failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Stop Runtime
    |--------------------------------------------------------------------------
    */

    private static async stopRuntime():
        Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Stop Alarm Loop
            |--------------------------------------------------------------------------
            */

            this.alarmLoopActive = false;

            /*
            |--------------------------------------------------------------------------
            | Stop Audio
            |--------------------------------------------------------------------------
            */

            await DeviceAudioService.stop();

            /*
            |--------------------------------------------------------------------------
            | Stop Speech
            |--------------------------------------------------------------------------
            */

            await DeviceSpeechService.stop();

            /*
            |--------------------------------------------------------------------------
            | Clear Active Reminder
            |--------------------------------------------------------------------------
            */

            this.activeReminder =
                null;

            await ReminderStorage.clearActiveReminder();

            logInfo(
                "Reminder runtime stopped"
            );
        } catch (error) {
            logError(
                "Runtime stop failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Get Active Reminder
    |--------------------------------------------------------------------------
    */

    static getActiveReminder():
        Reminder | null {
        return this.activeReminder;
    }

    /*
    |--------------------------------------------------------------------------
    | Has Active Reminder
    |--------------------------------------------------------------------------
    */

    static hasActiveReminder():
        boolean {
        return (
            this.activeReminder !==
            null
        );
    }
}