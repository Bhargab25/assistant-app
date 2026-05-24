// src/core/ai/recommendation-engine.service.ts

import {
    ReminderSessionService,
} from "../reminders/reminder-session.service";

import {
    RuntimeAnalyticsService,
} from "../runtime/runtime-analytics.service";

import {
    RuntimeEventStore,
} from "../runtime/runtime-event.store";

import {
    logInfo,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Recommendation
|--------------------------------------------------------------------------
*/

export type Recommendation =
    {
        id: string;

        type:
        | "workflow"
        | "timing"
        | "engagement"
        | "optimization";

        title: string;

        description: string;

        confidence: number;

        generatedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Recommendation Engine
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - smart recommendations
| - workflow optimization suggestions
| - reminder timing suggestions
| - engagement improvements
| - future adaptive intelligence
|
| IMPORTANT:
| This becomes the foundation for:
| - AI scheduling
| - adaptive workflows
| - personalized automation
|
*/

export class RecommendationEngineService {
    /*
    |--------------------------------------------------------------------------
    | Generate Recommendations
    |--------------------------------------------------------------------------
    */

    static generate():
        Recommendation[] {
        const recommendations:
            Recommendation[] = [];

        /*
        |--------------------------------------------------------------------------
        | Data Sources
        |--------------------------------------------------------------------------
        */

        const sessions =
            ReminderSessionService.getAll();

        const analytics =
            RuntimeAnalyticsService.generateSummary();

        const events =
            RuntimeEventStore.getAll();

        /*
        |--------------------------------------------------------------------------
        | Heavy Snoozing
        |--------------------------------------------------------------------------
        */

        const snoozedCount =
            sessions.filter(
                (session) =>
                    session.status ===
                    "snoozed"
            ).length;

        if (
            snoozedCount >= 5
        ) {
            recommendations.push({
                id:
                    "optimize-reminder-time",

                type: "timing",

                title:
                    "Optimize Reminder Timing",

                description:
                    "You snooze reminders frequently. Try moving reminders to a more convenient time.",

                confidence: 82,

                generatedAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Missed Reminder Pattern
        |--------------------------------------------------------------------------
        */

        if (
            analytics.remindersMissed >
            3
        ) {
            recommendations.push({
                id:
                    "reduce-reminder-frequency",

                type:
                    "optimization",

                title:
                    "Reduce Reminder Frequency",

                description:
                    "Too many reminders may reduce engagement. Consider simplifying workflows.",

                confidence: 76,

                generatedAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Low Engagement
        |--------------------------------------------------------------------------
        */

        const engagementScore =
            RuntimeAnalyticsService.getUserEngagementScore();

        if (
            engagementScore < 40
        ) {
            recommendations.push({
                id:
                    "increase-engagement",

                type:
                    "engagement",

                title:
                    "Improve Reminder Engagement",

                description:
                    "Try using stronger reminder sounds or shorter reminder intervals.",

                confidence: 74,

                generatedAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | High Activity User
        |--------------------------------------------------------------------------
        */

        if (
            events.length > 200
        ) {
            recommendations.push({
                id:
                    "advanced-automation",

                type:
                    "workflow",

                title:
                    "Enable Advanced Automation",

                description:
                    "You are an active user. Consider creating chained workflows and smart triggers.",

                confidence: 91,

                generatedAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Excellent Completion Rate
        |--------------------------------------------------------------------------
        */

        const completionRate =
            RuntimeAnalyticsService.getReminderCompletionRate();

        if (
            completionRate >= 90
        ) {
            recommendations.push({
                id:
                    "expand-routines",

                type:
                    "workflow",

                title:
                    "Expand Your Routines",

                description:
                    "Your reminder completion rate is excellent. You may benefit from more automation routines.",

                confidence: 88,

                generatedAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Notification Problems
        |--------------------------------------------------------------------------
        */

        const notificationFailureRate =
            RuntimeAnalyticsService.generateSummary()
                .notificationFailureRate;

        if (
            notificationFailureRate >
            15
        ) {
            recommendations.push({
                id:
                    "battery-optimization-warning",

                type:
                    "optimization",

                title:
                    "Disable Battery Optimization",

                description:
                    "Your device may be restricting background execution. Disable battery optimization for better reliability.",

                confidence: 95,

                generatedAt:
                    Date.now(),
            });
        }

        logInfo(
            "Recommendations generated",
            {
                count:
                    recommendations.length,
            }
        );

        return recommendations;
    }

    /*
    |--------------------------------------------------------------------------
    | Top Recommendation
    |--------------------------------------------------------------------------
    */

    static getTopRecommendation():
        Recommendation | null {
        const recommendations =
            this.generate();

        if (
            recommendations.length ===
            0
        ) {
            return null;
        }

        /*
        |--------------------------------------------------------------------------
        | Highest Confidence
        |--------------------------------------------------------------------------
        */

        return recommendations.sort(
            (a, b) =>
                b.confidence -
                a.confidence
        )[0];
    }
}