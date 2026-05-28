// src/core/workflows/workflow-runtime.service.ts

import {
    WorkflowDefinitionService,
} from "./workflow-definition.service";

import {
    WorkflowExecutionPlannerService,
} from "./workflow-execution-planner.service";

import {
    WorkflowActionExecutorService,
} from "./workflow-action-executor.service";

import {
    RuntimeStateService,
} from "../runtime/runtime-state.service";

import {
    RuntimeEventDispatcherService,
} from "../runtime/runtime-event-dispatcher.service";

import {
    generateId,
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Workflow Runtime Result
|--------------------------------------------------------------------------
*/

export type WorkflowRuntimeResult =
    {
        success: boolean;

        workflowId: string;

        executionId: string;

        executedSteps: number;

        skippedSteps: number;

        startedAt: number;

        completedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Workflow Runtime Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - execute workflows
| - coordinate planners
| - coordinate action executors
| - manage workflow runtime state
| - dispatch runtime events
|
| IMPORTANT:
| This becomes the REAL
| workflow execution engine.
|
*/

export class WorkflowRuntimeService {
    /*
    |--------------------------------------------------------------------------
    | Execute Workflow
    |--------------------------------------------------------------------------
    */

    static async execute(
        workflowId: string,
        context: Record<
            string,
            unknown
        > = {}
    ):
        Promise<
            WorkflowRuntimeResult
        > {
        const startedAt =
            Date.now();

        const executionId =
            generateId();

        try {
            logInfo(
                "Executing workflow runtime",
                {
                    workflowId,

                    executionId,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Find Workflow
            |--------------------------------------------------------------------------
            */

            let workflow =
                WorkflowDefinitionService.findById(
                    workflowId
                );

            if (!workflow) {
                try {
                    const { WorkflowRepository } = require("../storage/workflow.repository");
                    const dbWorkflow = await WorkflowRepository.findById(workflowId);
                    if (dbWorkflow) {
                        workflow = {
                            id: dbWorkflow.id,
                            name: dbWorkflow.name,
                            enabled: dbWorkflow.enabled,
                            trigger: (dbWorkflow.trigger.type === "time" ? "schedule" :
                                     dbWorkflow.trigger.type === "interval" ? "schedule" :
                                     (dbWorkflow.trigger.type === "geofence_enter" || dbWorkflow.trigger.type === "geofence_exit") ? "event" : "manual") as any,
                            schedule: dbWorkflow.trigger.type === "interval"
                                ? String(dbWorkflow.trigger.everyMinutes * 60 * 1000)
                                : (dbWorkflow.trigger.type === "time" ? dbWorkflow.trigger.time : undefined),
                            actions: dbWorkflow.actions.map((act: any, idx: number) => ({
                                id: act.id || `${dbWorkflow.id}_action_${idx}`,
                                type: (act.type === "notify" ? "notification" :
                                      act.type === "ask" ? "notification" :
                                      act.type === "set_brightness" ? "set_brightness" :
                                      act.type === "set_silent" ? "set_silent" :
                                      act.type === "vibrate" ? "vibrate" : "custom") as any,
                                name: act.name || `Action ${idx}`,
                                enabled: act.enabled !== false,
                                config: act.type === "notify" ? { title: act.title, body: act.message } :
                                        act.type === "ask" ? { title: "Question", body: act.question } :
                                        act.type === "set_brightness" ? { brightness: act.config.brightness } :
                                        act.type === "set_silent" ? { silent: act.config.silent } :
                                        act.type === "vibrate" ? (act.config || {}) : {},
                            })),
                            createdAt: new Date(dbWorkflow.createdAt).getTime(),
                            updatedAt: new Date(dbWorkflow.updatedAt).getTime(),
                        };
                        WorkflowDefinitionService.register(workflow);
                    }
                } catch (dbError) {
                    logWarn("Database fallback lookup for workflow failed", { workflowId, error: dbError });
                }
            }

            if (!workflow) {
                throw new Error(
                    "Workflow not found"
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Workflow Disabled
            |--------------------------------------------------------------------------
            */

            if (!workflow.enabled) {
                throw new Error(
                    "Workflow disabled"
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Update Runtime State
            |--------------------------------------------------------------------------
            */

            RuntimeStateService.setState(
                {
                    workflowId,

                    executionId,

                    state:
                        "executing",

                    metadata: {
                        context,
                    },

                    updatedAt:
                        Date.now(),
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Dispatch Start Event
            |--------------------------------------------------------------------------
            */

            await RuntimeEventDispatcherService.dispatch(
                {
                    type:
                        "workflow.execution.started",

                    workflowId,

                    executionId,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Build Execution Plan
            |--------------------------------------------------------------------------
            */

            const plan =
                WorkflowExecutionPlannerService.build(
                    workflow,
                    context
                );

            /*
            |--------------------------------------------------------------------------
            | Workflow Not Executable
            |--------------------------------------------------------------------------
            */

            if (!plan.executable) {
                RuntimeStateService.markCompleted(
                    workflowId
                );

                return {
                    success: false,

                    workflowId,

                    executionId,

                    executedSteps: 0,

                    skippedSteps:
                        plan.skippedSteps
                            .length,

                    startedAt,

                    completedAt:
                        Date.now(),
                };
            }

            /*
            |--------------------------------------------------------------------------
            | Execute Steps
            |--------------------------------------------------------------------------
            */

            let executedSteps = 0;

            for (const step of plan.steps) {
                await WorkflowActionExecutorService.execute(
                    step,
                    workflowId
                );

                executedSteps += 1;
            }

            /*
            |--------------------------------------------------------------------------
            | Mark Complete
            |--------------------------------------------------------------------------
            */

            RuntimeStateService.markCompleted(
                workflowId
            );

            /*
            |--------------------------------------------------------------------------
            | Dispatch Complete Event
            |--------------------------------------------------------------------------
            */

            await RuntimeEventDispatcherService.dispatch(
                {
                    type:
                        "workflow.execution.completed",

                    workflowId,

                    executionId,

                    payload: {
                        executedSteps,
                    },
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Runtime Result
            |--------------------------------------------------------------------------
            */

            const result:
                WorkflowRuntimeResult =
            {
                success: true,

                workflowId,

                executionId,

                executedSteps,

                skippedSteps:
                    plan.skippedSteps
                        .length,

                startedAt,

                completedAt:
                    Date.now(),
            };

            logInfo(
                "Workflow runtime execution completed",
                result
            );

            return result;
        } catch (error) {
            /*
            |--------------------------------------------------------------------------
            | Mark Failed
            |--------------------------------------------------------------------------
            */

            RuntimeStateService.markFailed(
                workflowId,
                error instanceof Error
                    ? error.message
                    : "Unknown workflow runtime error"
            );

            /*
            |--------------------------------------------------------------------------
            | Dispatch Failure Event
            |--------------------------------------------------------------------------
            */

            await RuntimeEventDispatcherService.dispatch(
                {
                    type:
                        "workflow.execution.failed",

                    workflowId,

                    executionId,

                    payload: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                }
            );

            logError(
                "Workflow runtime execution failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Execute Multiple Workflows
    |--------------------------------------------------------------------------
    */

    static async executeMany(
        workflowIds: string[],
        context: Record<
            string,
            unknown
        > = {}
    ):
        Promise<
            WorkflowRuntimeResult[]
        > {
        const results:
            WorkflowRuntimeResult[] =
            [];

        for (const workflowId of workflowIds) {
            try {
                const result =
                    await this.execute(
                        workflowId,
                        context
                    );

                results.push(
                    result
                );
            } catch (error) {
                logWarn(
                    "Workflow batch execution failed",
                    {
                        workflowId,

                        error,
                    }
                );
            }
        }

        return results;
    }

    /*
    |--------------------------------------------------------------------------
    | Execute Enabled Workflows
    |--------------------------------------------------------------------------
    */

    static async executeEnabled(
        context: Record<
            string,
            unknown
        > = {}
    ):
        Promise<
            WorkflowRuntimeResult[]
        > {
        try {
            const workflows =
                WorkflowDefinitionService.getEnabled();

            return await this.executeMany(
                workflows.map(
                    (
                        workflow
                    ) => workflow.id
                ),
                context
            );
        } catch (error) {
            logError(
                "Enabled workflow execution failed",
                error
            );

            return [];
        }
    }
}