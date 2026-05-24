// src/core/workflows/workflow-registry.service.ts

import {
    WorkflowDefinition,
} from "./workflow-definition.service";

import {
    WorkflowTemplateService,
} from "./workflow-template.service";

import {
    WorkflowDefinitionService,
} from "./workflow-definition.service";

import {
    WorkflowSchedulerService,
} from "./workflow-scheduler.service";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Workflow Registry State
|--------------------------------------------------------------------------
*/

type WorkflowRegistryState =
    {
        initialized: boolean;

        registered: number;

        scheduled: number;

        startedAt?: number;
    };

/*
|--------------------------------------------------------------------------
| Workflow Registry Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - register workflows
| - bootstrap templates
| - initialize workflow ecosystem
| - connect scheduler to workflows
|
| IMPORTANT:
| This becomes the CENTRAL
| workflow registry layer.
|
*/

export class WorkflowRegistryService {
    /*
    |--------------------------------------------------------------------------
    | Registry State
    |--------------------------------------------------------------------------
    */

    private static state:
        WorkflowRegistryState =
        {
            initialized: false,

            registered: 0,

            scheduled: 0,
        };

    /*
    |--------------------------------------------------------------------------
    | Initialize Registry
    |--------------------------------------------------------------------------
    */

    static async initialize():
        Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Prevent Duplicate Init
            |--------------------------------------------------------------------------
            */

            if (
                this.state
                    .initialized
            ) {
                return;
            }

            logInfo(
                "Initializing workflow registry..."
            );

            /*
            |--------------------------------------------------------------------------
            | Bootstrap Templates
            |--------------------------------------------------------------------------
            */

            await this.bootstrapTemplates();

            /*
            |--------------------------------------------------------------------------
            | Start Scheduler
            |--------------------------------------------------------------------------
            */

            WorkflowSchedulerService.start();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state = {
                initialized: true,

                registered:
                    WorkflowDefinitionService
                        .getAll()
                        .length,

                scheduled:
                    WorkflowSchedulerService
                        .getSchedules()
                        .length,

                startedAt:
                    Date.now(),
            };

            logInfo(
                "Workflow registry initialized",
                this.state
            );
        } catch (error) {
            logError(
                "Workflow registry initialization failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Bootstrap Templates
    |--------------------------------------------------------------------------
    */

    private static async bootstrapTemplates():
        Promise<void> {
        try {
            const templates =
                WorkflowTemplateService.getAll();

            /*
            |--------------------------------------------------------------------------
            | Prevent Duplicate Creation
            |--------------------------------------------------------------------------
            */

            if (
                WorkflowDefinitionService
                    .getAll()
                    .length > 0
            ) {
                logWarn(
                    "Workflow registry already populated"
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Create Workflows
            |--------------------------------------------------------------------------
            */

            for (const template of templates) {
                WorkflowTemplateService.createWorkflow(
                    template.id
                );
            }

            logInfo(
                "Workflow templates bootstrapped",
                {
                    templates:
                        templates.length,
                }
            );
        } catch (error) {
            logError(
                "Workflow template bootstrap failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Register Workflow
    |--------------------------------------------------------------------------
    */

    static register(
        workflow:
            WorkflowDefinition
    ): void {
        try {
            /*
            |--------------------------------------------------------------------------
            | Register Schedule
            |--------------------------------------------------------------------------
            */

            if (
                workflow.trigger ===
                "schedule" &&
                workflow.schedule
            ) {
                WorkflowSchedulerService.register(
                    workflow.id,
                    workflow.schedule
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state.registered =
                WorkflowDefinitionService
                    .getAll()
                    .length;

            this.state.scheduled =
                WorkflowSchedulerService
                    .getSchedules()
                    .length;

            logInfo(
                "Workflow registered",
                {
                    workflowId:
                        workflow.id,
                }
            );
        } catch (error) {
            logError(
                "Workflow registration failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Unregister Workflow
    |--------------------------------------------------------------------------
    */

    static unregister(
        workflowId: string
    ): void {
        try {
            WorkflowSchedulerService.unregister(
                workflowId
            );

            WorkflowDefinitionService.delete(
                workflowId
            );

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state.registered =
                WorkflowDefinitionService
                    .getAll()
                    .length;

            this.state.scheduled =
                WorkflowSchedulerService
                    .getSchedules()
                    .length;

            logInfo(
                "Workflow unregistered",
                {
                    workflowId,
                }
            );
        } catch (error) {
            logError(
                "Workflow unregister failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Reload Scheduler
    |--------------------------------------------------------------------------
    */

    static reloadScheduler():
        void {
        try {
            WorkflowSchedulerService.stop();

            WorkflowSchedulerService.start();

            this.state.scheduled =
                WorkflowSchedulerService
                    .getSchedules()
                    .length;

            logInfo(
                "Workflow scheduler reloaded"
            );
        } catch (error) {
            logError(
                "Workflow scheduler reload failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Get Workflows
    |--------------------------------------------------------------------------
    */

    static getWorkflows():
        WorkflowDefinition[] {
        return WorkflowDefinitionService.getAll();
    }

    /*
    |--------------------------------------------------------------------------
    | Registry State
    |--------------------------------------------------------------------------
    */

    static getState():
        WorkflowRegistryState {
        return this.state;
    }

    /*
    |--------------------------------------------------------------------------
    | Is Ready
    |--------------------------------------------------------------------------
    */

    static isReady():
        boolean {
        return (
            this.state
                .initialized
        );
    }
}