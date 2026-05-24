// src/core/workflows/workflow-scheduler.service.ts

import {
    WorkflowDefinitionService,
} from "./workflow-definition.service";

import {
    WorkflowTriggerService,
} from "./workflow-trigger.service";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Workflow Scheduler State
|--------------------------------------------------------------------------
*/

type WorkflowSchedulerState =
    {
        running: boolean;

        registered: number;

        startedAt?: number;
    };

/*
|--------------------------------------------------------------------------
| Workflow Schedule Entry
|--------------------------------------------------------------------------
*/

type WorkflowScheduleEntry =
    {
        workflowId: string;

        interval: NodeJS.Timeout;

        cron: string;
    };

/*
|--------------------------------------------------------------------------
| Workflow Scheduler Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - schedule workflows
| - manage recurring executions
| - register workflow timers
| - trigger scheduled workflows
|
| IMPORTANT:
| This becomes the FIRST
| workflow automation scheduler.
|
| NOTE:
| This is a SIMPLE interval-based
| scheduler for now.
|
*/

export class WorkflowSchedulerService {
    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    private static state:
        WorkflowSchedulerState =
        {
            running: false,

            registered: 0,
        };

    /*
    |--------------------------------------------------------------------------
    | Schedules
    |--------------------------------------------------------------------------
    */

    private static schedules:
        WorkflowScheduleEntry[] =
        [];

    /*
    |--------------------------------------------------------------------------
    | Start Scheduler
    |--------------------------------------------------------------------------
    */

    static start():
        void {
        try {
            if (
                this.state.running
            ) {
                return;
            }

            logInfo(
                "Starting workflow scheduler..."
            );

            /*
            |--------------------------------------------------------------------------
            | Register Existing Workflows
            |--------------------------------------------------------------------------
            */

            this.registerAll();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state.running =
                true;

            this.state.startedAt =
                Date.now();

            logInfo(
                "Workflow scheduler started"
            );
        } catch (error) {
            logError(
                "Workflow scheduler failed to start",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Stop Scheduler
    |--------------------------------------------------------------------------
    */

    static stop():
        void {
        try {
            for (const entry of this.schedules) {
                clearInterval(
                    entry.interval
                );
            }

            this.schedules = [];

            this.state.running =
                false;

            this.state.registered =
                0;

            logInfo(
                "Workflow scheduler stopped"
            );
        } catch (error) {
            logError(
                "Workflow scheduler stop failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Register All Scheduled Workflows
    |--------------------------------------------------------------------------
    */

    static registerAll():
        void {
        try {
            const workflows =
                WorkflowDefinitionService
                    .getEnabled()
                    .filter(
                        (
                            workflow
                        ) =>
                            workflow.trigger ===
                            "schedule" &&
                            workflow.schedule
                    );

            for (const workflow of workflows) {
                this.register(
                    workflow.id,
                    workflow.schedule!
                );
            }

            logInfo(
                "Workflow schedules registered",
                {
                    count:
                        workflows.length,
                }
            );
        } catch (error) {
            logError(
                "Workflow schedule registration failed",
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
        workflowId: string,
        cron: string
    ): void {
        try {
            /*
            |--------------------------------------------------------------------------
            | Parse Interval
            |--------------------------------------------------------------------------
            |
            | TEMP:
            | schedule is treated as milliseconds
            |
            | Example:
            | "60000"
            |
            */

            const intervalMs =
                Number(cron);

            if (
                Number.isNaN(
                    intervalMs
                ) ||
                intervalMs <= 0
            ) {
                logWarn(
                    "Invalid workflow schedule",
                    {
                        workflowId,

                        cron,
                    }
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Create Interval
            |--------------------------------------------------------------------------
            */

            const interval =
                setInterval(
                    async () => {
                        try {
                            await WorkflowTriggerService.scheduled(
                                {
                                    workflowId,
                                }
                            );

                            logInfo(
                                "Scheduled workflow triggered",
                                {
                                    workflowId,
                                }
                            );
                        } catch (error) {
                            logError(
                                "Scheduled workflow execution failed",
                                error
                            );
                        }
                    },
                    intervalMs
                );

            /*
            |--------------------------------------------------------------------------
            | Persist Schedule
            |--------------------------------------------------------------------------
            */

            this.schedules.push(
                {
                    workflowId,

                    interval,

                    cron,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state.registered =
                this.schedules.length;

            logInfo(
                "Workflow schedule registered",
                {
                    workflowId,

                    intervalMs,
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
            const schedule =
                this.schedules.find(
                    (
                        entry
                    ) =>
                        entry.workflowId ===
                        workflowId
                );

            if (!schedule) {
                return;
            }

            clearInterval(
                schedule.interval
            );

            this.schedules =
                this.schedules.filter(
                    (
                        entry
                    ) =>
                        entry.workflowId !==
                        workflowId
                );

            this.state.registered =
                this.schedules.length;

            logInfo(
                "Workflow schedule unregistered",
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
    | Scheduler State
    |--------------------------------------------------------------------------
    */

    static getState():
        WorkflowSchedulerState {
        return this.state;
    }

    /*
    |--------------------------------------------------------------------------
    | Get Schedules
    |--------------------------------------------------------------------------
    */

    static getSchedules():
        WorkflowScheduleEntry[] {
        return this.schedules;
    }

    /*
    |--------------------------------------------------------------------------
    | Is Running
    |--------------------------------------------------------------------------
    */

    static isRunning():
        boolean {
        return this.state.running;
    }
}