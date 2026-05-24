// src/core/ai/ai-event-processor.service.ts

import {
    EventBus,
} from "../events/event-bus";

import {
    EVENTS,
} from "../../shared/constants";

import {
    AIOrchestratorService,
} from "./ai-orchestrator.service";

import {
    AIMemoryService,
} from "./ai-memory.service";

import {
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| AI Event Processor
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - react to runtime events
| - trigger AI updates
| - refresh AI memory
| - keep intelligence current
|
| IMPORTANT:
| This becomes the bridge between:
|
| Runtime Events
|        ↓
| AI Intelligence System
|
*/

export class AIEventProcessorService {
    /*
    |--------------------------------------------------------------------------
    | Initialize
    |--------------------------------------------------------------------------
    */

    static initialize():
        void {
        try {
            /*
            |--------------------------------------------------------------------------
            | Workflow Events
            |--------------------------------------------------------------------------
            */

            this.register(
                EVENTS.WORKFLOW_COMPLETED
            );

            this.register(
                EVENTS.WORKFLOW_FAILED
            );

            /*
            |--------------------------------------------------------------------------
            | Reminder Events
            |--------------------------------------------------------------------------
            */

            this.register(
                EVENTS.ACTION_EXECUTED
            );

            this.register(
                EVENTS.RETRY_EXECUTED
            );

            /*
            |--------------------------------------------------------------------------
            | Notification Events
            |--------------------------------------------------------------------------
            */

            this.register(
                EVENTS.NOTIFICATION_SENT
            );

            /*
            |--------------------------------------------------------------------------
            | Parser Events
            |--------------------------------------------------------------------------
            */

            this.register(
                EVENTS.PARSER_COMPLETED
            );

            logInfo(
                "AI event processor initialized"
            );
        } catch (error) {
            logError(
                "AI event processor initialization failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Register Event
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
                    | Refresh Intelligence
                    |--------------------------------------------------------------------------
                    */

                    await this.processEvent(
                        eventName,
                        payload
                    );
                } catch (error) {
                    logError(
                        `AI event processing failed: ${eventName}`,
                        error
                    );
                }
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Process Event
    |--------------------------------------------------------------------------
    */

    private static async processEvent(
        eventName: string,
        payload?: Record<
            string,
            unknown
        >
    ): Promise<void> {
        /*
        |--------------------------------------------------------------------------
        | Rebuild Memory
        |--------------------------------------------------------------------------
        */

        AIMemoryService.buildMemory();

        /*
        |--------------------------------------------------------------------------
        | Refresh AI Snapshot
        |--------------------------------------------------------------------------
        */

        AIOrchestratorService.generateSnapshot();

        logInfo(
            "AI processed runtime event",
            {
                eventName,

                workflowId:
                    payload?.workflowId,

                sessionId:
                    payload?.sessionId,
            }
        );
    }
}