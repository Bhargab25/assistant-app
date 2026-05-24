// src/core/storage/storage-watchdog.service.ts

import {
    StorageSyncService,
} from "./storage-sync.service";

import {
    StorageRuntimeService,
} from "./storage-runtime.service";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Storage Watchdog State
|--------------------------------------------------------------------------
*/

type StorageWatchdogState =
    {
        running: boolean;

        startedAt?: number;

        lastSyncAt?: number;
    };

/*
|--------------------------------------------------------------------------
| Storage Watchdog Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - periodic persistence sync
| - runtime durability monitoring
| - automatic storage synchronization
| - persistence resilience
|
| IMPORTANT:
| This becomes the automated durability layer
| for the entire intelligent platform.
|
*/

export class StorageWatchdogService {
    /*
    |--------------------------------------------------------------------------
    | Watchdog State
    |--------------------------------------------------------------------------
    */

    private static state:
        StorageWatchdogState =
        {
            running: false,
        };

    /*
    |--------------------------------------------------------------------------
    | Sync Interval
    |--------------------------------------------------------------------------
    */

    private static interval:
        NodeJS.Timeout | null =
        null;

    /*
    |--------------------------------------------------------------------------
    | Start Watchdog
    |--------------------------------------------------------------------------
    */

    static start(
        intervalMs =
            1000 * 60 * 5
    ): void {
        try {
            /*
            |--------------------------------------------------------------------------
            | Prevent Duplicate Start
            |--------------------------------------------------------------------------
            */

            if (
                this.state.running
            ) {
                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Ensure Storage Ready
            |--------------------------------------------------------------------------
            */

            if (
                !StorageRuntimeService.isReady()
            ) {
                throw new Error(
                    "Storage runtime is not initialized"
                );
            }

            logInfo(
                "Starting storage watchdog..."
            );

            /*
            |--------------------------------------------------------------------------
            | Start Sync Loop
            |--------------------------------------------------------------------------
            */

            this.interval =
                setInterval(
                    async () => {
                        await this.performSync();
                    },
                    intervalMs
                );

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state = {
                running: true,

                startedAt:
                    Date.now(),
            };

            logInfo(
                "Storage watchdog started",
                {
                    intervalMs,
                }
            );
        } catch (error) {
            logError(
                "Failed starting storage watchdog",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Perform Sync
    |--------------------------------------------------------------------------
    */

    private static async performSync():
        Promise<void> {
        try {
            logInfo(
                "Storage watchdog sync started"
            );

            /*
            |--------------------------------------------------------------------------
            | Persist Runtime
            |--------------------------------------------------------------------------
            */

            await StorageSyncService.persist();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state.lastSyncAt =
                Date.now();

            logInfo(
                "Storage watchdog sync completed"
            );
        } catch (error) {
            logWarn(
                "Storage watchdog sync failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Force Sync
    |--------------------------------------------------------------------------
    */

    static async forceSync():
        Promise<void> {
        try {
            await this.performSync();

            logInfo(
                "Forced storage sync completed"
            );
        } catch (error) {
            logError(
                "Forced storage sync failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Stop Watchdog
    |--------------------------------------------------------------------------
    */

    static stop():
        void {
        try {
            if (
                this.interval
            ) {
                clearInterval(
                    this.interval
                );

                this.interval =
                    null;
            }

            this.state.running =
                false;

            logInfo(
                "Storage watchdog stopped"
            );
        } catch (error) {
            logError(
                "Failed stopping storage watchdog",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Watchdog State
    |--------------------------------------------------------------------------
    */

    static getState():
        StorageWatchdogState {
        return this.state;
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