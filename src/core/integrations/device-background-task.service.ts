// src/core/integrations/device-background-task.service.ts

import * as TaskManager from "expo-task-manager";

import * as BackgroundFetch from "expo-background-fetch";

import {
    WorkflowTriggerService,
} from "../workflows/workflow-trigger.service";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Background Task Definition
|--------------------------------------------------------------------------
*/

export type BackgroundTaskDefinition =
    {
        name: string;

        minimumInterval?: number;
    };

/*
|--------------------------------------------------------------------------
| Background Runtime State
|--------------------------------------------------------------------------
*/

type BackgroundRuntimeState =
    {
        initialized: boolean;

        registered: string[];

        startedAt?: number;
    };

/*
|--------------------------------------------------------------------------
| Default Task
|--------------------------------------------------------------------------
*/

const DEFAULT_TASK =
    "assistant-background-runtime";

/*
|--------------------------------------------------------------------------
| Device Background Task Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - register background tasks
| - run assistant automation in background
| - trigger scheduled workflows
| - support mobile runtime execution
|
| IMPORTANT:
| This becomes the REAL
| background execution layer.
|
*/

export class DeviceBackgroundTaskService {
    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    private static state:
        BackgroundRuntimeState =
        {
            initialized: false,

            registered: [],
        };

    /*
    |--------------------------------------------------------------------------
    | Initialize Background Runtime
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
                "Initializing background runtime..."
            );

            /*
            |--------------------------------------------------------------------------
            | Define Default Task
            |--------------------------------------------------------------------------
            */

            this.defineTask(
                DEFAULT_TASK
            );

            /*
            |--------------------------------------------------------------------------
            | Register Task
            |--------------------------------------------------------------------------
            */

            await this.register({
                name:
                    DEFAULT_TASK,

                minimumInterval:
                    60,
            });

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state.initialized =
                true;

            this.state.startedAt =
                Date.now();

            logInfo(
                "Background runtime initialized"
            );
        } catch (error) {
            logError(
                "Background runtime initialization failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Define Task
    |--------------------------------------------------------------------------
    */

    static defineTask(
        taskName: string
    ): void {
        try {
            /*
            |--------------------------------------------------------------------------
            | Prevent Duplicate Definition
            |--------------------------------------------------------------------------
            */

            const alreadyDefined =
                TaskManager.isTaskDefined(
                    taskName
                );

            if (
                alreadyDefined
            ) {
                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Define Background Task
            |--------------------------------------------------------------------------
            */

            TaskManager.defineTask(
                taskName,
                async () => {
                    try {
                        logInfo(
                            "Background task executing",
                            {
                                taskName,
                            }
                        );

                        /*
                        |--------------------------------------------------------------------------
                        | Trigger Scheduled Workflows
                        |--------------------------------------------------------------------------
                        */

                        await WorkflowTriggerService.scheduled(
                            {
                                source:
                                    "background_task",
                            }
                        );

                        logInfo(
                            "Background workflows executed"
                        );

                        return BackgroundFetch.BackgroundFetchResult
                            .NewData;
                    } catch (error) {
                        logError(
                            "Background task execution failed",
                            error
                        );

                        return BackgroundFetch.BackgroundFetchResult
                            .Failed;
                    }
                }
            );

            logInfo(
                "Background task defined",
                {
                    taskName,
                }
            );
        } catch (error) {
            logError(
                "Background task definition failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Register Task
    |--------------------------------------------------------------------------
    */

    static async register(
        task:
            BackgroundTaskDefinition
    ): Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Already Registered
            |--------------------------------------------------------------------------
            */

            const registered =
                await TaskManager.isTaskRegisteredAsync(
                    task.name
                );

            if (
                registered
            ) {
                logWarn(
                    "Background task already registered",
                    {
                        taskName:
                            task.name,
                    }
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Register Background Fetch
            |--------------------------------------------------------------------------
            */

            await BackgroundFetch.registerTaskAsync(
                task.name,
                {
                    minimumInterval:
                        task.minimumInterval ??
                        60,

                    stopOnTerminate:
                        false,

                    startOnBoot:
                        true,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Persist Runtime State
            |--------------------------------------------------------------------------
            */

            this.state.registered.push(
                task.name
            );

            logInfo(
                "Background task registered",
                {
                    taskName:
                        task.name,
                }
            );
        } catch (error) {
            logError(
                "Background task registration failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Unregister Task
    |--------------------------------------------------------------------------
    */

    static async unregister(
        taskName: string
    ): Promise<void> {
        try {
            await BackgroundFetch.unregisterTaskAsync(
                taskName
            );

            this.state.registered =
                this.state.registered.filter(
                    (
                        task
                    ) =>
                        task !== taskName
                );

            logInfo(
                "Background task unregistered",
                {
                    taskName,
                }
            );
        } catch (error) {
            logError(
                "Background task unregister failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Background Status
    |--------------------------------------------------------------------------
    */

    static async status() {
        try {
            const status =
                await BackgroundFetch.getStatusAsync();

            return status;
        } catch (error) {
            logError(
                "Background status check failed",
                error
            );

            return null;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    static getState():
        BackgroundRuntimeState {
        return this.state;
    }

    /*
    |--------------------------------------------------------------------------
    | Is Ready
    |--------------------------------------------------------------------------
    */

    static isReady():
        boolean {
        return this.state
            .initialized;
    }
}