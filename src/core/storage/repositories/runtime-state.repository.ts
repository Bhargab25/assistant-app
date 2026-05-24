// src/core/storage/repositories/runtime-state.repository.ts

import {
    DatabaseService,
} from "../database.service";

import type {
    RuntimeStateRecord,
} from "../../runtime/runtime-state.service";

import {
    logInfo,
    logError,
} from "../../../shared/utils";

/*
|--------------------------------------------------------------------------
| Runtime State Repository
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - persist runtime execution state
| - restore workflow executions
| - support crash recovery
| - maintain runtime durability
|
| IMPORTANT:
| This becomes critical for:
| - app restarts
| - background restoration
| - crash recovery
| - execution persistence
|
*/

export class RuntimeStateRepository {
    /*
    |--------------------------------------------------------------------------
    | Upsert Runtime State
    |--------------------------------------------------------------------------
    */

    static async save(
        state: RuntimeStateRecord
    ): Promise<void> {
        try {
            await DatabaseService.run(
                `
        INSERT OR REPLACE INTO runtime_states (
          workflow_id,
          execution_id,
          state,
          metadata,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?)
        `,
                [
                    state.workflowId,

                    state.executionId,

                    state.state,

                    JSON.stringify(
                        state.metadata ?? {}
                    ),

                    state.updatedAt,
                ]
            );

            logInfo(
                "Runtime state persisted",
                {
                    workflowId:
                        state.workflowId,

                    state:
                        state.state,
                }
            );
        } catch (error) {
            logError(
                "Failed persisting runtime state",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Find By Workflow
    |--------------------------------------------------------------------------
    */

    static async findByWorkflow(
        workflowId: string
    ): Promise<
        RuntimeStateRecord | null
    > {
        const row =
            await DatabaseService.getFirst<any>(
                `
        SELECT *
        FROM runtime_states
        WHERE workflow_id = ?
        LIMIT 1
        `,
                [workflowId]
            );

        if (!row) {
            return null;
        }

        return {
            workflowId:
                row.workflow_id,

            executionId:
                row.execution_id,

            state: row.state,

            metadata:
                row.metadata
                    ? JSON.parse(
                        row.metadata
                    )
                    : {},

            updatedAt:
                row.updated_at,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Find All
    |--------------------------------------------------------------------------
    */

    static async findAll():
        Promise<
            RuntimeStateRecord[]
        > {
        const rows =
            await DatabaseService.getAll<any>(
                `
        SELECT *
        FROM runtime_states
        ORDER BY updated_at DESC
        `
            );

        return rows.map(
            (row) => ({
                workflowId:
                    row.workflow_id,

                executionId:
                    row.execution_id,

                state: row.state,

                metadata:
                    row.metadata
                        ? JSON.parse(
                            row.metadata
                        )
                        : {},

                updatedAt:
                    row.updated_at,
            })
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Active Executions
    |--------------------------------------------------------------------------
    */

    static async findActive():
        Promise<
            RuntimeStateRecord[]
        > {
        const rows =
            await DatabaseService.getAll<any>(
                `
        SELECT *
        FROM runtime_states
        WHERE state IN (
          'executing',
          'waiting_response',
          'retry_pending'
        )
        ORDER BY updated_at DESC
        `
            );

        return rows.map(
            (row) => ({
                workflowId:
                    row.workflow_id,

                executionId:
                    row.execution_id,

                state: row.state,

                metadata:
                    row.metadata
                        ? JSON.parse(
                            row.metadata
                        )
                        : {},

                updatedAt:
                    row.updated_at,
            })
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Workflow State
    |--------------------------------------------------------------------------
    */

    static async delete(
        workflowId: string
    ): Promise<void> {
        await DatabaseService.run(
            `
      DELETE FROM runtime_states
      WHERE workflow_id = ?
      `,
            [workflowId]
        );

        logInfo(
            "Runtime state deleted",
            {
                workflowId,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Clear All States
    |--------------------------------------------------------------------------
    */

    static async clear():
        Promise<void> {
        await DatabaseService.exec(`
      DELETE FROM runtime_states;
    `);

        logInfo(
            "Runtime states cleared"
        );
    }
}