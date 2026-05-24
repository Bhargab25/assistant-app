// src/core/runtime/runtime-workflow-retry.service.ts

import {
    RuntimeWorkflowQueueService,
} from "./runtime-workflow-queue.service";

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
| Retry Payload
|--------------------------------------------------------------------------
*/

export type WorkflowRetryPayload =
    {
        workflowId: string;

        sessionId?: string;

        reason?: string;

        metadata?: Record<
            string,
            unknown
        >;
    };

/*
|--------------------------------------------------------------------------
| Retry Queue Item
|--------------------------------------------------------------------------
*/

type RetryQueueItem =
    WorkflowRetryPayload & {
        id: string;

        attempts: number;

        maxAttempts: number;

        nextRetryAt: number;

        createdAt: number;
    };

/*
|--------------------------------------------------------------------------
| Retry Runtime State
|--------------------------------------------------------------------------
*/

type RetryRuntimeState =
    {
        running: boolean;

        processed: number;

        failed: number;

        startedAt?: number;
    };

/*
|--------------------------------------------------------------------------
| Runtime Workflow Retry Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - retry failed workflows
| - exponential retry scheduling
| - failure recovery
| - retry queue processing
| - resilient execution recovery
|
| IMPORTANT:
| This becomes the workflow
| fault-tolerance layer.
|
*/

export class RuntimeWorkflowRetryService {
    /*
    |--------------------------------------------------------------------------
    | Retry Queue
    |--------------------------------------------------------------------------
    */

    private static queue:
        RetryQueueItem[] =
        [];

    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    private static state:
        RetryRuntimeState =
        {
            running: false,

            processed: 0,

            failed: 0,
        };

    /*
    |--------------------------------------------------------------------------
    | Retry Interval
    |--------------------------------------------------------------------------
    */

    private static interval:
        NodeJS.Timeout | null =
        null;

    /*
    |--------------------------------------------------------------------------
    | Add Retry Job
    |--------------------------------------------------------------------------
    */

    static schedule(
        payload:
            WorkflowRetryPayload,
        maxAttempts = 3
    ): RetryQueueItem {
        try {
            const item:
                RetryQueueItem =
            {
                id: generateId(),

                workflowId:
                    payload.workflowId,

                sessionId:
                    payload.sessionId,

                reason:
                    payload.reason,

                metadata:
                    payload.metadata ??
                    {},

                attempts: 0,

                maxAttempts,

                nextRetryAt:
                    Date.now() +
                    5000,

                createdAt:
                    Date.now(),
            };

            /*
            |--------------------------------------------------------------------------
            | Push Queue
            |--------------------------------------------------------------------------
            */

            this.queue.push(item);

            /*
            |--------------------------------------------------------------------------
            | Generate Runtime Event
            |--------------------------------------------------------------------------
            */

            RuntimeEventStore.add({
                id: generateId(),

                type:
                    "workflow.retry.scheduled",

                workflowId:
                    item.workflowId,

                sessionId:
                    item.sessionId,

                payload: {
                    retryId:
                        item.id,

                    maxAttempts,
                },

                timestamp:
                    Date.now(),
            });

            logInfo(
                "Workflow retry scheduled",
                {
                    retryId:
                        item.id,

                    workflowId:
                        item.workflowId,
                }
            );

            return item;
        } catch (error) {
            logError(
                "Failed scheduling workflow retry",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Start Retry Engine
    |--------------------------------------------------------------------------
    */

    static start():
        void {
        try {
            if (
                this.state.running
            ) {
                return;
            }

            logInfo(
                "Starting workflow retry engine..."
            );

            this.interval =
                setInterval(
                    async () => {
                        await this.process();
                    },
                    2000
                );

            this.state.running =
                true;

            this.state.startedAt =
                Date.now();

            logInfo(
                "Workflow retry engine started"
            );
        } catch (error) {
            logError(
                "Failed starting retry engine",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Process Retry Queue
    |--------------------------------------------------------------------------
    */

    private static async process():
        Promise<void> {
        try {
            const now =
                Date.now();

            const readyItems =
                this.queue.filter(
                    (item) =>
                        item.nextRetryAt <=
                        now
                );

            for (const item of readyItems) {
                await this.processItem(
                    item
                );
            }
        } catch (error) {
            logWarn(
                "Retry queue processing warning",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Process Retry Item
    |--------------------------------------------------------------------------
    */

    private static async processItem(
        item: RetryQueueItem
    ): Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Remove From Queue
            |--------------------------------------------------------------------------
            */

            this.queue =
                this.queue.filter(
                    (retry) =>
                        retry.id !== item.id
                );

            /*
            |--------------------------------------------------------------------------
            | Max Attempts
            |--------------------------------------------------------------------------
            */

            if (
                item.attempts >=
                item.maxAttempts
            ) {
                this.state.failed +=
                    1;

                RuntimeStateService.setState(
                    {
                        workflowId:
                            item.workflowId,

                        executionId:
                            generateId(),

                        state:
                            "failed",

                        metadata: {
                            retryExhausted:
                                true,
                        },

                        updatedAt:
                            Date.now(),
                    }
                );

                logWarn(
                    "Workflow retry exhausted",
                    {
                        workflowId:
                            item.workflowId,
                    }
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Queue Workflow Again
            |--------------------------------------------------------------------------
            */

            RuntimeWorkflowQueueService.enqueue(
                {
                    workflowId:
                        item.workflowId,

                    sessionId:
                        item.sessionId,

                    trigger:
                        "retry",

                    metadata: {
                        retryAttempt:
                            item.attempts +
                            1,

                        retryReason:
                            item.reason,
                    },
                },
                "high"
            );

            /*
            |--------------------------------------------------------------------------
            | Runtime Event
            |--------------------------------------------------------------------------
            */

            RuntimeEventStore.add({
                id: generateId(),

                type:
                    "workflow.retry.executed",

                workflowId:
                    item.workflowId,

                sessionId:
                    item.sessionId,

                payload: {
                    retryId:
                        item.id,

                    attempt:
                        item.attempts +
                        1,
                },

                timestamp:
                    Date.now(),
            });

            this.state.processed +=
                1;

            logInfo(
                "Workflow retry executed",
                {
                    workflowId:
                        item.workflowId,

                    attempt:
                        item.attempts +
                        1,
                }
            );
        } catch (error) {
            logError(
                "Workflow retry processing failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Stop Retry Engine
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

            this.state.running =
                false;

            logInfo(
                "Workflow retry engine stopped"
            );
        } catch (error) {
            logError(
                "Failed stopping retry engine",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Queue
    |--------------------------------------------------------------------------
    */

    static getQueue():
        RetryQueueItem[] {
        return this.queue;
    }

    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    static getState():
        RetryRuntimeState {
        return this.state;
    }

    /*
    |--------------------------------------------------------------------------
    | Is Running
    |--------------------------------------------------------------------------
    */

    static isRunning():
        boolean {
        return this.state.running;
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
            "Workflow retry queue cleared"
        );
    }
}