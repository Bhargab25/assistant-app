// src/core/runtime/runtime-workflow-queue.service.ts

import {
    RuntimeWorkflowExecutorService,
    WorkflowExecutionPayload,
} from "./runtime-workflow-executor.service";

import {
    RuntimeEventStore,
} from "./runtime-event.store";

import {
    generateId,
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Workflow Queue Item
|--------------------------------------------------------------------------
*/

export type WorkflowQueueItem =
    WorkflowExecutionPayload & {
        id: string;

        queuedAt: number;

        attempts: number;

        priority:
        | "low"
        | "normal"
        | "high"
        | "critical";
    };

/*
|--------------------------------------------------------------------------
| Queue State
|--------------------------------------------------------------------------
*/

type QueueState =
    {
        processing: boolean;

        startedAt?: number;

        processed: number;

        failed: number;
    };

/*
|--------------------------------------------------------------------------
| Runtime Workflow Queue Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - queue workflow executions
| - prioritize execution order
| - process workflow pipeline
| - retry failed workflows
| - provide execution buffering
|
| IMPORTANT:
| This becomes the FIRST
| real automation execution queue.
|
*/

export class RuntimeWorkflowQueueService {
    /*
    |--------------------------------------------------------------------------
    | Queue
    |--------------------------------------------------------------------------
    */

    private static queue:
        WorkflowQueueItem[] =
        [];

    /*
    |--------------------------------------------------------------------------
    | Queue State
    |--------------------------------------------------------------------------
    */

    private static state:
        QueueState =
        {
            processing: false,

            processed: 0,

            failed: 0,
        };

    /*
    |--------------------------------------------------------------------------
    | Processing Interval
    |--------------------------------------------------------------------------
    */

    private static interval:
        NodeJS.Timeout | null =
        null;

    /*
    |--------------------------------------------------------------------------
    | Add To Queue
    |--------------------------------------------------------------------------
    */

    static enqueue(
        payload:
            WorkflowExecutionPayload,
        priority:
            | "low"
            | "normal"
            | "high"
            | "critical" =
            "normal"
    ): WorkflowQueueItem {
        try {
            const item:
                WorkflowQueueItem =
            {
                id: generateId(),

                workflowId:
                    payload.workflowId,

                sessionId:
                    payload.sessionId,

                trigger:
                    payload.trigger,

                metadata:
                    payload.metadata ??
                    {},

                queuedAt:
                    Date.now(),

                attempts: 0,

                priority,
            };

            /*
            |--------------------------------------------------------------------------
            | Push Queue
            |--------------------------------------------------------------------------
            */

            this.queue.push(item);

            /*
            |--------------------------------------------------------------------------
            | Sort Priority
            |--------------------------------------------------------------------------
            */

            this.sortQueue();

            /*
            |--------------------------------------------------------------------------
            | Runtime Event
            |--------------------------------------------------------------------------
            */

            RuntimeEventStore.add({
                id: generateId(),

                type:
                    "workflow.queue.enqueued",

                workflowId:
                    item.workflowId,

                sessionId:
                    item.sessionId,

                payload: {
                    queueId:
                        item.id,

                    priority,
                },

                timestamp:
                    Date.now(),
            });

            logInfo(
                "Workflow queued",
                {
                    queueId:
                        item.id,

                    workflowId:
                        item.workflowId,

                    priority,
                }
            );

            return item;
        } catch (error) {
            logError(
                "Failed queueing workflow",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Start Queue Processor
    |--------------------------------------------------------------------------
    */

    static start():
        void {
        try {
            if (
                this.state
                    .processing
            ) {
                return;
            }

            logInfo(
                "Starting workflow queue processor..."
            );

            this.interval =
                setInterval(
                    async () => {
                        await this.processNext();
                    },
                    1000
                );

            this.state.processing =
                true;

            this.state.startedAt =
                Date.now();

            logInfo(
                "Workflow queue processor started"
            );
        } catch (error) {
            logError(
                "Failed starting workflow queue",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Process Next Workflow
    |--------------------------------------------------------------------------
    */

    private static async processNext():
        Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Empty Queue
            |--------------------------------------------------------------------------
            */

            if (
                this.queue.length ===
                0
            ) {
                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Next Item
            |--------------------------------------------------------------------------
            */

            const item =
                this.queue.shift();

            if (!item) {
                return;
            }

            logInfo(
                "Processing queued workflow",
                {
                    queueId:
                        item.id,

                    workflowId:
                        item.workflowId,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Execute Workflow
            |--------------------------------------------------------------------------
            */

            await RuntimeWorkflowExecutorService.execute(
                {
                    workflowId:
                        item.workflowId,

                    sessionId:
                        item.sessionId,

                    trigger:
                        item.trigger,

                    metadata:
                        item.metadata,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Update Metrics
            |--------------------------------------------------------------------------
            */

            this.state.processed +=
                1;

            /*
            |--------------------------------------------------------------------------
            | Runtime Event
            |--------------------------------------------------------------------------
            */

            RuntimeEventStore.add({
                id: generateId(),

                type:
                    "workflow.queue.processed",

                workflowId:
                    item.workflowId,

                sessionId:
                    item.sessionId,

                payload: {
                    queueId:
                        item.id,
                },

                timestamp:
                    Date.now(),
            });

            logInfo(
                "Queued workflow processed successfully"
            );
        } catch (error) {
            this.state.failed +=
                1;

            logWarn(
                "Queued workflow failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Stop Queue Processor
    |--------------------------------------------------------------------------
    */

    static stop():
        void {
        try {
            if (
                this.interval
            ) {
                clearInterval(
                    this.interval
                );

                this.interval =
                    null;
            }

            this.state.processing =
                false;

            logInfo(
                "Workflow queue processor stopped"
            );
        } catch (error) {
            logError(
                "Failed stopping workflow queue",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Sort Queue By Priority
    |--------------------------------------------------------------------------
    */

    private static sortQueue():
        void {
        const priorityOrder =
        {
            critical: 4,

            high: 3,

            normal: 2,

            low: 1,
        };

        this.queue.sort(
            (a, b) =>
                priorityOrder[
                b.priority
                ] -
                priorityOrder[
                a.priority
                ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get Queue
    |--------------------------------------------------------------------------
    */

    static getQueue():
        WorkflowQueueItem[] {
        return this.queue;
    }

    /*
    |--------------------------------------------------------------------------
    | Queue Length
    |--------------------------------------------------------------------------
    */

    static size():
        number {
        return this.queue.length;
    }

    /*
    |--------------------------------------------------------------------------
    | Queue State
    |--------------------------------------------------------------------------
    */

    static getState():
        QueueState {
        return this.state;
    }

    /*
    |--------------------------------------------------------------------------
    | Is Processing
    |--------------------------------------------------------------------------
    */

    static isProcessing():
        boolean {
        return (
            this.state
                .processing
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Clear Queue
    |--------------------------------------------------------------------------
    */

    static clear():
        void {
        this.queue = [];

        logInfo(
            "Workflow queue cleared"
        );
    }
}