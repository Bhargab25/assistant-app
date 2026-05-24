// src/core/assistant/assistant-evolution.service.ts

import {
    AssistantLearningService,
} from "./assistant-learning.service";

import {
    AssistantMemoryService,
} from "./assistant-memory.service";

import {
    AssistantOrchestratorService,
} from "./assistant-orchestrator.service";

import {
    logInfo,
    logWarn,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Assistant Evolution State
|--------------------------------------------------------------------------
*/

export type AssistantEvolutionState =
    {
        generation: number;

        intelligenceScore: number;

        memoryStrength: number;

        evolvedAt: number;

        improvements: string[];
    };

/*
|--------------------------------------------------------------------------
| Assistant Evolution Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - evolve assistant intelligence
| - improve conversational quality
| - reinforce contextual memory
| - track assistant generations
|
| IMPORTANT:
| This becomes the conceptual foundation for:
| - adaptive conversational AI
| - evolving assistant behavior
| - personalized assistant intelligence
|
*/

export class AssistantEvolutionService {
    /*
    |--------------------------------------------------------------------------
    | Evolution History
    |--------------------------------------------------------------------------
    */

    private static history:
        AssistantEvolutionState[] =
        [];

    /*
    |--------------------------------------------------------------------------
    | Execute Evolution Cycle
    |--------------------------------------------------------------------------
    */

    static evolve():
        AssistantEvolutionState {
        /*
        |--------------------------------------------------------------------------
        | Learning Evaluation
        |--------------------------------------------------------------------------
        */

        const learning =
            AssistantLearningService.evaluate();

        /*
        |--------------------------------------------------------------------------
        | Reinforce Memory
        |--------------------------------------------------------------------------
        */

        AssistantLearningService.reinforce();

        /*
        |--------------------------------------------------------------------------
        | Fresh Response
        |--------------------------------------------------------------------------
        */

        AssistantOrchestratorService.generateResponse();

        /*
        |--------------------------------------------------------------------------
        | Memory Strength
        |--------------------------------------------------------------------------
        */

        const memoryStrength =
            Math.min(
                100,
                AssistantMemoryService
                    .getAll()
                    .length * 10
            );

        /*
        |--------------------------------------------------------------------------
        | Improvements
        |--------------------------------------------------------------------------
        */

        const improvements:
            string[] = [];

        if (
            learning
                .recommendationQuality <
            60
        ) {
            improvements.push(
                "Improve recommendation diversity"
            );
        }

        if (
            learning
                .engagementLevel <
            70
        ) {
            improvements.push(
                "Increase assistant engagement intelligence"
            );
        }

        if (
            memoryStrength < 50
        ) {
            improvements.push(
                "Expand conversational memory depth"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Evolution State
        |--------------------------------------------------------------------------
        */

        const state:
            AssistantEvolutionState =
        {
            generation:
                this.history.length +
                1,

            intelligenceScore:
                learning.score,

            memoryStrength,

            evolvedAt:
                Date.now(),

            improvements,
        };

        /*
        |--------------------------------------------------------------------------
        | Persist History
        |--------------------------------------------------------------------------
        */

        this.history.push(
            state
        );

        /*
        |--------------------------------------------------------------------------
        | Logging
        |--------------------------------------------------------------------------
        */

        if (
            state.intelligenceScore >=
            80
        ) {
            logInfo(
                "Assistant evolution successful",
                {
                    generation:
                        state.generation,

                    intelligenceScore:
                        state.intelligenceScore,
                }
            );
        } else {
            logWarn(
                "Assistant evolution detected weaknesses",
                {
                    generation:
                        state.generation,

                    intelligenceScore:
                        state.intelligenceScore,
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
        | AssistantEvolutionState
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
        AssistantEvolutionState[] {
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
    | Current Score
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