// src/core/runtime/runtime-action-executor.service.ts

import {
    RuntimeEventStore,
} from "./runtime-event.store";

import {
    RuntimeStateService,
} from "./runtime-state.service";

import {
    NotificationHistoryService,
} from "../notifications/notification-history.service";

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
| Runtime Action Type
|--------------------------------------------------------------------------
*/

export type RuntimeActionType =
    | "DONE"
    | "SNOOZE"
    | "SKIP"
    | "REMIND_LATER";

/*
|--------------------------------------------------------------------------
| Runtime Action Payload
|--------------------------------------------------------------------------
*/

export type RuntimeActionPayload =
    {
        workflowId: string;

        notificationId?: string;

        sessionId?: string;

        metadata?: Record<
            string,
            unknown
        >;
    };

/*
|--------------------------------------------------------------------------
| Runtime Action Result
|--------------------------------------------------------------------------
*/

export type RuntimeActionResult =
    {
        success: boolean;

        action: RuntimeActionType;

        workflowId: string;

        executionId: string;

        completedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Runtime Action Executor
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - execute notification actions
| - transition workflow states
| - generate runtime events
| - feed AI learning systems
| - persist execution intelligence
|
| IMPORTANT:
| This becomes the FIRST
| full end-to-end execution pipeline.
|
*/

export class RuntimeActionExecutorService {
    /*
    |--------------------------------------------------------------------------
    | Execute Action
    |--------------------------------------------------------------------------
    */

    static async execute(
        action: RuntimeActionType,
        payload: RuntimeActionPayload
    ): Promise<
        RuntimeActionResult
    > {
        try {
            logInfo(
                "Executing runtime action",
                {
                    action,

                    workflowId:
                        payload.workflowId,
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
            | Generate Runtime Event
            |--------------------------------------------------------------------------
            */

            RuntimeEventStore.add({
                id: generateId(),

                type:
                    `runtime.action.${action.toLowerCase()}`,

                workflowId:
                    payload.workflowId,

                sessionId:
                    payload.sessionId,

                executionId,

                payload: {
                    action,

                    metadata:
                        payload.metadata ??
                        {},
                },

                timestamp:
                    Date.now(),
            });

            /*
            |--------------------------------------------------------------------------
            | Transition Runtime State
            |--------------------------------------------------------------------------
            */

            await this.transitionWorkflowState(
                action,
                payload.workflowId,
                executionId
            );

            /*
            |--------------------------------------------------------------------------
            | Update Notification Status
            |--------------------------------------------------------------------------
            */

            if (
                payload.notificationId
            ) {
                await NotificationHistoryService.updateStatus(
                    payload.notificationId,
                    this.mapActionToStatus(
                        action
                    )
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Feed AI Memory
            |--------------------------------------------------------------------------
            */

            AIMemoryService.remember({
                category:
                    "runtime_action",

                summary:
                    `Workflow action executed: ${action}`,

                confidence: 85,

                metadata: {
                    workflowId:
                        payload.workflowId,

                    action,
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
                RuntimeActionResult =
            {
                success: true,

                action,

                workflowId:
                    payload.workflowId,

                executionId,

                completedAt:
                    Date.now(),
            };

            logInfo(
                "Runtime action executed successfully",
                result
            );

            return result;
        } catch (error) {
            logError(
                "Runtime action execution failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Transition Workflow State
    |--------------------------------------------------------------------------
    */

    private static async transitionWorkflowState(
        action: RuntimeActionType,
        workflowId: string,
        executionId: string
    ): Promise<void> {
        switch (action) {
            /*
            |--------------------------------------------------------------------------
            | DONE
            |--------------------------------------------------------------------------
            */

            case "DONE":
                RuntimeStateService.setState(
                    {
                        workflowId,

                        executionId,

                        state:
                            "completed",

                        metadata: {
                            completed: true,
                        },

                        updatedAt:
                            Date.now(),
                    }
                );

                break;

            /*
            |--------------------------------------------------------------------------
            | SNOOZE
            |--------------------------------------------------------------------------
            */

            case "SNOOZE":
                RuntimeStateService.setState(
                    {
                        workflowId,

                        executionId,

                        state:
                            "snoozed",

                        metadata: {
                            snoozed: true,
                        },

                        updatedAt:
                            Date.now(),
                    }
                );

                break;

            /*
            |--------------------------------------------------------------------------
            | SKIP
            |--------------------------------------------------------------------------
            */

            case "SKIP":
                RuntimeStateService.setState(
                    {
                        workflowId,

                        executionId,

                        state:
                            "skipped",

                        metadata: {
                            skipped: true,
                        },

                        updatedAt:
                            Date.now(),
                    }
                );

                break;

            /*
            |--------------------------------------------------------------------------
            | REMIND LATER
            |--------------------------------------------------------------------------
            */

            case "REMIND_LATER":
                RuntimeStateService.setState(
                    {
                        workflowId,

                        executionId,

                        state:
                            "rescheduled",

                        metadata: {
                            remindLater: true,
                        },

                        updatedAt:
                            Date.now(),
                    }
                );

                break;

            default:
                logWarn(
                    "Unhandled runtime action state transition",
                    {
                        action,
                    }
                );

                break;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Map Action → Notification Status
    |--------------------------------------------------------------------------
    */

    private static mapActionToStatus(
        action: RuntimeActionType
    ) {
        switch (action) {
            case "DONE":
                return "completed";

            case "SNOOZE":
                return "snoozed";

            case "SKIP":
                return "skipped";

            case "REMIND_LATER":
                return "rescheduled";

            default:
                return "delivered";
        }
    }
}