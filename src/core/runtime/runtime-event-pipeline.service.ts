// src/core/runtime/runtime-event-pipeline.service.ts

import {
    EventBus,
} from "../events/event-bus";

import {
    EVENTS,
} from "../../shared/constants";

import {
    RuntimeEventStore,
} from "./runtime-event.store";

import {
    RuntimeWorkflowQueueService,
} from "./runtime-workflow-queue.service";

import {
    RuntimeWorkflowRetryService,
} from "./runtime-workflow-retry.service";

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
| Runtime Event Pipeline State
|--------------------------------------------------------------------------
*/

type RuntimeEventPipelineState =
    {
        initialized: boolean;

        registeredEvents: number;

        startedAt?: number;
    };

/*
|--------------------------------------------------------------------------
| Runtime Event Pipeline
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - process runtime events
| - coordinate workflow execution
| - coordinate retry execution
| - feed AI learning systems
| - maintain runtime observability
|
| IMPORTANT:
| This becomes the INTERNAL
| event-driven execution pipeline.
|
*/

export class RuntimeEventPipelineService {
    /*
    |--------------------------------------------------------------------------
    | Pipeline State
    |--------------------------------------------------------------------------
    */

    private static state:
        RuntimeEventPipelineState =
        {
            initialized: false,

            registeredEvents: 0,
        };

    /*
    |--------------------------------------------------------------------------
    | Initialize Pipeline
    |--------------------------------------------------------------------------
    */

    static async initialize():
        Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Prevent Duplicate Init
            |--------------------------------------------------------------------------
            */

            if (
                this.state
                    .initialized
            ) {
                return;
            }

            logInfo(
                "Initializing runtime event pipeline..."
            );

            /*
            |--------------------------------------------------------------------------
            | Workflow Execution Events
            |--------------------------------------------------------------------------
            */

            EventBus.on(
                EVENTS.WORKFLOW_TRIGGERED,
                async (
                    payload
                ) => {
                    try {
                        RuntimeEventStore.add({
                            id: generateId(),

                            type:
                                "pipeline.workflow.triggered",

                            workflowId:
                                payload.workflowId,

                            payload,

                            timestamp:
                                Date.now(),
                        });

                        RuntimeWorkflowQueueService.enqueue(
                            {
                                workflowId:
                                    payload.workflowId,

                                sessionId:
                                    payload.sessionId,

                                trigger:
                                    "scheduler",

                                metadata:
                                    payload,
                            },
                            "normal"
                        );

                        logInfo(
                            "Workflow pipeline event processed",
                            {
                                workflowId:
                                    payload.workflowId,
                            }
                        );
                    } catch (error) {
                        logError(
                            "Workflow pipeline event failed",
                            error
                        );
                    }
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Workflow Failure Events
            |--------------------------------------------------------------------------
            */

            EventBus.on(
                EVENTS.WORKFLOW_FAILED,
                async (
                    payload
                ) => {
                    try {
                        RuntimeEventStore.add({
                            id: generateId(),

                            type:
                                "pipeline.workflow.failed",

                            workflowId:
                                payload.workflowId,

                            payload,

                            timestamp:
                                Date.now(),
                        });

                        RuntimeWorkflowRetryService.schedule(
                            {
                                workflowId:
                                    payload.workflowId,

                                reason:
                                    payload.reason,

                                metadata:
                                    payload,
                            }
                        );

                        logWarn(
                            "Workflow failure routed to retry pipeline",
                            {
                                workflowId:
                                    payload.workflowId,
                            }
                        );
                    } catch (error) {
                        logError(
                            "Workflow failure pipeline failed",
                            error
                        );
                    }
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Workflow Completed Events
            |--------------------------------------------------------------------------
            */

            EventBus.on(
                EVENTS.WORKFLOW_COMPLETED,
                async (
                    payload
                ) => {
                    try {
                        RuntimeEventStore.add({
                            id: generateId(),

                            type:
                                "pipeline.workflow.completed",

                            workflowId:
                                payload.workflowId,

                            payload,

                            timestamp:
                                Date.now(),
                        });

                        /*
                        |--------------------------------------------------------------------------
                        | Feed AI Memory
                        |--------------------------------------------------------------------------
                        */

                        AIMemoryService.remember({
                            category:
                                "workflow_completion",

                            summary:
                                `Workflow completed successfully: ${payload.workflowId}`,

                            confidence: 90,

                            metadata:
                                payload,
                        });

                        /*
                        |--------------------------------------------------------------------------
                        | Capture Assistant Memory
                        |--------------------------------------------------------------------------
                        */

                        AssistantMemoryService.capture();

                        logInfo(
                            "Workflow completion pipeline processed",
                            {
                                workflowId:
                                    payload.workflowId,
                            }
                        );
                    } catch (error) {
                        logError(
                            "Workflow completion pipeline failed",
                            error
                        );
                    }
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state = {
                initialized: true,

                registeredEvents: 3,

                startedAt:
                    Date.now(),
            };

            logInfo(
                "Runtime event pipeline initialized"
            );
        } catch (error) {
            logError(
                "Runtime event pipeline initialization failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Shutdown Pipeline
    |--------------------------------------------------------------------------
    */

    static async shutdown():
        Promise<void> {
        try {
            this.state.initialized =
                false;

            this.state.registeredEvents =
                0;

            logInfo(
                "Runtime event pipeline shutdown complete"
            );
        } catch (error) {
            logError(
                "Runtime event pipeline shutdown failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Pipeline State
    |--------------------------------------------------------------------------
    */

    static getState():
        RuntimeEventPipelineState {
        return this.state;
    }

    /*
    |--------------------------------------------------------------------------
    | Is Ready
    |--------------------------------------------------------------------------
    */

    static isReady():
        boolean {
        return this.state
            .initialized;
    }
}