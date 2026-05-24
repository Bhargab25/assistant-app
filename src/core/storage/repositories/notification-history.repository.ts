// src/core/storage/repositories/notification-history.repository.ts

import {
    DatabaseService,
} from "../database.service";

import type {
    NotificationHistoryRecord,
    NotificationStatus,
} from "../../notifications/notification-history.service";

import {
    logInfo,
    logError,
} from "../../../shared/utils";

/*
|--------------------------------------------------------------------------
| Notification History Repository
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - persist notification lifecycle
| - restore notification history
| - support analytics
| - provide delivery observability
|
| IMPORTANT:
| This becomes critical for:
| - notification analytics
| - retry systems
| - engagement analysis
| - delivery diagnostics
|
*/

export class NotificationHistoryRepository {
    /*
    |--------------------------------------------------------------------------
    | Create Record
    |--------------------------------------------------------------------------
    */

    static async create(
        record: NotificationHistoryRecord
    ): Promise<void> {
        try {
            await DatabaseService.run(
                `
        INSERT INTO notification_history (
          id,
          workflow_id,
          session_id,
          notification_id,
          title,
          body,
          status,
          metadata,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
                [
                    record.id,

                    record.workflowId,

                    record.sessionId ??
                    null,

                    record.notificationId ??
                    null,

                    record.title,

                    record.body,

                    record.status,

                    JSON.stringify(
                        record.metadata ?? {}
                    ),

                    record.createdAt,

                    record.updatedAt,
                ]
            );

            logInfo(
                "Notification history persisted",
                {
                    notificationId:
                        record.id,
                }
            );
        } catch (error) {
            logError(
                "Failed persisting notification history",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Update Status
    |--------------------------------------------------------------------------
    */

    static async updateStatus(
        id: string,
        status: NotificationStatus,
        metadata?: Record<
            string,
            unknown
        >
    ): Promise<void> {
        try {
            await DatabaseService.run(
                `
        UPDATE notification_history
        SET
          status = ?,
          metadata = ?,
          updated_at = ?
        WHERE id = ?
        `,
                [
                    status,

                    JSON.stringify(
                        metadata ?? {}
                    ),

                    Date.now(),

                    id,
                ]
            );

            logInfo(
                "Notification status updated",
                {
                    id,

                    status,
                }
            );
        } catch (error) {
            logError(
                "Failed updating notification status",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Find By ID
    |--------------------------------------------------------------------------
    */

    static async findById(
        id: string
    ): Promise<
        NotificationHistoryRecord | null
    > {
        const row =
            await DatabaseService.getFirst<any>(
                `
        SELECT *
        FROM notification_history
        WHERE id = ?
        LIMIT 1
        `,
                [id]
            );

        if (!row) {
            return null;
        }

        return {
            id: row.id,

            workflowId:
                row.workflow_id,

            sessionId:
                row.session_id,

            notificationId:
                row.notification_id,

            title: row.title,

            body: row.body,

            status: row.status,

            metadata:
                row.metadata
                    ? JSON.parse(
                        row.metadata
                    )
                    : {},

            createdAt:
                row.created_at,

            updatedAt:
                row.updated_at,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Find By Workflow
    |--------------------------------------------------------------------------
    */

    static async findByWorkflow(
        workflowId: string
    ): Promise<
        NotificationHistoryRecord[]
    > {
        const rows =
            await DatabaseService.getAll<any>(
                `
        SELECT *
        FROM notification_history
        WHERE workflow_id = ?
        ORDER BY created_at DESC
        `,
                [workflowId]
            );

        return rows.map(
            (row) => ({
                id: row.id,

                workflowId:
                    row.workflow_id,

                sessionId:
                    row.session_id,

                notificationId:
                    row.notification_id,

                title: row.title,

                body: row.body,

                status: row.status,

                metadata:
                    row.metadata
                        ? JSON.parse(
                            row.metadata
                        )
                        : {},

                createdAt:
                    row.created_at,

                updatedAt:
                    row.updated_at,
            })
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Find Failed Notifications
    |--------------------------------------------------------------------------
    */

    static async findFailed():
        Promise<
            NotificationHistoryRecord[]
        > {
        const rows =
            await DatabaseService.getAll<any>(
                `
        SELECT *
        FROM notification_history
        WHERE status = 'failed'
        ORDER BY updated_at DESC
        `
            );

        return rows.map(
            (row) => ({
                id: row.id,

                workflowId:
                    row.workflow_id,

                sessionId:
                    row.session_id,

                notificationId:
                    row.notification_id,

                title: row.title,

                body: row.body,

                status: row.status,

                metadata:
                    row.metadata
                        ? JSON.parse(
                            row.metadata
                        )
                        : {},

                createdAt:
                    row.created_at,

                updatedAt:
                    row.updated_at,
            })
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Find All
    |--------------------------------------------------------------------------
    */

    static async findAll():
        Promise<
            NotificationHistoryRecord[]
        > {
        const rows =
            await DatabaseService.getAll<any>(
                `
        SELECT *
        FROM notification_history
        ORDER BY created_at DESC
        `
            );

        return rows.map(
            (row) => ({
                id: row.id,

                workflowId:
                    row.workflow_id,

                sessionId:
                    row.session_id,

                notificationId:
                    row.notification_id,

                title: row.title,

                body: row.body,

                status: row.status,

                metadata:
                    row.metadata
                        ? JSON.parse(
                            row.metadata
                        )
                        : {},

                createdAt:
                    row.created_at,

                updatedAt:
                    row.updated_at,
            })
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Clear History
    |--------------------------------------------------------------------------
    */

    static async clear():
        Promise<void> {
        await DatabaseService.exec(`
      DELETE FROM notification_history;
    `);

        logInfo(
            "Notification history cleared"
        );
    }
}