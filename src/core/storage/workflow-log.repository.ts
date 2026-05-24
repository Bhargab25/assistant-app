// src/core/storage/workflow-log.repository.ts

import { db } from "./database";

/*
|--------------------------------------------------------------------------
| Workflow Log Types
|--------------------------------------------------------------------------
*/

export type WorkflowLog = {
    id?: number;

    workflowId: string;

    eventType: string;

    status: string;

    message?: string;

    createdAt: string;
};

/*
|--------------------------------------------------------------------------
| Workflow Log Repository
|--------------------------------------------------------------------------
|
| Used for:
| - debugging
| - retry tracking
| - workflow history
| - analytics
| - future AI learning
|
*/

export class WorkflowLogRepository {
    /*
    |--------------------------------------------------------------------------
    | Create Log
    |--------------------------------------------------------------------------
    */

    static async create(log: WorkflowLog): Promise<void> {
        const query = `
      INSERT INTO workflow_logs (
        workflow_id,
        event_type,
        status,
        message,
        created_at
      )
      VALUES (?, ?, ?, ?, ?);
    `;

        await db.runAsync(query, [
            log.workflowId,
            log.eventType,
            log.status,
            log.message ?? null,
            log.createdAt,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Find Logs By Workflow ID
    |--------------------------------------------------------------------------
    */

    static async findByWorkflowId(
        workflowId: string
    ): Promise<WorkflowLog[]> {
        const query = `
      SELECT *
      FROM workflow_logs
      WHERE workflow_id = ?
      ORDER BY created_at DESC;
    `;

        const results = await db.getAllAsync<{
            id: number;
            workflow_id: string;
            event_type: string;
            status: string;
            message: string | null;
            created_at: string;
        }>(query, [workflowId]);

        return results.map((item) => ({
            id: item.id,
            workflowId: item.workflow_id,
            eventType: item.event_type,
            status: item.status,
            message: item.message ?? undefined,
            createdAt: item.created_at,
        }));
    }

    /*
    |--------------------------------------------------------------------------
    | Find Recent Logs
    |--------------------------------------------------------------------------
    */

    static async findRecent(
        limit: number = 50
    ): Promise<WorkflowLog[]> {
        const query = `
      SELECT *
      FROM workflow_logs
      ORDER BY created_at DESC
      LIMIT ?;
    `;

        const results = await db.getAllAsync<{
            id: number;
            workflow_id: string;
            event_type: string;
            status: string;
            message: string | null;
            created_at: string;
        }>(query, [limit]);

        return results.map((item) => ({
            id: item.id,
            workflowId: item.workflow_id,
            eventType: item.event_type,
            status: item.status,
            message: item.message ?? undefined,
            createdAt: item.created_at,
        }));
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Logs By Workflow ID
    |--------------------------------------------------------------------------
    */

    static async deleteByWorkflowId(
        workflowId: string
    ): Promise<void> {
        const query = `
      DELETE FROM workflow_logs
      WHERE workflow_id = ?;
    `;

        await db.runAsync(query, [workflowId]);
    }

    /*
    |--------------------------------------------------------------------------
    | Clear All Logs
    |--------------------------------------------------------------------------
    */

    static async clearAll(): Promise<void> {
        const query = `
      DELETE FROM workflow_logs;
    `;

        await db.runAsync(query);
    }
}