// src/core/scheduler/scheduler.service.ts

import { Workflow } from "../workflows/types";

import { WorkflowRepository } from "../storage/workflow.repository";

import { WorkflowLogRepository } from "../storage/workflow-log.repository";

import { TriggerService } from "../triggers/trigger.service";

import { ActionService } from "../actions/action.service";

/*
|--------------------------------------------------------------------------
| Scheduler Service
|--------------------------------------------------------------------------
|
| Central orchestration engine.
|
| Responsibilities:
| - load workflows
| - evaluate workflows
| - orchestrate triggers/actions
| - workflow lifecycle management
|
| IMPORTANT:
| Scheduler should NOT contain:
| - trigger logic
| - action logic
|
| Those belong to:
| - TriggerService
| - ActionService
|
*/

export class SchedulerService {
    private static intervalId: any | null =
        null;

    /*
    |--------------------------------------------------------------------------
    | Start Scheduler
    |--------------------------------------------------------------------------
    */

    static async start(): Promise<void> {
        console.log("Scheduler started");

        /*
        |--------------------------------------------------------------------------
        | Run immediately once
        |--------------------------------------------------------------------------
        */

        await this.tick();

        /*
        |--------------------------------------------------------------------------
        | Run every 10 seconds
        |--------------------------------------------------------------------------
        */

        this.intervalId = setInterval(
            async () => {
                await this.tick();
            },
            10 * 1000
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Stop Scheduler
    |--------------------------------------------------------------------------
    */

    static stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);

            this.intervalId = null;
        }

        console.log("Scheduler stopped");
    }

    /*
    |--------------------------------------------------------------------------
    | Main Scheduler Tick
    |--------------------------------------------------------------------------
    */

    static async tick(): Promise<void> {
        try {
            console.log("Scheduler tick");

            const workflows =
                await WorkflowRepository.findEnabled();

            for (const workflow of workflows) {
                await this.processWorkflow(
                    workflow
                );
            }
        } catch (error) {
            console.error(
                "Scheduler tick failed:",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Process Workflow
    |--------------------------------------------------------------------------
    */

    static async processWorkflow(
        workflow: Workflow
    ): Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Evaluate Workflow
            |--------------------------------------------------------------------------
            */

            const shouldRun =
                await TriggerService.evaluateWorkflow(
                    workflow
                );

            if (!shouldRun) {
                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Execute Actions
            |--------------------------------------------------------------------------
            */

            await ActionService.executeWorkflow(
                workflow
            );

            /*
            |--------------------------------------------------------------------------
            | Log Success
            |--------------------------------------------------------------------------
            */

            await WorkflowLogRepository.create({
                workflowId: workflow.id,

                eventType:
                    "workflow_executed",

                status: "success",

                message:
                    "Workflow executed successfully",

                createdAt:
                    new Date().toISOString(),
            });
        } catch (error) {
            console.error(
                `Workflow failed: ${workflow.id}`,
                error
            );

            /*
            |--------------------------------------------------------------------------
            | Log Error
            |--------------------------------------------------------------------------
            */

            await WorkflowLogRepository.create({
                workflowId: workflow.id,

                eventType:
                    "workflow_error",

                status: "error",

                message: String(error),

                createdAt:
                    new Date().toISOString(),
            });
        }
    }
}