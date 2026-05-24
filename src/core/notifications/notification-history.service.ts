// src/core/notifications/notification-history.service.ts

import {
    generateId,
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Notification Status
|--------------------------------------------------------------------------
*/

export type NotificationStatus =
    | "scheduled"
    | "sent"
    | "delivered"
    | "clicked"
    | "dismissed"
    | "failed";

/*
|--------------------------------------------------------------------------
| Notification History Record
|--------------------------------------------------------------------------
*/

export type NotificationHistoryRecord =
    {
        id: string;

        workflowId: string;

        sessionId?: string;

        notificationId?: string;

        title: string;

        body: string;

        status: NotificationStatus;

        createdAt: number;

        updatedAt: number;

        metadata?: Record<
            string,
            unknown
        >;
    };

/*
|--------------------------------------------------------------------------
| Notification History Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - track notification lifecycle
| - analytics
| - delivery observability
| - user interaction tracking
| - debugging
| - retry analysis
|
*/

export class NotificationHistoryService {
    /*
    |--------------------------------------------------------------------------
    | In-Memory Store
    |--------------------------------------------------------------------------
    |
    | TEMPORARY:
    | Replace later with SQLite persistence.
    |
    */

    private static history:
        NotificationHistoryRecord[] =
        [];

    /*
    |--------------------------------------------------------------------------
    | Create Record
    |--------------------------------------------------------------------------
    */

    static create(
        input: {
            workflowId: string;

            sessionId?: string;

            notificationId?: string;

            title: string;

            body: string;

            metadata?: Record<
                string,
                unknown
            >;
        }
    ): NotificationHistoryRecord {
        const record:
            NotificationHistoryRecord =
        {
            id: generateId(),

            workflowId:
                input.workflowId,

            sessionId:
                input.sessionId,

            notificationId:
                input.notificationId,

            title: input.title,

            body: input.body,

            status:
                "scheduled",

            createdAt:
                Date.now(),

            updatedAt:
                Date.now(),

            metadata:
                input.metadata,
        };

        this.history.push(
            record
        );

        logInfo(
            "Notification history created",
            {
                workflowId:
                    record.workflowId,

                notificationId:
                    record.notificationId,
            }
        );

        return record;
    }

    /*
    |--------------------------------------------------------------------------
    | Update Status
    |--------------------------------------------------------------------------
    */

    static updateStatus(
        historyId: string,
        status: NotificationStatus,
        metadata?: Record<
            string,
            unknown
        >
    ): void {
        const record =
            this.findById(
                historyId
            );

        if (!record) {
            logWarn(
                "Notification history record not found",
                {
                    historyId,
                }
            );

            return;
        }

        record.status =
            status;

        record.updatedAt =
            Date.now();

        record.metadata = {
            ...record.metadata,

            ...metadata,
        };

        logInfo(
            "Notification status updated",
            {
                historyId,

                status,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Mark Sent
    |--------------------------------------------------------------------------
    */

    static markSent(
        historyId: string
    ): void {
        this.updateStatus(
            historyId,
            "sent"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Mark Delivered
    |--------------------------------------------------------------------------
    */

    static markDelivered(
        historyId: string
    ): void {
        this.updateStatus(
            historyId,
            "delivered"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Mark Clicked
    |--------------------------------------------------------------------------
    */

    static markClicked(
        historyId: string
    ): void {
        this.updateStatus(
            historyId,
            "clicked"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Mark Dismissed
    |--------------------------------------------------------------------------
    */

    static markDismissed(
        historyId: string
    ): void {
        this.updateStatus(
            historyId,
            "dismissed"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Mark Failed
    |--------------------------------------------------------------------------
    */

    static markFailed(
        historyId: string,
        error?: unknown
    ): void {
        this.updateStatus(
            historyId,
            "failed",
            {
                error:
                    String(error),
            }
        );

        logError(
            "Notification delivery failed",
            {
                historyId,

                error,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Find By ID
    |--------------------------------------------------------------------------
    */

    static findById(
        historyId: string
    ):
        | NotificationHistoryRecord
        | undefined {
        return this.history.find(
            (item) =>
                item.id ===
                historyId
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Find By Workflow
    |--------------------------------------------------------------------------
    */

    static findByWorkflow(
        workflowId: string
    ):
        NotificationHistoryRecord[] {
        return this.history.filter(
            (item) =>
                item.workflowId ===
                workflowId
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Find By Session
    |--------------------------------------------------------------------------
    */

    static findBySession(
        sessionId: string
    ):
        NotificationHistoryRecord[] {
        return this.history.filter(
            (item) =>
                item.sessionId ===
                sessionId
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get Failed Notifications
    |--------------------------------------------------------------------------
    */

    static getFailed():
        NotificationHistoryRecord[] {
        return this.history.filter(
            (item) =>
                item.status ===
                "failed"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get All History
    |--------------------------------------------------------------------------
    */

    static getAll():
        NotificationHistoryRecord[] {
        return this.history;
    }

    /*
    |--------------------------------------------------------------------------
    | Clear History
    |--------------------------------------------------------------------------
    */

    static clear(): void {
        this.history = [];
    }
}