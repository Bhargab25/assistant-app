// src/core/ai/adaptive-scheduler.service.ts

import {
    PatternDetectionService,
} from "./pattern-detection.service";

import {
    RecommendationEngineService,
} from "./recommendation-engine.service";

import {
    ReminderSessionService,
} from "../reminders/reminder-session.service";

import {
    logInfo,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Adaptive Schedule Suggestion
|--------------------------------------------------------------------------
*/

export type AdaptiveScheduleSuggestion =
    {
        workflowId: string;

        currentHour?: number;

        suggestedHour: number;

        confidence: number;

        reason: string;

        generatedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Adaptive Scheduler Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - suggest optimal reminder timing
| - adaptive scheduling intelligence
| - behavior-aware automation
| - future predictive scheduling
|
| IMPORTANT:
| This becomes the foundation for:
| - smart reminders
| - AI scheduling
| - predictive automation
| - habit-aware workflows
|
*/

export class AdaptiveSchedulerService {
    /*
    |--------------------------------------------------------------------------
    | Generate Suggestions
    |--------------------------------------------------------------------------
    */

    static generateSuggestions():
        AdaptiveScheduleSuggestion[] {
        const suggestions:
            AdaptiveScheduleSuggestion[] =
            [];

        /*
        |--------------------------------------------------------------------------
        | Data Sources
        |--------------------------------------------------------------------------
        */

        const patterns =
            PatternDetectionService.detect();

        const recommendations =
            RecommendationEngineService.generate();

        const sessions =
            ReminderSessionService.getAll();

        /*
        |--------------------------------------------------------------------------
        | Workflow Aggregation
        |--------------------------------------------------------------------------
        */

        const workflowMap =
            new Map<
                string,
                number[]
            >();

        for (const session of sessions) {
            if (
                !workflowMap.has(
                    session.workflowId
                )
            ) {
                workflowMap.set(
                    session.workflowId,
                    []
                );
            }

            workflowMap
                .get(session.workflowId)
                ?.push(
                    new Date(
                        session.createdAt
                    ).getHours()
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Analyze Workflows
        |--------------------------------------------------------------------------
        */

        for (const [
            workflowId,
            hours,
        ] of workflowMap.entries()) {
            if (
                hours.length < 3
            ) {
                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Average Hour
            |--------------------------------------------------------------------------
            */

            const averageHour =
                Math.round(
                    hours.reduce(
                        (sum, hour) =>
                            sum + hour,
                        0
                    ) / hours.length
                );

            /*
            |--------------------------------------------------------------------------
            | Morning Pattern
            |--------------------------------------------------------------------------
            */

            const morningPattern =
                patterns.find(
                    (pattern) =>
                        pattern.id ===
                        "morning-activity-pattern"
                );

            if (
                morningPattern
            ) {
                suggestions.push({
                    workflowId,

                    suggestedHour: 8,

                    confidence: 84,

                    reason:
                        "User shows strong morning productivity behavior.",

                    generatedAt:
                        Date.now(),
                });

                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Night Pattern
            |--------------------------------------------------------------------------
            */

            const nightPattern =
                patterns.find(
                    (pattern) =>
                        pattern.id ===
                        "night-activity-pattern"
                );

            if (
                nightPattern
            ) {
                suggestions.push({
                    workflowId,

                    suggestedHour: 22,

                    confidence: 72,

                    reason:
                        "User frequently interacts during late-night hours.",

                    generatedAt:
                        Date.now(),
                });

                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Heavy Snoozing Recommendation
            |--------------------------------------------------------------------------
            */

            const timingRecommendation =
                recommendations.find(
                    (recommendation) =>
                        recommendation.id ===
                        "optimize-reminder-time"
                );

            if (
                timingRecommendation
            ) {
                suggestions.push({
                    workflowId,

                    currentHour:
                        averageHour,

                    suggestedHour:
                        averageHour + 1,

                    confidence: 76,

                    reason:
                        "Frequent snoozing detected. Slightly delaying reminders may improve engagement.",

                    generatedAt:
                        Date.now(),
                });

                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Default Suggestion
            |--------------------------------------------------------------------------
            */

            suggestions.push({
                workflowId,

                currentHour:
                    averageHour,

                suggestedHour:
                    averageHour,

                confidence: 60,

                reason:
                    "Based on historical interaction averages.",

                generatedAt:
                    Date.now(),
            });
        }

        logInfo(
            "Adaptive scheduling suggestions generated",
            {
                count:
                    suggestions.length,
            }
        );

        return suggestions;
    }

    /*
    |--------------------------------------------------------------------------
    | Best Suggestion
    |--------------------------------------------------------------------------
    */

    static getBestSuggestion(
        workflowId: string
    ):
        | AdaptiveScheduleSuggestion
        | undefined {
        return this
            .generateSuggestions()
            .find(
                (suggestion) =>
                    suggestion.workflowId ===
                    workflowId
            );
    }
}