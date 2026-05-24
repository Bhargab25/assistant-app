// src/core/platform/platform-orchestrator.service.ts

import {
    StorageOrchestratorService,
} from "../storage/storage-orchestrator.service";

import {
    PlatformRuntimeService,
} from "./platform-runtime.service";

import {
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Platform Orchestrator State
|--------------------------------------------------------------------------
*/

type PlatformOrchestratorState =
    {
        initialized: boolean;

        storageReady: boolean;

        runtimeReady: boolean;

        startedAt?: number;
    };

/*
|--------------------------------------------------------------------------
| Platform Orchestrator Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - bootstrap complete platform lifecycle
| - initialize persistence infrastructure
| - initialize runtime infrastructure
| - orchestrate startup/shutdown order
| - ensure platform durability
|
| IMPORTANT:
| This becomes the TRUE MASTER
| SYSTEM ORCHESTRATOR.
|
*/

export class PlatformOrchestratorService {
    /*
    |--------------------------------------------------------------------------
    | Orchestrator State
    |--------------------------------------------------------------------------
    */

    private static state:
        PlatformOrchestratorState =
        {
            initialized: false,

            storageReady: false,

            runtimeReady: false,
        };

    /*
    |--------------------------------------------------------------------------
    | Initialize Platform
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
                "Initializing platform orchestrator..."
            );

            /*
            |--------------------------------------------------------------------------
            | Initialize Storage Layer
            |--------------------------------------------------------------------------
            */

            await StorageOrchestratorService.initialize();

            /*
            |--------------------------------------------------------------------------
            | Initialize Runtime Layer
            |--------------------------------------------------------------------------
            */

            await PlatformRuntimeService.initialize();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state = {
                initialized: true,

                storageReady:
                    StorageOrchestratorService.isReady(),

                runtimeReady:
                    PlatformRuntimeService.isHealthy(),

                startedAt:
                    Date.now(),
            };

            logInfo(
                "Platform orchestrator initialized"
            );
        } catch (error) {
            logError(
                "Platform orchestrator initialization failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Shutdown Platform
    |--------------------------------------------------------------------------
    */

    static async shutdown():
        Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Shutdown Runtime
            |--------------------------------------------------------------------------
            */

            await PlatformRuntimeService.shutdown();

            /*
            |--------------------------------------------------------------------------
            | Shutdown Storage
            |--------------------------------------------------------------------------
            */

            await StorageOrchestratorService.shutdown();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state.runtimeReady =
                false;

            this.state.storageReady =
                false;

            this.state.initialized =
                false;

            logInfo(
                "Platform orchestrator shutdown complete"
            );
        } catch (error) {
            logError(
                "Platform orchestrator shutdown failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Get State
    |--------------------------------------------------------------------------
    */

    static getState():
        PlatformOrchestratorState {
        return this.state;
    }

    /*
    |--------------------------------------------------------------------------
    | Is Healthy
    |--------------------------------------------------------------------------
    */

    static isHealthy():
        boolean {
        return (
            this.state
                .initialized &&
            this.state
                .storageReady &&
            this.state
                .runtimeReady
        );
    }
}