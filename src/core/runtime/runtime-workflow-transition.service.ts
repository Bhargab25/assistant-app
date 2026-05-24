// src/core/runtime/runtime-workflow-transition.service.ts

import {
    RuntimeEventStore,
} from "./runtime-event.store";

import {
    RuntimeStateService,
} from "./runtime-state.service";

import {
    generateId,
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Workflow State
|--------------------------------------------------------------------------
*/

export type WorkflowExecutionState =
    | "pending"
    | "queued"
    | "executing"
    | "waiting_response"
    | "completed"
    | "failed"
    | "cancelled"
    | "snoozed"
    | "skipped"
    | "rescheduled";

/*
|--------------------------------------------------------------------------
| Workflow Transition Payload
|--------------------------------------------------------------------------
*/

export type WorkflowTransitionPayload =
    {
        workflowId: string;

        from?: WorkflowExecutionState;

        to: WorkflowExecutionState;

        executionId: string;

        metadata?: Record<
            string,
            unknown
        >;
    };

/*
|--------------------------------------------------------------------------
| Workflow Transition Result
|--------------------------------------------------------------------------
*/

export type WorkflowTransitionResult =
    {
        success: boolean;

        workflowId: string;

        from?: WorkflowExecutionState;

        to: WorkflowExecutionState;

        transitionedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Runtime Workflow Transition Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - manage workflow state transitions
| - validate execution transitions
| - generate workflow events
| - maintain execution integrity
|
| IMPORTANT:
| This becomes the FOUNDATION
| state machine layer.
|
*/

export class RuntimeWorkflowTransitionService {
    /*
    |--------------------------------------------------------------------------
    | Allowed Transitions
    |--------------------------------------------------------------------------
    */

    private static transitions:
        Record<
            WorkflowExecutionState,
            WorkflowExecutionState[]
        > = {
            pending: [
                "queued",
                "cancelled",
            ],

            queued: [
                "executing",
                "cancelled",
            ],

            executing: [
                "waiting_response",
                "completed",
                "failed",
                "snoozed",
                "skipped",
                "rescheduled",
            ],

            waiting_response: [
                "completed",
                "failed",
                "snoozed",
                "skipped",
                "rescheduled",
            ],

            completed: [],

            failed: [
                "queued",
            ],

            cancelled: [],

            snoozed: [
                "queued",
            ],

            skipped: [],

            rescheduled: [
                "queued",
            ],
        };

    /*
    |--------------------------------------------------------------------------
    | Transition Workflow
    |--------------------------------------------------------------------------
    */

    static async transition(
        payload:
            WorkflowTransitionPayload
    ): Promise<
        WorkflowTransitionResult
    > {
        try {
            /*
            |--------------------------------------------------------------------------
            | Resolve Current State
            |--------------------------------------------------------------------------
            */

            const current =
                RuntimeStateService.get(
                    payload.workflowId
                );

            const from =
                payload.from ??
                current?.state;

            /*
            |--------------------------------------------------------------------------
            | Validate Transition
            |--------------------------------------------------------------------------
            */

            if (
                from &&
                !this.canTransition(
                    from,
                    payload.to
                )
            ) {
                throw new Error(
                    `Invalid workflow transition: ${from} → ${payload.to}`
                );
            }

            logInfo(
                "Transitioning workflow state",
                {
                    workflowId:
                        payload.workflowId,

                    from,

                    to: payload.to,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Persist Runtime State
            |--------------------------------------------------------------------------
            */

            RuntimeStateService.setState(
                {
                    workflowId:
                        payload.workflowId,

                    executionId:
                        payload.executionId,

                    state:
                        payload.to,

                    metadata:
                        payload.metadata ??
                        {},

                    updatedAt:
                        Date.now(),
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Generate Runtime Event
            |--------------------------------------------------------------------------
            */

            RuntimeEventStore.add({
                id: generateId(),

                type:
                    "workflow.transition",

                workflowId:
                    payload.workflowId,

                executionId:
                    payload.executionId,

                payload: {
                    from,

                    to: payload.to,

                    metadata:
                        payload.metadata ??
                        {},
                },

                timestamp:
                    Date.now(),
            });

            /*
            |--------------------------------------------------------------------------
            | Result
            |--------------------------------------------------------------------------
            */

            const result:
                WorkflowTransitionResult =
            {
                success: true,

                workflowId:
                    payload.workflowId,

                from,

                to: payload.to,

                transitionedAt:
                    Date.now(),
            };

            logInfo(
                "Workflow transition completed",
                result
            );

            return result;
        } catch (error) {
            logError(
                "Workflow transition failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Can Transition
    |--------------------------------------------------------------------------
    */

    static canTransition(
        from:
            WorkflowExecutionState,
        to:
            WorkflowExecutionState
    ): boolean {
        return (
            this.transitions[
                from
            ]?.includes(to) ??
            false
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get Allowed Transitions
    |--------------------------------------------------------------------------
    */

    static getAllowedTransitions(
        state:
            WorkflowExecutionState
    ):
        WorkflowExecutionState[] {
        return (
            this.transitions[
            state
            ] ?? []
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Is Terminal State
    |--------------------------------------------------------------------------
    */

    static isTerminal(
        state:
            WorkflowExecutionState
    ): boolean {
        return [
            "completed",
            "cancelled",
            "skipped",
        ].includes(state);
    }

    /*
    |--------------------------------------------------------------------------
    | Is Recoverable
    |--------------------------------------------------------------------------
    */

    static isRecoverable(
        state:
            WorkflowExecutionState
    ): boolean {
        return [
            "failed",
            "snoozed",
            "rescheduled",
        ].includes(state);
    }

    /*
    |--------------------------------------------------------------------------
    | Validate State
    |--------------------------------------------------------------------------
    */

    static validate(
        state: string
    ): boolean {
        return Object.keys(
            this.transitions
        ).includes(state);
    }
}