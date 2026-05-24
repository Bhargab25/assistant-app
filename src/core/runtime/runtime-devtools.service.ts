// src/core/runtime/runtime-devtools.service.ts

import {
    RuntimeDashboardService,
} from "./runtime-dashboard.service";

import {
    RuntimeMetricsService,
} from "./runtime-metrics.service";

import {
    RuntimeAdminService,
} from "./runtime-admin.service";

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
| Runtime Devtools Export
|--------------------------------------------------------------------------
*/

export type RuntimeDevtoolsExport =
    {
        dashboard: ReturnType<
            typeof RuntimeDashboardService.snapshot
        >;

        metrics: ReturnType<
            typeof RuntimeMetricsService.snapshot
        >;

        runtimeStates: ReturnType<
            typeof RuntimeStateService.getAll
        >;

        runtimeEvents: ReturnType<
            typeof RuntimeEventStore.getAll
        >;

        workflowQueue: ReturnType<
            typeof RuntimeWorkflowQueueService.getQueue
        >;

        retryQueue: ReturnType<
            typeof RuntimeWorkflowRetryService.getQueue
        >;

        aiMemory: ReturnType<
            typeof AIMemoryService.getAll
        >;

        assistantMemory: ReturnType<
            typeof AssistantMemoryService.getAll
        >;

        exportedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Runtime Devtools Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - developer diagnostics
| - runtime debugging
| - runtime exporting
| - developer inspection
| - runtime snapshots
|
| IMPORTANT:
| This becomes the developer
| debugging + inspection layer.
|
*/

export class RuntimeDevtoolsService {
    /*
    |--------------------------------------------------------------------------
    | Export Runtime Snapshot
    |--------------------------------------------------------------------------
    */

    static export():
        RuntimeDevtoolsExport {
        try {
            logInfo(
                "Exporting runtime devtools snapshot..."
            );

            const snapshot:
                RuntimeDevtoolsExport =
            {
                dashboard:
                    RuntimeDashboardService.snapshot(),

                metrics:
                    RuntimeMetricsService.snapshot(),

                runtimeStates:
                    RuntimeStateService.getAll(),

                runtimeEvents:
                    RuntimeEventStore.getAll(),

                workflowQueue:
                    RuntimeWorkflowQueueService.getQueue(),

                retryQueue:
                    RuntimeWorkflowRetryService.getQueue(),

                aiMemory:
                    AIMemoryService.getAll(),

                assistantMemory:
                    AssistantMemoryService.getAll(),

                exportedAt:
                    Date.now(),
            };

            logInfo(
                "Runtime devtools snapshot exported"
            );

            return snapshot;
        } catch (error) {
            logError(
                "Failed exporting runtime devtools snapshot",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Print Runtime Snapshot
    |--------------------------------------------------------------------------
    */

    static print():
        void {
        try {
            const snapshot =
                this.export();

            logInfo(
                "========== RUNTIME DEVTOOLS =========="
            );

            logInfo(
                "Dashboard",
                snapshot.dashboard
            );

            logInfo(
                "Metrics",
                snapshot.metrics
            );

            logInfo(
                "Runtime States",
                snapshot.runtimeStates
            );

            logInfo(
                "Runtime Events",
                snapshot.runtimeEvents
            );

            logInfo(
                "Workflow Queue",
                snapshot.workflowQueue
            );

            logInfo(
                "Retry Queue",
                snapshot.retryQueue
            );

            logInfo(
                "AI Memory",
                snapshot.aiMemory
            );

            logInfo(
                "Assistant Memory",
                snapshot.assistantMemory
            );

            logInfo(
                "======================================"
            );
        } catch (error) {
            logError(
                "Failed printing runtime devtools snapshot",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Runtime
    |--------------------------------------------------------------------------
    */

    static validate():
        boolean {
        try {
            const diagnostics =
                RuntimeAdminService.diagnostics();

            if (!diagnostics) {
                return false;
            }

            const metrics =
                diagnostics.metrics;

            /*
            |--------------------------------------------------------------------------
            | Validation Rules
            |--------------------------------------------------------------------------
            */

            const valid =
                metrics.health
                    .healthy &&
                metrics.queue
                    .size < 500 &&
                metrics.retry
                    .size < 250 &&
                metrics.events
                    .failedDispatches <
                100;

            if (!valid) {
                logWarn(
                    "Runtime validation failed",
                    metrics
                );
            }

            return valid;
        } catch (error) {
            logError(
                "Runtime validation failed",
                error
            );

            return false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Inspect Workflow
    |--------------------------------------------------------------------------
    */

    static inspectWorkflow(
        workflowId: string
    ) {
        try {
            const states =
                RuntimeStateService
                    .getAll()
                    .filter(
                        (state) =>
                            state.workflowId ===
                            workflowId
                    );

            const events =
                RuntimeEventStore
                    .getAll()
                    .filter(
                        (event) =>
                            event.workflowId ===
                            workflowId
                    );

            return {
                workflowId,

                states,

                events,

                inspectedAt:
                    Date.now(),
            };
        } catch (error) {
            logError(
                "Workflow inspection failed",
                error
            );

            return null;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Inspect Runtime Health
    |--------------------------------------------------------------------------
    */

    static health() {
        try {
            const metrics =
                RuntimeMetricsService.snapshot();

            return {
                healthy:
                    metrics.health
                        .healthy,

                bottleneck:
                    metrics.health
                        .bottleneck,

                queueSize:
                    metrics.queue
                        .size,

                retrySize:
                    metrics.retry
                        .size,

                staleExecutions:
                    metrics.executions
                        .stale,

                failedDispatches:
                    metrics.events
                        .failedDispatches,

                timestamp:
                    Date.now(),
            };
        } catch (error) {
            logError(
                "Runtime health inspection failed",
                error
            );

            return null;
        }
    }
}