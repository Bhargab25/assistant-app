// src/core/ai/context-engine.service.ts

import {
    AIMemoryService,
} from "./ai-memory.service";

import {
    RuntimeAnalyticsService,
} from "../runtime/runtime-analytics.service";

import {
    PatternDetectionService,
} from "./pattern-detection.service";

import {
    RecommendationEngineService,
} from "./recommendation-engine.service";

import {
    logInfo,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| AI Context
|--------------------------------------------------------------------------
*/

export type AIContext =
    {
        engagementScore: number;

        dominantPattern?: string;

        topRecommendation?: string;

        memorySummaries: string[];

        productivityLevel:
        | "low"
        | "medium"
        | "high";

        generatedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Context Engine Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - aggregate AI intelligence
| - build contextual awareness
| - prepare future LLM prompts
| - unify behavioral understanding
|
| IMPORTANT:
| This becomes the future:
| - AI assistant context layer
| - prompt engineering layer
| - intelligent automation context
|
*/

export class ContextEngineService {
    /*
    |--------------------------------------------------------------------------
    | Generate Context
    |--------------------------------------------------------------------------
    */

    static generate():
        AIContext {
        /*
        |--------------------------------------------------------------------------
        | Analytics
        |--------------------------------------------------------------------------
        */

        const engagementScore =
            RuntimeAnalyticsService.getUserEngagementScore();

        /*
        |--------------------------------------------------------------------------
        | Dominant Pattern
        |--------------------------------------------------------------------------
        */

        const dominantPattern =
            PatternDetectionService.getDominantPattern();

        /*
        |--------------------------------------------------------------------------
        | Recommendation
        |--------------------------------------------------------------------------
        */

        const recommendation =
            RecommendationEngineService.getTopRecommendation();

        /*
        |--------------------------------------------------------------------------
        | Memory
        |--------------------------------------------------------------------------
        */

        const memory =
            AIMemoryService.latest(
                10
            );

        /*
        |--------------------------------------------------------------------------
        | Productivity Level
        |--------------------------------------------------------------------------
        */

        let productivityLevel:
            | "low"
            | "medium"
            | "high" =
            "medium";

        if (
            engagementScore >= 75
        ) {
            productivityLevel =
                "high";
        } else if (
            engagementScore < 40
        ) {
            productivityLevel =
                "low";
        }

        /*
        |--------------------------------------------------------------------------
        | Context Object
        |--------------------------------------------------------------------------
        */

        const context:
            AIContext =
        {
            engagementScore,

            dominantPattern:
                dominantPattern?.title,

            topRecommendation:
                recommendation?.title,

            memorySummaries:
                memory.map(
                    (item) =>
                        item.summary
                ),

            productivityLevel,

            generatedAt:
                Date.now(),
        };

        logInfo(
            "AI context generated",
            context
        );

        return context;
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Prompt Context
    |--------------------------------------------------------------------------
    |
    | Future:
    | Used for LLM prompt injection.
    |
    */

    static generatePromptContext():
        string {
        const context =
            this.generate();

        return `
User Productivity Level:
${context.productivityLevel}

Engagement Score:
${context.engagementScore}

Dominant Pattern:
${context.dominantPattern ?? "None"}

Top Recommendation:
${context.topRecommendation ?? "None"}

Memory Signals:
${context.memorySummaries.join(
            ", "
        )}
    `.trim();
    }
}