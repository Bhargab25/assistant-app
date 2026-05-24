// src/core/assistant/assistant-learning-loop.service.ts

import {
    AssistantEvolutionService,
} from "./assistant-evolution.service";

import {
    AssistantLearningService,
} from "./assistant-learning.service";

import {
    AssistantMemoryService,
} from "./assistant-memory.service";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Assistant Learning Cycle Result
|--------------------------------------------------------------------------
*/

export type AssistantLearningCycleResult =
    {
        success: boolean;

        intelligenceScore: number;

        memoryStrength: number;

        trend:
        | "improving"
        | "stable"
        | "declining";

        completedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Assistant Learning Loop Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - continuously improve assistant intelligence
| - reinforce assistant memory
| - evolve conversational quality
| - monitor assistant learning trends
|
| IMPORTANT:
| This becomes the autonomous learning
| infrastructure for the assistant layer.
|
*/

export class AssistantLearningLoopService {
    /*
    |--------------------------------------------------------------------------
    | Loop State
    |--------------------------------------------------------------------------
    */

    private static running =
        false;

    /*
    |--------------------------------------------------------------------------
    | Interval Reference
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
        AssistantLearningCycleResult {
        try {
            /*
            |--------------------------------------------------------------------------
            | Reinforce Memory
            |--------------------------------------------------------------------------
            */

            AssistantMemoryService.capture();

            /*
            |--------------------------------------------------------------------------
            | Evaluate Learning
            |--------------------------------------------------------------------------
            */

            const learning =
                AssistantLearningService.evaluate();

            /*
            |--------------------------------------------------------------------------
            | Evolution
            |--------------------------------------------------------------------------
            */

            const evolution =
                AssistantEvolutionService.evolve();

            /*
            |--------------------------------------------------------------------------
            | Result
            |--------------------------------------------------------------------------
            */

            const result:
                AssistantLearningCycleResult =
            {
                success: true,

                intelligenceScore:
                    evolution.intelligenceScore,

                memoryStrength:
                    evolution.memoryStrength,

                trend:
                    AssistantEvolutionService.getTrend(),

                completedAt:
                    Date.now(),
            };

            /*
            |--------------------------------------------------------------------------
            | Logging
            |--------------------------------------------------------------------------
            */

            if (
                result.intelligenceScore >=
                75
            ) {
                logInfo(
                    "Assistant learning cycle successful",
                    result
                );
            } else {
                logWarn(
                    "Assistant learning cycle detected weak intelligence",
                    result
                );
            }

            return result;
        } catch (error) {
            logError(
                "Assistant learning cycle failed",
                error
            );

            return {
                success: false,

                intelligenceScore: 0,

                memoryStrength: 0,

                trend:
                    "declining",

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
            1000 * 60 * 45
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
            | Start Loop
            |--------------------------------------------------------------------------
            */

            this.interval =
                setInterval(
                    () => {
                        this.executeCycle();
                    },
                    intervalMs
                );

            this.running =
                true;

            logInfo(
                "Assistant learning loop started",
                {
                    intervalMs,
                }
            );
        } catch (error) {
            logError(
                "Failed starting assistant learning loop",
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
                "Assistant learning loop stopped"
            );
        } catch (error) {
            logError(
                "Failed stopping assistant learning loop",
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