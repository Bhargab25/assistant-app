// src/core/runtime/runtime-watchdog.service.ts

import {
    RuntimeObserverService,
} from "./runtime-observer.service";

import {
    RuntimeRecoveryService,
} from "./runtime-recovery.service";

import {
    RuntimeWorkflowRetryService,
} from "./runtime-workflow-retry.service";

import {
    RuntimeWorkflowQueueService,
} from "./runtime-workflow-queue.service";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Runtime Watchdog State
|--------------------------------------------------------------------------
*/

type RuntimeWatchdogState =
    {
        running: boolean;

        startedAt?: number;

        lastCheckAt?: number;

        lastRecoveryAt?: number;
    };

/*
|--------------------------------------------------------------------------
| Runtime Watchdog Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - periodic runtime monitoring
| - automatic runtime recovery
| - stale execution detection
| - queue supervision
| - retry supervision
| - runtime self-healing
| - resilience infrastructure
|
| IMPORTANT:
| This becomes the autonomous
| runtime protection layer.
|
*/

export class RuntimeWatchdogService {
    /*
    |--------------------------------------------------------------------------
    | Watchdog State
    |--------------------------------------------------------------------------
    */

    private static state:
        RuntimeWatchdogState =
        {
            running: false,
        };

    /*
    |--------------------------------------------------------------------------
    | Watchdog Interval
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
            1000 * 30
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

            logInfo(
                "Starting runtime watchdog..."
            );

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
            | Watchdog Loop
            |--------------------------------------------------------------------------
            */

            this.interval =
                setInterval(
                    async () => {
                        await this.performHealthCheck();
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
                "Runtime watchdog started",
                {
                    intervalMs,
                }
            );
        } catch (error) {
            logError(
                "Failed starting watchdog",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Perform Health Check
    |--------------------------------------------------------------------------
    */

    private static async performHealthCheck():
        Promise<void> {
        try {
            logInfo(
                "Runtime watchdog health check started"
            );

            /*
            |--------------------------------------------------------------------------
            | Observe Runtime
            |--------------------------------------------------------------------------
            */

            RuntimeObserverService.monitor();

            /*
            |--------------------------------------------------------------------------
            | Detect Stale Executions
            |--------------------------------------------------------------------------
            */

            const stale =
                RuntimeObserverService.detectStaleExecutions();

            /*
            |--------------------------------------------------------------------------
            | Recover Stale Workflows
            |--------------------------------------------------------------------------
            */

            if (
                stale.length > 0
            ) {
                logWarn(
                    "Recovering stale executions",
                    {
                        stale,
                    }
                );

                for (const workflowId of stale) {
                    await RuntimeRecoveryService.recoverWorkflow(
                        workflowId
                    );
                }

                this.state.lastRecoveryAt =
                    Date.now();
            }

            /*
            |--------------------------------------------------------------------------
            | Detect Queue Bottlenecks
            |--------------------------------------------------------------------------
            */

            const bottleneck =
                RuntimeObserverService.detectQueueBottlenecks();

            if (
                bottleneck
            ) {
                logWarn(
                    "Runtime bottleneck detected"
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Observe AI Runtime
            |--------------------------------------------------------------------------
            */

            RuntimeObserverService.observeAI();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state.lastCheckAt =
                Date.now();

            logInfo(
                "Runtime watchdog health check completed"
            );
        } catch (error) {
            logError(
                "Runtime watchdog failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Force Health Check
    |--------------------------------------------------------------------------
    */

    static async forceCheck():
        Promise<void> {
        try {
            await this.performHealthCheck();

            logInfo(
                "Forced runtime health check completed"
            );
        } catch (error) {
            logError(
                "Forced runtime health check failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Restart Watchdog
    |--------------------------------------------------------------------------
    */

    static restart():
        void {
        this.stop();

        this.start();

        logInfo(
            "Runtime watchdog restarted"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Stop Watchdog
    |--------------------------------------------------------------------------
    */

    static stop():
        void {
        try {
            /*
            |--------------------------------------------------------------------------
            | Stop Interval
            |--------------------------------------------------------------------------
            */

            if (
                this.interval
            ) {
                clearInterval(
                    this.interval
                );

                this.interval =
                    null;
            }

            /*
            |--------------------------------------------------------------------------
            | Stop Engines
            |--------------------------------------------------------------------------
            */

            RuntimeWorkflowQueueService.stop();

            RuntimeWorkflowRetryService.stop();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state.running =
                false;

            logInfo(
                "Runtime watchdog stopped"
            );
        } catch (error) {
            logError(
                "Failed stopping watchdog",
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
        RuntimeWatchdogState {
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