// src/core/runtime/runtime-analytics.service.ts

import {
    RuntimeEventStore,
} from "./runtime-event.store";

import {
    NotificationHistoryService,
} from "../notifications/notification-history.service";

import {
    ReminderSessionService,
} from "../reminders/reminder-session.service";

import {
    RuntimeMetricsService,
} from "./runtime-metrics.service";

import {
    EVENTS,
} from "../../shared/constants";

import {
    logInfo,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Analytics Summary
|--------------------------------------------------------------------------
*/

export type AnalyticsSummary =
    {
        totalEvents: number;

        workflowsCompleted: number;

        workflowsFailed: number;

        remindersCompleted: number;

        remindersMissed: number;

        notificationClicks: number;

        notificationFailures: number;

        workflowSuccessRate: number;

        notificationFailureRate: number;
    };

/*
|--------------------------------------------------------------------------
| Runtime Analytics Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - runtime analytics
| - behavioral insights
| - workflow performance
| - reminder effectiveness
| - future AI recommendations
|
| IMPORTANT:
| This becomes the foundation for:
| - AI optimization
| - smart scheduling
| - productivity insights
| - user behavior analysis
|
*/

export class RuntimeAnalyticsService {
    /*
    |--------------------------------------------------------------------------
    | Generate Analytics Summary
    |--------------------------------------------------------------------------
    */

    static generateSummary():
        AnalyticsSummary {
        /*
        |--------------------------------------------------------------------------
        | Runtime Events
        |--------------------------------------------------------------------------
        */

        const events =
            RuntimeEventStore.getAll();

        /*
        |--------------------------------------------------------------------------
        | Sessions
        |--------------------------------------------------------------------------
        */

        const sessions =
            ReminderSessionService.getAll();

        /*
        |--------------------------------------------------------------------------
        | Notifications
        |--------------------------------------------------------------------------
        */

        const notifications =
            NotificationHistoryService.getAll();

        /*
        |--------------------------------------------------------------------------
        | Workflow Events
        |--------------------------------------------------------------------------
        */

        const workflowsCompleted =
            events.filter(
                (event) =>
                    event.type ===
                    EVENTS.WORKFLOW_COMPLETED
            ).length;

        const workflowsFailed =
            events.filter(
                (event) =>
                    event.type ===
                    EVENTS.WORKFLOW_FAILED
            ).length;

        /*
        |--------------------------------------------------------------------------
        | Reminder Metrics
        |--------------------------------------------------------------------------
        */

        const remindersCompleted =
            sessions.filter(
                (session) =>
                    session.status ===
                    "completed"
            ).length;

        const remindersMissed =
            sessions.filter(
                (session) =>
                    session.status ===
                    "missed" ||
                    session.status ===
                    "expired"
            ).length;

        /*
        |--------------------------------------------------------------------------
        | Notification Metrics
        |--------------------------------------------------------------------------
        */

        const notificationClicks =
            notifications.filter(
                (notification) =>
                    notification.status ===
                    "clicked"
            ).length;

        const notificationFailures =
            notifications.filter(
                (notification) =>
                    notification.status ===
                    "failed"
            ).length;

        /*
        |--------------------------------------------------------------------------
        | Rates
        |--------------------------------------------------------------------------
        */

        const workflowSuccessRate =
            RuntimeMetricsService.getWorkflowSuccessRate();

        const notificationFailureRate =
            RuntimeMetricsService.getNotificationFailureRate();

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */

        const summary:
            AnalyticsSummary =
        {
            totalEvents:
                events.length,

            workflowsCompleted,

            workflowsFailed,

            remindersCompleted,

            remindersMissed,

            notificationClicks,

            notificationFailures,

            workflowSuccessRate,

            notificationFailureRate,
        };

        logInfo(
            "Runtime analytics generated",
            summary
        );

        return summary;
    }

    /*
    |--------------------------------------------------------------------------
    | Most Common Event
    |--------------------------------------------------------------------------
    */

    static getMostCommonEvent():
        string | null {
        const events =
            RuntimeEventStore.getAll();

        if (
            events.length === 0
        ) {
            return null;
        }

        const counter:
            Record<
                string,
                number
            > = {};

        for (const event of events) {
            counter[event.type] =
                (counter[event.type] ||
                    0) + 1;
        }

        let highest = 0;

        let mostCommon:
            string | null =
            null;

        for (const key in counter) {
            if (
                counter[key] >
                highest
            ) {
                highest =
                    counter[key];

                mostCommon = key;
            }
        }

        return mostCommon;
    }

    /*
    |--------------------------------------------------------------------------
    | Get Reminder Completion Rate
    |--------------------------------------------------------------------------
    */

    static getReminderCompletionRate():
        number {
        const sessions =
            ReminderSessionService.getAll();

        if (
            sessions.length === 0
        ) {
            return 0;
        }

        const completed =
            sessions.filter(
                (session) =>
                    session.status ===
                    "completed"
            ).length;

        return Math.round(
            (completed /
                sessions.length) *
            100
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get User Engagement Score
    |--------------------------------------------------------------------------
    */

    static getUserEngagementScore():
        number {
        const completionRate =
            this.getReminderCompletionRate();

        const workflowSuccessRate =
            RuntimeMetricsService.getWorkflowSuccessRate();

        const notificationClickRate =
            this.getNotificationClickRate();

        /*
        |--------------------------------------------------------------------------
        | Weighted Score
        |--------------------------------------------------------------------------
        */

        return Math.round(
            completionRate * 0.4 +
            workflowSuccessRate *
            0.4 +
            notificationClickRate *
            0.2
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Notification Click Rate
    |--------------------------------------------------------------------------
    */

    static getNotificationClickRate():
        number {
        const notifications =
            NotificationHistoryService.getAll();

        if (
            notifications.length === 0
        ) {
            return 0;
        }

        const clicked =
            notifications.filter(
                (notification) =>
                    notification.status ===
                    "clicked"
            ).length;

        return Math.round(
            (clicked /
                notifications.length) *
            100
        );
    }
}