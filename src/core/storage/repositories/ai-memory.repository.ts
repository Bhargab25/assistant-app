// src/core/storage/repositories/ai-memory.repository.ts

import {
    DatabaseService,
} from "../database.service";

import type {
    AIMemoryRecord,
} from "../../ai/ai-memory.service";

import {
    logInfo,
    logError,
} from "../../../shared/utils";

/*
|--------------------------------------------------------------------------
| AI Memory Repository
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - persist AI memory
| - restore learned intelligence
| - support long-term memory
| - provide behavioral persistence
|
| IMPORTANT:
| This becomes the persistence layer for:
| - adaptive intelligence
| - behavioral learning
| - long-term optimization
|
*/

export class AIMemoryRepository {
    /*
    |--------------------------------------------------------------------------
    | Create Memory Record
    |--------------------------------------------------------------------------
    */

    static async create(
        record: AIMemoryRecord
    ): Promise<void> {
        try {
            await DatabaseService.run(
                `
        INSERT INTO ai_memory (
          id,
          category,
          summary,
          confidence,
          metadata,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
                [
                    record.id,

                    record.category,

                    record.summary,

                    record.confidence,

                    JSON.stringify(
                        record.metadata ?? {}
                    ),

                    record.createdAt,
                ]
            );

            logInfo(
                "AI memory persisted",
                {
                    memoryId:
                        record.id,
                }
            );
        } catch (error) {
            logError(
                "Failed persisting AI memory",
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
            AIMemoryRecord[]
        > {
        const rows =
            await DatabaseService.getAll<any>(
                `
        SELECT *
        FROM ai_memory
        ORDER BY created_at DESC
        `
            );

        return rows.map(
            (row) => ({
                id: row.id,

                category:
                    row.category,

                summary:
                    row.summary,

                confidence:
                    row.confidence,

                metadata:
                    row.metadata
                        ? JSON.parse(
                            row.metadata
                        )
                        : {},

                createdAt:
                    row.created_at,
            })
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Find By Category
    |--------------------------------------------------------------------------
    */

    static async findByCategory(
        category: string
    ): Promise<
        AIMemoryRecord[]
    > {
        const rows =
            await DatabaseService.getAll<any>(
                `
        SELECT *
        FROM ai_memory
        WHERE category = ?
        ORDER BY created_at DESC
        `,
                [category]
            );

        return rows.map(
            (row) => ({
                id: row.id,

                category:
                    row.category,

                summary:
                    row.summary,

                confidence:
                    row.confidence,

                metadata:
                    row.metadata
                        ? JSON.parse(
                            row.metadata
                        )
                        : {},

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
        limit = 20
    ): Promise<
        AIMemoryRecord[]
    > {
        const rows =
            await DatabaseService.getAll<any>(
                `
        SELECT *
        FROM ai_memory
        ORDER BY created_at DESC
        LIMIT ?
        `,
                [limit]
            );

        return rows.map(
            (row) => ({
                id: row.id,

                category:
                    row.category,

                summary:
                    row.summary,

                confidence:
                    row.confidence,

                metadata:
                    row.metadata
                        ? JSON.parse(
                            row.metadata
                        )
                        : {},

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
      DELETE FROM ai_memory
      WHERE id = ?
      `,
            [id]
        );

        logInfo(
            "AI memory deleted",
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
      DELETE FROM ai_memory;
    `);

        logInfo(
            "AI memory cleared"
        );
    }
}