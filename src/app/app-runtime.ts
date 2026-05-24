// src/app/app-runtime.ts

import {
    PlatformOrchestratorService,
} from "../core/platform/platform-orchestrator.service";

import {
    AppBootstrap,
} from "../core/app/bootstrap";

import {
    AppLifecycleService,
} from "./app-lifecycle";

import {
    logInfo,
    logError,
} from "../shared/utils";

/*
|--------------------------------------------------------------------------
| App Runtime State
|--------------------------------------------------------------------------
*/

type AppRuntimeState =
    {
        initialized: boolean;

        startedAt?: number;

        lifecycleReady: boolean;

        platformReady: boolean;

        bootstrapReady: boolean;
    };

/*
|--------------------------------------------------------------------------
| App Runtime Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - bootstrap mobile application runtime
| - initialize legacy bootstrap systems
| - initialize platform orchestrator
| - initialize lifecycle management
| - coordinate startup/shutdown
|
| IMPORTANT:
| This becomes the FINAL
| mobile runtime bootstrap layer.
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

            lifecycleReady: false,

            platformReady: false,

            bootstrapReady: false,
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
            | Initialize Existing Bootstrap
            |--------------------------------------------------------------------------
            */

            await AppBootstrap.initialize();

            /*
            |--------------------------------------------------------------------------
            | Initialize Platform Orchestrator
            |--------------------------------------------------------------------------
            */

            await PlatformOrchestratorService.initialize();

            /*
            |--------------------------------------------------------------------------
            | Initialize App Lifecycle
            |--------------------------------------------------------------------------
            */

            AppLifecycleService.initialize();

            /*
            |--------------------------------------------------------------------------
            | Validate Platform
            |--------------------------------------------------------------------------
            */

            const healthy =
                PlatformOrchestratorService.isHealthy();

            if (!healthy) {
                throw new Error(
                    "Platform orchestrator unhealthy"
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state = {
                initialized: true,

                startedAt:
                    Date.now(),

                lifecycleReady:
                    true,

                platformReady:
                    true,

                bootstrapReady:
                    true,
            };

            logInfo(
                "App runtime initialized"
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
    | Shutdown Runtime
    |--------------------------------------------------------------------------
    */

    static async shutdown():
        Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Destroy Lifecycle Monitoring
            |--------------------------------------------------------------------------
            */

            AppLifecycleService.destroy();

            /*
            |--------------------------------------------------------------------------
            | Shutdown Platform
            |--------------------------------------------------------------------------
            */

            await PlatformOrchestratorService.shutdown();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state.lifecycleReady =
                false;

            this.state.platformReady =
                false;

            this.state.bootstrapReady =
                false;

            this.state.initialized =
                false;

            logInfo(
                "App runtime shutdown complete"
            );
        } catch (error) {
            logError(
                "App runtime shutdown failed",
                error
            );
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
        return (
            this.state
                .initialized &&
            this.state
                .platformReady &&
            this.state
                .lifecycleReady &&
            this.state
                .bootstrapReady
        );
    }
}