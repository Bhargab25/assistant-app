// src/core/workflows/workflow-definition.service.ts

import {
    generateId,
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Workflow Trigger
|--------------------------------------------------------------------------
*/

export type WorkflowTrigger =
    | "manual"
    | "schedule"
    | "notification"
    | "event"
    | "assistant";

/*
|--------------------------------------------------------------------------
| Workflow Action Type
|--------------------------------------------------------------------------
*/

export type WorkflowActionType =
    | "notification"
    | "assistant_message"
    | "sound_alarm"
    | "update_state"
    | "delay"
    | "custom";

/*
|--------------------------------------------------------------------------
| Workflow Condition
|--------------------------------------------------------------------------
*/

export type WorkflowCondition =
    {
        id: string;

        field: string;

        operator:
        | "equals"
        | "not_equals"
        | "greater_than"
        | "less_than"
        | "contains";

        value: unknown;
    };

/*
|--------------------------------------------------------------------------
| Workflow Action
|--------------------------------------------------------------------------
*/

export type WorkflowAction =
    {
        id: string;

        type:
        WorkflowActionType;

        name: string;

        enabled: boolean;

        config: Record<
            string,
            unknown
        >;

        conditions?:
        WorkflowCondition[];

        delayMs?: number;
    };

/*
|--------------------------------------------------------------------------
| Workflow Definition
|--------------------------------------------------------------------------
*/

export type WorkflowDefinition =
    {
        id: string;

        name: string;

        description?: string;

        enabled: boolean;

        trigger:
        WorkflowTrigger;

        schedule?: string;

        conditions?:
        WorkflowCondition[];

        actions:
        WorkflowAction[];

        metadata?: Record<
            string,
            unknown
        >;

        createdAt: number;

        updatedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Workflow Definition Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - define workflows
| - manage workflow definitions
| - validate workflow structures
| - expose workflow metadata
|
| IMPORTANT:
| This becomes the FOUNDATION
| automation definition layer.
|
*/

export class WorkflowDefinitionService {
    /*
    |--------------------------------------------------------------------------
    | Workflow Store
    |--------------------------------------------------------------------------
    */

    private static workflows:
        WorkflowDefinition[] =
        [];

    /*
    |--------------------------------------------------------------------------
    | Register Workflow Definition
    |--------------------------------------------------------------------------
    */

    static register(
        workflow: WorkflowDefinition
    ): void {
        const index = this.workflows.findIndex(
            (w) => w.id === workflow.id
        );

        if (index !== -1) {
            this.workflows[index] = workflow;
        } else {
            this.workflows.push(workflow);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Create Workflow
    |--------------------------------------------------------------------------
    */

    static create(
        workflow: Omit<
            WorkflowDefinition,
            | "id"
            | "createdAt"
            | "updatedAt"
        >
    ): WorkflowDefinition {
        try {
            const definition:
                WorkflowDefinition =
            {
                ...workflow,

                id: generateId(),

                createdAt:
                    Date.now(),

                updatedAt:
                    Date.now(),
            };

            /*
            |--------------------------------------------------------------------------
            | Validate Workflow
            |--------------------------------------------------------------------------
            */

            this.validate(
                definition
            );

            /*
            |--------------------------------------------------------------------------
            | Persist Workflow
            |--------------------------------------------------------------------------
            */

            this.workflows.push(
                definition
            );

            logInfo(
                "Workflow definition created",
                {
                    workflowId:
                        definition.id,

                    name:
                        definition.name,
                }
            );

            return definition;
        } catch (error) {
            logError(
                "Workflow creation failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Update Workflow
    |--------------------------------------------------------------------------
    */

    static update(
        workflowId: string,
        updates: Partial<
            WorkflowDefinition
        >
    ):
        WorkflowDefinition | null {
        try {
            const index =
                this.workflows.findIndex(
                    (
                        workflow
                    ) =>
                        workflow.id ===
                        workflowId
                );

            if (index === -1) {
                return null;
            }

            const updated:
                WorkflowDefinition =
            {
                ...this.workflows[
                index
                ],

                ...updates,

                updatedAt:
                    Date.now(),
            };

            this.validate(
                updated
            );

            this.workflows[
                index
            ] = updated;

            logInfo(
                "Workflow updated",
                {
                    workflowId,
                }
            );

            return updated;
        } catch (error) {
            logError(
                "Workflow update failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Workflow
    |--------------------------------------------------------------------------
    */

    static delete(
        workflowId: string
    ): boolean {
        try {
            const before =
                this.workflows.length;

            this.workflows =
                this.workflows.filter(
                    (
                        workflow
                    ) =>
                        workflow.id !==
                        workflowId
                );

            const deleted =
                before !==
                this.workflows.length;

            if (deleted) {
                logInfo(
                    "Workflow deleted",
                    {
                        workflowId,
                    }
                );
            }

            return deleted;
        } catch (error) {
            logError(
                "Workflow deletion failed",
                error
            );

            return false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Find Workflow
    |--------------------------------------------------------------------------
    */

    static findById(
        workflowId: string
    ):
        WorkflowDefinition | null {
        return (
            this.workflows.find(
                (
                    workflow
                ) =>
                    workflow.id ===
                    workflowId
            ) ?? null
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get All Workflows
    |--------------------------------------------------------------------------
    */

    static getAll():
        WorkflowDefinition[] {
        return this.workflows;
    }

    /*
    |--------------------------------------------------------------------------
    | Get Enabled Workflows
    |--------------------------------------------------------------------------
    */

    static getEnabled():
        WorkflowDefinition[] {
        return this.workflows.filter(
            (
                workflow
            ) => workflow.enabled
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Workflow
    |--------------------------------------------------------------------------
    */

    static validate(
        workflow:
            WorkflowDefinition
    ): boolean {
        /*
        |--------------------------------------------------------------------------
        | Basic Validation
        |--------------------------------------------------------------------------
        */

        if (!workflow.name) {
            throw new Error(
                "Workflow name required"
            );
        }

        if (
            !workflow.actions ||
            workflow.actions.length ===
            0
        ) {
            throw new Error(
                "Workflow must contain at least one action"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Actions
        |--------------------------------------------------------------------------
        */

        for (const action of workflow.actions) {
            if (!action.name) {
                throw new Error(
                    "Workflow action name required"
                );
            }

            if (!action.type) {
                throw new Error(
                    "Workflow action type required"
                );
            }
        }

        return true;
    }

    /*
    |--------------------------------------------------------------------------
    | Clone Workflow
    |--------------------------------------------------------------------------
    */

    static clone(
        workflowId: string
    ):
        WorkflowDefinition | null {
        try {
            const workflow =
                this.findById(
                    workflowId
                );

            if (!workflow) {
                return null;
            }

            return this.create({
                ...workflow,

                name:
                    `${workflow.name} Copy`,
            });
        } catch (error) {
            logError(
                "Workflow clone failed",
                error
            );

            return null;
        }
    }
}