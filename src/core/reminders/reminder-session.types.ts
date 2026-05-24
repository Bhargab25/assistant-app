// src/core/reminders/reminder-session.types.ts

/*
|--------------------------------------------------------------------------
| Reminder Session Status
|--------------------------------------------------------------------------
*/

export type ReminderSessionStatus =
    | "pending"
    | "active"
    | "completed"
    | "snoozed"
    | "skipped"
    | "missed"
    | "expired"
    | "escalated";

/*
|--------------------------------------------------------------------------
| Reminder Action
|--------------------------------------------------------------------------
*/

export type ReminderAction =
    | "DONE"
    | "SNOOZE_5"
    | "SNOOZE_10"
    | "SNOOZE_30"
    | "SKIP"
    | "OPEN_APP"
    | "MARK_LATER";

/*
|--------------------------------------------------------------------------
| Reminder Interaction
|--------------------------------------------------------------------------
*/

export type ReminderInteraction =
    {
        action: ReminderAction;

        timestamp: number;
    };

/*
|--------------------------------------------------------------------------
| Escalation Policy
|--------------------------------------------------------------------------
*/

export type EscalationPolicy =
    {
        enabled: boolean;

        maxEscalations: number;

        escalationIntervalMinutes: number;

        stopAt?: string;

        quietHours?: {
            start: string;

            end: string;
        };
    };

/*
|--------------------------------------------------------------------------
| Reminder Session
|--------------------------------------------------------------------------
|
| Represents a single reminder execution lifecycle.
|
| IMPORTANT:
| Every reminder execution creates its own session.
|
*/

export type ReminderSession =
    {
        /*
        |--------------------------------------------------------------------------
        | Identity
        |--------------------------------------------------------------------------
        */

        id: string;

        workflowId: string;

        executionLockId: string;

        notificationId?: string;

        /*
        |--------------------------------------------------------------------------
        | State
        |--------------------------------------------------------------------------
        */

        status: ReminderSessionStatus;

        /*
        |--------------------------------------------------------------------------
        | Timestamps
        |--------------------------------------------------------------------------
        */

        createdAt: number;

        startedAt?: number;

        respondedAt?: number;

        completedAt?: number;

        snoozeUntil?: number;

        expiresAt?: number;

        /*
        |--------------------------------------------------------------------------
        | Retry / Escalation
        |--------------------------------------------------------------------------
        */

        retryCount: number;

        escalationLevel: number;

        escalationPolicy?: EscalationPolicy;

        /*
        |--------------------------------------------------------------------------
        | User Interaction
        |--------------------------------------------------------------------------
        */

        lastInteraction?: ReminderInteraction;

        /*
        |--------------------------------------------------------------------------
        | Runtime Metadata
        |--------------------------------------------------------------------------
        */

        metadata?: Record<
            string,
            unknown
        >;
    };

/*
|--------------------------------------------------------------------------
| Reminder Session Create Input
|--------------------------------------------------------------------------
*/

export type CreateReminderSessionInput =
    {
        workflowId: string;

        notificationId?: string;

        escalationPolicy?: EscalationPolicy;

        metadata?: Record<
            string,
            unknown
        >;
    };