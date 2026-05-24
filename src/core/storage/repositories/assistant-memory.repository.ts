// src/core/storage/repositories/assistant-memory.repository.ts

import {
    DatabaseService,
} from "../database.service";

import type {
    AssistantMemoryEntry,
} from "../../assistant/assistant-memory.service";

import {
    logInfo,
    logError,
} from "../../../shared/utils";

/*
|--------------------------------------------------------------------------
| Assistant Memory Repository
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - persist assistant conversational memory
| - restore assistant intelligence history
| - support contextual continuity
| - provide long-term assistant memory
|
| IMPORTANT:
| This becomes the persistence layer for:
| - conversational AI continuity
| - assistant personalization
| - contextual recall
|
*/

export class AssistantMemoryRepository {
    /*
    |--------------------------------------------------------------------------
    | Create Memory Entry
    |--------------------------------------------------------------------------
    */

    static async create(
        entry: AssistantMemoryEntry
    ): Promise<void> {
        try {
            await DatabaseService.run(
                `
        INSERT INTO assistant_memory (
          id,
          summary,
          recommendations,
          insights,
          created_at
        )
        VALUES (?, ?, ?, ?, ?)
        `,
                [
                    entry.id,

                    entry.summary,

                    JSON.stringify(
                        entry.recommendations
                    ),

                    JSON.stringify(
                        entry.insights
                    ),

                    entry.createdAt,
                ]
            );

            logInfo(
                "Assistant memory persisted",
                {
                    memoryId:
                        entry.id,
                }
            );
        } catch (error) {
            logError(
                "Failed persisting assistant memory",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Find All Memory
    |--------------------------------------------------------------------------
    */

    static async findAll():
        Promise<
            AssistantMemoryEntry[]
        > {
        const rows =
            await DatabaseService.getAll<any>(
                `
        SELECT *
        FROM assistant_memory
        ORDER BY created_at DESC
        `
            );

        return rows.map(
            (row) => ({
                id: row.id,

                summary:
                    row.summary,

                recommendations:
                    row.recommendations
                        ? JSON.parse(
                            row.recommendations
                        )
                        : [],

                insights:
                    row.insights
                        ? JSON.parse(
                            row.insights
                        )
                        : [],

                createdAt:
                    row.created_at,
            })
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Latest Memory
    |--------------------------------------------------------------------------
    */

    static async latest(
        limit = 10
    ): Promise<
        AssistantMemoryEntry[]
    > {
        const rows =
            await DatabaseService.getAll<any>(
                `
        SELECT *
        FROM assistant_memory
        ORDER BY created_at DESC
        LIMIT ?
        `,
                [limit]
            );

        return rows.map(
            (row) => ({
                id: row.id,

                summary:
                    row.summary,

                recommendations:
                    row.recommendations
                        ? JSON.parse(
                            row.recommendations
                        )
                        : [],

                insights:
                    row.insights
                        ? JSON.parse(
                            row.insights
                        )
                        : [],

                createdAt:
                    row.created_at,
            })
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Search Memory
    |--------------------------------------------------------------------------
    */

    static async search(
        keyword: string
    ): Promise<
        AssistantMemoryEntry[]
    > {
        const query =
            `%${keyword}%`;

        const rows =
            await DatabaseService.getAll<any>(
                `
        SELECT *
        FROM assistant_memory
        WHERE
          summary LIKE ?
        ORDER BY created_at DESC
        `,
                [query]
            );

        return rows.map(
            (row) => ({
                id: row.id,

                summary:
                    row.summary,

                recommendations:
                    row.recommendations
                        ? JSON.parse(
                            row.recommendations
                        )
                        : [],

                insights:
                    row.insights
                        ? JSON.parse(
                            row.insights
                        )
                        : [],

                createdAt:
                    row.created_at,
            })
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Memory
    |--------------------------------------------------------------------------
    */

    static async delete(
        id: string
    ): Promise<void> {
        await DatabaseService.run(
            `
      DELETE FROM assistant_memory
      WHERE id = ?
      `,
            [id]
        );

        logInfo(
            "Assistant memory deleted",
            {
                memoryId: id,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Clear Memory
    |--------------------------------------------------------------------------
    */

    static async clear():
        Promise<void> {
        await DatabaseService.exec(`
      DELETE FROM assistant_memory;
    `);

        logInfo(
            "Assistant memory cleared"
        );
    }
}