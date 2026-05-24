// src/core/ai/ai-evolution.service.ts

import {
    AISelfImprovementService,
} from "./ai-self-improvement.service";

import {
    AIOrchestratorService,
} from "./ai-orchestrator.service";

import {
    AIMemoryService,
} from "./ai-memory.service";

import {
    logInfo,
    logWarn,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| AI Evolution State
|--------------------------------------------------------------------------
*/

export type AIEvolutionState =
    {
        generation: number;

        intelligenceScore: number;

        evolvedAt: number;

        improvements: string[];
    };

/*
|--------------------------------------------------------------------------
| AI Evolution Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - evolve AI intelligence quality
| - track intelligence generations
| - improve AI behavior over time
| - maintain long-term adaptation
|
| IMPORTANT:
| This becomes the conceptual foundation for:
| - self-evolving intelligence
| - adaptive automation systems
| - long-term optimization
|
*/

export class AIEvolutionService {
    /*
    |--------------------------------------------------------------------------
    | Evolution History
    |--------------------------------------------------------------------------
    */

    private static history:
        AIEvolutionState[] =
        [];

    /*
    |--------------------------------------------------------------------------
    | Run Evolution Cycle
    |--------------------------------------------------------------------------
    */

    static evolve():
        AIEvolutionState {
        /*
        |--------------------------------------------------------------------------
        | Evaluate AI
        |--------------------------------------------------------------------------
        */

        const evaluation =
            AISelfImprovementService.evaluate();

        /*
        |--------------------------------------------------------------------------
        | Generate Snapshot
        |--------------------------------------------------------------------------
        */

        const snapshot =
            AIOrchestratorService.generateSnapshot();

        /*
        |--------------------------------------------------------------------------
        | Intelligence Score
        |--------------------------------------------------------------------------
        */

        const intelligenceScore =
            evaluation.score;

        /*
        |--------------------------------------------------------------------------
        | Evolution Generation
        |--------------------------------------------------------------------------
        */

        const generation =
            this.history.length + 1;

        /*
        |--------------------------------------------------------------------------
        | Improvements
        |--------------------------------------------------------------------------
        */

        const improvements =
            evaluation.improvements;

        /*
        |--------------------------------------------------------------------------
        | Evolution State
        |--------------------------------------------------------------------------
        */

        const state:
            AIEvolutionState =
        {
            generation,

            intelligenceScore,

            evolvedAt:
                Date.now(),

            improvements,
        };

        /*
        |--------------------------------------------------------------------------
        | Persist Evolution
        |--------------------------------------------------------------------------
        */

        this.history.push(
            state
        );

        /*
        |--------------------------------------------------------------------------
        | Memory Reinforcement
        |--------------------------------------------------------------------------
        */

        if (
            snapshot.memory.length <
            10
        ) {
            AIMemoryService.buildMemory();
        }

        /*
        |--------------------------------------------------------------------------
        | Logging
        |--------------------------------------------------------------------------
        */

        if (
            intelligenceScore >=
            80
        ) {
            logInfo(
                "AI evolution cycle successful",
                {
                    generation,

                    intelligenceScore,
                }
            );
        } else {
            logWarn(
                "AI evolution cycle detected weak intelligence",
                {
                    generation,

                    intelligenceScore,
                }
            );
        }

        return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Latest Evolution
    |--------------------------------------------------------------------------
    */

    static latest():
        | AIEvolutionState
        | undefined {
        return this.history.at(
            -1
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Evolution History
    |--------------------------------------------------------------------------
    */

    static getHistory():
        AIEvolutionState[] {
        return this.history;
    }

    /*
    |--------------------------------------------------------------------------
    | Intelligence Trend
    |--------------------------------------------------------------------------
    */

    static getTrend():
        "improving" |
        "stable" |
        "declining" {
        if (
            this.history.length < 2
        ) {
            return "stable";
        }

        const latest =
            this.history.at(-1);

        const previous =
            this.history.at(-2);

        if (
            !latest ||
            !previous
        ) {
            return "stable";
        }

        if (
            latest.intelligenceScore >
            previous.intelligenceScore
        ) {
            return "improving";
        }

        if (
            latest.intelligenceScore <
            previous.intelligenceScore
        ) {
            return "declining";
        }

        return "stable";
    }

    /*
    |--------------------------------------------------------------------------
    | Current Intelligence Score
    |--------------------------------------------------------------------------
    */

    static getCurrentScore():
        number {
        return (
            this.latest()
                ?.intelligenceScore ??
            0
        );
    }
}