// src/core/ai/ai-learning-loop.service.ts

import {
    AIEvolutionService,
} from "./ai-evolution.service";

import {
    AIOrchestratorService,
} from "./ai-orchestrator.service";

import {
    AISelfImprovementService,
} from "./ai-self-improvement.service";

import {
    RuntimeAnalyticsService,
} from "../runtime/runtime-analytics.service";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Learning Cycle Result
|--------------------------------------------------------------------------
*/

export type LearningCycleResult =
    {
        success: boolean;

        evolutionScore: number;

        intelligenceTrend:
        | "improving"
        | "stable"
        | "declining";

        improvements: string[];

        analyticsScore: number;

        completedAt: number;
    };

/*
|--------------------------------------------------------------------------
| AI Learning Loop Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - continuously improve intelligence
| - run periodic evolution cycles
| - reinforce adaptive learning
| - evaluate behavioral improvements
|
| IMPORTANT:
| This becomes the foundation for:
| - autonomous optimization
| - continuous intelligence refinement
| - adaptive AI behavior
|
*/

export class AILearningLoopService {
    /*
    |--------------------------------------------------------------------------
    | Learning State
    |--------------------------------------------------------------------------
    */

    private static running =
        false;

    /*
    |--------------------------------------------------------------------------
    | Learning Interval
    |--------------------------------------------------------------------------
    */

    private static interval:
        NodeJS.Timeout | null =
        null;

    /*
    |--------------------------------------------------------------------------
    | Execute Learning Cycle
    |--------------------------------------------------------------------------
    */

    static executeCycle():
        LearningCycleResult {
        try {
            /*
            |--------------------------------------------------------------------------
            | Generate Snapshot
            |--------------------------------------------------------------------------
            */

            AIOrchestratorService.generateSnapshot();

            /*
            |--------------------------------------------------------------------------
            | Self Evaluation
            |--------------------------------------------------------------------------
            */

            const evaluation =
                AISelfImprovementService.evaluate();

            /*
            |--------------------------------------------------------------------------
            | Evolution
            |--------------------------------------------------------------------------
            */

            const evolution =
                AIEvolutionService.evolve();

            /*
            |--------------------------------------------------------------------------
            | Analytics
            |--------------------------------------------------------------------------
            */

            const analytics =
                RuntimeAnalyticsService.generateSummary();

            /*
            |--------------------------------------------------------------------------
            | Result
            |--------------------------------------------------------------------------
            */

            const result:
                LearningCycleResult =
            {
                success: true,

                evolutionScore:
                    evolution.intelligenceScore,

                intelligenceTrend:
                    AIEvolutionService.getTrend(),

                improvements:
                    evaluation.improvements,

                analyticsScore:
                    analytics.workflowSuccessRate,

                completedAt:
                    Date.now(),
            };

            /*
            |--------------------------------------------------------------------------
            | Logging
            |--------------------------------------------------------------------------
            */

            if (
                result.evolutionScore >=
                75
            ) {
                logInfo(
                    "AI learning cycle successful",
                    result
                );
            } else {
                logWarn(
                    "AI learning cycle detected weak intelligence",
                    result
                );
            }

            return result;
        } catch (error) {
            logError(
                "AI learning cycle failed",
                error
            );

            return {
                success: false,

                evolutionScore: 0,

                intelligenceTrend:
                    "declining",

                improvements: [],

                analyticsScore: 0,

                completedAt:
                    Date.now(),
            };
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Start Learning Loop
    |--------------------------------------------------------------------------
    */

    static start(
        intervalMs =
            1000 * 60 * 30
    ): void {
        try {
            /*
            |--------------------------------------------------------------------------
            | Prevent Duplicate Start
            |--------------------------------------------------------------------------
            */

            if (
                this.running
            ) {
                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Start Interval
            |--------------------------------------------------------------------------
            */

            this.interval =
                setInterval(
                    () => {
                        this.executeCycle();
                    },
                    intervalMs
                );

            this.running = true;

            logInfo(
                "AI learning loop started",
                {
                    intervalMs,
                }
            );
        } catch (error) {
            logError(
                "Failed starting AI learning loop",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Stop Learning Loop
    |--------------------------------------------------------------------------
    */

    static stop():
        void {
        try {
            if (
                this.interval
            ) {
                clearInterval(
                    this.interval
                );

                this.interval =
                    null;
            }

            this.running =
                false;

            logInfo(
                "AI learning loop stopped"
            );
        } catch (error) {
            logError(
                "Failed stopping AI learning loop",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Is Running
    |--------------------------------------------------------------------------
    */

    static isRunning():
        boolean {
        return this.running;
    }
}