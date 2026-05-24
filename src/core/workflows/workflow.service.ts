// src/core/workflows/workflow.service.ts

import dayjs from "dayjs";

import { Workflow } from "./types";

import { WorkflowFactory } from "./workflow.factory";

import { WorkflowRepository } from "../storage/workflow.repository";

import { WorkflowLogRepository } from "../storage/workflow-log.repository";

/*
|--------------------------------------------------------------------------
| Workflow Service
|--------------------------------------------------------------------------
|
| Main business logic layer.
|
| Responsibilities:
| - create workflows
| - update workflows
| - delete workflows
| - enable/disable workflows
| - workflow lifecycle management
| - workflow logging
|
*/

export class WorkflowService {
    /*
    |--------------------------------------------------------------------------
    | Create Workflow
    |--------------------------------------------------------------------------
    */

    static async create(
        payload: Partial<Workflow>
    ): Promise<Workflow> {
        const workflow =
            WorkflowFactory.create(payload);

        await WorkflowRepository.create(
            workflow
        );

        await WorkflowLogRepository.create({
            workflowId: workflow.id,
            eventType: "workflow_created",
            status: "success",
            message: `Workflow "${workflow.name}" created`,
            createdAt: new Date().toISOString(),
        });

        return workflow;
    }

    /*
    |--------------------------------------------------------------------------
    | Update Workflow
    |--------------------------------------------------------------------------
    */

    static async update(
        workflowId: string,
        updates: Partial<Workflow>
    ): Promise<Workflow | null> {
        const existing =
            await WorkflowRepository.findById(
                workflowId
            );

        if (!existing) {
            return null;
        }

        const updatedWorkflow =
            WorkflowFactory.create({
                ...existing,

                ...updates,

                updatedAt:
                    dayjs().toISOString(),
            });

        await WorkflowRepository.update(
            updatedWorkflow
        );

        await WorkflowLogRepository.create({
            workflowId:
                updatedWorkflow.id,

            eventType: "workflow_updated",

            status: "success",

            message: `Workflow "${updatedWorkflow.name}" updated`,

            createdAt:
                new Date().toISOString(),
        });

        return updatedWorkflow;
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Workflow
    |--------------------------------------------------------------------------
    */

    static async delete(
        workflowId: string
    ): Promise<void> {
        const workflow =
            await WorkflowRepository.findById(
                workflowId
            );

        if (!workflow) {
            return;
        }

        await WorkflowRepository.delete(
            workflowId
        );

        await WorkflowLogRepository.deleteByWorkflowId(
            workflowId
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Enable Workflow
    |--------------------------------------------------------------------------
    */

    static async enable(
        workflowId: string
    ): Promise<Workflow | null> {
        return this.update(workflowId, {
            enabled: true,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Disable Workflow
    |--------------------------------------------------------------------------
    */

    static async disable(
        workflowId: string
    ): Promise<Workflow | null> {
        return this.update(workflowId, {
            enabled: false,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Pause Workflow
    |--------------------------------------------------------------------------
    */

    static async pause(
        workflowId: string
    ): Promise<Workflow | null> {
        return this.update(workflowId, {
            state: "paused",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Resume Workflow
    |--------------------------------------------------------------------------
    */

    static async resume(
        workflowId: string
    ): Promise<Workflow | null> {
        return this.update(workflowId, {
            state: "active",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Find Workflow
    |--------------------------------------------------------------------------
    */

    static async findById(
        workflowId: string
    ): Promise<Workflow | null> {
        return WorkflowRepository.findById(
            workflowId
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Find All Workflows
    |--------------------------------------------------------------------------
    */

    static async findAll(): Promise<
        Workflow[]
    > {
        return WorkflowRepository.findAll();
    }

    /*
    |--------------------------------------------------------------------------
    | Find Enabled Workflows
    |--------------------------------------------------------------------------
    */

    static async findEnabled(): Promise<
        Workflow[]
    > {
        return WorkflowRepository.findEnabled();
    }
}