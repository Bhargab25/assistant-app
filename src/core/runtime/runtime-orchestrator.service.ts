// src/core/runtime/runtime-orchestrator.service.ts

import {
    AlarmService,
} from "../scheduler/alarm.service";

import {
    NotificationActionHandler,
} from "../notifications/notification-action.handler";

import {
    RuntimeEventListener,
} from "./runtime-event.listener";

import {
    RuntimeNotificationActionHandlerService,
} from "./runtime-notification-action-handler.service";

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
    RuntimeStateService,
} from "./runtime-state.service";

import {
    ReminderSessionService,
} from "../reminders/reminder-session.service";

import {
    EventBus,
} from "../events/event-bus";

import {
    EVENTS,
} from "../../shared/constants";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Runtime Orchestrator State
|--------------------------------------------------------------------------
*/

type RuntimeOrchestratorState =
    {
        initialized: boolean;

        runtimeReady: boolean;

        queueReady: boolean;

        retryReady: boolean;

        observerReady: boolean;

        notificationActionsReady: boolean;

        startedAt?: number;
    };

/*
|--------------------------------------------------------------------------
| Runtime Orchestrator Service
|--------------------------------------------------------------------------
|
| THE CENTRAL RUNTIME BOOTSTRAPPER
|
| RESPONSIBILITIES:
|
| - initialize runtime systems
| - initialize runtime engine
| - wire runtime infrastructure
| - initialize alarms
| - initialize notifications
| - initialize event listeners
| - restore runtime state
| - supervise runtime execution
|
| IMPORTANT:
| This becomes the MAIN
| runtime operating kernel.
|
*/

export class RuntimeOrchestratorService {
    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    private static state:
        RuntimeOrchestratorState =
        {
            initialized: false,

            runtimeReady: false,

            queueReady: false,

            retryReady: false,

            observerReady: false,

            notificationActionsReady:
                false,
        };

    /*
    |--------------------------------------------------------------------------
    | Initialize Runtime
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
                "Initializing runtime orchestrator..."
            );

            /*
            |--------------------------------------------------------------------------
            | Initialize Alarm Service
            |--------------------------------------------------------------------------
            */

            AlarmService.initialize();

            /*
            |--------------------------------------------------------------------------
            | Initialize Legacy Notification Actions
            |--------------------------------------------------------------------------
            */

            NotificationActionHandler.initialize();

            /*
            |--------------------------------------------------------------------------
            | Initialize Runtime Notification Actions
            |--------------------------------------------------------------------------
            */

            RuntimeNotificationActionHandlerService.initialize();

            /*
            |--------------------------------------------------------------------------
            | Initialize Runtime Event Listener
            |--------------------------------------------------------------------------
            */

            RuntimeEventListener.initialize();

            /*
            |--------------------------------------------------------------------------
            | Initialize Runtime Engine
            |--------------------------------------------------------------------------
            */

            await RuntimeEngineService.initialize();

            /*
            |--------------------------------------------------------------------------
            | Restore Runtime
            |--------------------------------------------------------------------------
            */

            await this.restoreRuntime();

            /*
            |--------------------------------------------------------------------------
            | Initial Runtime Health Report
            |--------------------------------------------------------------------------
            */

            const report =
                RuntimeObserverService.generateReport();

            /*
            |--------------------------------------------------------------------------
            | Emit App Initialized Event
            |--------------------------------------------------------------------------
            */

            await EventBus.emit(
                EVENTS.APP_INITIALIZED,
                {
                    timestamp:
                        Date.now(),
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state = {
                initialized: true,

                runtimeReady:
                    RuntimeEngineService.isHealthy(),

                queueReady:
                    RuntimeWorkflowQueueService.isProcessing(),

                retryReady:
                    RuntimeWorkflowRetryService.isRunning(),

                observerReady:
                    report.healthy,

                notificationActionsReady:
                    true,

                startedAt:
                    Date.now(),
            };

            logInfo(
                "Runtime orchestrator initialized",
                this.state
            );
        } catch (error) {
            logError(
                "Runtime orchestrator failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Runtime
    |--------------------------------------------------------------------------
    */

    private static async restoreRuntime():
        Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Restore Sessions
            |--------------------------------------------------------------------------
            */

            const activeSessions =
                ReminderSessionService.getActiveSessions();

            /*
            |--------------------------------------------------------------------------
            | Restore Executions
            |--------------------------------------------------------------------------
            */

            const activeExecutions =
                RuntimeStateService.getActiveExecutions();

            logInfo(
                "Runtime restored",
                {
                    activeSessions:
                        activeSessions.length,

                    activeExecutions:
                        activeExecutions.length,
                }
            );
        } catch (error) {
            logError(
                "Failed restoring runtime",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Runtime Health Check
    |--------------------------------------------------------------------------
    */

    static async healthCheck():
        Promise<boolean> {
        try {
            const healthy =
                await RuntimeEngineService.healthCheck();

            const report =
                RuntimeObserverService.generateReport();

            this.state.runtimeReady =
                healthy;

            this.state.queueReady =
                RuntimeWorkflowQueueService.isProcessing();

            this.state.retryReady =
                RuntimeWorkflowRetryService.isRunning();

            this.state.observerReady =
                report.healthy;

            if (!healthy) {
                logWarn(
                    "Runtime orchestrator unhealthy"
                );
            }

            return healthy;
        } catch (error) {
            logError(
                "Runtime orchestrator health check failed",
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
            logWarn(
                "Runtime orchestrator recovery started"
            );

            await RuntimeEngineService.recover();

            await this.healthCheck();

            logInfo(
                "Runtime orchestrator recovery completed"
            );
        } catch (error) {
            logError(
                "Runtime orchestrator recovery failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Shutdown Runtime
    |--------------------------------------------------------------------------
    */

    static async shutdown():
        Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Emit Shutdown Event
            |--------------------------------------------------------------------------
            */

            await EventBus.emit(
                EVENTS.SCHEDULER_STOPPED,
                {
                    timestamp:
                        Date.now(),
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Shutdown Runtime Engine
            |--------------------------------------------------------------------------
            */

            await RuntimeEngineService.shutdown();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state.initialized =
                false;

            this.state.runtimeReady =
                false;

            this.state.queueReady =
                false;

            this.state.retryReady =
                false;

            this.state.observerReady =
                false;

            this.state.notificationActionsReady =
                false;

            logInfo(
                "Runtime orchestrator shutdown complete"
            );
        } catch (error) {
            logError(
                "Runtime orchestrator shutdown failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Runtime Health
    |--------------------------------------------------------------------------
    */

    static getHealth() {
        return {
            initialized:
                this.state
                    .initialized,

            runtimeReady:
                this.state
                    .runtimeReady,

            queueReady:
                this.state
                    .queueReady,

            retryReady:
                this.state
                    .retryReady,

            observerReady:
                this.state
                    .observerReady,

            activeSessions:
                ReminderSessionService
                    .getActiveSessions()
                    .length,

            activeExecutions:
                RuntimeStateService
                    .getActiveExecutions()
                    .length,

            registeredEvents:
                Object.keys(
                    EventBus.getEvents()
                ).length,
        };
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
                .runtimeReady &&
            this.state
                .queueReady &&
            this.state
                .retryReady
        );
    }
}