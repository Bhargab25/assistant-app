// src/core/app/bootstrap.ts

import { initializeDatabase } from "../storage/database";

import {
    StorageOrchestratorService,
} from "../storage/storage-orchestrator.service";

import {
    PlatformOrchestratorService,
} from "../platform/platform-orchestrator.service";

import {
    NotificationService,
} from "../notifications/notification.service";

import {
    NotificationActions,
} from "../notifications/notification.actions";

import {
    SchedulerService,
} from "../scheduler/scheduler.service";

import {
    RetryService,
} from "../scheduler/retry.service";

import {
    AppRuntimeService,
} from "./app-runtime.service";

/*
|--------------------------------------------------------------------------
| NEW REMINDER RUNTIME IMPORTS
|--------------------------------------------------------------------------
*/

import * as Notifications from "expo-notifications";

import {
    ReminderScheduler,
} from "../reminders/reminder.scheduler";

import {
    ReminderStorage,
} from "../reminders/reminder.storage";

import {
    ReminderRuntime,
} from "../reminders/reminder.runtime";

import {
    DeviceNotificationService,
} from "../integrations/device-notification.service";

import {
    DeviceAudioService,
} from "../integrations/device-audio.service";

import {
    DeviceSpeechService,
} from "../integrations/device-speech.service";

import {
    NavigationService,
} from "../../ui/navigation/navigation.service";

/*
|--------------------------------------------------------------------------
| Application Bootstrap
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - initialize database
| - initialize storage runtime
| - initialize platform runtime
| - initialize notifications
| - initialize scheduler
| - initialize retry engine
| - initialize assistant runtime
| - initialize reminder runtime
| - restore active alarms
| - initialize audio/speech
| - restore scheduled reminders
|
| IMPORTANT:
| This becomes the unified
| application startup engine.
|
*/

export class AppBootstrap {
    /*
    |--------------------------------------------------------------------------
    | Retry Interval
    |--------------------------------------------------------------------------
    */

    private static retryInterval:
        NodeJS.Timeout | null =
        null;

    /*
    |--------------------------------------------------------------------------
    | Initialize Application
    |--------------------------------------------------------------------------
    */

    static async initialize():
        Promise<void> {
        try {
            console.log(
                "Bootstrapping application..."
            );

            /*
            |--------------------------------------------------------------------------
            | Initialize Legacy Database
            |--------------------------------------------------------------------------
            */

            await initializeDatabase();

            console.log(
                "Database initialized"
            );

            /*
            |--------------------------------------------------------------------------
            | Initialize Storage Runtime
            |--------------------------------------------------------------------------
            */

            await StorageOrchestratorService.initialize();

            console.log(
                "Storage orchestrator initialized"
            );

            /*
            |--------------------------------------------------------------------------
            | Initialize Intelligent Platform
            |--------------------------------------------------------------------------
            */

            await PlatformOrchestratorService.initialize();

            console.log(
                "Platform orchestrator initialized"
            );

            /*
            |--------------------------------------------------------------------------
            | Initialize Assistant Runtime
            |--------------------------------------------------------------------------
            */

            await AppRuntimeService.initialize();

            console.log(
                "Assistant runtime initialized"
            );

            /*
            |--------------------------------------------------------------------------
            | Initialize Notification Runtime
            |--------------------------------------------------------------------------
            */

            await NotificationService.initialize();

            console.log(
                "Notification service initialized"
            );

            /*
            |--------------------------------------------------------------------------
            | Initialize Notification Actions
            |--------------------------------------------------------------------------
            */

            await NotificationActions.initialize();

            console.log(
                "Notification actions initialized"
            );

            /*
            |--------------------------------------------------------------------------
            | Initialize Device Notification Engine
            |--------------------------------------------------------------------------
            */

            await DeviceNotificationService.initialize();

            console.log(
                "Device notification runtime initialized"
            );

            /*
            |--------------------------------------------------------------------------
            | Initialize Audio Runtime
            |--------------------------------------------------------------------------
            */

            await DeviceAudioService.initialize();

            console.log(
                "Audio runtime initialized"
            );

            /*
            |--------------------------------------------------------------------------
            | Initialize Speech Runtime
            |--------------------------------------------------------------------------
            */

            await DeviceSpeechService.initialize();

            console.log(
                "Speech runtime initialized"
            );

            /*
            |--------------------------------------------------------------------------
            | Initialize Reminder Scheduler
            |--------------------------------------------------------------------------
            */

            await ReminderScheduler.initialize();

            console.log(
                "Reminder scheduler initialized"
            );

            /*
            |--------------------------------------------------------------------------
            | Register Notification Listener
            |--------------------------------------------------------------------------
            */

            NotificationActions.registerResponseListener(
                async (response) => {
                    await this.handleNotificationResponse(response);
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Handle Last Notification Response (Cold Start)
            |--------------------------------------------------------------------------
            */

            try {
                const lastResponse = await Notifications.getLastNotificationResponseAsync();
                if (lastResponse) {
                    console.log(
                        "[AppBootstrap] Handling cold-start notification response:",
                        lastResponse
                    );
                    await this.handleNotificationResponse(lastResponse);
                }
            } catch (err) {
                console.error("[AppBootstrap] Failed to get last notification response:", err);
            }

            /*
            |--------------------------------------------------------------------------
            | Register Foreground Notification Listener
            |--------------------------------------------------------------------------
            */

            Notifications.addNotificationReceivedListener(
                async (
                    notification
                ) => {
                    try {
                        const data = notification.request?.content?.data;
                        const reminderId = String(data?.reminderId ?? "");


                        if (
                            !reminderId
                        ) {
                            return;
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | Skip if JS alarm timer already triggered the full-screen alarm
                        |--------------------------------------------------------------------------
                        */

                        if (
                            ReminderRuntime.hasActiveReminder()
                        ) {
                            console.log(
                                "[AppBootstrap] Skipping foreground notification — alarm already active via JS timer"
                            );

                            return;
                        }

                        const reminder =
                            await ReminderStorage.getById(
                                reminderId
                            );

                        if (
                            !reminder
                        ) {
                            return;
                        }

                        console.log(
                            "[AppBootstrap] Foreground notification received — triggering alarm (fallback path):",
                            reminderId
                        );

                        await ReminderRuntime.triggerReminder(
                            reminder
                        );
                    } catch (error) {
                        console.error(
                            "[AppBootstrap] Foreground notification listener failed:",
                            error
                        );
                    }
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Start Main Scheduler
            |--------------------------------------------------------------------------
            */

            await SchedulerService.start();

            console.log(
                "Scheduler started"
            );

            /*
            |--------------------------------------------------------------------------
            | Start Retry Engine
            |--------------------------------------------------------------------------
            */

            this.retryInterval =
                setInterval(
                    async () => {
                        await RetryService.processQueue();
                    },
                    60 * 1000
                );

            console.log(
                "Retry engine started"
            );

            /*
            |--------------------------------------------------------------------------
            | Restore Active Reminder
            |--------------------------------------------------------------------------
            */

            await this.restoreActiveReminder();

            /*
            |--------------------------------------------------------------------------
            | Restore Scheduled Reminders
            |--------------------------------------------------------------------------
            */

            await ReminderScheduler.restoreAll();

            console.log(
                "Reminder restoration completed"
            );

            console.log(
                "Application bootstrap complete"
            );
        } catch (error) {
            console.error(
                "Application bootstrap failed:",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Active Reminder
    |--------------------------------------------------------------------------
    */

    private static async restoreActiveReminder():
        Promise<void> {
        try {
            const reminder =
                await ReminderStorage.getActiveReminder();

            /*
            |--------------------------------------------------------------------------
            | No Active Reminder
            |--------------------------------------------------------------------------
            */

            if (!reminder) {
                return;
            }

            console.warn(
                "Restoring active reminder:",
                reminder.id
            );

            /*
            |--------------------------------------------------------------------------
            | Restore Runtime
            |--------------------------------------------------------------------------
            */

            await ReminderRuntime.triggerReminder(
                reminder
            );

            /*
            |--------------------------------------------------------------------------
            | Restore Alarm Screen
            |--------------------------------------------------------------------------
            */

            NavigationService.openAlarm(
                reminder.id
            );

            console.log(
                "Active reminder restored"
            );
        } catch (error) {
            console.error(
                "Reminder restore failed:",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Shutdown Application
    |--------------------------------------------------------------------------
    */

    static async shutdown():
        Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Stop Retry Engine
            |--------------------------------------------------------------------------
            */

            if (
                this.retryInterval
            ) {
                clearInterval(
                    this.retryInterval
                );

                this.retryInterval =
                    null;
            }

            /*
            |--------------------------------------------------------------------------
            | Stop Active Audio
            |--------------------------------------------------------------------------
            */

            await DeviceAudioService.stop();

            /*
            |--------------------------------------------------------------------------
            | Stop Active Speech
            |--------------------------------------------------------------------------
            */

            await DeviceSpeechService.stop();

            /*
            |--------------------------------------------------------------------------
            | Shutdown Platform Runtime
            |--------------------------------------------------------------------------
            */

            await PlatformOrchestratorService.shutdown();

            console.log(
                "Application shutdown complete"
            );
        } catch (error) {
            logError(
                "Application shutdown failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Private Notification Action Handler
    |--------------------------------------------------------------------------
    */

    private static async handleNotificationResponse(
        response: Notifications.NotificationResponse
    ): Promise<void> {
        try {
            const action =
                NotificationActions.getActionIdentifier(
                    response
                );

            const data =
                NotificationActions.getNotificationData(
                    response
                );

            console.log(
                "Notification action:",
                action
            );

            console.log(
                "Notification data:",
                data
            );

            /*
            |--------------------------------------------------------------------------
            | Reminder ID
            |--------------------------------------------------------------------------
            */

            const reminderId =
                String(
                    data?.reminderId ??
                    ""
                );

            /*
            |--------------------------------------------------------------------------
            | Load Reminder if ID is Present
            |--------------------------------------------------------------------------
            */

            const reminder = reminderId
                ? await ReminderStorage.getById(reminderId)
                : null;

            /*
            |--------------------------------------------------------------------------
            | Handle Reminder Actions
            |--------------------------------------------------------------------------
            */

            switch (
            action
            ) {
                /*
                |--------------------------------------------------------------------------
                | Complete Reminder
                |--------------------------------------------------------------------------
                */

                case "DONE":
                    await ReminderRuntime.completeReminder(reminder || undefined);

                    console.log(
                        "Reminder completed"
                    );

                    break;

                /*
                |--------------------------------------------------------------------------
                | Snooze Reminder
                |--------------------------------------------------------------------------
                */

                case "SNOOZE":
                    await ReminderRuntime.snoozeReminder(reminder || undefined);

                    console.log(
                        "Reminder snoozed"
                    );

                    break;

                /*
                |--------------------------------------------------------------------------
                | Skip Reminder
                |--------------------------------------------------------------------------
                */

                case "SKIP":
                    await ReminderRuntime.skipReminder(reminder || undefined);

                    console.log(
                        "Reminder skipped"
                    );

                    break;

                /*
                |--------------------------------------------------------------------------
                | Open Full Screen Alarm
                |--------------------------------------------------------------------------
                */

                default:
                    if (
                        reminderId
                    ) {
                        NavigationService.openAlarm(
                            reminderId
                        );
                    }

                    break;
            }
        } catch (error) {
            console.error(
                "Notification handler failed:",
                error
            );
        }
    }
}