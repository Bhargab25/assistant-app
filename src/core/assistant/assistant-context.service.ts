// src/core/assistant/assistant-context.service.ts

import {
    logInfo,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Assistant Context
|--------------------------------------------------------------------------
*/

export type AssistantContext =
    {
        runtime: {
            healthy: boolean;

            activeExecutions: number;

            activeSessions: number;
        };

        analytics: {
            engagementScore: number;

            workflowSuccessRate: number;

            reminderCompletionRate: number;
        };

        ai: {
            productivityLevel:
            | "low"
            | "medium"
            | "high";

            topRecommendation?: string;

            dominantPattern?: string;
        };

        generatedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Assistant Context Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - prepare assistant intelligence context
| - aggregate runtime + AI state
| - provide future LLM prompt context
| - unify platform intelligence
|
| IMPORTANT:
| This becomes the foundation for:
| - AI assistant chat
| - voice assistant
| - smart workflow builder
| - conversational automation
|
*/

export class AssistantContextService {
    /*
    |--------------------------------------------------------------------------
    | Generate Context
    |--------------------------------------------------------------------------
    */

    static generate():
        AssistantContext {
        const { RuntimeHealthService } = require("../runtime/runtime-health.service");
        const { RuntimeMetricsService } = require("../runtime/runtime-metrics.service");
        const { RuntimeAnalyticsService } = require("../runtime/runtime-analytics.service");
        const { AIOrchestratorService } = require("../ai/ai-orchestrator.service");

        /*
        |--------------------------------------------------------------------------
        | Runtime Health
        |--------------------------------------------------------------------------
        */

        const health =
            RuntimeHealthService.generateReport();

        /*
        |--------------------------------------------------------------------------
        | Metrics
        |--------------------------------------------------------------------------
        */

        const metrics =
            RuntimeMetricsService.snapshot();

        /*
        |--------------------------------------------------------------------------
        | Analytics
        |--------------------------------------------------------------------------
        */

        const analytics =
            RuntimeAnalyticsService.generateSummary();

        /*
        |--------------------------------------------------------------------------
        | AI Snapshot
        |--------------------------------------------------------------------------
        */

        const ai =
            AIOrchestratorService.generateSnapshot();

        /*
        |--------------------------------------------------------------------------
        | Context
        |--------------------------------------------------------------------------
        */

        const context:
            AssistantContext =
        {
            runtime: {
                healthy:
                    health.healthy,

                activeExecutions:
                    metrics.workflows
                        .activeExecutions,

                activeSessions:
                    metrics.reminders
                        .activeSessions,
            },

            analytics: {
                engagementScore:
                    analytics.workflowSuccessRate,

                workflowSuccessRate:
                    analytics.workflowSuccessRate,

                reminderCompletionRate:
                    RuntimeAnalyticsService.getReminderCompletionRate(),
            },

            ai: {
                productivityLevel:
                    ai.context
                        .productivityLevel,

                topRecommendation:
                    ai.context
                        .topRecommendation,

                dominantPattern:
                    ai.context
                        .dominantPattern,
            },

            generatedAt:
                Date.now(),
        };

        logInfo(
            "Assistant context generated",
            context
        );

        return context;
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Prompt
    |--------------------------------------------------------------------------
    |
    | Future:
    | Used for conversational AI prompts.
    |
    */

    static generatePrompt():
        string {
        const context =
            this.generate();

        return `
Runtime Healthy:
${context.runtime.healthy}

Active Executions:
${context.runtime.activeExecutions}

Active Sessions:
${context.runtime.activeSessions}

Workflow Success Rate:
${context.analytics.workflowSuccessRate}%

Reminder Completion Rate:
${context.analytics.reminderCompletionRate}%

Productivity Level:
${context.ai.productivityLevel}

Top Recommendation:
${context.ai.topRecommendation ?? "None"}

Dominant Pattern:
${context.ai.dominantPattern ?? "None"}
    `.trim();
    }
}