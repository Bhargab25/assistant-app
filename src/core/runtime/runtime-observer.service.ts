// src/core/runtime/runtime-observer.service.ts

import {
    RuntimeEventStore,
} from "./runtime-event.store";

import {
    RuntimeStateService,
} from "./runtime-state.service";

import {
    RuntimeWorkflowQueueService,
} from "./runtime-workflow-queue.service";

import {
    RuntimeWorkflowRetryService,
} from "./runtime-workflow-retry.service";

import {
    AIMemoryService,
} from "../ai/ai-memory.service";

import {
    AssistantMemoryService,
} from "../assistant/assistant-memory.service";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Runtime Health Report
|--------------------------------------------------------------------------
*/

export type RuntimeHealthReport =
    {
        healthy: boolean;

        queueSize: number;

        retryQueueSize: number;

        activeExecutions: number;

        totalEvents: number;

        aiMemoryEntries: number;

        assistantMemories: number;

        generatedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Runtime Observer Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - monitor runtime health
| - detect unhealthy execution patterns
| - monitor queue pressure
| - provide runtime diagnostics
| - generate operational insights
|
| IMPORTANT:
| This becomes the FIRST
| observability layer.
|
*/

export class RuntimeObserverService {
    /*
    |--------------------------------------------------------------------------
    | Generate Health Report
    |--------------------------------------------------------------------------
    */

    static generateReport():
        RuntimeHealthReport {
        try {
            /*
            |--------------------------------------------------------------------------
            | Runtime Metrics
            |--------------------------------------------------------------------------
            */

            const queueSize =
                RuntimeWorkflowQueueService.size();

            const retryQueueSize =
                RuntimeWorkflowRetryService
                    .getQueue()
                    .length;

            const activeExecutions =
                RuntimeStateService
                    .getActiveExecutions()
                    .length;

            const totalEvents =
                RuntimeEventStore.getAll()
                    .length;

            const aiMemoryEntries =
                AIMemoryService.getAll()
                    .length;

            const assistantMemories =
                AssistantMemoryService
                    .getAll()
                    .length;

            /*
            |--------------------------------------------------------------------------
            | Health Evaluation
            |--------------------------------------------------------------------------
            */

            const healthy =
                queueSize < 100 &&
                retryQueueSize < 50 &&
                activeExecutions < 1000;

            const report:
                RuntimeHealthReport =
            {
                healthy,

                queueSize,

                retryQueueSize,

                activeExecutions,

                totalEvents,

                aiMemoryEntries,

                assistantMemories,

                generatedAt:
                    Date.now(),
            };

            logInfo(
                "Runtime health report generated",
                report
            );

            return report;
        } catch (error) {
            logError(
                "Failed generating runtime health report",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Monitor Runtime
    |--------------------------------------------------------------------------
    */

    static monitor():
        void {
        try {
            const report =
                this.generateReport();

            /*
            |--------------------------------------------------------------------------
            | Queue Pressure Warning
            |--------------------------------------------------------------------------
            */

            if (
                report.queueSize >
                50
            ) {
                logWarn(
                    "High workflow queue pressure detected",
                    {
                        queueSize:
                            report.queueSize,
                    }
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Retry Pressure Warning
            |--------------------------------------------------------------------------
            */

            if (
                report.retryQueueSize >
                20
            ) {
                logWarn(
                    "High retry queue pressure detected",
                    {
                        retryQueueSize:
                            report.retryQueueSize,
                    }
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Active Execution Warning
            |--------------------------------------------------------------------------
            */

            if (
                report.activeExecutions >
                500
            ) {
                logWarn(
                    "High active execution count detected",
                    {
                        activeExecutions:
                            report.activeExecutions,
                    }
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Runtime Healthy
            |--------------------------------------------------------------------------
            */

            if (
                report.healthy
            ) {
                logInfo(
                    "Runtime health stable"
                );
            } else {
                logWarn(
                    "Runtime health degraded"
                );
            }
        } catch (error) {
            logError(
                "Runtime monitoring failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Detect Stale Executions
    |--------------------------------------------------------------------------
    */

    static detectStaleExecutions():
        string[] {
        try {
            const executions =
                RuntimeStateService.getActiveExecutions();

            const stale =
                executions
                    .filter(
                        (
                            execution
                        ) =>
                            Date.now() -
                            execution.updatedAt >
                            1000 *
                            60 *
                            60
                    )
                    .map(
                        (
                            execution
                        ) =>
                            execution.workflowId
                    );

            if (
                stale.length > 0
            ) {
                logWarn(
                    "Stale executions detected",
                    {
                        stale,
                    }
                );
            }

            return stale;
        } catch (error) {
            logError(
                "Failed detecting stale executions",
                error
            );

            return [];
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Detect Queue Bottlenecks
    |--------------------------------------------------------------------------
    */

    static detectQueueBottlenecks():
        boolean {
        try {
            const queueSize =
                RuntimeWorkflowQueueService.size();

            const retrySize =
                RuntimeWorkflowRetryService
                    .getQueue()
                    .length;

            const bottleneck =
                queueSize > 75 ||
                retrySize > 30;

            if (
                bottleneck
            ) {
                logWarn(
                    "Runtime bottleneck detected",
                    {
                        queueSize,

                        retrySize,
                    }
                );
            }

            return bottleneck;
        } catch (error) {
            logError(
                "Failed detecting bottlenecks",
                error
            );

            return false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Observe AI Runtime
    |--------------------------------------------------------------------------
    */

    static observeAI():
        void {
        try {
            const memory =
                AIMemoryService.getAll();

            /*
            |--------------------------------------------------------------------------
            | Low Memory Warning
            |--------------------------------------------------------------------------
            */

            if (
                memory.length < 5
            ) {
                logWarn(
                    "AI memory dataset very small"
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Large Dataset Warning
            |--------------------------------------------------------------------------
            */

            if (
                memory.length >
                10000
            ) {
                logWarn(
                    "AI memory dataset very large"
                );
            }

            logInfo(
                "AI runtime observation complete",
                {
                    memories:
                        memory.length,
                }
            );
        } catch (error) {
            logError(
                "AI observation failed",
                error
            );
        }
    }
}