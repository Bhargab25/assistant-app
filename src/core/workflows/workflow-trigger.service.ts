// src/core/workflows/workflow-trigger.service.ts

import {
    WorkflowDefinitionService,
    WorkflowTrigger,
} from "./workflow-definition.service";

import {
    WorkflowRuntimeService,
} from "./workflow-runtime.service";

import {
    RuntimeEventDispatcherService,
} from "../runtime/runtime-event-dispatcher.service";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Workflow Trigger Payload
|--------------------------------------------------------------------------
*/

export type WorkflowTriggerPayload =
    {
        trigger:
        WorkflowTrigger;

        workflowId?: string;

        context?: Record<
            string,
            unknown
        >;
    };

/*
|--------------------------------------------------------------------------
| Workflow Trigger Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - trigger workflows
| - trigger workflow groups
| - dispatch trigger events
| - connect runtime to workflow engine
|
| IMPORTANT:
| This becomes the PRIMARY
| workflow activation layer.
|
*/

export class WorkflowTriggerService {
    /*
    |--------------------------------------------------------------------------
    | Trigger Workflow
    |--------------------------------------------------------------------------
    */

    static async trigger(
        payload:
            WorkflowTriggerPayload
    ): Promise<void> {
        try {
            logInfo(
                "Workflow trigger received",
                payload
            );

            /*
            |--------------------------------------------------------------------------
            | Single Workflow
            |--------------------------------------------------------------------------
            */

            if (
                payload.workflowId
            ) {
                await this.triggerWorkflow(
                    payload.workflowId,
                    payload.trigger,
                    payload.context ??
                    {}
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Trigger By Type
            |--------------------------------------------------------------------------
            */

            const workflows =
                WorkflowDefinitionService
                    .getEnabled()
                    .filter(
                        (
                            workflow
                        ) =>
                            workflow.trigger ===
                            payload.trigger
                    );

            for (const workflow of workflows) {
                await this.triggerWorkflow(
                    workflow.id,
                    payload.trigger,
                    payload.context ??
                    {}
                );
            }
        } catch (error) {
            logError(
                "Workflow trigger failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Trigger Single Workflow
    |--------------------------------------------------------------------------
    */

    private static async triggerWorkflow(
        workflowId: string,
        trigger:
            WorkflowTrigger,
        context: Record<
            string,
            unknown
        >
    ): Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Dispatch Trigger Event
            |--------------------------------------------------------------------------
            */

            await RuntimeEventDispatcherService.dispatch(
                {
                    type:
                        "workflow.triggered",

                    workflowId,

                    payload: {
                        trigger,

                        context,
                    },
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Execute Workflow
            |--------------------------------------------------------------------------
            */

            await WorkflowRuntimeService.execute(
                workflowId,
                {
                    ...context,

                    trigger,
                }
            );

            logInfo(
                "Workflow triggered successfully",
                {
                    workflowId,

                    trigger,
                }
            );
        } catch (error) {
            logWarn(
                "Workflow trigger execution failed",
                {
                    workflowId,

                    trigger,

                    error,
                }
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Trigger Manual Workflow
    |--------------------------------------------------------------------------
    */

    static async manual(
        workflowId: string,
        context: Record<
            string,
            unknown
        > = {}
    ): Promise<void> {
        await this.trigger({
            workflowId,

            trigger:
                "manual",

            context,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Trigger Event Workflows
    |--------------------------------------------------------------------------
    */

    static async event(
        eventName: string,
        context: Record<
            string,
            unknown
        > = {}
    ): Promise<void> {
        await this.trigger({
            trigger:
                "event",

            context: {
                ...context,

                eventName,
            },
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Trigger Assistant Workflows
    |--------------------------------------------------------------------------
    */

    static async assistant(
        context: Record<
            string,
            unknown
        > = {}
    ): Promise<void> {
        await this.trigger({
            trigger:
                "assistant",

            context,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Trigger Scheduled Workflows
    |--------------------------------------------------------------------------
    */

    static async scheduled(
        context: Record<
            string,
            unknown
        > = {}
    ): Promise<void> {
        await this.trigger({
            trigger:
                "schedule",

            context,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Trigger Notification Workflows
    |--------------------------------------------------------------------------
    */

    static async notification(
        context: Record<
            string,
            unknown
        > = {}
    ): Promise<void> {
        await this.trigger({
            trigger:
                "notification",

            context,
        });
    }
}