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
    DeviceUsageMonitorService,
} from "../integrations/device-usage-monitor.service";

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

        /*
        |--------------------------------------------------------------------------
        | Device Activity & Usage Pattern Matching
        |--------------------------------------------------------------------------
        */

        const metrics = DeviceUsageMonitorService.getMetricsSync();

        // 1. Late-night high brightness pattern: active at night (>= 22:00 or <= 01:00) with brightness >= 0.7
        const lateNightHighBrightness = metrics.filter(
            (m) => (m.hour >= 22 || m.hour <= 1) && m.appState === "active" && m.brightness >= 0.7
        );
        if (lateNightHighBrightness.length >= 3) {
            recommendations.push({
                id: "dim-display-late-night",
                type: "optimization",
                title: "Dim Display at Night",
                description: "You use high brightness late at night. Let's schedule a routine to automatically dim the display to 15% at 10:00 PM.",
                confidence: 88,
                generatedAt: Date.now(),
            });
        }

        // 2. Morning silent mode pattern: volume is muted (0.0) between 8 AM and 11 AM
        const silentMorning = metrics.filter(
            (m) => m.hour >= 8 && m.hour <= 11 && m.volume === 0
        );
        if (silentMorning.length >= 3) {
            recommendations.push({
                id: "schedule-silent-mode-morning",
                type: "timing",
                title: "Schedule Silent Mode",
                description: "You frequently silence your device in the morning. Let's schedule silent mode automatically from 9:00 AM to 11:00 AM.",
                confidence: 85,
                generatedAt: Date.now(),
            });
        }

        // 3. Location-based gym routine pattern: user is at the "gym" location
        const gymVisits = metrics.filter(
            (m) => m.location === "gym"
        );
        if (gymVisits.length >= 3) {
            recommendations.push({
                id: "gym-routine-suggestion",
                type: "workflow",
                title: "Activate Gym Routine",
                description: "You visit the gym frequently. Would you like to automate silencing your phone and adjusting brightness when entering the gym?",
                confidence: 90,
                generatedAt: Date.now(),
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