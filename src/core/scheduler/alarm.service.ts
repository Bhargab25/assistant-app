// src/core/scheduler/alarm.service.ts

import * as Notifications
    from "expo-notifications";

import { Workflow } from "../workflows/types";

import {
    generateNotificationId,
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Alarm Registration Result
|--------------------------------------------------------------------------
*/

export type AlarmRegistrationResult =
    {
        success: boolean;

        notificationId?: string;

        error?: string;
    };

/*
|--------------------------------------------------------------------------
| Alarm Service
|--------------------------------------------------------------------------
|
| CRITICAL RESPONSIBILITIES:
|
| - compile workflows into OS alarms
| - register native notifications
| - cancel alarms
| - reschedule alarms
| - bridge workflow engine ↔ OS
|
| IMPORTANT:
| Scheduler should NEVER directly
| manage native notifications.
|
*/

export class AlarmService {
    /*
    |--------------------------------------------------------------------------
    | Initialize Notification Handler
    |--------------------------------------------------------------------------
    */

    static initialize(): void {
        Notifications.setNotificationHandler(
            {
                handleNotification:
                    async (notification) => {
                        const data = notification.request.content.data;
                        const isAlarm = !!(data?.reminderId || data?.workflowId);
                        return {
                            shouldShowBanner:
                                !isAlarm,

                            shouldShowList:
                                !isAlarm,

                            shouldPlaySound:
                                !isAlarm,

                            shouldSetBadge:
                                isAlarm,
                        };
                    },
            }
        );

        logInfo(
            "Alarm service initialized"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Register Workflow Alarm
    |--------------------------------------------------------------------------
    */

    static async registerWorkflow(
        workflow: Workflow
    ): Promise<AlarmRegistrationResult> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Notification Identity
            |--------------------------------------------------------------------------
            */

            const internalId =
                generateNotificationId();

            /*
            |--------------------------------------------------------------------------
            | Compile Trigger
            |--------------------------------------------------------------------------
            */

            const trigger =
                this.compileTrigger(
                    workflow
                );

            /*
            |--------------------------------------------------------------------------
            | Invalid Trigger
            |--------------------------------------------------------------------------
            */

            if (!trigger) {
                return {
                    success: false,

                    error:
                        "Unsupported workflow trigger",
                };
            }

            /*
            |--------------------------------------------------------------------------
            | Create Notification
            |--------------------------------------------------------------------------
            */

            const notificationId =
                await Notifications.scheduleNotificationAsync(
                    {
                        content: {
                            title:
                                workflow.name,

                            body:
                                this.buildMessage(
                                    workflow
                                ),

                            sound: true,

                            priority:
                                Notifications.AndroidNotificationPriority.HIGH,

                            data: {
                                workflowId:
                                    workflow.id,

                                internalId,
                            },
                        },

                        trigger,
                    }
                );

            logInfo(
                "Workflow alarm registered",
                {
                    workflowId:
                        workflow.id,

                    notificationId,
                }
            );

            return {
                success: true,

                notificationId,
            };
        } catch (error) {
            logError(
                "Failed to register workflow alarm",
                error
            );

            return {
                success: false,

                error: String(error),
            };
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Cancel Alarm
    |--------------------------------------------------------------------------
    */

    static async cancelAlarm(
        notificationId: string
    ): Promise<void> {
        try {
            await Notifications.cancelScheduledNotificationAsync(
                notificationId
            );

            logInfo(
                "Alarm cancelled",
                {
                    notificationId,
                }
            );
        } catch (error) {
            logError(
                "Failed to cancel alarm",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Cancel All Alarms
    |--------------------------------------------------------------------------
    */

    static async cancelAll():
        Promise<void> {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();

            logWarn(
                "All alarms cancelled"
            );
        } catch (error) {
            logError(
                "Failed to cancel alarms",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Reschedule Workflow
    |--------------------------------------------------------------------------
    */

    static async rescheduleWorkflow(
        workflow: Workflow,
        previousNotificationId?: string
    ): Promise<AlarmRegistrationResult> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Cancel Existing
            |--------------------------------------------------------------------------
            */

            if (
                previousNotificationId
            ) {
                await this.cancelAlarm(
                    previousNotificationId
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Register Again
            |--------------------------------------------------------------------------
            */

            return await this.registerWorkflow(
                workflow
            );
        } catch (error) {
            logError(
                "Failed to reschedule workflow",
                error
            );

            return {
                success: false,

                error: String(error),
            };
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Compile Workflow Trigger
    |--------------------------------------------------------------------------
    */

    private static compileTrigger(
        workflow: Workflow
    ):
        | Notifications.NotificationTriggerInput
        | null {
        switch (
        workflow.trigger.type
        ) {
            /*
            |--------------------------------------------------------------------------
            | Interval Trigger
            |--------------------------------------------------------------------------
            */

            case "interval":
                return {
                    type:
                        Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,

                    seconds:
                        workflow.trigger
                            .everyMinutes *
                        60,

                    repeats: true,
                };

            /*
            |--------------------------------------------------------------------------
            | Time Trigger
            |--------------------------------------------------------------------------
            */

            case "time":
                return {
                    hour: 21,

                    minute: 0,

                    repeats: true,
                } as any;

            default:
                return null;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Build Notification Message
    |--------------------------------------------------------------------------
    */

    private static buildMessage(
        workflow: Workflow
    ): string {
        const firstAction =
            workflow.actions[0];

        if (
            firstAction?.type ===
            "notify"
        ) {
            return (
                firstAction.message
            );
        }

        return "Workflow reminder";
    }

    /*
    |--------------------------------------------------------------------------
    | Get Pending Alarms
    |--------------------------------------------------------------------------
    */

    static async getPendingAlarms() {
        return Notifications.getAllScheduledNotificationsAsync();
    }
}