// src/core/ai/ai-runtime.service.ts

import {
    AIOrchestratorService,
} from "./ai-orchestrator.service";

import {
    AIWatchdogService,
} from "./ai-watchdog.service";

import {
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| AI Runtime State
|--------------------------------------------------------------------------
*/

type AIRuntimeState =
    {
        initialized: boolean;

        startedAt?: number;

        lastSnapshotAt?: number;

        monitoringActive: boolean;
    };

/*
|--------------------------------------------------------------------------
| AI Runtime Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - bootstrap AI systems
| - initialize AI orchestration
| - start AI monitoring
| - manage AI lifecycle
|
| IMPORTANT:
| This becomes the runtime entrypoint
| for the entire AI subsystem.
|
*/

export class AIRuntimeService {
    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    private static state:
        AIRuntimeState = {
            initialized: false,

            monitoringActive: false,
        };

    /*
    |--------------------------------------------------------------------------
    | Monitoring Interval
    |--------------------------------------------------------------------------
    */

    private static monitor:
        NodeJS.Timeout | null =
        null;

    /*
    |--------------------------------------------------------------------------
    | Initialize AI Runtime
    |--------------------------------------------------------------------------
    */

    static initialize():
        void {
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
                "Initializing AI runtime..."
            );

            /*
            |--------------------------------------------------------------------------
            | Generate Initial Snapshot
            |--------------------------------------------------------------------------
            */

            AIOrchestratorService.generateSnapshot();

            /*
            |--------------------------------------------------------------------------
            | Start Monitoring
            |--------------------------------------------------------------------------
            */

            this.monitor =
                AIWatchdogService.startMonitoring();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state = {
                initialized: true,

                startedAt:
                    Date.now(),

                lastSnapshotAt:
                    Date.now(),

                monitoringActive:
                    true,
            };

            logInfo(
                "AI runtime initialized"
            );
        } catch (error) {
            logError(
                "AI runtime initialization failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Refresh AI Snapshot
    |--------------------------------------------------------------------------
    */

    static refreshSnapshot():
        void {
        try {
            AIOrchestratorService.generateSnapshot();

            this.state.lastSnapshotAt =
                Date.now();

            logInfo(
                "AI runtime snapshot refreshed"
            );
        } catch (error) {
            logError(
                "Failed refreshing AI snapshot",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Shutdown AI Runtime
    |--------------------------------------------------------------------------
    */

    static shutdown():
        void {
        try {
            /*
            |--------------------------------------------------------------------------
            | Stop Monitoring
            |--------------------------------------------------------------------------
            */

            if (
                this.monitor
            ) {
                clearInterval(
                    this.monitor
                );

                this.monitor =
                    null;
            }

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state
                .monitoringActive =
                false;

            logInfo(
                "AI runtime shutdown complete"
            );
        } catch (error) {
            logError(
                "AI runtime shutdown failed",
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
        AIRuntimeState {
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
                .monitoringActive
        );
    }
}