// src/core/workflows/workflow.factory.ts

import dayjs from "dayjs";

import { Workflow } from "./types";

import {
    WorkflowSchema,
} from "./validators";

/*
|--------------------------------------------------------------------------
| Workflow Factory
|--------------------------------------------------------------------------
|
| Responsible for:
| - creating safe workflow objects
| - enforcing defaults
| - schema validation
| - future workflow versioning
|
*/

export class WorkflowFactory {
    /*
    |--------------------------------------------------------------------------
    | Create Workflow
    |--------------------------------------------------------------------------
    */

    static create(
        workflow: Partial<Workflow>
    ): Workflow {
        const now = dayjs().toISOString();

        const safeWorkflow: Workflow = {
            id:
                workflow.id ??
                this.generateId(),

            name:
                workflow.name ??
                "Untitled Workflow",

            enabled:
                workflow.enabled ?? true,

            trigger:
                workflow.trigger!,

            conditions:
                workflow.conditions ?? [],

            actions:
                workflow.actions ?? [],

            retryPolicy:
                workflow.retryPolicy,

            state:
                workflow.state ?? "idle",

            createdAt:
                workflow.createdAt ?? now,

            updatedAt:
                workflow.updatedAt ?? now,
        };

        /*
        |--------------------------------------------------------------------------
        | Validate Workflow
        |--------------------------------------------------------------------------
        */

        const validated =
            WorkflowSchema.parse(
                safeWorkflow
            );

        return validated;
    }

    /*
    |--------------------------------------------------------------------------
    | Clone Workflow
    |--------------------------------------------------------------------------
    */

    static clone(
        workflow: Workflow
    ): Workflow {
        return this.create({
            ...workflow,

            id: this.generateId(),

            createdAt:
                dayjs().toISOString(),

            updatedAt:
                dayjs().toISOString(),
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Create Empty Workflow
    |--------------------------------------------------------------------------
    */

    static createEmpty(): Workflow {
        return this.create({
            name: "New Workflow",

            trigger: {
                type: "interval",
                everyMinutes: 60,
            },

            actions: [
                {
                    type: "notify",
                    title: "Reminder",
                    message: "Complete task",
                },
            ],
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Workflow ID
    |--------------------------------------------------------------------------
    */

    static generateId(): string {
        return (
            "wf_" +
            Math.random()
                .toString(36)
                .substring(2, 12)
        );
    }
}