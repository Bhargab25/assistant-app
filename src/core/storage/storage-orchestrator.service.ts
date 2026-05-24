// src/core/storage/storage-orchestrator.service.ts

import {
    StorageRuntimeService,
} from "./storage-runtime.service";

import {
    StorageSyncService,
} from "./storage-sync.service";

import {
    StorageWatchdogService,
} from "./storage-watchdog.service";

import {
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Storage Orchestrator State
|--------------------------------------------------------------------------
*/

type StorageOrchestratorState =
    {
        initialized: boolean;

        restoring: boolean;

        syncing: boolean;

        startedAt?: number;
    };

/*
|--------------------------------------------------------------------------
| Storage Orchestrator Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - orchestrate persistence lifecycle
| - initialize storage runtime
| - restore persisted runtime state
| - start storage durability watchdog
| - manage persistence synchronization
|
| IMPORTANT:
| This becomes the MASTER
| persistence orchestration layer.
|
*/

export class StorageOrchestratorService {
    /*
    |--------------------------------------------------------------------------
    | Orchestrator State
    |--------------------------------------------------------------------------
    */

    private static state:
        StorageOrchestratorState =
        {
            initialized: false,

            restoring: false,

            syncing: false,
        };

    /*
    |--------------------------------------------------------------------------
    | Initialize Storage System
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
                "Initializing storage orchestrator..."
            );

            /*
            |--------------------------------------------------------------------------
            | Initialize Runtime
            |--------------------------------------------------------------------------
            */

            await StorageRuntimeService.initialize();

            /*
            |--------------------------------------------------------------------------
            | Restore Runtime
            |--------------------------------------------------------------------------
            */

            this.state.restoring =
                true;

            await StorageSyncService.restore();

            this.state.restoring =
                false;

            /*
            |--------------------------------------------------------------------------
            | Start Watchdog
            |--------------------------------------------------------------------------
            */

            StorageWatchdogService.start();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state = {
                initialized: true,

                restoring: false,

                syncing: false,

                startedAt:
                    Date.now(),
            };

            logInfo(
                "Storage orchestrator initialized"
            );
        } catch (error) {
            logError(
                "Storage orchestrator initialization failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Sync Runtime
    |--------------------------------------------------------------------------
    */

    static async sync():
        Promise<void> {
        try {
            this.state.syncing =
                true;

            await StorageSyncService.persist();

            this.state.syncing =
                false;

            logInfo(
                "Storage orchestrator sync completed"
            );
        } catch (error) {
            this.state.syncing =
                false;

            logError(
                "Storage orchestrator sync failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Shutdown Storage
    |--------------------------------------------------------------------------
    */

    static async shutdown():
        Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Final Sync
            |--------------------------------------------------------------------------
            */

            await this.sync();

            /*
            |--------------------------------------------------------------------------
            | Stop Watchdog
            |--------------------------------------------------------------------------
            */

            StorageWatchdogService.stop();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state.initialized =
                false;

            logInfo(
                "Storage orchestrator shutdown complete"
            );
        } catch (error) {
            logError(
                "Storage orchestrator shutdown failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Orchestrator State
    |--------------------------------------------------------------------------
    */

    static getState():
        StorageOrchestratorState {
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