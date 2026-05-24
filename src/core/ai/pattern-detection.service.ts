// src/core/ai/pattern-detection.service.ts

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
| Behavioral Pattern
|--------------------------------------------------------------------------
*/

export type BehavioralPattern =
    {
        id: string;

        type:
        | "snooze_pattern"
        | "completion_pattern"
        | "miss_pattern"
        | "engagement_pattern"
        | "time_pattern";

        title: string;

        description: string;

        confidence: number;

        detectedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Pattern Detection Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - detect user behavior patterns
| - identify workflow trends
| - discover reminder habits
| - prepare AI learning signals
|
| IMPORTANT:
| This becomes the foundation for:
| - adaptive scheduling
| - intelligent reminders
| - behavioral AI
| - predictive automation
|
*/

export class PatternDetectionService {
    /*
    |--------------------------------------------------------------------------
    | Detect Patterns
    |--------------------------------------------------------------------------
    */

    static detect():
        BehavioralPattern[] {
        const patterns:
            BehavioralPattern[] = [];

        /*
        |--------------------------------------------------------------------------
        | Data Sources
        |--------------------------------------------------------------------------
        */

        const sessions =
            ReminderSessionService.getAll();

        const events =
            RuntimeEventStore.getAll();

        /*
        |--------------------------------------------------------------------------
        | Frequent Snoozing
        |--------------------------------------------------------------------------
        */

        const snoozed =
            sessions.filter(
                (session) =>
                    session.status ===
                    "snoozed"
            );

        if (
            snoozed.length >= 5
        ) {
            patterns.push({
                id:
                    "frequent-snoozing",

                type:
                    "snooze_pattern",

                title:
                    "Frequent Snoozing Behavior",

                description:
                    "User regularly snoozes reminders before completing them.",

                confidence: 84,

                detectedAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Strong Completion Pattern
        |--------------------------------------------------------------------------
        */

        const completed =
            sessions.filter(
                (session) =>
                    session.status ===
                    "completed"
            );

        if (
            completed.length >= 10
        ) {
            patterns.push({
                id:
                    "strong-completion-pattern",

                type:
                    "completion_pattern",

                title:
                    "Strong Completion Habit",

                description:
                    "User consistently completes reminder sessions.",

                confidence: 90,

                detectedAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Missed Reminder Pattern
        |--------------------------------------------------------------------------
        */

        const missed =
            sessions.filter(
                (session) =>
                    session.status ===
                    "missed" ||
                    session.status ===
                    "expired"
            );

        if (
            missed.length >= 5
        ) {
            patterns.push({
                id:
                    "missed-reminder-pattern",

                type:
                    "miss_pattern",

                title:
                    "Frequent Missed Reminders",

                description:
                    "User often ignores or misses reminders.",

                confidence: 78,

                detectedAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | High Engagement
        |--------------------------------------------------------------------------
        */

        if (
            events.length >= 250
        ) {
            patterns.push({
                id:
                    "high-engagement-pattern",

                type:
                    "engagement_pattern",

                title:
                    "High Engagement Behavior",

                description:
                    "User interacts heavily with workflows and reminders.",

                confidence: 87,

                detectedAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Morning Activity Pattern
        |--------------------------------------------------------------------------
        */

        const morningSessions =
            sessions.filter(
                (session) => {
                    const hour =
                        new Date(
                            session.createdAt
                        ).getHours();

                    return (
                        hour >= 5 &&
                        hour <= 11
                    );
                }
            );

        if (
            morningSessions.length >=
            8
        ) {
            patterns.push({
                id:
                    "morning-activity-pattern",

                type:
                    "time_pattern",

                title:
                    "Morning Productivity Pattern",

                description:
                    "User is highly active during morning hours.",

                confidence: 73,

                detectedAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Night Activity Pattern
        |--------------------------------------------------------------------------
        */

        const nightSessions =
            sessions.filter(
                (session) => {
                    const hour =
                        new Date(
                            session.createdAt
                        ).getHours();

                    return (
                        hour >= 22 ||
                        hour <= 2
                    );
                }
            );

        if (
            nightSessions.length >=
            6
        ) {
            patterns.push({
                id:
                    "night-activity-pattern",

                type:
                    "time_pattern",

                title:
                    "Late Night Usage Pattern",

                description:
                    "User frequently interacts with reminders late at night.",

                confidence: 70,

                detectedAt:
                    Date.now(),
            });
        }

        logInfo(
            "Behavior patterns detected",
            {
                count:
                    patterns.length,
            }
        );

        return patterns;
    }

    /*
    |--------------------------------------------------------------------------
    | Get Dominant Pattern
    |--------------------------------------------------------------------------
    */

    static getDominantPattern():
        BehavioralPattern | null {
        const patterns =
            this.detect();

        if (
            patterns.length === 0
        ) {
            return null;
        }

        return patterns.sort(
            (a, b) =>
                b.confidence -
                a.confidence
        )[0];
    }
}