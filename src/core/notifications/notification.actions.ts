// src/core/notifications/notification.actions.ts

import * as Notifications from "expo-notifications";

/*
|--------------------------------------------------------------------------
| Notification Action IDs
|--------------------------------------------------------------------------
*/

export const NOTIFICATION_ACTIONS = {
    DONE: "DONE",
    SNOOZE: "SNOOZE",
    SKIP: "SKIP",
    REMIND_LATER: "REMIND_LATER",
} as const;

/*
|--------------------------------------------------------------------------
| Notification Categories
|--------------------------------------------------------------------------
|
| These create interactive notification buttons.
|
*/

export class NotificationActions {
    /*
    |--------------------------------------------------------------------------
    | Initialize Categories
    |--------------------------------------------------------------------------
    */

    static async initialize(): Promise<void> {
        try {
            await Notifications.setNotificationCategoryAsync(
                "WORKFLOW_REMINDER",
                [
                    {
                        identifier: NOTIFICATION_ACTIONS.DONE,
                        buttonTitle: "Done",
                        options: {
                            opensAppToForeground: true,
                        },
                    },

                    {
                        identifier: NOTIFICATION_ACTIONS.SNOOZE,
                        buttonTitle: "Snooze",
                        options: {
                            opensAppToForeground: true,
                        },
                    },

                    {
                        identifier: NOTIFICATION_ACTIONS.SKIP,
                        buttonTitle: "Skip",
                        options: {
                            opensAppToForeground: true,
                        },
                    },

                    {
                        identifier:
                            NOTIFICATION_ACTIONS.REMIND_LATER,
                        buttonTitle: "Remind Later",
                        options: {
                            opensAppToForeground: true,
                        },
                    },
                ]
            );
        } catch (error) {
            console.warn(
                "[NotificationActions] Failed to initialize notification categories:",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Register Notification Response Listener
    |--------------------------------------------------------------------------
    */

    static registerResponseListener(
        callback: (
            response: Notifications.NotificationResponse
        ) => void
    ) {
        return Notifications.addNotificationResponseReceivedListener(
            callback
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Extract Action Identifier
    |--------------------------------------------------------------------------
    */

    static getActionIdentifier(
        response: Notifications.NotificationResponse
    ): string {
        return response.actionIdentifier;
    }

    /*
    |--------------------------------------------------------------------------
    | Extract Notification Data
    |--------------------------------------------------------------------------
    */

    static getNotificationData(
        response: Notifications.NotificationResponse
    ) {
        return response.notification.request.content.data;
    }
}