// src/core/assistant/assistant-learning.service.ts

import {
    AssistantMemoryService,
} from "./assistant-memory.service";

import {
    AssistantOrchestratorService,
} from "./assistant-orchestrator.service";

import {
    RuntimeAnalyticsService,
} from "../runtime/runtime-analytics.service";

import {
    logInfo,
    logWarn,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Assistant Learning Report
|--------------------------------------------------------------------------
*/

export type AssistantLearningReport =
    {
        score: number;

        memoryEntries: number;

        recommendationQuality: number;

        engagementLevel: number;

        generatedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Assistant Learning Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - evaluate assistant intelligence
| - reinforce conversational memory
| - improve assistant recommendations
| - monitor assistant learning quality
|
| IMPORTANT:
| This becomes the foundation for:
| - adaptive assistant behavior
| - conversational intelligence growth
| - personalized assistant evolution
|
*/

export class AssistantLearningService {
    /*
    |--------------------------------------------------------------------------
    | Evaluate Assistant
    |--------------------------------------------------------------------------
    */

    static evaluate():
        AssistantLearningReport {
        /*
        |--------------------------------------------------------------------------
        | Memory
        |--------------------------------------------------------------------------
        */

        const memory =
            AssistantMemoryService.getAll();

        /*
        |--------------------------------------------------------------------------
        | Fresh Response
        |--------------------------------------------------------------------------
        */

        const response =
            AssistantOrchestratorService.generateResponse();

        /*
        |--------------------------------------------------------------------------
        | Analytics
        |--------------------------------------------------------------------------
        */

        const analytics =
            RuntimeAnalyticsService.generateSummary();

        /*
        |--------------------------------------------------------------------------
        | Recommendation Quality
        |--------------------------------------------------------------------------
        */

        const recommendationQuality =
            Math.min(
                100,
                response
                    .recommendations
                    .length * 20
            );

        /*
        |--------------------------------------------------------------------------
        | Engagement
        |--------------------------------------------------------------------------
        */

        const engagementLevel =
            analytics.workflowSuccessRate;

        /*
        |--------------------------------------------------------------------------
        | Intelligence Score
        |--------------------------------------------------------------------------
        */

        let score = 50;

        if (
            memory.length >= 5
        ) {
            score += 15;
        }

        if (
            recommendationQuality >=
            60
        ) {
            score += 15;
        }

        if (
            engagementLevel >= 70
        ) {
            score += 20;
        }

        /*
        |--------------------------------------------------------------------------
        | Clamp
        |--------------------------------------------------------------------------
        */

        score = Math.max(
            0,
            Math.min(score, 100)
        );

        /*
        |--------------------------------------------------------------------------
        | Report
        |--------------------------------------------------------------------------
        */

        const report:
            AssistantLearningReport =
        {
            score,

            memoryEntries:
                memory.length,

            recommendationQuality,

            engagementLevel,

            generatedAt:
                Date.now(),
        };

        /*
        |--------------------------------------------------------------------------
        | Logging
        |--------------------------------------------------------------------------
        */

        if (score >= 75) {
            logInfo(
                "Assistant learning quality strong",
                report
            );
        } else {
            logWarn(
                "Assistant learning quality weak",
                report
            );
        }

        return report;
    }

    /*
    |--------------------------------------------------------------------------
    | Reinforce Memory
    |--------------------------------------------------------------------------
    */

    static reinforce():
        void {
        AssistantMemoryService.capture();

        logInfo(
            "Assistant memory reinforced"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Is Improving
    |--------------------------------------------------------------------------
    */

    static isImproving():
        boolean {
        return (
            this.evaluate().score >=
            70
        );
    }
}