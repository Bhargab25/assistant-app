// src/core/runtime/runtime-admin.service.ts

import {
    RuntimeEngineService,
} from "./runtime-engine.service";

import {
    RuntimeOrchestratorService,
} from "./runtime-orchestrator.service";

import {
    RuntimeDashboardService,
} from "./runtime-dashboard.service";

import {
    RuntimeMetricsService,
} from "./runtime-metrics.service";

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
    RuntimeEventStore,
} from "./runtime-event.store";

import {
    RuntimeStateService,
} from "./runtime-state.service";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Runtime Admin Action Result
|--------------------------------------------------------------------------
*/

export type RuntimeAdminActionResult =
    {
        success: boolean;

        action: string;

        timestamp: number;

        metadata?: Record<
            string,
            unknown
        >;
    };

/*
|--------------------------------------------------------------------------
| Runtime Admin Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - runtime administration
| - runtime maintenance
| - operational controls
| - emergency recovery
| - runtime diagnostics
|
| IMPORTANT:
| This becomes the operational
| runtime management layer.
|
*/

export class RuntimeAdminService {
    /*
    |--------------------------------------------------------------------------
    | Restart Runtime
    |--------------------------------------------------------------------------
    */

    static async restart():
        Promise<
            RuntimeAdminActionResult
        > {
        try {
            logWarn(
                "Restarting runtime..."
            );

            /*
            |--------------------------------------------------------------------------
            | Shutdown Runtime
            |--------------------------------------------------------------------------
            */

            await RuntimeOrchestratorService.shutdown();

            /*
            |--------------------------------------------------------------------------
            | Reinitialize Runtime
            |--------------------------------------------------------------------------
            */

            await RuntimeOrchestratorService.initialize();

            logInfo(
                "Runtime restarted successfully"
            );

            return {
                success: true,

                action:
                    "runtime_restart",

                timestamp:
                    Date.now(),
            };
        } catch (error) {
            logError(
                "Runtime restart failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Force Recovery
    |--------------------------------------------------------------------------
    */

    static async recover():
        Promise<
            RuntimeAdminActionResult
        > {
        try {
            logWarn(
                "Force runtime recovery initiated"
            );

            await RuntimeRecoveryService.recover();

            return {
                success: true,

                action:
                    "runtime_recovery",

                timestamp:
                    Date.now(),
            };
        } catch (error) {
            logError(
                "Runtime recovery failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Clear Runtime Events
    |--------------------------------------------------------------------------
    */

    static clearEvents():
        RuntimeAdminActionResult {
        try {
            RuntimeEventStore.clear();

            logWarn(
                "Runtime events cleared"
            );

            return {
                success: true,

                action:
                    "runtime_events_cleared",

                timestamp:
                    Date.now(),
            };
        } catch (error) {
            logError(
                "Failed clearing runtime events",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Clear Workflow Queue
    |--------------------------------------------------------------------------
    */

    static clearQueue():
        RuntimeAdminActionResult {
        try {
            RuntimeWorkflowQueueService.clear();

            logWarn(
                "Workflow queue cleared"
            );

            return {
                success: true,

                action:
                    "workflow_queue_cleared",

                timestamp:
                    Date.now(),
            };
        } catch (error) {
            logError(
                "Failed clearing workflow queue",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Clear Retry Queue
    |--------------------------------------------------------------------------
    */

    static clearRetryQueue():
        RuntimeAdminActionResult {
        try {
            RuntimeWorkflowRetryService.clear();

            logWarn(
                "Retry queue cleared"
            );

            return {
                success: true,

                action:
                    "retry_queue_cleared",

                timestamp:
                    Date.now(),
            };
        } catch (error) {
            logError(
                "Failed clearing retry queue",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Clear Runtime States
    |--------------------------------------------------------------------------
    */

    static clearRuntimeStates():
        RuntimeAdminActionResult {
        try {
            RuntimeStateService.clear();

            logWarn(
                "Runtime states cleared"
            );

            return {
                success: true,

                action:
                    "runtime_states_cleared",

                timestamp:
                    Date.now(),
            };
        } catch (error) {
            logError(
                "Failed clearing runtime states",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Emergency Reset
    |--------------------------------------------------------------------------
    */

    static async emergencyReset():
        Promise<
            RuntimeAdminActionResult
        > {
        try {
            logWarn(
                "Emergency runtime reset initiated"
            );

            /*
            |--------------------------------------------------------------------------
            | Shutdown Runtime
            |--------------------------------------------------------------------------
            */

            await RuntimeEngineService.shutdown();

            /*
            |--------------------------------------------------------------------------
            | Clear Runtime Systems
            |--------------------------------------------------------------------------
            */

            RuntimeWorkflowQueueService.clear();

            RuntimeWorkflowRetryService.clear();

            RuntimeEventStore.clear();

            RuntimeStateService.clear();

            /*
            |--------------------------------------------------------------------------
            | Reinitialize Runtime
            |--------------------------------------------------------------------------
            */

            await RuntimeEngineService.initialize();

            logWarn(
                "Emergency runtime reset complete"
            );

            return {
                success: true,

                action:
                    "emergency_runtime_reset",

                timestamp:
                    Date.now(),
            };
        } catch (error) {
            logError(
                "Emergency runtime reset failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Runtime Diagnostics
    |--------------------------------------------------------------------------
    */

    static diagnostics() {
        try {
            return {
                dashboard:
                    RuntimeDashboardService.snapshot(),

                metrics:
                    RuntimeMetricsService.snapshot(),

                orchestrator:
                    RuntimeOrchestratorService.getHealth(),

                engine:
                    RuntimeEngineService.getState(),

                timestamp:
                    Date.now(),
            };
        } catch (error) {
            logError(
                "Failed generating runtime diagnostics",
                error
            );

            return null;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Runtime Health
    |--------------------------------------------------------------------------
    */

    static healthy():
        boolean {
        try {
            return (
                RuntimeEngineService.isHealthy() &&
                RuntimeMetricsService.isHealthy()
            );
        } catch (error) {
            logError(
                "Runtime health validation failed",
                error
            );

            return false;
        }
    }
}