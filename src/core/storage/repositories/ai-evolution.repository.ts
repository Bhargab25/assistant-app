// src/core/storage/repositories/ai-evolution.repository.ts

import {
    DatabaseService,
} from "../database.service";

import type {
    AIEvolutionState,
} from "../../ai/ai-evolution.service";

import {
    logInfo,
    logError,
} from "../../../shared/utils";

/*
|--------------------------------------------------------------------------
| AI Evolution Repository
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - persist AI evolution history
| - track intelligence generations
| - support long-term AI analytics
| - restore evolution state
|
| IMPORTANT:
| This becomes the persistence layer for:
| - self-improving intelligence
| - AI trend analysis
| - adaptive learning history
|
*/

export class AIEvolutionRepository {
    /*
    |--------------------------------------------------------------------------
    | Create Evolution Record
    |--------------------------------------------------------------------------
    */

    static async create(
        evolution: AIEvolutionState
    ): Promise<void> {
        try {
            await DatabaseService.run(
                `
        INSERT INTO ai_evolution (
          generation,
          intelligence_score,
          improvements,
          evolved_at
        )
        VALUES (?, ?, ?, ?)
        `,
                [
                    evolution.generation,

                    evolution.intelligenceScore,

                    JSON.stringify(
                        evolution.improvements
                    ),

                    evolution.evolvedAt,
                ]
            );

            logInfo(
                "AI evolution persisted",
                {
                    generation:
                        evolution.generation,
                }
            );
        } catch (error) {
            logError(
                "Failed persisting AI evolution",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Find All Evolution History
    |--------------------------------------------------------------------------
    */

    static async findAll():
        Promise<
            AIEvolutionState[]
        > {
        const rows =
            await DatabaseService.getAll<any>(
                `
        SELECT *
        FROM ai_evolution
        ORDER BY generation DESC
        `
            );

        return rows.map(
            (row) => ({
                generation:
                    row.generation,

                intelligenceScore:
                    row.intelligence_score,

                improvements:
                    row.improvements
                        ? JSON.parse(
                            row.improvements
                        )
                        : [],

                evolvedAt:
                    row.evolved_at,
            })
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Latest Evolution
    |--------------------------------------------------------------------------
    */

    static async latest():
        Promise<
            AIEvolutionState | null
        > {
        const row =
            await DatabaseService.getFirst<any>(
                `
        SELECT *
        FROM ai_evolution
        ORDER BY generation DESC
        LIMIT 1
        `
            );

        if (!row) {
            return null;
        }

        return {
            generation:
                row.generation,

            intelligenceScore:
                row.intelligence_score,

            improvements:
                row.improvements
                    ? JSON.parse(
                        row.improvements
                    )
                    : [],

            evolvedAt:
                row.evolved_at,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Find By Generation
    |--------------------------------------------------------------------------
    */

    static async findByGeneration(
        generation: number
    ): Promise<
        AIEvolutionState | null
    > {
        const row =
            await DatabaseService.getFirst<any>(
                `
        SELECT *
        FROM ai_evolution
        WHERE generation = ?
        LIMIT 1
        `,
                [generation]
            );

        if (!row) {
            return null;
        }

        return {
            generation:
                row.generation,

            intelligenceScore:
                row.intelligence_score,

            improvements:
                row.improvements
                    ? JSON.parse(
                        row.improvements
                    )
                    : [],

            evolvedAt:
                row.evolved_at,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Intelligence Trend
    |--------------------------------------------------------------------------
    */

    static async getTrend():
        Promise<
            "improving" |
            "stable" |
            "declining"
        > {
        const history =
            await this.findAll();

        if (
            history.length < 2
        ) {
            return "stable";
        }

        const latest =
            history[0];

        const previous =
            history[1];

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
    | Clear Evolution History
    |--------------------------------------------------------------------------
    */

    static async clear():
        Promise<void> {
        await DatabaseService.exec(`
      DELETE FROM ai_evolution;
    `);

        logInfo(
            "AI evolution history cleared"
        );
    }
}