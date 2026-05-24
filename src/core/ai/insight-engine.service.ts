// src/core/ai/insight-engine.service.ts

import {
    RuntimeAnalyticsService,
} from "../runtime/runtime-analytics.service";

import {
    RuntimeMetricsService,
} from "../runtime/runtime-metrics.service";

import {
    ReminderSessionService,
} from "../reminders/reminder-session.service";

import {
    RuntimeEventStore,
} from "../runtime/runtime-event.store";

import {
    logInfo,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| AI Insight
|--------------------------------------------------------------------------
*/

export type AIInsight =
    {
        id: string;

        type:
        | "productivity"
        | "engagement"
        | "health"
        | "optimization"
        | "warning";

        title: string;

        description: string;

        score?: number;

        generatedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Insight Engine Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - behavioral insights
| - smart recommendations
| - workflow optimization hints
| - engagement analysis
| - adaptive intelligence foundation
|
| IMPORTANT:
| This becomes the future AI brain layer.
|
*/

export class InsightEngineService {
    /*
    |--------------------------------------------------------------------------
    | Generate Insights
    |--------------------------------------------------------------------------
    */

    static generateInsights():
        AIInsight[] {
        const insights:
            AIInsight[] = [];

        /*
        |--------------------------------------------------------------------------
        | Metrics
        |--------------------------------------------------------------------------
        */

        const analytics =
            RuntimeAnalyticsService.generateSummary();

        const metrics =
            RuntimeMetricsService.snapshot();

        const sessions =
            ReminderSessionService.getAll();

        const events =
            RuntimeEventStore.getAll();

        /*
        |--------------------------------------------------------------------------
        | Productivity Insight
        |--------------------------------------------------------------------------
        */

        if (
            analytics.workflowSuccessRate >=
            80
        ) {
            insights.push({
                id:
                    "high-productivity",

                type:
                    "productivity",

                title:
                    "High Productivity Detected",

                description:
                    "Your workflow completion rate is excellent.",

                score:
                    analytics.workflowSuccessRate,

                generatedAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Missed Reminder Warning
        |--------------------------------------------------------------------------
        */

        if (
            analytics.remindersMissed >
            5
        ) {
            insights.push({
                id:
                    "missed-reminders",

                type: "warning",

                title:
                    "Frequent Missed Reminders",

                description:
                    "You are missing many reminders. Consider reducing reminder frequency.",

                generatedAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Notification Failure Insight
        |--------------------------------------------------------------------------
        */

        if (
            analytics.notificationFailureRate >
            20
        ) {
            insights.push({
                id:
                    "notification-failures",

                type:
                    "optimization",

                title:
                    "Notification Reliability Issue",

                description:
                    "Notification delivery failures are high. Battery optimization settings may be affecting reliability.",

                score:
                    analytics.notificationFailureRate,

                generatedAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Engagement Insight
        |--------------------------------------------------------------------------
        */

        const engagement =
            RuntimeAnalyticsService.getUserEngagementScore();

        if (
            engagement >= 75
        ) {
            insights.push({
                id:
                    "high-engagement",

                type:
                    "engagement",

                title:
                    "Strong Engagement",

                description:
                    "You consistently interact with reminders and workflows.",

                score:
                    engagement,

                generatedAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Snooze Pattern Detection
        |--------------------------------------------------------------------------
        */

        const snoozedSessions =
            sessions.filter(
                (session) =>
                    session.status ===
                    "snoozed"
            ).length;

        if (
            snoozedSessions >
            10
        ) {
            insights.push({
                id:
                    "heavy-snoozing",

                type:
                    "optimization",

                title:
                    "Frequent Snoozing Detected",

                description:
                    "You snooze reminders frequently. Consider adjusting reminder timing.",

                generatedAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Event Activity Insight
        |--------------------------------------------------------------------------
        */

        if (
            events.length > 500
        ) {
            insights.push({
                id:
                    "high-activity",

                type:
                    "engagement",

                title:
                    "High Automation Activity",

                description:
                    "Your automation system is highly active and engaged.",

                generatedAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Reminder Completion Insight
        |--------------------------------------------------------------------------
        */

        const reminderCompletionRate =
            RuntimeAnalyticsService.getReminderCompletionRate();

        if (
            reminderCompletionRate >=
            85
        ) {
            insights.push({
                id:
                    "excellent-reminder-discipline",

                type: "health",

                title:
                    "Excellent Reminder Discipline",

                description:
                    "You consistently complete your reminders successfully.",

                score:
                    reminderCompletionRate,

                generatedAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Low Activity Warning
        |--------------------------------------------------------------------------
        */

        if (
            metrics.events.total < 5
        ) {
            insights.push({
                id:
                    "low-activity",

                type: "warning",

                title:
                    "Low Automation Usage",

                description:
                    "Your automation system has very little activity. Create more workflows to improve productivity.",

                generatedAt:
                    Date.now(),
            });
        }

        logInfo(
            "AI insights generated",
            {
                count:
                    insights.length,
            }
        );

        return insights;
    }

    /*
    |--------------------------------------------------------------------------
    | Top Insight
    |--------------------------------------------------------------------------
    */

    static getTopInsight():
        AIInsight | null {
        const insights =
            this.generateInsights();

        if (
            insights.length === 0
        ) {
            return null;
        }

        return insights[0];
    }
}