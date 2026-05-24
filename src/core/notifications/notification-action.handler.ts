// src/core/notifications/notification-action.handler.ts

import * as Notifications
    from "expo-notifications";

import {
    ReminderSessionService,
} from "../reminders/reminder-session.service";

import {
    ReminderAction,
} from "../reminders/reminder-session.types";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

import { EVENTS } from "../../shared/constants";

import { EventBus } from "../events/event-bus";

/*
|--------------------------------------------------------------------------
| Notification Action Payload
|--------------------------------------------------------------------------
*/

type NotificationActionPayload =
    {
        sessionId: string;

        workflowId: string;

        action: ReminderAction;
    };

/*
|--------------------------------------------------------------------------
| Notification Action Handler
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - handle notification button presses
| - update reminder sessions
| - emit runtime events
| - trigger snooze/retry flows
| - track user interactions
|
*/

export class NotificationActionHandler {
    /*
    |--------------------------------------------------------------------------
    | Initialize Listener
    |--------------------------------------------------------------------------
    */

    static initialize(): void {
        Notifications.addNotificationResponseReceivedListener(
            async (
                response
            ) => {
                try {
                    /*
                    |--------------------------------------------------------------------------
                    | Extract Payload
                    |--------------------------------------------------------------------------
                    */

                    const data =
                        response.notification
                            .request.content
                            .data as NotificationActionPayload;

                    /*
                    |--------------------------------------------------------------------------
                    | Missing Data
                    |--------------------------------------------------------------------------
                    */

                    if (
                        !data?.sessionId
                    ) {
                        logWarn(
                            "Notification action missing sessionId"
                        );

                        return;
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Resolve Action
                    |--------------------------------------------------------------------------
                    */

                    const action =
                        this.resolveAction(
                            response.actionIdentifier,
                            data.action
                        );

                    /*
                    |--------------------------------------------------------------------------
                    | Handle Action
                    |--------------------------------------------------------------------------
                    */

                    await this.handleAction(
                        data.sessionId,
                        action
                    );
                } catch (error) {
                    logError(
                        "Notification action handling failed",
                        error
                    );
                }
            }
        );

        logInfo(
            "Notification action handler initialized"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Handle Action
    |--------------------------------------------------------------------------
    */

    static async handleAction(
        sessionId: string,
        action: ReminderAction
    ): Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Register Interaction
            |--------------------------------------------------------------------------
            */

            await ReminderSessionService.registerInteraction(
                sessionId,
                action
            );

            /*
            |--------------------------------------------------------------------------
            | Handle Actions
            |--------------------------------------------------------------------------
            */

            switch (action) {
                /*
                |--------------------------------------------------------------------------
                | Done
                |--------------------------------------------------------------------------
                */

                case "DONE":
                    await ReminderSessionService.complete(
                        sessionId
                    );

                    await EventBus.emit(
                        EVENTS.WORKFLOW_COMPLETED,
                        {
                            sessionId,
                        }
                    );

                    break;

                /*
                |--------------------------------------------------------------------------
                | Snooze 5
                |--------------------------------------------------------------------------
                */

                case "SNOOZE_5":
                    await ReminderSessionService.snooze(
                        sessionId,
                        5
                    );

                    break;

                /*
                |--------------------------------------------------------------------------
                | Snooze 10
                |--------------------------------------------------------------------------
                */

                case "SNOOZE_10":
                    await ReminderSessionService.snooze(
                        sessionId,
                        10
                    );

                    break;

                /*
                |--------------------------------------------------------------------------
                | Snooze 30
                |--------------------------------------------------------------------------
                */

                case "SNOOZE_30":
                    await ReminderSessionService.snooze(
                        sessionId,
                        30
                    );

                    break;

                /*
                |--------------------------------------------------------------------------
                | Skip
                |--------------------------------------------------------------------------
                */

                case "SKIP":
                    await ReminderSessionService.skip(
                        sessionId
                    );

                    break;

                /*
                |--------------------------------------------------------------------------
                | Open App
                |--------------------------------------------------------------------------
                */

                case "OPEN_APP":
                    logInfo(
                        "Reminder app opened",
                        {
                            sessionId,
                        }
                    );

                    break;

                /*
                |--------------------------------------------------------------------------
                | Mark Later
                |--------------------------------------------------------------------------
                */

                case "MARK_LATER":
                    await ReminderSessionService.snooze(
                        sessionId,
                        60
                    );

                    break;

                default:
                    logWarn(
                        "Unknown reminder action",
                        {
                            action,
                        }
                    );
            }

            /*
            |--------------------------------------------------------------------------
            | Emit Interaction Event
            |--------------------------------------------------------------------------
            */

            await EventBus.emit(
                EVENTS.ACTION_EXECUTED,
                {
                    sessionId,

                    action,
                }
            );

            logInfo(
                "Reminder action processed",
                {
                    sessionId,

                    action,
                }
            );
        } catch (error) {
            logError(
                "Failed to process reminder action",
                error
            );

            await EventBus.emit(
                EVENTS.ACTION_FAILED,
                {
                    sessionId,

                    action,
                }
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Resolve Action
    |--------------------------------------------------------------------------
    */

    private static resolveAction(
        actionIdentifier: string,
        fallback: ReminderAction
    ): ReminderAction {
        switch (
        actionIdentifier
        ) {
            case "DONE":
                return "DONE";

            case "SNOOZE_5":
                return "SNOOZE_5";

            case "SNOOZE_10":
                return "SNOOZE_10";

            case "SNOOZE_30":
                return "SNOOZE_30";

            case "SKIP":
                return "SKIP";

            case "MARK_LATER":
                return "MARK_LATER";

            default:
                return fallback;
        }
    }
}