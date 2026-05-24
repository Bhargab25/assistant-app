// src/core/runtime/runtime-event.listener.ts

import { EventBus } from "../events/event-bus";

import { EVENTS } from "../../shared/constants";

import { RuntimeEventStore } from "./runtime-event.store";

import {
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Runtime Event Listener
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - subscribe to runtime events
| - persist event history
| - centralize event tracking
| - enable analytics/debugging
|
| IMPORTANT:
| This becomes the bridge between:
|
| Event Bus
|      ↓
| Event Store
|
*/

export class RuntimeEventListener {
    /*
    |--------------------------------------------------------------------------
    | Initialize Listeners
    |--------------------------------------------------------------------------
    */

    static initialize(): void {
        try {
            /*
            |--------------------------------------------------------------------------
            | Workflow Events
            |--------------------------------------------------------------------------
            */

            this.register(
                EVENTS.WORKFLOW_CREATED
            );

            this.register(
                EVENTS.WORKFLOW_UPDATED
            );

            this.register(
                EVENTS.WORKFLOW_DELETED
            );

            this.register(
                EVENTS.WORKFLOW_STARTED
            );

            this.register(
                EVENTS.WORKFLOW_COMPLETED
            );

            this.register(
                EVENTS.WORKFLOW_FAILED
            );

            /*
            |--------------------------------------------------------------------------
            | Action Events
            |--------------------------------------------------------------------------
            */

            this.register(
                EVENTS.ACTION_EXECUTED
            );

            this.register(
                EVENTS.ACTION_FAILED
            );

            /*
            |--------------------------------------------------------------------------
            | Parser Events
            |--------------------------------------------------------------------------
            */

            this.register(
                EVENTS.PARSER_STARTED
            );

            this.register(
                EVENTS.PARSER_COMPLETED
            );

            this.register(
                EVENTS.PARSER_FAILED
            );

            /*
            |--------------------------------------------------------------------------
            | Retry Events
            |--------------------------------------------------------------------------
            */

            this.register(
                EVENTS.RETRY_EXECUTED
            );

            this.register(
                EVENTS.RETRY_ESCALATED
            );

            /*
            |--------------------------------------------------------------------------
            | Notification Events
            |--------------------------------------------------------------------------
            */

            this.register(
                EVENTS.NOTIFICATION_SENT
            );

            this.register(
                EVENTS.NOTIFICATION_FAILED
            );

            /*
            |--------------------------------------------------------------------------
            | Scheduler Events
            |--------------------------------------------------------------------------
            */

            this.register(
                EVENTS.SCHEDULER_STARTED
            );

            this.register(
                EVENTS.SCHEDULER_STOPPED
            );

            this.register(
                EVENTS.SCHEDULER_TICK
            );

            logInfo(
                "Runtime event listeners initialized"
            );
        } catch (error) {
            logError(
                "Failed to initialize runtime listeners",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Register Event Listener
    |--------------------------------------------------------------------------
    */

    private static register(
        eventName: string
    ): void {
        EventBus.on(
            eventName,
            async (
                payload?: Record<
                    string,
                    unknown
                >
            ) => {
                try {
                    /*
                    |--------------------------------------------------------------------------
                    | Store Event
                    |--------------------------------------------------------------------------
                    */

                    RuntimeEventStore.add(
                        eventName as any,
                        {
                            workflowId:
                                payload?.workflowId as
                                | string
                                | undefined,

                            sessionId:
                                payload?.sessionId as
                                | string
                                | undefined,

                            executionId:
                                payload?.executionId as
                                | string
                                | undefined,

                            data: payload,
                        }
                    );
                } catch (error) {
                    logError(
                        `Failed storing event: ${eventName}`,
                        error
                    );
                }
            }
        );
    }
}