// src/core/reminders/reminder-session.service.ts

import {
    CreateReminderSessionInput,
    ReminderAction,
    ReminderSession,
} from "./reminder-session.types";

import {
    generateId,
    generateTraceId,
    now,
    logInfo,
    logWarn,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Reminder Session Service
|--------------------------------------------------------------------------
|
| MOST IMPORTANT RESPONSIBILITIES:
|
| - create reminder sessions
| - manage reminder lifecycle
| - track retries/escalations
| - persist runtime state
| - prevent duplicate execution
| - restore sessions after reboot
|
*/

export class ReminderSessionService {
    /*
    |--------------------------------------------------------------------------
    | In-Memory Session Store
    |--------------------------------------------------------------------------
    |
    | TEMPORARY:
    | Later replace with SQLite repository.
    |
    */

    private static sessions:
        ReminderSession[] = [];

    /*
    |--------------------------------------------------------------------------
    | Create Session
    |--------------------------------------------------------------------------
    */

    static async create(
        input: CreateReminderSessionInput
    ): Promise<ReminderSession> {
        /*
        |--------------------------------------------------------------------------
        | Create Session
        |--------------------------------------------------------------------------
        */

        const session: ReminderSession =
        {
            id: generateId(),

            workflowId:
                input.workflowId,

            executionLockId:
                generateTraceId(),

            notificationId:
                input.notificationId,

            status: "pending",

            createdAt:
                Date.now(),

            retryCount: 0,

            escalationLevel: 0,

            escalationPolicy:
                input.escalationPolicy,

            metadata:
                input.metadata,
        };

        /*
        |--------------------------------------------------------------------------
        | Store Session
        |--------------------------------------------------------------------------
        */

        this.sessions.push(
            session
        );

        logInfo(
            "Reminder session created",
            {
                sessionId:
                    session.id,

                workflowId:
                    session.workflowId,
            }
        );

        return session;
    }

    /*
    |--------------------------------------------------------------------------
    | Activate Session
    |--------------------------------------------------------------------------
    */

    static async activate(
        sessionId: string
    ): Promise<void> {
        const session =
            this.findById(
                sessionId
            );

        if (!session) {
            return;
        }

        session.status =
            "active";

        session.startedAt =
            Date.now();

        logInfo(
            "Reminder session activated",
            {
                sessionId,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Complete Session
    |--------------------------------------------------------------------------
    */

    static async complete(
        sessionId: string
    ): Promise<void> {
        const session =
            this.findById(
                sessionId
            );

        if (!session) {
            return;
        }

        session.status =
            "completed";

        session.completedAt =
            Date.now();

        session.respondedAt =
            Date.now();

        logInfo(
            "Reminder session completed",
            {
                sessionId,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Snooze Session
    |--------------------------------------------------------------------------
    */

    static async snooze(
        sessionId: string,
        minutes: number
    ): Promise<void> {
        const session =
            this.findById(
                sessionId
            );

        if (!session) {
            return;
        }

        session.status =
            "snoozed";

        session.snoozeUntil =
            Date.now() +
            minutes *
            60 *
            1000;

        session.respondedAt =
            Date.now();

        logInfo(
            "Reminder session snoozed",
            {
                sessionId,

                minutes,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Skip Session
    |--------------------------------------------------------------------------
    */

    static async skip(
        sessionId: string
    ): Promise<void> {
        const session =
            this.findById(
                sessionId
            );

        if (!session) {
            return;
        }

        session.status =
            "skipped";

        session.respondedAt =
            Date.now();

        logWarn(
            "Reminder session skipped",
            {
                sessionId,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Mark Missed
    |--------------------------------------------------------------------------
    */

    static async markMissed(
        sessionId: string
    ): Promise<void> {
        const session =
            this.findById(
                sessionId
            );

        if (!session) {
            return;
        }

        session.status =
            "missed";

        logWarn(
            "Reminder session missed",
            {
                sessionId,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Escalate Session
    |--------------------------------------------------------------------------
    */

    static async escalate(
        sessionId: string
    ): Promise<void> {
        const session =
            this.findById(
                sessionId
            );

        if (!session) {
            return;
        }

        session.status =
            "escalated";

        session.escalationLevel += 1;

        logWarn(
            "Reminder escalated",
            {
                sessionId,

                escalationLevel:
                    session.escalationLevel,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Register Interaction
    |--------------------------------------------------------------------------
    */

    static async registerInteraction(
        sessionId: string,
        action: ReminderAction
    ): Promise<void> {
        const session =
            this.findById(
                sessionId
            );

        if (!session) {
            return;
        }

        session.lastInteraction =
        {
            action,

            timestamp:
                Date.now(),
        };

        session.respondedAt =
            Date.now();

        logInfo(
            "Reminder interaction registered",
            {
                sessionId,

                action,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Increment Retry
    |--------------------------------------------------------------------------
    */

    static async incrementRetry(
        sessionId: string
    ): Promise<void> {
        const session =
            this.findById(
                sessionId
            );

        if (!session) {
            return;
        }

        session.retryCount += 1;

        logInfo(
            "Reminder retry incremented",
            {
                sessionId,

                retryCount:
                    session.retryCount,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Expire Session
    |--------------------------------------------------------------------------
    */

    static async expire(
        sessionId: string
    ): Promise<void> {
        const session =
            this.findById(
                sessionId
            );

        if (!session) {
            return;
        }

        session.status =
            "expired";

        logWarn(
            "Reminder session expired",
            {
                sessionId,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Find By ID
    |--------------------------------------------------------------------------
    */

    static findById(
        sessionId: string
    ): ReminderSession | undefined {
        return this.sessions.find(
            (session) =>
                session.id ===
                sessionId
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Find By Workflow
    |--------------------------------------------------------------------------
    */

    static findByWorkflow(
        workflowId: string
    ): ReminderSession[] {
        return this.sessions.filter(
            (session) =>
                session.workflowId ===
                workflowId
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get Active Sessions
    |--------------------------------------------------------------------------
    */

    static getActiveSessions():
        ReminderSession[] {
        return this.sessions.filter(
            (session) =>
                session.status ===
                "active" ||
                session.status ===
                "pending" ||
                session.status ===
                "snoozed"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get All Sessions
    |--------------------------------------------------------------------------
    */

    static getAll():
        ReminderSession[] {
        return this.sessions;
    }

    /*
    |--------------------------------------------------------------------------
    | Clear Sessions
    |--------------------------------------------------------------------------
    */

    static clear(): void {
        this.sessions = [];
    }
}