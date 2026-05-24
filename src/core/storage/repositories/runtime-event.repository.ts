// src/core/storage/repositories/runtime-event.repository.ts

import {
    DatabaseService,
} from "../database.service";

import type {
    RuntimeEventRecord,
} from "../../runtime/runtime-event.store";

import {
    logInfo,
    logError,
} from "../../../shared/utils";

/*
|--------------------------------------------------------------------------
| Runtime Event Repository
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - persist runtime events
| - query event history
| - support analytics
| - provide event sourcing persistence
|
| IMPORTANT:
| This replaces in-memory-only event storage.
|
*/

export class RuntimeEventRepository {
    /*
    |--------------------------------------------------------------------------
    | Create Event
    |--------------------------------------------------------------------------
    */

    static async create(
        event: RuntimeEventRecord
    ): Promise<void> {
        try {
            await DatabaseService.run(
                `
        INSERT INTO runtime_events (
          id,
          type,
          workflow_id,
          session_id,
          execution_id,
          payload,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
                [
                    event.id,

                    event.type,

                    event.workflowId ??
                    null,

                    event.sessionId ??
                    null,

                    event.executionId ??
                    null,

                    JSON.stringify(
                        event.payload ?? {}
                    ),

                    event.timestamp,
                ]
            );

            logInfo(
                "Runtime event persisted",
                {
                    eventId:
                        event.id,
                }
            );
        } catch (error) {
            logError(
                "Failed persisting runtime event",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Find All
    |--------------------------------------------------------------------------
    */

    static async findAll():
        Promise<
            RuntimeEventRecord[]
        > {
        const rows =
            await DatabaseService.getAll<any>(
                `
        SELECT *
        FROM runtime_events
        ORDER BY created_at DESC
        `
            );

        return rows.map(
            (row) => ({
                id: row.id,

                type: row.type,

                workflowId:
                    row.workflow_id,

                sessionId:
                    row.session_id,

                executionId:
                    row.execution_id,

                payload:
                    row.payload
                        ? JSON.parse(
                            row.payload
                        )
                        : {},

                timestamp:
                    row.created_at,
            })
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Find By Workflow
    |--------------------------------------------------------------------------
    */

    static async findByWorkflow(
        workflowId: string
    ): Promise<
        RuntimeEventRecord[]
    > {
        const rows =
            await DatabaseService.getAll<any>(
                `
        SELECT *
        FROM runtime_events
        WHERE workflow_id = ?
        ORDER BY created_at DESC
        `,
                [workflowId]
            );

        return rows.map(
            (row) => ({
                id: row.id,

                type: row.type,

                workflowId:
                    row.workflow_id,

                sessionId:
                    row.session_id,

                executionId:
                    row.execution_id,

                payload:
                    row.payload
                        ? JSON.parse(
                            row.payload
                        )
                        : {},

                timestamp:
                    row.created_at,
            })
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Find By Type
    |--------------------------------------------------------------------------
    */

    static async findByType(
        type: string
    ): Promise<
        RuntimeEventRecord[]
    > {
        const rows =
            await DatabaseService.getAll<any>(
                `
        SELECT *
        FROM runtime_events
        WHERE type = ?
        ORDER BY created_at DESC
        `,
                [type]
            );

        return rows.map(
            (row) => ({
                id: row.id,

                type: row.type,

                workflowId:
                    row.workflow_id,

                sessionId:
                    row.session_id,

                executionId:
                    row.execution_id,

                payload:
                    row.payload
                        ? JSON.parse(
                            row.payload
                        )
                        : {},

                timestamp:
                    row.created_at,
            })
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete All
    |--------------------------------------------------------------------------
    */

    static async clear():
        Promise<void> {
        await DatabaseService.exec(`
      DELETE FROM runtime_events;
    `);

        logInfo(
            "Runtime events cleared"
        );
    }
}