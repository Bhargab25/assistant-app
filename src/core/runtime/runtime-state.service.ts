// src/core/runtime/runtime-state.service.ts

import {
    generateTraceId,
    logInfo,
    logWarn,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Workflow Runtime State
|--------------------------------------------------------------------------
*/

export type WorkflowRuntimeState =
    | "idle"
    | "scheduled"
    | "triggered"
    | "executing"
    | "waiting_response"
    | "retry_pending"
    | "completed"
    | "failed"
    | "cancelled";

/*
|--------------------------------------------------------------------------
| Runtime State Record
|--------------------------------------------------------------------------
*/

export type RuntimeStateRecord =
    {
        workflowId: string;

        executionId: string;

        state: WorkflowRuntimeState;

        updatedAt: number;

        metadata?: Record<
            string,
            unknown
        >;
    };

/*
|--------------------------------------------------------------------------
| Runtime State Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - workflow execution lifecycle
| - runtime state tracking
| - execution observability
| - retry orchestration support
| - runtime debugging
|
*/

export class RuntimeStateService {
    /*
    |--------------------------------------------------------------------------
    | Runtime State Store
    |--------------------------------------------------------------------------
    |
    | TEMPORARY:
    | Replace later with SQLite persistence.
    |
    */

    private static states:
        RuntimeStateRecord[] = [];

    /*
    |--------------------------------------------------------------------------
    | Create Runtime State
    |--------------------------------------------------------------------------
    */

    static create(
        workflowId: string,
        initialState:
            WorkflowRuntimeState = "idle",
        metadata?: Record<
            string,
            unknown
        >
    ): RuntimeStateRecord {
        const record:
            RuntimeStateRecord =
        {
            workflowId,

            executionId:
                generateTraceId(),

            state:
                initialState,

            updatedAt:
                Date.now(),

            metadata,
        };

        this.states.push(
            record
        );

        logInfo(
            "Runtime state created",
            {
                workflowId,

                state:
                    initialState,
            }
        );

        return record;
    }

    /*
    |--------------------------------------------------------------------------
    | Set State Record
    |--------------------------------------------------------------------------
    */

    static setState(
        record: RuntimeStateRecord
    ): void {
        const index =
            this.states.findIndex(
                (s) =>
                    s.workflowId ===
                    record.workflowId
            );

        if (index >= 0) {
            this.states[index] = record;
        } else {
            this.states.push(record);
        }

        logInfo(
            "Runtime state set",
            {
                workflowId:
                    record.workflowId,

                state:
                    record.state,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update State
    |--------------------------------------------------------------------------
    */

    static updateState(
        workflowId: string,
        state:
            WorkflowRuntimeState,
        metadata?: Record<
            string,
            unknown
        >
    ): void {
        const runtime =
            this.findByWorkflow(
                workflowId
            );

        /*
        |--------------------------------------------------------------------------
        | Create Missing Runtime
        |--------------------------------------------------------------------------
        */

        if (!runtime) {
            this.create(
                workflowId,
                state,
                metadata
            );

            return;
        }

        runtime.state = state;

        runtime.updatedAt =
            Date.now();

        runtime.metadata = {
            ...runtime.metadata,

            ...metadata,
        };

        logInfo(
            "Runtime state updated",
            {
                workflowId,

                state,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Mark Executing
    |--------------------------------------------------------------------------
    */

    static markExecuting(
        workflowId: string
    ): void {
        this.updateState(
            workflowId,
            "executing"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Mark Waiting Response
    |--------------------------------------------------------------------------
    */

    static markWaitingResponse(
        workflowId: string
    ): void {
        this.updateState(
            workflowId,
            "waiting_response"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Mark Retry Pending
    |--------------------------------------------------------------------------
    */

    static markRetryPending(
        workflowId: string
    ): void {
        this.updateState(
            workflowId,
            "retry_pending"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Mark Completed
    |--------------------------------------------------------------------------
    */

    static markCompleted(
        workflowId: string
    ): void {
        this.updateState(
            workflowId,
            "completed"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Mark Failed
    |--------------------------------------------------------------------------
    */

    static markFailed(
        workflowId: string,
        error?: unknown
    ): void {
        this.updateState(
            workflowId,
            "failed",
            {
                error:
                    String(error),
            }
        );

        logWarn(
            "Workflow runtime failed",
            {
                workflowId,

                error,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Cancel Runtime
    |--------------------------------------------------------------------------
    */

    static cancel(
        workflowId: string
    ): void {
        this.updateState(
            workflowId,
            "cancelled"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Reset Runtime
    |--------------------------------------------------------------------------
    */

    static reset(
        workflowId: string
    ): void {
        this.updateState(
            workflowId,
            "idle"
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
        | RuntimeStateRecord
        | undefined {
        return this.states.find(
            (state) =>
                state.workflowId ===
                workflowId
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get Active Executions
    |--------------------------------------------------------------------------
    */

    static getActiveExecutions():
        RuntimeStateRecord[] {
        return this.states.filter(
            (state) =>
                state.state ===
                "executing" ||
                state.state ===
                "waiting_response" ||
                state.state ===
                "retry_pending"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get All Runtime States
    |--------------------------------------------------------------------------
    */

    static getAll():
        RuntimeStateRecord[] {
        return this.states;
    }

    /*
    |--------------------------------------------------------------------------
    | Clear Runtime State
    |--------------------------------------------------------------------------
    */

    static clear(): void {
        this.states = [];
    }
}