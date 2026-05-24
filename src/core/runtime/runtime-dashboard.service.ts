// src/core/runtime/runtime-dashboard.service.ts

import {
    RuntimeMetricsService,
} from "./runtime-metrics.service";

import {
    RuntimeOrchestratorService,
} from "./runtime-orchestrator.service";

import {
    RuntimeEngineService,
} from "./runtime-engine.service";

import {
    RuntimeObserverService,
} from "./runtime-observer.service";

import {
    RuntimeWorkflowQueueService,
} from "./runtime-workflow-queue.service";

import {
    RuntimeWorkflowRetryService,
} from "./runtime-workflow-retry.service";

import {
    RuntimeEventStore,
} from "./runtime-event.store";

import {
    RuntimeStateService,
} from "./runtime-state.service";

import {
    AIMemoryService,
} from "../ai/ai-memory.service";

import {
    AssistantMemoryService,
} from "../assistant/assistant-memory.service";

import {
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Runtime Dashboard Snapshot
|--------------------------------------------------------------------------
*/

export type RuntimeDashboardSnapshot =
    {
        orchestrator: {
            ready: boolean;

            health: ReturnType<
                typeof RuntimeOrchestratorService.getHealth
            >;
        };

        engine: {
            healthy: boolean;

            recovering: boolean;

            state: ReturnType<
                typeof RuntimeEngineService.getState
            >;
        };

        queue: {
            size: number;

            processing: boolean;

            state: ReturnType<
                typeof RuntimeWorkflowQueueService.getState
            >;
        };

        retry: {
            size: number;

            running: boolean;

            state: ReturnType<
                typeof RuntimeWorkflowRetryService.getState
            >;
        };

        executions: {
            active: number;

            stale: number;
        };

        events: {
            total: number;

            recent: number;
        };

        ai: {
            memoryEntries: number;

            assistantMemories: number;
        };

        metrics: ReturnType<
            typeof RuntimeMetricsService.snapshot
        >;

        generatedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Runtime Dashboard Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - aggregate runtime dashboard data
| - expose runtime operational state
| - provide observability snapshots
| - expose AI analytics
| - power admin dashboards
|
| IMPORTANT:
| This becomes the CENTRAL
| runtime monitoring API.
|
*/

export class RuntimeDashboardService {
    /*
    |--------------------------------------------------------------------------
    | Generate Dashboard Snapshot
    |--------------------------------------------------------------------------
    */

    static snapshot():
        RuntimeDashboardSnapshot {
        try {
            /*
            |--------------------------------------------------------------------------
            | Runtime Health
            |--------------------------------------------------------------------------
            */

            const orchestratorHealth =
                RuntimeOrchestratorService.getHealth();

            /*
            |--------------------------------------------------------------------------
            | Runtime Metrics
            |--------------------------------------------------------------------------
            */

            const metrics =
                RuntimeMetricsService.snapshot();

            /*
            |--------------------------------------------------------------------------
            | Active Executions
            |--------------------------------------------------------------------------
            */

            const activeExecutions =
                RuntimeStateService
                    .getActiveExecutions();

            /*
            |--------------------------------------------------------------------------
            | Stale Executions
            |--------------------------------------------------------------------------
            */

            const staleExecutions =
                RuntimeObserverService.detectStaleExecutions();

            /*
            |--------------------------------------------------------------------------
            | Recent Events
            |--------------------------------------------------------------------------
            */

            const events =
                RuntimeEventStore.getAll();

            const recentEvents =
                events.filter(
                    (event) =>
                        Date.now() -
                        event.timestamp <
                        1000 *
                        60 *
                        60
                );

            /*
            |--------------------------------------------------------------------------
            | Snapshot
            |--------------------------------------------------------------------------
            */

            const snapshot:
                RuntimeDashboardSnapshot =
            {
                orchestrator: {
                    ready:
                        RuntimeOrchestratorService.isReady(),

                    health:
                        orchestratorHealth,
                },

                engine: {
                    healthy:
                        RuntimeEngineService.isHealthy(),

                    recovering:
                        RuntimeEngineService.isRecovering(),

                    state:
                        RuntimeEngineService.getState(),
                },

                queue: {
                    size:
                        RuntimeWorkflowQueueService.size(),

                    processing:
                        RuntimeWorkflowQueueService.isProcessing(),

                    state:
                        RuntimeWorkflowQueueService.getState(),
                },

                retry: {
                    size:
                        RuntimeWorkflowRetryService
                            .getQueue()
                            .length,

                    running:
                        RuntimeWorkflowRetryService.isRunning(),

                    state:
                        RuntimeWorkflowRetryService.getState(),
                },

                executions: {
                    active:
                        activeExecutions.length,

                    stale:
                        staleExecutions.length,
                },

                events: {
                    total:
                        events.length,

                    recent:
                        recentEvents.length,
                },

                ai: {
                    memoryEntries:
                        AIMemoryService.getAll()
                            .length,

                    assistantMemories:
                        AssistantMemoryService
                            .getAll()
                            .length,
                },

                metrics,

                generatedAt:
                    Date.now(),
            };

            logInfo(
                "Runtime dashboard snapshot generated"
            );

            return snapshot;
        } catch (error) {
            logError(
                "Failed generating runtime dashboard snapshot",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Print Dashboard
    |--------------------------------------------------------------------------
    */

    static print():
        void {
        try {
            const dashboard =
                this.snapshot();

            logInfo(
                "========== RUNTIME DASHBOARD =========="
            );

            logInfo(
                "Orchestrator",
                dashboard.orchestrator
            );

            logInfo(
                "Engine",
                dashboard.engine
            );

            logInfo(
                "Queue",
                dashboard.queue
            );

            logInfo(
                "Retry",
                dashboard.retry
            );

            logInfo(
                "Executions",
                dashboard.executions
            );

            logInfo(
                "Events",
                dashboard.events
            );

            logInfo(
                "AI",
                dashboard.ai
            );

            logInfo(
                "======================================="
            );
        } catch (error) {
            logError(
                "Failed printing runtime dashboard",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Runtime Summary
    |--------------------------------------------------------------------------
    */

    static summary() {
        try {
            const dashboard =
                this.snapshot();

            return {
                healthy:
                    dashboard.metrics
                        .health
                        .healthy,

                workflows:
                    dashboard.metrics
                        .workflows,

                reminders:
                    dashboard.metrics
                        .reminders,

                notifications:
                    dashboard.metrics
                        .notifications,

                queue:
                    dashboard.queue.size,

                retries:
                    dashboard.retry.size,

                events:
                    dashboard.events.total,

                aiMemories:
                    dashboard.ai
                        .memoryEntries,
            };
        } catch (error) {
            logError(
                "Failed generating runtime summary",
                error
            );

            return null;
        }
    }
}