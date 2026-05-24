// src/core/ai/ai-orchestrator.service.ts

import {
    InsightEngineService,
} from "./insight-engine.service";

import {
    RecommendationEngineService,
} from "./recommendation-engine.service";

import {
    PatternDetectionService,
} from "./pattern-detection.service";

import {
    AdaptiveSchedulerService,
} from "./adaptive-scheduler.service";

import {
    AIMemoryService,
} from "./ai-memory.service";

import {
    ContextEngineService,
} from "./context-engine.service";

import {
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| AI Runtime Snapshot
|--------------------------------------------------------------------------
*/

export type AIRuntimeSnapshot =
    {
        insights: ReturnType<
            typeof InsightEngineService.generateInsights
        >;

        recommendations: ReturnType<
            typeof RecommendationEngineService.generate
        >;

        patterns: ReturnType<
            typeof PatternDetectionService.detect
        >;

        schedules: ReturnType<
            typeof AdaptiveSchedulerService.generateSuggestions
        >;

        memory: ReturnType<
            typeof AIMemoryService.getAll
        >;

        context: ReturnType<
            typeof ContextEngineService.generate
        >;

        generatedAt: number;
    };

/*
|--------------------------------------------------------------------------
| AI Orchestrator Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - orchestrate all AI systems
| - unify intelligence pipelines
| - generate runtime AI snapshots
| - manage behavioral intelligence
| - future AI assistant integration
|
| IMPORTANT:
| This becomes the central AI brain coordinator.
|
*/

export class AIOrchestratorService {
    /*
    |--------------------------------------------------------------------------
    | Generate Runtime Snapshot
    |--------------------------------------------------------------------------
    */

    static generateSnapshot():
        AIRuntimeSnapshot {
        try {
            /*
            |--------------------------------------------------------------------------
            | Generate AI Systems
            |--------------------------------------------------------------------------
            */

            const insights =
                InsightEngineService.generateInsights();

            const recommendations =
                RecommendationEngineService.generate();

            const patterns =
                PatternDetectionService.detect();

            const schedules =
                AdaptiveSchedulerService.generateSuggestions();

            /*
            |--------------------------------------------------------------------------
            | Build AI Memory
            |--------------------------------------------------------------------------
            */

            AIMemoryService.buildMemory();

            const memory =
                AIMemoryService.getAll();

            /*
            |--------------------------------------------------------------------------
            | Build Context
            |--------------------------------------------------------------------------
            */

            const context =
                ContextEngineService.generate();

            /*
            |--------------------------------------------------------------------------
            | Snapshot
            |--------------------------------------------------------------------------
            */

            const snapshot:
                AIRuntimeSnapshot =
            {
                insights,

                recommendations,

                patterns,

                schedules,

                memory,

                context,

                generatedAt:
                    Date.now(),
            };

            logInfo(
                "AI runtime snapshot generated",
                {
                    insights:
                        insights.length,

                    recommendations:
                        recommendations.length,

                    patterns:
                        patterns.length,

                    schedules:
                        schedules.length,

                    memory:
                        memory.length,
                }
            );

            return snapshot;
        } catch (error) {
            logError(
                "AI orchestrator failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Get AI Summary
    |--------------------------------------------------------------------------
    */

    static getSummary() {
        const snapshot =
            this.generateSnapshot();

        return {
            insights:
                snapshot.insights.length,

            recommendations:
                snapshot
                    .recommendations
                    .length,

            patterns:
                snapshot.patterns.length,

            schedules:
                snapshot.schedules.length,

            memory:
                snapshot.memory.length,

            productivity:
                snapshot.context
                    .productivityLevel,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Assistant Context
    |--------------------------------------------------------------------------
    |
    | Future:
    | Used for LLM/assistant prompt injection.
    |
    */

    static generateAssistantContext():
        string {
        return ContextEngineService.generatePromptContext();
    }
}