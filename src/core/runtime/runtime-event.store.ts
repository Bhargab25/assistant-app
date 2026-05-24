// src/core/runtime/runtime-event.store.ts

import {
    generateEventId,
    logDebug,
} from "../../shared/utils";

import {
    AppEvent,
} from "../../shared/constants";

/*
|--------------------------------------------------------------------------
| Runtime Event Record
|--------------------------------------------------------------------------
*/

export type RuntimeEventRecord =
    {
        id: string;

        type: AppEvent;

        timestamp: number;

        workflowId?: string;

        sessionId?: string;

        executionId?: string;

        payload?: Record<
            string,
            unknown
        >;
    };

/*
|--------------------------------------------------------------------------
| Runtime Event Store
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - event sourcing
| - runtime observability
| - analytics foundation
| - debugging
| - behavioral tracking
| - AI learning data
|
| IMPORTANT:
| Every major runtime action
| should create an event.
|
*/

export class RuntimeEventStore {
    /*
    |--------------------------------------------------------------------------
    | In-Memory Event Store
    |--------------------------------------------------------------------------
    |
    | TEMPORARY:
    | Replace later with SQLite persistence.
    |
    */

    private static events:
        RuntimeEventRecord[] = [];

    /*
    |--------------------------------------------------------------------------
    | Add Event
    |--------------------------------------------------------------------------
    */

    static add(
        type: AppEvent,
        payload?: {
            workflowId?: string;

            sessionId?: string;

            executionId?: string;

            data?: Record<
                string,
                unknown
            >;
        }
    ): RuntimeEventRecord {
        const event:
            RuntimeEventRecord =
        {
            id: generateEventId(),

            type,

            timestamp:
                Date.now(),

            workflowId:
                payload?.workflowId,

            sessionId:
                payload?.sessionId,

            executionId:
                payload?.executionId,

            payload:
                payload?.data,
        };

        this.events.push(
            event
        );

        logDebug(
            "Runtime event stored",
            {
                eventId: event.id,

                type:
                    event.type,
            }
        );

        return event;
    }

    /*
    |--------------------------------------------------------------------------
    | Find By Type
    |--------------------------------------------------------------------------
    */

    static findByType(
        type: AppEvent
    ): RuntimeEventRecord[] {
        return this.events.filter(
            (event) =>
                event.type === type
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Find By Workflow
    |--------------------------------------------------------------------------
    */

    static findByWorkflow(
        workflowId: string
    ): RuntimeEventRecord[] {
        return this.events.filter(
            (event) =>
                event.workflowId ===
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
    ): RuntimeEventRecord[] {
        return this.events.filter(
            (event) =>
                event.sessionId ===
                sessionId
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get Latest Events
    |--------------------------------------------------------------------------
    */

    static latest(
        limit = 50
    ): RuntimeEventRecord[] {
        return [...this.events]
            .sort(
                (a, b) =>
                    b.timestamp -
                    a.timestamp
            )
            .slice(0, limit);
    }

    /*
    |--------------------------------------------------------------------------
    | Get All Events
    |--------------------------------------------------------------------------
    */

    static getAll():
        RuntimeEventRecord[] {
        return this.events;
    }

    /*
    |--------------------------------------------------------------------------
    | Clear Events
    |--------------------------------------------------------------------------
    */

    static clear(): void {
        this.events = [];
    }
}