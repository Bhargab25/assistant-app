// src/core/runtime/runtime-workflow-executor.service.ts

import {
    RuntimeWorkflowTransitionService,
} from "./runtime-workflow-transition.service";

import {
    RuntimeEventStore,
} from "./runtime-event.store";

import {
    RuntimeStateService,
} from "./runtime-state.service";

import {
    AIMemoryService,
} from "../ai/ai-memory.service";

import {
    AssistantMemoryService,
} from "../assistant/assistant-memory.service";

import {
    generateId,
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Workflow Execution Payload
|--------------------------------------------------------------------------
*/

export type WorkflowExecutionPayload =
    {
        workflowId: string;

        sessionId?: string;

        trigger:
        | "manual"
        | "scheduler"
        | "notification"
        | "retry"
        | "assistant";

        metadata?: Record<
            string,
            unknown
        >;
    };

/*
|--------------------------------------------------------------------------
| Workflow Execution Result
|--------------------------------------------------------------------------
*/

export type WorkflowExecutionResult =
    {
        success: boolean;

        workflowId: string;

        executionId: string;

        state: string;

        completedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Runtime Workflow Executor
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - execute workflows
| - manage execution lifecycle
| - generate execution events
| - integrate AI learning
| - maintain execution observability
|
| IMPORTANT:
| This becomes the CORE
| automation execution engine.
|
*/

export class RuntimeWorkflowExecutorService {
    /*
    |--------------------------------------------------------------------------
    | Execute Workflow
    |--------------------------------------------------------------------------
    */

    static async execute(
        payload:
            WorkflowExecutionPayload
    ): Promise<
        WorkflowExecutionResult
    > {
        try {
            logInfo(
                "Starting workflow execution",
                {
                    workflowId:
                        payload.workflowId,

                    trigger:
                        payload.trigger,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Execution ID
            |--------------------------------------------------------------------------
            */

            const executionId =
                generateId();

            /*
            |--------------------------------------------------------------------------
            | Transition → Queued
            |--------------------------------------------------------------------------
            */

            await RuntimeWorkflowTransitionService.transition(
                {
                    workflowId:
                        payload.workflowId,

                    executionId,

                    to: "queued",

                    metadata: {
                        trigger:
                            payload.trigger,
                    },
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Transition → Executing
            |--------------------------------------------------------------------------
            */

            await RuntimeWorkflowTransitionService.transition(
                {
                    workflowId:
                        payload.workflowId,

                    executionId,

                    from:
                        "queued",

                    to: "executing",

                    metadata: {
                        startedAt:
                            Date.now(),
                    },
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Generate Execution Event
            |--------------------------------------------------------------------------
            */

            RuntimeEventStore.add({
                id: generateId(),

                type:
                    "workflow.execution.started",

                workflowId:
                    payload.workflowId,

                sessionId:
                    payload.sessionId,

                executionId,

                payload: {
                    trigger:
                        payload.trigger,

                    metadata:
                        payload.metadata ??
                        {},
                },

                timestamp:
                    Date.now(),
            });

            /*
            |--------------------------------------------------------------------------
            | Simulated Execution Pipeline
            |--------------------------------------------------------------------------
            |
            | FUTURE:
            | - workflow graph execution
            | - conditions
            | - actions
            | - branching
            | - AI decisioning
            |
            */

            await this.runExecutionPipeline(
                payload.workflowId,
                executionId
            );

            /*
            |--------------------------------------------------------------------------
            | Transition → Completed
            |--------------------------------------------------------------------------
            */

            await RuntimeWorkflowTransitionService.transition(
                {
                    workflowId:
                        payload.workflowId,

                    executionId,

                    from:
                        "executing",

                    to: "completed",

                    metadata: {
                        completedAt:
                            Date.now(),
                    },
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Feed AI Memory
            |--------------------------------------------------------------------------
            */

            AIMemoryService.remember({
                category:
                    "workflow_execution",

                summary:
                    `Workflow executed successfully: ${payload.workflowId}`,

                confidence: 92,

                metadata: {
                    workflowId:
                        payload.workflowId,

                    executionId,

                    trigger:
                        payload.trigger,
                },
            });

            /*
            |--------------------------------------------------------------------------
            | Feed Assistant Memory
            |--------------------------------------------------------------------------
            */

            AssistantMemoryService.capture();

            /*
            |--------------------------------------------------------------------------
            | Result
            |--------------------------------------------------------------------------
            */

            const result:
                WorkflowExecutionResult =
            {
                success: true,

                workflowId:
                    payload.workflowId,

                executionId,

                state:
                    "completed",

                completedAt:
                    Date.now(),
            };

            logInfo(
                "Workflow execution completed",
                result
            );

            return result;
        } catch (error) {
            logError(
                "Workflow execution failed",
                error
            );

            /*
            |--------------------------------------------------------------------------
            | Failure Recovery
            |--------------------------------------------------------------------------
            */

            const executionId =
                generateId();

            RuntimeStateService.setState(
                {
                    workflowId:
                        payload.workflowId,

                    executionId,

                    state:
                        "failed",

                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown execution failure",
                    },

                    updatedAt:
                        Date.now(),
                }
            );

            RuntimeEventStore.add({
                id: generateId(),

                type:
                    "workflow.execution.failed",

                workflowId:
                    payload.workflowId,

                executionId,

                payload: {
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown failure",
                },

                timestamp:
                    Date.now(),
            });

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Execution Pipeline
    |--------------------------------------------------------------------------
    */

    private static async runExecutionPipeline(
        workflowId: string,
        executionId: string
    ): Promise<void> {
        try {
            logInfo(
                "Running workflow execution pipeline",
                {
                    workflowId,

                    executionId,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Simulated Execution Delay
            |--------------------------------------------------------------------------
            */

            await new Promise(
                (resolve) =>
                    setTimeout(
                        resolve,
                        1000
                    )
            );

            /*
            |--------------------------------------------------------------------------
            | Generate Pipeline Event
            |--------------------------------------------------------------------------
            */

            RuntimeEventStore.add({
                id: generateId(),

                type:
                    "workflow.pipeline.executed",

                workflowId,

                executionId,

                payload: {
                    pipeline:
                        "default_execution_pipeline",
                },

                timestamp:
                    Date.now(),
            });

            logInfo(
                "Workflow pipeline executed"
            );
        } catch (error) {
            logWarn(
                "Workflow pipeline execution warning",
                error
            );

            throw error;
        }
    }
}