// src/core/workflows/workflow-execution-planner.service.ts

import {
    WorkflowDefinition,
    WorkflowAction,
    WorkflowCondition,
} from "./workflow-definition.service";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Workflow Execution Step
|--------------------------------------------------------------------------
*/

export type WorkflowExecutionStep =
    {
        actionId: string;

        actionType: string;

        actionName: string;

        executable: boolean;

        delayMs?: number;

        config: Record<
            string,
            unknown
        >;
    };

/*
|--------------------------------------------------------------------------
| Workflow Execution Plan
|--------------------------------------------------------------------------
*/

export type WorkflowExecutionPlan =
    {
        workflowId: string;

        executable: boolean;

        steps:
        WorkflowExecutionStep[];

        skippedSteps:
        string[];

        generatedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Workflow Execution Planner
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - generate execution plans
| - evaluate workflow conditions
| - filter executable actions
| - prepare workflow pipelines
|
| IMPORTANT:
| This becomes the bridge between:
|
| workflow definitions
|        ↓
| runtime execution engine
|
*/

export class WorkflowExecutionPlannerService {
    /*
    |--------------------------------------------------------------------------
    | Build Execution Plan
    |--------------------------------------------------------------------------
    */

    static build(
        workflow:
            WorkflowDefinition,
        context: Record<
            string,
            unknown
        > = {}
    ):
        WorkflowExecutionPlan {
        try {
            logInfo(
                "Building workflow execution plan",
                {
                    workflowId:
                        workflow.id,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Validate Workflow Conditions
            |--------------------------------------------------------------------------
            */

            const workflowExecutable =
                this.evaluateConditions(
                    workflow.conditions ??
                    [],
                    context
                );

            /*
            |--------------------------------------------------------------------------
            | Workflow Blocked
            |--------------------------------------------------------------------------
            */

            if (
                !workflowExecutable
            ) {
                return {
                    workflowId:
                        workflow.id,

                    executable:
                        false,

                    steps: [],

                    skippedSteps:
                        workflow.actions.map(
                            (
                                action
                            ) => action.id
                        ),

                    generatedAt:
                        Date.now(),
                };
            }

            /*
            |--------------------------------------------------------------------------
            | Build Steps
            |--------------------------------------------------------------------------
            */

            const steps:
                WorkflowExecutionStep[] =
                [];

            const skippedSteps:
                string[] = [];

            for (const action of workflow.actions) {
                /*
                |--------------------------------------------------------------------------
                | Disabled Action
                |--------------------------------------------------------------------------
                */

                if (!action.enabled) {
                    skippedSteps.push(
                        action.id
                    );

                    continue;
                }

                /*
                |--------------------------------------------------------------------------
                | Action Conditions
                |--------------------------------------------------------------------------
                */

                const executable =
                    this.evaluateConditions(
                        action.conditions ??
                        [],
                        context
                    );

                if (!executable) {
                    skippedSteps.push(
                        action.id
                    );

                    continue;
                }

                /*
                |--------------------------------------------------------------------------
                | Create Step
                |--------------------------------------------------------------------------
                */

                steps.push({
                    actionId:
                        action.id,

                    actionType:
                        action.type,

                    actionName:
                        action.name,

                    executable,

                    delayMs:
                        action.delayMs,

                    config:
                        action.config,
                });
            }

            /*
            |--------------------------------------------------------------------------
            | Execution Plan
            |--------------------------------------------------------------------------
            */

            const plan:
                WorkflowExecutionPlan =
            {
                workflowId:
                    workflow.id,

                executable:
                    steps.length > 0,

                steps,

                skippedSteps,

                generatedAt:
                    Date.now(),
            };

            logInfo(
                "Workflow execution plan generated",
                {
                    workflowId:
                        workflow.id,

                    executableSteps:
                        steps.length,

                    skippedSteps:
                        skippedSteps.length,
                }
            );

            return plan;
        } catch (error) {
            logError(
                "Workflow execution planning failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Evaluate Conditions
    |--------------------------------------------------------------------------
    */

    private static evaluateConditions(
        conditions:
            WorkflowCondition[],
        context: Record<
            string,
            unknown
        >
    ): boolean {
        try {
            /*
            |--------------------------------------------------------------------------
            | No Conditions
            |--------------------------------------------------------------------------
            */

            if (
                conditions.length ===
                0
            ) {
                return true;
            }

            /*
            |--------------------------------------------------------------------------
            | Validate All Conditions
            |--------------------------------------------------------------------------
            */

            return conditions.every(
                (
                    condition
                ) =>
                    this.evaluateCondition(
                        condition,
                        context
                    )
            );
        } catch (error) {
            logWarn(
                "Workflow condition evaluation failed",
                error
            );

            return false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Evaluate Single Condition
    |--------------------------------------------------------------------------
    */

    private static evaluateCondition(
        condition:
            WorkflowCondition,
        context: Record<
            string,
            unknown
        >
    ): boolean {
        const value =
            context[
            condition.field
            ];

        switch (
        condition.operator
        ) {
            case "equals":
                return (
                    value ===
                    condition.value
                );

            case "not_equals":
                return (
                    value !==
                    condition.value
                );

            case "greater_than":
                return (
                    Number(value) >
                    Number(
                        condition.value
                    )
                );

            case "less_than":
                return (
                    Number(value) <
                    Number(
                        condition.value
                    )
                );

            case "contains":
                return String(
                    value
                ).includes(
                    String(
                        condition.value
                    )
                );

            default:
                return false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Estimate Execution Duration
    |--------------------------------------------------------------------------
    */

    static estimateDuration(
        workflow:
            WorkflowDefinition
    ): number {
        try {
            return workflow.actions.reduce(
                (
                    total,
                    action
                ) =>
                    total +
                    (action.delayMs ??
                        0),
                0
            );
        } catch (error) {
            logError(
                "Workflow duration estimation failed",
                error
            );

            return 0;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Extract Action Types
    |--------------------------------------------------------------------------
    */

    static getActionTypes(
        workflow:
            WorkflowDefinition
    ): string[] {
        try {
            return [
                ...new Set(
                    workflow.actions.map(
                        (
                            action
                        ) => action.type
                    )
                ),
            ];
        } catch (error) {
            logError(
                "Workflow action type extraction failed",
                error
            );

            return [];
        }
    }
}