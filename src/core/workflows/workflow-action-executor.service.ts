// src/core/workflows/workflow-action-executor.service.ts

import {
    WorkflowExecutionStep,
} from "./workflow-execution-planner.service";

import {
    RuntimeEventDispatcherService,
} from "../runtime/runtime-event-dispatcher.service";

import {
    DeviceWorkflowActionBridgeService,
} from "../integrations/device-workflow-action-bridge.service";

import {
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Workflow Action Result
|--------------------------------------------------------------------------
*/

export type WorkflowActionResult =
    {
        success: boolean;

        actionId: string;

        actionType: string;

        executedAt: number;

        output?: unknown;
    };

/*
|--------------------------------------------------------------------------
| Workflow Action Executor
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - execute workflow actions
| - handle action delays
| - dispatch runtime events
| - execute automation steps
| - bridge workflows to device APIs
|
| IMPORTANT:
| This becomes the REAL
| workflow execution layer.
|
*/

export class WorkflowActionExecutorService {
    /*
    |--------------------------------------------------------------------------
    | Execute Step
    |--------------------------------------------------------------------------
    */

    static async execute(
        step:
            WorkflowExecutionStep,
        workflowId: string
    ):
        Promise<
            WorkflowActionResult
        > {
        try {
            logInfo(
                "Executing workflow action",
                {
                    workflowId,

                    actionId:
                        step.actionId,

                    type:
                        step.actionType,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Delay Execution
            |--------------------------------------------------------------------------
            */

            if (
                step.delayMs &&
                step.delayMs > 0
            ) {
                await this.delay(
                    step.delayMs
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Execute Real Device Action
            |--------------------------------------------------------------------------
            */

            const output =
                await DeviceWorkflowActionBridgeService.execute(
                    step
                );

            /*
            |--------------------------------------------------------------------------
            | Dispatch Event
            |--------------------------------------------------------------------------
            */

            await RuntimeEventDispatcherService.dispatch(
                {
                    type:
                        "workflow.action.executed",

                    workflowId,

                    payload: {
                        actionId:
                            step.actionId,

                        actionType:
                            step.actionType,

                        output,
                    },
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Result
            |--------------------------------------------------------------------------
            */

            const result:
                WorkflowActionResult =
            {
                success: true,

                actionId:
                    step.actionId,

                actionType:
                    step.actionType,

                executedAt:
                    Date.now(),

                output,
            };

            logInfo(
                "Workflow action executed successfully",
                result
            );

            return result;
        } catch (error) {
            logError(
                "Workflow action execution failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Delay Helper
    |--------------------------------------------------------------------------
    */

    private static async delay(
        ms: number
    ): Promise<void> {
        return new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    ms
                )
        );
    }
}