// src/core/notifications/notification.service.ts

import * as Notifications from "expo-notifications";

import { Platform } from "react-native";

/*
|--------------------------------------------------------------------------
| Notification Behavior
|--------------------------------------------------------------------------
|
| Controls how notifications behave when app is open.
|
*/

Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
        const data = notification.request.content.data;
        const isAlarm = !!(data?.reminderId || data?.workflowId);
        return {
            shouldShowBanner: !isAlarm,
            shouldShowList: !isAlarm,
            shouldPlaySound: !isAlarm,
            shouldSetBadge: isAlarm,
        };
    },
});

/*
|--------------------------------------------------------------------------
| Notification Service
|--------------------------------------------------------------------------
*/

export class NotificationService {
    /*
    |--------------------------------------------------------------------------
    | Initialize Notifications
    |--------------------------------------------------------------------------
    */

    static async initialize(): Promise<void> {
        try {
            await this.requestPermissions();

            if (Platform.OS === "android") {
                await Notifications.setNotificationChannelAsync(
                    "default",
                    {
                        name: "Default",
                        importance: Notifications.AndroidImportance.MAX,
                        vibrationPattern: [0, 250, 250, 250],
                        lockscreenVisibility:
                            Notifications.AndroidNotificationVisibility.PUBLIC,
                    }
                );
            }
        } catch (error) {
            const errStr = String(error);
            if (errStr.includes("setNotificationChannelAsync") || errStr.includes("NullPointerException")) {
                console.warn(
                    "[NotificationService] Notification channels are not fully supported in Expo Go. Skipping channel setup."
                );
            } else {
                console.warn(
                    "[NotificationService] Failed to initialize notifications:",
                    error
                );
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Request Permissions
    |--------------------------------------------------------------------------
    */

    static async requestPermissions(): Promise<boolean> {
        const settings = await Notifications.getPermissionsAsync();

        if (settings.granted) {
            return true;
        }

        const request =
            await Notifications.requestPermissionsAsync();

        return request.granted;
    }

    /*
    |--------------------------------------------------------------------------
    | Send Instant Notification
    |--------------------------------------------------------------------------
    */

    static async sendNow(
        title: string,
        body: string
    ): Promise<void> {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
            },
            trigger: null,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Schedule Notification
    |--------------------------------------------------------------------------
    */

    static async schedule(
        title: string,
        body: string,
        secondsFromNow: number
    ): Promise<string> {
        const notificationId =
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: secondsFromNow,
                },
            });

        return notificationId;
    }

    /*
    |--------------------------------------------------------------------------
    | Cancel Notification
    |--------------------------------------------------------------------------
    */

    static async cancel(
        notificationId: string
    ): Promise<void> {
        await Notifications.cancelScheduledNotificationAsync(
            notificationId
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Cancel All Notifications
    |--------------------------------------------------------------------------
    */

    static async cancelAll(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }

    /*
    |--------------------------------------------------------------------------
    | Get Scheduled Notifications
    |--------------------------------------------------------------------------
    */

    static async getAllScheduled() {
        return await Notifications.getAllScheduledNotificationsAsync();
    }
}