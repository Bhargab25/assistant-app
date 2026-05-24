// src/core/storage/workflow.repository.ts

import { db } from "./database";

import { Workflow } from "../workflows/types";

/*
|--------------------------------------------------------------------------
| Workflow Repository
|--------------------------------------------------------------------------
|
| This layer isolates all database access.
| Business logic should NEVER directly use SQL.
|
*/

export class WorkflowRepository {
    /*
    |--------------------------------------------------------------------------
    | Create Workflow
    |--------------------------------------------------------------------------
    */

    static async create(workflow: Workflow): Promise<void> {
        const query = `
      INSERT INTO workflows (
        id,
        name,
        workflow_json,
        enabled,
        state,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

        await db.runAsync(query, [
            workflow.id,
            workflow.name,
            JSON.stringify(workflow),
            workflow.enabled ? 1 : 0,
            workflow.state,
            workflow.createdAt,
            workflow.updatedAt,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Workflow
    |--------------------------------------------------------------------------
    */

    static async update(workflow: Workflow): Promise<void> {
        const query = `
      UPDATE workflows
      SET
        name = ?,
        workflow_json = ?,
        enabled = ?,
        state = ?,
        updated_at = ?
      WHERE id = ?;
    `;

        await db.runAsync(query, [
            workflow.name,
            JSON.stringify(workflow),
            workflow.enabled ? 1 : 0,
            workflow.state,
            workflow.updatedAt,
            workflow.id,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Workflow
    |--------------------------------------------------------------------------
    */

    static async delete(id: string): Promise<void> {
        const query = `
      DELETE FROM workflows
      WHERE id = ?;
    `;

        await db.runAsync(query, [id]);
    }

    /*
    |--------------------------------------------------------------------------
    | Find Workflow By ID
    |--------------------------------------------------------------------------
    */

    static async findById(id: string): Promise<Workflow | null> {
        const query = `
      SELECT workflow_json
      FROM workflows
      WHERE id = ?
      LIMIT 1;
    `;

        const result = await db.getFirstAsync<{ workflow_json: string }>(
            query,
            [id]
        );

        if (!result) {
            return null;
        }

        return JSON.parse(result.workflow_json);
    }

    /*
    |--------------------------------------------------------------------------
    | Find All Workflows
    |--------------------------------------------------------------------------
    */

    static async findAll(): Promise<Workflow[]> {
        const query = `
      SELECT workflow_json
      FROM workflows
      ORDER BY created_at DESC;
    `;

        const results = await db.getAllAsync<{ workflow_json: string }>(
            query
        );

        return results.map((item) =>
            JSON.parse(item.workflow_json)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Find Enabled Workflows
    |--------------------------------------------------------------------------
    */

    static async findEnabled(): Promise<Workflow[]> {
        const query = `
      SELECT workflow_json
      FROM workflows
      WHERE enabled = 1;
    `;

        const results = await db.getAllAsync<{ workflow_json: string }>(
            query
        );

        return results.map((item) =>
            JSON.parse(item.workflow_json)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Clear All Workflows
    |--------------------------------------------------------------------------
    */

    static async clearAll(): Promise<void> {
        const query = `
      DELETE FROM workflows;
    `;

        await db.runAsync(query);
    }
}