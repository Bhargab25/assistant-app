// src/core/ai/ai-self-improvement.service.ts

import {
    AIOrchestratorService,
} from "./ai-orchestrator.service";

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
    logWarn,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Self Improvement Report
|--------------------------------------------------------------------------
*/

export type SelfImprovementReport =
    {
        score: number;

        strengths: string[];

        weaknesses: string[];

        improvements: string[];

        generatedAt: number;
    };

/*
|--------------------------------------------------------------------------
| AI Self Improvement Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - evaluate AI effectiveness
| - detect weak intelligence areas
| - generate self-improvement signals
| - optimize recommendation quality
|
| IMPORTANT:
| This becomes the foundation for:
| - self-learning systems
| - adaptive intelligence
| - evolving automation quality
|
*/

export class AISelfImprovementService {
    /*
    |--------------------------------------------------------------------------
    | Evaluate AI Runtime
    |--------------------------------------------------------------------------
    */

    static evaluate():
        SelfImprovementReport {
        /*
        |--------------------------------------------------------------------------
        | Runtime Snapshot
        |--------------------------------------------------------------------------
        */

        const snapshot =
            AIOrchestratorService.generateSnapshot();

        const analytics =
            RuntimeAnalyticsService.generateSummary();

        const patterns =
            PatternDetectionService.detect();

        const recommendations =
            RecommendationEngineService.generate();

        /*
        |--------------------------------------------------------------------------
        | Evaluation
        |--------------------------------------------------------------------------
        */

        const strengths:
            string[] = [];

        const weaknesses:
            string[] = [];

        const improvements:
            string[] = [];

        let score = 50;

        /*
        |--------------------------------------------------------------------------
        | Strong Engagement
        |--------------------------------------------------------------------------
        */

        if (
            analytics.workflowSuccessRate >=
            80
        ) {
            strengths.push(
                "High workflow completion rate"
            );

            score += 10;
        } else {
            weaknesses.push(
                "Low workflow completion rate"
            );

            improvements.push(
                "Improve reminder timing recommendations"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Pattern Detection
        |--------------------------------------------------------------------------
        */

        if (
            patterns.length >= 3
        ) {
            strengths.push(
                "Behavioral patterns detected successfully"
            );

            score += 10;
        } else {
            weaknesses.push(
                "Limited behavioral pattern detection"
            );

            improvements.push(
                "Collect more interaction history"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Recommendation Quality
        |--------------------------------------------------------------------------
        */

        if (
            recommendations.length >=
            3
        ) {
            strengths.push(
                "Recommendation engine is active"
            );

            score += 10;
        } else {
            weaknesses.push(
                "Weak recommendation generation"
            );

            improvements.push(
                "Expand recommendation logic"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | AI Memory Strength
        |--------------------------------------------------------------------------
        */

        if (
            snapshot.memory.length >=
            5
        ) {
            strengths.push(
                "AI memory accumulation is healthy"
            );

            score += 10;
        } else {
            weaknesses.push(
                "AI memory is still limited"
            );

            improvements.push(
                "Increase memory persistence frequency"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Notification Failures
        |--------------------------------------------------------------------------
        */

        if (
            analytics.notificationFailureRate >
            15
        ) {
            weaknesses.push(
                "Notification delivery reliability is weak"
            );

            improvements.push(
                "Improve alarm registration and retry handling"
            );

            score -= 10;
        }

        /*
        |--------------------------------------------------------------------------
        | Clamp Score
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
            SelfImprovementReport =
        {
            score,

            strengths,

            weaknesses,

            improvements,

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
                "AI self-evaluation strong",
                {
                    score,
                }
            );
        } else {
            logWarn(
                "AI self-evaluation detected weaknesses",
                {
                    score,
                }
            );
        }

        return report;
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