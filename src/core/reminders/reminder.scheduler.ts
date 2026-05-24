// src/core/reminders/reminder.scheduler.ts

import * as Notifications
    from "expo-notifications";

import {
    Reminder,
} from "./reminder.types";

import {
    ReminderRuntime,
} from "./reminder.runtime";

import {
    ReminderStorage,
} from "./reminder.storage";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Reminder Scheduler
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - local reminder scheduling
| - notification scheduling
| - background reminder execution
| - repeating reminders
| - cold-start reminder restore
| - notification interaction handling
|
| THIS IS THE REAL
| BACKGROUND SCHEDULER ENGINE
|
*/

export class ReminderScheduler {
    /*
    |--------------------------------------------------------------------------
    | Active JS Alarm Timers
    |--------------------------------------------------------------------------
    |
    | JavaScript setTimeout timers that DIRECTLY trigger the full-screen alarm
    | when the scheduled time arrives. This is the PRIMARY foreground alarm
    | mechanism — it does NOT depend on the OS notification system at all.
    |
    | The OS notification is kept as a BACKUP for when the app is in the
    | background or killed.
    |
    */

    private static alarmTimers: Map<string, ReturnType<typeof setTimeout>> =
        new Map();

    /*
    |--------------------------------------------------------------------------
    | Initialize Scheduler
    |--------------------------------------------------------------------------
    */

    static async initialize():
        Promise<void> {
        try {
            logInfo(
                "Initializing reminder scheduler..."
            );

            /*
            |--------------------------------------------------------------------------
            | Notification Tap Handler
            |--------------------------------------------------------------------------
            */

            Notifications.addNotificationResponseReceivedListener(
                async (
                    response
                ) => {
                    try {
                        // Only trigger full-screen alarm if the user tapped the notification itself (default action).
                        // Interactive button responses (DONE, SNOOZE, SKIP) are handled in bootstrap.ts.
                        if (
                            response.actionIdentifier !==
                            Notifications.DEFAULT_ACTION_IDENTIFIER
                        ) {
                            return;
                        }

                        const data = response.notification?.content?.data ?? response.notification?.request?.content?.data;
                        const reminderId = String(data?.reminderId ?? "");

                        if (
                            !reminderId
                        ) {
                            return;
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | Load Reminder
                        |--------------------------------------------------------------------------
                        */

                        const reminder =
                            await ReminderStorage.getById(
                                reminderId
                            );

                        if (
                            !reminder
                        ) {
                            return;
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | Trigger Runtime
                        |--------------------------------------------------------------------------
                        */

                        await ReminderRuntime.triggerReminder(
                            reminder
                        );

                        logInfo(
                            "Reminder notification opened",
                            {
                                reminderId,
                            }
                        );
                    } catch (error) {
                        logError(
                            "Notification response handling failed",
                            error
                        );
                    }
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Restore Pending Reminders
            |--------------------------------------------------------------------------
            */

            await this.restoreAll();

            logInfo(
                "Reminder scheduler initialized"
            );
        } catch (error) {
            logError(
                "Scheduler initialization failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Schedule Reminder
    |--------------------------------------------------------------------------
    */

    static async schedule(
        reminder:
            Reminder
    ): Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Disabled Reminder
            |--------------------------------------------------------------------------
            */

            if (
                !reminder.runtime
                    .active
            ) {
                return;
            }

            logInfo(
                "Scheduling reminder",
                {
                    reminderId:
                        reminder.id,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Parse Schedule
            |--------------------------------------------------------------------------
            */

            let triggerDate =
                this.buildDate(
                    reminder.schedule
                        .date,

                    reminder.schedule
                        .time
                );

            /*
            |--------------------------------------------------------------------------
            | Past Date
            |--------------------------------------------------------------------------
            |
            | For repeating reminders, advance to the next future occurrence instead
            | of silently bailing. This fixes disable → re-enable being broken.
            |
            */

            if (
                triggerDate.getTime() <=
                Date.now()
            ) {
                const repeat = reminder.schedule.repeat;

                if (
                    repeat === "daily" ||
                    repeat === "weekly" ||
                    repeat === "monthly"
                ) {
                    triggerDate = this.findNextFutureOccurrence(
                        triggerDate,
                        repeat
                    );

                    // Persist the advanced date so future calls are already correct
                    reminder.schedule.date =
                        triggerDate
                            .toISOString()
                            .split("T")[0];

                    await ReminderStorage.update(
                        reminder.id,
                        {
                            schedule: {
                                ...reminder.schedule,
                            },
                        }
                    );

                    logInfo(
                        "Repeating reminder advanced to next future occurrence",
                        {
                            reminderId: reminder.id,
                            nextDate: reminder.schedule.date,
                        }
                    );
                } else {
                    logWarn(
                        "Reminder trigger already passed — one-time reminder skipped",
                        { reminderId: reminder.id }
                    );

                    return;
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Schedule Notification
            |--------------------------------------------------------------------------
            */

            const notificationId =
                await Notifications.scheduleNotificationAsync(
                    {
                        content: {
                            title:
                                reminder.title,

                            body:
                                reminder.description ??
                                "Reminder triggered",

                            sound:
                                true,

                            sticky:
                                true,

                            priority:
                                Notifications.AndroidNotificationPriority.MAX,

                            categoryIdentifier:
                                "WORKFLOW_REMINDER",

                            data: {
                                reminderId:
                                    reminder.id,
                            },

                            android: {
                                channelId:
                                    "alarm-channel",
                            },
                        },

                        trigger: {
                            type:
                                Notifications.SchedulableTriggerInputTypes.DATE,

                            date:
                                triggerDate,
                        },
                    }
                );

            /*
            |--------------------------------------------------------------------------
            | Persist Notification ID
            |--------------------------------------------------------------------------
            */

            await ReminderStorage.update(
                reminder.id,
                {
                    notificationId,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | JavaScript Alarm Timer (PRIMARY foreground trigger)
            |--------------------------------------------------------------------------
            |
            | This setTimeout fires at the exact scheduled time and DIRECTLY
            | triggers the full-screen alarm UI — bypassing the notification
            | listener entirely. This guarantees the alarm screen appears when
            | the app is in the foreground.
            |
            | The OS notification above is kept as a BACKUP for background/killed.
            |
            */

            this.clearAlarmTimer(
                reminder.id
            );

            const delayMs =
                triggerDate.getTime() -
                Date.now();

            if (delayMs > 0) {
                const timerId = setTimeout(
                    async () => {
                        try {
                            this.alarmTimers.delete(
                                reminder.id
                            );

                            logInfo(
                                "JS alarm timer fired — triggering full-screen alarm",
                                {
                                    reminderId:
                                        reminder.id,
                                }
                            );

                            /*
                            |--------------------------------------------------------------------------
                            | Re-fetch the reminder to get latest state
                            |--------------------------------------------------------------------------
                            */

                            const freshReminder =
                                await ReminderStorage.getById(
                                    reminder.id
                                );

                            if (
                                !freshReminder
                            ) {
                                logWarn(
                                    "JS alarm timer: reminder no longer exists",
                                    {
                                        reminderId:
                                            reminder.id,
                                    }
                                );

                                return;
                            }

                            if (
                                !freshReminder.runtime.active
                            ) {
                                logWarn(
                                    "JS alarm timer: reminder is no longer active",
                                    {
                                        reminderId:
                                            reminder.id,
                                    }
                                );

                                return;
                            }

                            /*
                            |--------------------------------------------------------------------------
                            | Trigger Full-Screen Alarm
                            |--------------------------------------------------------------------------
                            */

                            await ReminderRuntime.triggerReminder(
                                freshReminder
                            );
                        } catch (timerError) {
                            logError(
                                "JS alarm timer execution failed",
                                timerError
                            );
                        }
                    },
                    delayMs
                );

                this.alarmTimers.set(
                    reminder.id,
                    timerId
                );

                logInfo(
                    "JS alarm timer set",
                    {
                        reminderId:
                            reminder.id,

                        delayMs,
                    }
                );
            }

            logInfo(
                "Reminder scheduled successfully",
                {
                    reminderId:
                        reminder.id,

                    notificationId,
                }
            );
        } catch (error) {
            logError(
                "Reminder scheduling failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Cancel Reminder
    |--------------------------------------------------------------------------
    */

    static async cancel(
        reminderId: string
    ): Promise<void> {
        try {
            logInfo("Cancelling notifications for reminder:", { reminderId });

            /*
            |--------------------------------------------------------------------------
            | Cancel JavaScript Alarm Timer
            |--------------------------------------------------------------------------
            */

            this.clearAlarmTimer(
                reminderId
            );

            /*
            |--------------------------------------------------------------------------
            | Cancel scheduled notifications by scanning the OS queue
            |--------------------------------------------------------------------------
            |
            | This is extremely robust: even if the stored notificationId is lost
            | or stale, we scan the OS scheduler queue and delete any scheduled notification
            | that matches this reminder's ID in the data payload.
            |
            */

            const scheduled = await Notifications.getAllScheduledNotificationsAsync();
            for (const notification of scheduled) {
                const id = notification.content?.data?.reminderId ?? (notification as any).request?.content?.data?.reminderId;
                if (String(id) === reminderId) {
                    await Notifications.cancelScheduledNotificationAsync(
                        notification.identifier
                    );
                    logInfo("Cancelled scheduled notification by payload reminderId:", {
                        notificationId: notification.identifier,
                        reminderId,
                    });
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Stored Notification ID Cancel Fallback
            |--------------------------------------------------------------------------
            */

            const reminder =
                await ReminderStorage.getById(
                    reminderId
                );

            if (reminder && reminder.notificationId) {
                await Notifications.cancelScheduledNotificationAsync(
                    reminder.notificationId
                );
            }

            logInfo(
                "Reminder cancelled",
                {
                    reminderId,
                }
            );
        } catch (error) {
            logError(
                "Reminder cancellation failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Reschedule Reminder
    |--------------------------------------------------------------------------
    */

    static async reschedule(
        reminder:
            Reminder
    ): Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Cancel Existing
            |--------------------------------------------------------------------------
            */

            await this.cancel(
                reminder.id
            );

            /*
            |--------------------------------------------------------------------------
            | Calculate Next Date
            |--------------------------------------------------------------------------
            */

            const nextDate =
                this.calculateNextDate(
                    reminder
                );

            /*
            |--------------------------------------------------------------------------
            | Update Schedule
            |--------------------------------------------------------------------------
            */

            reminder.schedule.date =
                nextDate
                    .toISOString()
                    .split("T")[0];

            /*
            |--------------------------------------------------------------------------
            | Schedule Again
            |--------------------------------------------------------------------------
            */

            await this.schedule(
                reminder
            );

            logInfo(
                "Reminder rescheduled"
            );
        } catch (error) {
            logError(
                "Reminder reschedule failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Restore All Reminders
    |--------------------------------------------------------------------------
    */

    static async restoreAll():
        Promise<void> {
        try {
            logInfo("Restoring and reconciling reminders...");

            const reminders =
                await ReminderStorage.getAll();

            /*
            |--------------------------------------------------------------------------
            | Empty Database Rescue (Total OS Wiping)
            |--------------------------------------------------------------------------
            |
            | If the local database is completely empty (no reminders exist at all),
            | we wipe the entire OS scheduler queue and the SQLite workflows database
            | to instantly stop the background Scheduler ticks and any ghost/rogue alerts.
            |
            */

            if (reminders.length === 0) {
                logWarn("No reminders found in database. Wiping all OS scheduled notifications clean!");
                await Notifications.cancelAllScheduledNotificationsAsync();
                
                try {
                    const { WorkflowRepository } = require("../storage/workflow.repository");
                    await WorkflowRepository.clearAll();
                    logInfo("Successfully cleared SQLite workflows repository.");
                } catch (err) {
                    logError("Failed to clear SQLite workflows repository:", err);
                }

                logInfo("OS scheduled notifications queue successfully cleared.");
                return;
            }

            const activeReminderIds = new Set(
                reminders
                    .filter((r) => r.runtime.active)
                    .map((r) => r.id)
            );

            /*
            |--------------------------------------------------------------------------
            | Reconcile Scheduled OS Notifications (Orphaned / Stale Cleanups)
            |--------------------------------------------------------------------------
            |
            | We fetch all currently scheduled notifications from the OS queue.
            | A scheduled notification is cancelled if:
            | 1. It has no reminderId in its data payload (meaning it is a legacy/ghost notification or rogue alarm)
            | 2. Its reminderId is not in our database list of active reminders.
            |
            | This guarantees that only valid, active reminders have schedules.
            |
            */

            const scheduled = await Notifications.getAllScheduledNotificationsAsync();
            let cancelledCount = 0;

            for (const notification of scheduled) {
                const reminderId = notification.content?.data?.reminderId ?? (notification as any).request?.content?.data?.reminderId;
                if (!reminderId || !activeReminderIds.has(String(reminderId))) {
                    await Notifications.cancelScheduledNotificationAsync(
                        notification.identifier
                    );
                    cancelledCount++;
                    logInfo("Cleaned up orphaned/ghost/legacy scheduled notification:", {
                        notificationId: notification.identifier,
                        reminderId,
                    });
                }
            }

            logInfo("Scheduled notification reconciliation complete", {
                clearedCount: cancelledCount,
            });

            /*
            |--------------------------------------------------------------------------
            | SQLite Workflow Reconciliation (Ghost Workflow Cleanups)
            |--------------------------------------------------------------------------
            |
            | Workflows are created in SQLite but reminders are in AsyncStorage.
            | We scan SQLite workflows and delete any workflow whose first action
            | message doesn't match an active reminder title or description.
            | This completely terminates orphaned workflow ticks in the background!
            |
            */

            try {
                const { WorkflowRepository } = require("../storage/workflow.repository");
                const activeReminders = reminders.filter((r) => r.runtime.active);
                const activeTitles = new Set(activeReminders.map((r) => r.title.toLowerCase().trim()));
                const activeDescs = new Set(activeReminders.map((r) => r.description?.toLowerCase().trim() ?? ""));

                const sqlWorkflows = await WorkflowRepository.findAll();
                let clearedWorkflows = 0;

                for (const workflow of sqlWorkflows) {
                    const actionMessage = workflow.actions[0]?.message?.toLowerCase().trim();
                    if (actionMessage) {
                        let isMatched = false;
                        for (const title of activeTitles) {
                            if (title.includes(actionMessage) || actionMessage.includes(title)) {
                                isMatched = true;
                                break;
                            }
                        }
                        if (!isMatched) {
                            for (const desc of activeDescs) {
                                if (desc.includes(actionMessage)) {
                                    isMatched = true;
                                    break;
                                }
                            }
                        }

                        if (!isMatched) {
                            await WorkflowRepository.delete(workflow.id);
                            clearedWorkflows++;
                            logInfo("Cleaned up orphaned SQLite workflow:", {
                                workflowId: workflow.id,
                                actionMessage,
                            });
                        }
                    }
                }
                logInfo("SQLite workflow reconciliation complete", {
                    clearedCount: clearedWorkflows,
                });
            } catch (err) {
                logError("Failed to reconcile SQLite workflows:", err);
            }

            /*
            |--------------------------------------------------------------------------
            | Restore Active Only
            |--------------------------------------------------------------------------
            */

            for (const reminder of reminders) {
                if (
                    reminder.runtime
                        .active
                ) {
                    await this.schedule(
                        reminder
                    );
                }
            }

            logInfo(
                "Reminder restore completed",
                {
                    total:
                        reminders.length,
                }
            );
        } catch (error) {
            logError(
                "Reminder restore failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Build Date
    |--------------------------------------------------------------------------
    */

    private static buildDate(
        date: string,

        time: string
    ): Date {
        /*
        |--------------------------------------------------------------------------
        | Parse Time
        |--------------------------------------------------------------------------
        */

        const [rawTime,
            modifier] =
            time.split(" ");

        let [hours,
            minutes] =
            rawTime
                .split(":")
                .map(Number);

        /*
        |--------------------------------------------------------------------------
        | AM/PM Conversion
        |--------------------------------------------------------------------------
        */

        if (
            modifier === "PM" &&
            hours < 12
        ) {
            hours += 12;
        }

        if (
            modifier === "AM" &&
            hours === 12
        ) {
            hours = 0;
        }

        /*
        |--------------------------------------------------------------------------
        | Construct Date
        |--------------------------------------------------------------------------
        */

        const target =
            new Date(date);

        target.setHours(
            hours
        );

        target.setMinutes(
            minutes
        );

        target.setSeconds(
            0
        );

        target.setMilliseconds(
            0
        );

        return target;
    }

    /*
    |--------------------------------------------------------------------------
    | Calculate Next Repeat Date
    |--------------------------------------------------------------------------
    */

    private static calculateNextDate(
        reminder:
            Reminder
    ): Date {
        const current =
            this.buildDate(
                reminder.schedule
                    .date,

                reminder.schedule
                    .time
            );

        switch (
        reminder.schedule
            .repeat
        ) {
            case "daily":
                current.setDate(
                    current.getDate() + 1
                );

                break;

            case "weekly":
                current.setDate(
                    current.getDate() + 7
                );

                break;

            case "monthly":
                current.setMonth(
                    current.getMonth() + 1
                );

                break;

            default:
                break;
        }

        return current;
    }

    /*
    |--------------------------------------------------------------------------
    | Find Next Future Occurrence
    |--------------------------------------------------------------------------
    |
    | Given a past triggerDate and a repeat type, advances the date forward
    | in the correct interval until it is in the future. Handles cases where
    | the reminder was disabled for multiple intervals (e.g., a week or more).
    |
    */

    private static findNextFutureOccurrence(
        pastDate: Date,
        repeat: "daily" | "weekly" | "monthly"
    ): Date {
        const next = new Date(pastDate);
        const now = Date.now();

        while (next.getTime() <= now) {
            switch (repeat) {
                case "daily":
                    next.setDate(next.getDate() + 1);
                    break;

                case "weekly":
                    next.setDate(next.getDate() + 7);
                    break;

                case "monthly":
                    next.setMonth(next.getMonth() + 1);
                    break;
            }
        }

        return next;
    }

    /*
    |--------------------------------------------------------------------------
    | Clear Alarm Timer
    |--------------------------------------------------------------------------
    |
    | Cancels and removes a JavaScript alarm timer for a specific reminder.
    |
    */

    private static clearAlarmTimer(
        reminderId: string
    ): void {
        const existing =
            this.alarmTimers.get(
                reminderId
            );

        if (existing) {
            clearTimeout(existing);

            this.alarmTimers.delete(
                reminderId
            );

            logInfo(
                "JS alarm timer cleared",
                {
                    reminderId,
                }
            );
        }
    }
}