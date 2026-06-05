// src/core/integrations/device-notification.service.ts

import * as Notifications
    from "expo-notifications";

import {
    Platform,
} from "react-native";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Device Notification Payload
|--------------------------------------------------------------------------
*/

export type DeviceNotificationPayload =
    {
        /*
        |--------------------------------------------------------------------------
        | Identity
        |--------------------------------------------------------------------------
        */

        id?: string;

        /*
        |--------------------------------------------------------------------------
        | Content
        |--------------------------------------------------------------------------
        */

        title: string;

        body: string;

        /*
        |--------------------------------------------------------------------------
        | Runtime Data
        |--------------------------------------------------------------------------
        */

        data?: Record<
            string,
            unknown
        >;

        /*
        |--------------------------------------------------------------------------
        | Alarm Behavior
        |--------------------------------------------------------------------------
        */

        sound?: boolean;

        fullScreen?: boolean;

        /*
        |--------------------------------------------------------------------------
        | Priority
        |--------------------------------------------------------------------------
        */

        priority?:
        | "default"
        | "high"
        | "max";

        /*
        |--------------------------------------------------------------------------
        | Scheduling
        |--------------------------------------------------------------------------
        */

        triggerAt?: number;
    };

/*
|--------------------------------------------------------------------------
| Device Notification Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - send local notifications
| - schedule alarm notifications
| - full screen alarm support
| - notification permissions
| - Android alarm channels
| - high priority alarms
| - runtime notification management
|
| IMPORTANT:
| This becomes the REAL
| mobile alarm notification layer.
|
*/

export class DeviceNotificationService {
    /*
    |--------------------------------------------------------------------------
    | Initialize Notifications
    |--------------------------------------------------------------------------
    */

    static async initialize():
        Promise<void> {
        try {
            logInfo(
                "Initializing device notifications..."
            );

            /*
            |--------------------------------------------------------------------------
            | Notification Runtime Handler
            |--------------------------------------------------------------------------
            */

            Notifications.setNotificationHandler(
                {
                    handleNotification:
                        async (
                            notification
                        ) => {
                            const data = notification.request.content.data;
                            const isAlarm =
                                !!(data?.reminderId || data?.workflowId);

                            return {
                                shouldPlaySound:
                                    !isAlarm,

                                shouldSetBadge:
                                    true,

                                shouldShowBanner:
                                    !isAlarm,

                                shouldShowList:
                                    !isAlarm,
                            };
                        },
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Android Channels
            |--------------------------------------------------------------------------
            */

            if (
                Platform.OS ===
                "android"
            ) {
                await this.createChannels();
            }

            /*
            |--------------------------------------------------------------------------
            | Permissions
            |--------------------------------------------------------------------------
            */

            await this.requestPermissions();

            logInfo(
                "Device notifications initialized"
            );
        } catch (error) {
            logError(
                "Notification initialization failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Create Notification Channels
    |--------------------------------------------------------------------------
    */

    private static async createChannels():
        Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Default Channel
            |--------------------------------------------------------------------------
            */

            await Notifications.setNotificationChannelAsync(
                "default",
                {
                    name:
                        "Default Notifications",

                    importance:
                        Notifications.AndroidImportance.DEFAULT,

                    sound:
                        "default",
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Reminder Channel
            |--------------------------------------------------------------------------
            */

            await Notifications.setNotificationChannelAsync(
                "reminder-channel",
                {
                    name:
                        "Reminder Notifications",

                    importance:
                        Notifications.AndroidImportance.HIGH,

                    vibrationPattern:
                        [0, 250, 250, 250],

                    enableVibrate:
                        true,

                    sound:
                        "default",

                    lockscreenVisibility:
                        Notifications.AndroidNotificationVisibility.PUBLIC,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Alarm Channel
            |--------------------------------------------------------------------------
            */

            await Notifications.setNotificationChannelAsync(
                "alarm-channel-v3",
                {
                    name:
                        "Alarm Notifications",

                    importance:
                        Notifications.AndroidImportance.MAX,

                    vibrationPattern:
                        [0, 500, 250, 500],

                    enableVibrate:
                        true,

                    sound:
                        "alarm_sound",

                    bypassDnd:
                        true,

                    lockscreenVisibility:
                        Notifications.AndroidNotificationVisibility.PUBLIC,
                }
            );

            logInfo(
                "Notification channels created"
            );
        } catch (error) {
            /*
            |--------------------------------------------------------------------------
            | Expo Go Compatibility
            |--------------------------------------------------------------------------
            */

            const errStr =
                String(error);

            if (
                errStr.includes(
                    "setNotificationChannelAsync"
                ) ||
                errStr.includes(
                    "NullPointerException"
                )
            ) {
                logWarn(
                    "Notification channels partially unsupported in Expo Go."
                );

                return;
            }

            logError(
                "Notification channel creation failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Request Notification Permissions
    |--------------------------------------------------------------------------
    */

    static async requestPermissions():
        Promise<boolean> {
        try {
            const existing =
                await Notifications.getPermissionsAsync();

            let status =
                existing.status;

            /*
            |--------------------------------------------------------------------------
            | Request Permissions
            |--------------------------------------------------------------------------
            */

            if (
                status !==
                "granted"
            ) {
                const permission =
                    await Notifications.requestPermissionsAsync();

                status =
                    permission.status;
            }

            /*
            |--------------------------------------------------------------------------
            | Permission Denied
            |--------------------------------------------------------------------------
            */

            if (
                status !==
                "granted"
            ) {
                logWarn(
                    "Notification permission denied"
                );

                return false;
            }

            logInfo(
                "Notification permission granted"
            );

            return true;
        } catch (error) {
            logError(
                "Notification permission request failed",
                error
            );

            return false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Send Instant Notification
    |--------------------------------------------------------------------------
    */

    static async send(
        payload:
            DeviceNotificationPayload
    ): Promise<string> {
        try {
            logInfo(
                "Sending notification",
                payload
            );

            const id =
                await Notifications.scheduleNotificationAsync(
                    {
                        content: {
                            title:
                                payload.title,

                            body:
                                payload.body,

                            data:
                                payload.data ??
                                {},

                            sound:
                                payload.sound !==
                                false,

                            sticky:
                                payload.fullScreen ??
                                false,

                            priority:
                                this.resolvePriority(
                                    payload.priority
                                ),

                            categoryIdentifier:
                                "WORKFLOW_REMINDER",

                            android: {
                                channelId:
                                    payload.fullScreen
                                        ? "alarm-channel-v3"
                                        : "reminder-channel",
                            },
                        } as any,

                        trigger: null,
                    }
                );

            logInfo(
                "Notification sent",
                {
                    id,
                }
            );

            return id;
        } catch (error) {
            logError(
                "Notification send failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Schedule Notification
    |--------------------------------------------------------------------------
    */

    static async schedule(
        payload:
            DeviceNotificationPayload
    ): Promise<string> {
        try {
            if (
                !payload.triggerAt
            ) {
                throw new Error(
                    "triggerAt required"
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Calculate Trigger Delay
            |--------------------------------------------------------------------------
            */

            const seconds =
                Math.max(
                    1,
                    Math.floor(
                        (
                            payload.triggerAt -
                            Date.now()
                        ) / 1000
                    )
                );

            /*
            |--------------------------------------------------------------------------
            | Schedule Notification
            |--------------------------------------------------------------------------
            */

            const id =
                await Notifications.scheduleNotificationAsync(
                    {
                        content: {
                            title:
                                payload.title,

                            body:
                                payload.body,

                            data:
                                payload.data ??
                                {},

                            sound:
                                payload.sound !==
                                false,

                            sticky:
                                payload.fullScreen ??
                                false,

                            priority:
                                this.resolvePriority(
                                    payload.priority
                                ),

                            categoryIdentifier:
                                "WORKFLOW_REMINDER",

                            android: {
                                channelId:
                                    payload.fullScreen
                                        ? "alarm-channel-v3"
                                        : "reminder-channel",
                            },
                        } as any,

                        trigger: {
                            type:
                                Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,

                            seconds,
                        },
                    }
                );

            logInfo(
                "Notification scheduled",
                {
                    id,

                    seconds,
                }
            );

            return id;
        } catch (error) {
            logError(
                "Notification scheduling failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Cancel Notification
    |--------------------------------------------------------------------------
    */

    static async cancel(
        notificationId: string
    ): Promise<void> {
        try {
            await Notifications.cancelScheduledNotificationAsync(
                notificationId
            );

            logInfo(
                "Notification cancelled",
                {
                    notificationId,
                }
            );
        } catch (error) {
            logError(
                "Notification cancellation failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Cancel All Notifications
    |--------------------------------------------------------------------------
    */

    static async cancelAll():
        Promise<void> {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();

            logInfo(
                "All notifications cancelled"
            );
        } catch (error) {
            logError(
                "Cancel all notifications failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Resolve Android Priority
    |--------------------------------------------------------------------------
    */

    private static resolvePriority(
        priority?:
            | "default"
            | "high"
            | "max"
    ):
        Notifications.AndroidNotificationPriority {
        switch (
        priority
        ) {
            case "max":
                return Notifications.AndroidNotificationPriority.MAX;

            case "high":
                return Notifications.AndroidNotificationPriority.HIGH;

            default:
                return Notifications.AndroidNotificationPriority.DEFAULT;
        }
    }
}