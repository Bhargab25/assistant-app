// src/core/runtime/runtime-engine.service.ts

import {
    RuntimeWatchdogService,
} from "./runtime-watchdog.service";

import {
    RuntimeRecoveryService,
} from "./runtime-recovery.service";

import {
    RuntimeWorkflowQueueService,
} from "./runtime-workflow-queue.service";

import {
    RuntimeWorkflowRetryService,
} from "./runtime-workflow-retry.service";

import {
    RuntimeObserverService,
} from "./runtime-observer.service";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Runtime Engine State
|--------------------------------------------------------------------------
*/

type RuntimeEngineState =
    {
        initialized: boolean;

        healthy: boolean;

        recovering: boolean;

        startedAt?: number;

        lastHealthCheckAt?: number;
    };

/*
|--------------------------------------------------------------------------
| Runtime Engine Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - initialize runtime subsystems
| - coordinate runtime infrastructure
| - supervise execution engines
| - manage recovery lifecycle
| - expose runtime health
|
| IMPORTANT:
| This becomes the CENTRAL
| runtime operating layer.
|
*/

export class RuntimeEngineService {
    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    private static state:
        RuntimeEngineState =
        {
            initialized: false,

            healthy: false,

            recovering: false,
        };

    /*
    |--------------------------------------------------------------------------
    | Initialize Runtime Engine
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
                "Initializing runtime engine..."
            );

            /*
            |--------------------------------------------------------------------------
            | Recover Runtime
            |--------------------------------------------------------------------------
            */

            this.state.recovering =
                true;

            await RuntimeRecoveryService.recover();

            this.state.recovering =
                false;

            /*
            |--------------------------------------------------------------------------
            | Start Queue Engine
            |--------------------------------------------------------------------------
            */

            RuntimeWorkflowQueueService.start();

            /*
            |--------------------------------------------------------------------------
            | Start Retry Engine
            |--------------------------------------------------------------------------
            */

            RuntimeWorkflowRetryService.start();

            /*
            |--------------------------------------------------------------------------
            | Start Runtime Watchdog
            |--------------------------------------------------------------------------
            */

            RuntimeWatchdogService.start();

            /*
            |--------------------------------------------------------------------------
            | Initial Health Report
            |--------------------------------------------------------------------------
            */

            const report =
                RuntimeObserverService.generateReport();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state = {
                initialized: true,

                healthy:
                    report.healthy,

                recovering: false,

                startedAt:
                    Date.now(),

                lastHealthCheckAt:
                    report.generatedAt,
            };

            logInfo(
                "Runtime engine initialized",
                {
                    healthy:
                        report.healthy,
                }
            );
        } catch (error) {
            this.state.healthy =
                false;

            logError(
                "Runtime engine initialization failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Shutdown Runtime Engine
    |--------------------------------------------------------------------------
    */

    static async shutdown():
        Promise<void> {
        try {
            logWarn(
                "Shutting down runtime engine..."
            );

            /*
            |--------------------------------------------------------------------------
            | Stop Watchdog
            |--------------------------------------------------------------------------
            */

            RuntimeWatchdogService.stop();

            /*
            |--------------------------------------------------------------------------
            | Stop Queue Engine
            |--------------------------------------------------------------------------
            */

            RuntimeWorkflowQueueService.stop();

            /*
            |--------------------------------------------------------------------------
            | Stop Retry Engine
            |--------------------------------------------------------------------------
            */

            RuntimeWorkflowRetryService.stop();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state.initialized =
                false;

            this.state.healthy =
                false;

            logInfo(
                "Runtime engine shutdown complete"
            );
        } catch (error) {
            logError(
                "Runtime engine shutdown failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Health Check
    |--------------------------------------------------------------------------
    */

    static async healthCheck():
        Promise<boolean> {
        try {
            const report =
                RuntimeObserverService.generateReport();

            this.state.healthy =
                report.healthy;

            this.state.lastHealthCheckAt =
                report.generatedAt;

            if (!report.healthy) {
                logWarn(
                    "Runtime engine unhealthy"
                );
            }

            return report.healthy;
        } catch (error) {
            logError(
                "Runtime engine health check failed",
                error
            );

            return false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Force Recovery
    |--------------------------------------------------------------------------
    */

    static async recover():
        Promise<void> {
        try {
            this.state.recovering =
                true;

            await RuntimeRecoveryService.recover();

            this.state.recovering =
                false;

            logInfo(
                "Runtime engine recovery complete"
            );
        } catch (error) {
            this.state.recovering =
                false;

            logError(
                "Runtime engine recovery failed",
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
        RuntimeEngineState {
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
                .healthy
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Is Recovering
    |--------------------------------------------------------------------------
    */

    static isRecovering():
        boolean {
        return this.state
            .recovering;
    }
}