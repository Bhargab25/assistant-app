// src/core/runtime/runtime-profiler.service.ts

import {
    RuntimeEventStore,
} from "./runtime-event.store";

import {
    RuntimeMetricsService,
} from "./runtime-metrics.service";

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
| Runtime Profile
|--------------------------------------------------------------------------
*/

export type RuntimeProfile =
    {
        performance: {
            queuePressure: number;

            retryPressure: number;

            staleExecutionPressure: number;

            eventPressure: number;
        };

        throughput: {
            processedWorkflows: number;

            failedWorkflows: number;

            dispatchFailures: number;
        };

        health: {
            healthy: boolean;

            bottleneck: boolean;

            critical: boolean;
        };

        recommendations: string[];

        generatedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Runtime Profiler Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - runtime profiling
| - performance diagnostics
| - bottleneck analysis
| - runtime recommendations
| - execution pressure analysis
|
| IMPORTANT:
| This becomes the runtime
| performance intelligence layer.
|
*/

export class RuntimeProfilerService {
    /*
    |--------------------------------------------------------------------------
    | Generate Runtime Profile
    |--------------------------------------------------------------------------
    */

    static profile():
        RuntimeProfile {
        try {
            /*
            |--------------------------------------------------------------------------
            | Runtime Metrics
            |--------------------------------------------------------------------------
            */

            const metrics =
                RuntimeMetricsService.snapshot();

            /*
            |--------------------------------------------------------------------------
            | Pressure Metrics
            |--------------------------------------------------------------------------
            */

            const queuePressure =
                metrics.queue.size;

            const retryPressure =
                metrics.retry.size;

            const staleExecutionPressure =
                metrics.executions
                    .stale;

            const eventPressure =
                RuntimeEventStore.getAll()
                    .length;

            /*
            |--------------------------------------------------------------------------
            | Health Metrics
            |--------------------------------------------------------------------------
            */

            const bottleneck =
                RuntimeObserverService.detectQueueBottlenecks();

            const critical =
                RuntimeMetricsService.detectCriticalState();

            /*
            |--------------------------------------------------------------------------
            | Recommendations
            |--------------------------------------------------------------------------
            */

            const recommendations:
                string[] = [];

            if (
                queuePressure > 50
            ) {
                recommendations.push(
                    "Workflow queue pressure is high"
                );
            }

            if (
                retryPressure > 25
            ) {
                recommendations.push(
                    "Retry queue pressure is elevated"
                );
            }

            if (
                staleExecutionPressure >
                10
            ) {
                recommendations.push(
                    "Stale workflow executions detected"
                );
            }

            if (
                eventPressure >
                5000
            ) {
                recommendations.push(
                    "Runtime event store should be compacted"
                );
            }

            if (
                metrics.events
                    .failedDispatches >
                10
            ) {
                recommendations.push(
                    "Event dispatch failures detected"
                );
            }

            if (
                recommendations.length ===
                0
            ) {
                recommendations.push(
                    "Runtime operating normally"
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Runtime Profile
            |--------------------------------------------------------------------------
            */

            const profile:
                RuntimeProfile =
            {
                performance: {
                    queuePressure,

                    retryPressure,

                    staleExecutionPressure,

                    eventPressure,
                },

                throughput: {
                    processedWorkflows:
                        metrics.queue
                            .processed,

                    failedWorkflows:
                        metrics.queue
                            .failed,

                    dispatchFailures:
                        metrics.events
                            .failedDispatches,
                },

                health: {
                    healthy:
                        metrics.health
                            .healthy,

                    bottleneck,

                    critical,
                },

                recommendations,

                generatedAt:
                    Date.now(),
            };

            logInfo(
                "Runtime profile generated",
                profile
            );

            return profile;
        } catch (error) {
            logError(
                "Failed generating runtime profile",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Print Runtime Profile
    |--------------------------------------------------------------------------
    */

    static print():
        void {
        try {
            const profile =
                this.profile();

            logInfo(
                "========== RUNTIME PROFILE =========="
            );

            logInfo(
                "Performance",
                profile.performance
            );

            logInfo(
                "Throughput",
                profile.throughput
            );

            logInfo(
                "Health",
                profile.health
            );

            logInfo(
                "Recommendations",
                profile.recommendations
            );

            logInfo(
                "====================================="
            );
        } catch (error) {
            logError(
                "Failed printing runtime profile",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Queue Utilization
    |--------------------------------------------------------------------------
    */

    static queueUtilization():
        number {
        try {
            const size =
                RuntimeWorkflowQueueService.size();

            return Math.min(
                100,
                Math.round(
                    (size / 100) *
                    100
                )
            );
        } catch (error) {
            logError(
                "Queue utilization failed",
                error
            );

            return 0;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Retry Utilization
    |--------------------------------------------------------------------------
    */

    static retryUtilization():
        number {
        try {
            const size =
                RuntimeWorkflowRetryService
                    .getQueue()
                    .length;

            return Math.min(
                100,
                Math.round(
                    (size / 50) *
                    100
                )
            );
        } catch (error) {
            logError(
                "Retry utilization failed",
                error
            );

            return 0;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Runtime Score
    |--------------------------------------------------------------------------
    */

    static score():
        number {
        try {
            const profile =
                this.profile();

            let score = 100;

            /*
            |--------------------------------------------------------------------------
            | Penalties
            |--------------------------------------------------------------------------
            */

            score -=
                profile.performance
                    .queuePressure;

            score -=
                profile.performance
                    .retryPressure *
                2;

            score -=
                profile.performance
                    .staleExecutionPressure *
                3;

            score -=
                profile.throughput
                    .dispatchFailures *
                5;

            if (
                profile.health
                    .critical
            ) {
                score -= 25;
            }

            return Math.max(
                0,
                score
            );
        } catch (error) {
            logError(
                "Runtime score calculation failed",
                error
            );

            return 0;
        }
    }
}