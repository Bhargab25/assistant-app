// src/core/app/app-runtime.service.ts

import {
    DeviceRuntimeBootstrapService,
} from "../integrations/device-runtime-bootstrap.service";

import {
    WorkflowTriggerService,
} from "../workflows/workflow-trigger.service";

import {
    WorkflowDefinitionService,
} from "../workflows/workflow-definition.service";

import {
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| App Runtime State
|--------------------------------------------------------------------------
*/

type AppRuntimeState =
    {
        initialized: boolean;

        ready: boolean;

        startedAt?: number;
    };

/*
|--------------------------------------------------------------------------
| App Runtime Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - bootstrap assistant runtime
| - initialize device integrations
| - initialize workflows
| - expose runtime state
|
| IMPORTANT:
| This becomes the MAIN
| intelligent assistant runtime.
|
*/

export class AppRuntimeService {
    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    private static state:
        AppRuntimeState =
        {
            initialized: false,

            ready: false,
        };

    /*
    |--------------------------------------------------------------------------
    | Initialize Runtime
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
                "Initializing app runtime..."
            );

            /*
            |--------------------------------------------------------------------------
            | Bootstrap Device Runtime
            |--------------------------------------------------------------------------
            */

            await DeviceRuntimeBootstrapService.initialize();

            /*
            |--------------------------------------------------------------------------
            | Trigger Assistant Startup
            |--------------------------------------------------------------------------
            */

            await WorkflowTriggerService.assistant(
                {
                    startup: true,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state.initialized =
                true;

            this.state.ready =
                true;

            this.state.startedAt =
                Date.now();

            logInfo(
                "App runtime initialized"
            );

            /*
            |--------------------------------------------------------------------------
            | Debug Workflows
            |--------------------------------------------------------------------------
            */

            logInfo(
                "Registered workflows",
                WorkflowDefinitionService.getAll()
            );
        } catch (error) {
            logError(
                "App runtime initialization failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    static getState():
        AppRuntimeState {
        return this.state;
    }

    /*
    |--------------------------------------------------------------------------
    | Is Ready
    |--------------------------------------------------------------------------
    */

    static isReady():
        boolean {
        return this.state.ready;
    }
}