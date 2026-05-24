// src/core/runtime/runtime-event-dispatcher.service.ts

import {
    EventBus,
} from "../events/event-bus";

import {
    RuntimeEventStore,
} from "./runtime-event.store";

import {
    RuntimeObserverService,
} from "./runtime-observer.service";

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
| Runtime Dispatch Event
|--------------------------------------------------------------------------
*/

export type RuntimeDispatchEvent =
    {
        type: string;

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
| Runtime Dispatcher State
|--------------------------------------------------------------------------
*/

type RuntimeDispatcherState =
    {
        initialized: boolean;

        dispatched: number;

        failed: number;

        startedAt?: number;
    };

/*
|--------------------------------------------------------------------------
| Runtime Event Dispatcher
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - dispatch runtime events
| - bridge internal event systems
| - feed observability pipeline
| - trigger AI learning
| - maintain event durability
|
| IMPORTANT:
| This becomes the CENTRAL
| runtime event transport layer.
|
*/

export class RuntimeEventDispatcherService {
    /*
    |--------------------------------------------------------------------------
    | Dispatcher State
    |--------------------------------------------------------------------------
    */

    private static state:
        RuntimeDispatcherState =
        {
            initialized: false,

            dispatched: 0,

            failed: 0,
        };

    /*
    |--------------------------------------------------------------------------
    | Initialize Dispatcher
    |--------------------------------------------------------------------------
    */

    static async initialize():
        Promise<void> {
        try {
            if (
                this.state
                    .initialized
            ) {
                return;
            }

            logInfo(
                "Initializing runtime event dispatcher..."
            );

            this.state.initialized =
                true;

            this.state.startedAt =
                Date.now();

            logInfo(
                "Runtime event dispatcher initialized"
            );
        } catch (error) {
            logError(
                "Runtime event dispatcher initialization failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Dispatch Event
    |--------------------------------------------------------------------------
    */

    static async dispatch(
        event:
            RuntimeDispatchEvent
    ): Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Persist Runtime Event
            |--------------------------------------------------------------------------
            */

            RuntimeEventStore.add({
                id: generateId(),

                type:
                    event.type,

                workflowId:
                    event.workflowId,

                sessionId:
                    event.sessionId,

                executionId:
                    event.executionId,

                payload:
                    event.payload ??
                    {},

                timestamp:
                    Date.now(),
            });

            /*
            |--------------------------------------------------------------------------
            | Emit EventBus Event
            |--------------------------------------------------------------------------
            */

            await EventBus.emit(
                event.type,
                {
                    workflowId:
                        event.workflowId,

                    sessionId:
                        event.sessionId,

                    executionId:
                        event.executionId,

                    ...(event.payload ??
                        {}),
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Feed AI Memory
            |--------------------------------------------------------------------------
            */

            AIMemoryService.remember({
                category:
                    "runtime_dispatch",

                summary:
                    `Runtime event dispatched: ${event.type}`,

                confidence: 80,

                metadata: {
                    eventType:
                        event.type,

                    workflowId:
                        event.workflowId,
                },
            });

            /*
            |--------------------------------------------------------------------------
            | Capture Assistant Memory
            |--------------------------------------------------------------------------
            */

            AssistantMemoryService.capture();

            /*
            |--------------------------------------------------------------------------
            | Observe Runtime
            |--------------------------------------------------------------------------
            */

            RuntimeObserverService.monitor();

            /*
            |--------------------------------------------------------------------------
            | Metrics
            |--------------------------------------------------------------------------
            */

            this.state.dispatched +=
                1;

            logInfo(
                "Runtime event dispatched",
                {
                    type:
                        event.type,

                    workflowId:
                        event.workflowId,
                }
            );
        } catch (error) {
            this.state.failed +=
                1;

            logWarn(
                "Runtime event dispatch failed",
                {
                    type:
                        event.type,

                    error,
                }
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Dispatcher State
    |--------------------------------------------------------------------------
    */

    static getState():
        RuntimeDispatcherState {
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