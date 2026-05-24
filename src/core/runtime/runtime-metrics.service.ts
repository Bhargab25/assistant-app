// src/core/runtime/runtime-metrics.service.ts

import {
    ReminderSessionService,
} from "../reminders/reminder-session.service";

import {
    NotificationHistoryService,
} from "../notifications/notification-history.service";

import {
    RuntimeWorkflowQueueService,
} from "./runtime-workflow-queue.service";

import {
    RuntimeWorkflowRetryService,
} from "./runtime-workflow-retry.service";

import {
    RuntimeEventDispatcherService,
} from "./runtime-event-dispatcher.service";

import {
    RuntimeObserverService,
} from "./runtime-observer.service";

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
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Runtime Metrics Snapshot
|--------------------------------------------------------------------------
*/

export type RuntimeMetricsSnapshot =
    {
        workflows: {
            activeExecutions: number;

            completed: number;

            failed: number;
        };

        reminders: {
            activeSessions: number;

            snoozedSessions: number;

            completedSessions: number;

            missedSessions: number;
        };

        notifications: {
            sent: number;

            failed: number;

            clicked: number;
        };

        queue: {
            active: boolean;

            size: number;

            processed: number;

            failed: number;
        };

        retry: {
            active: boolean;

            size: number;

            processed: number;

            failed: number;
        };

        events: {
            total: number;

            dispatched: number;

            failedDispatches: number;
        };

        executions: {
            stale: number;
        };

        ai: {
            memoryEntries: number;

            assistantMemories: number;
        };

        health: {
            healthy: boolean;

            bottleneck: boolean;
        };

        generatedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Runtime Metrics Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - runtime analytics
| - observability metrics
| - telemetry aggregation
| - AI insight foundation
| - runtime diagnostics
| - dashboard statistics
|
| IMPORTANT:
| This becomes the unified
| runtime telemetry layer.
|
*/

export class RuntimeMetricsService {
    /*
    |--------------------------------------------------------------------------
    | Generate Snapshot
    |--------------------------------------------------------------------------
    */

    static snapshot():
        RuntimeMetricsSnapshot {
        try {
            /*
            |--------------------------------------------------------------------------
            | Runtime States
            |--------------------------------------------------------------------------
            */

            const runtimeStates =
                RuntimeStateService.getAll();

            /*
            |--------------------------------------------------------------------------
            | Sessions
            |--------------------------------------------------------------------------
            */

            const sessions =
                ReminderSessionService.getAll();

            /*
            |--------------------------------------------------------------------------
            | Notifications
            |--------------------------------------------------------------------------
            */

            const notifications =
                NotificationHistoryService.getAll();

            /*
            |--------------------------------------------------------------------------
            | Events
            |--------------------------------------------------------------------------
            */

            const events =
                RuntimeEventStore.getAll();

            /*
            |--------------------------------------------------------------------------
            | Workflow Metrics
            |--------------------------------------------------------------------------
            */

            const activeExecutions =
                runtimeStates.filter(
                    (state) =>
                        state.state ===
                        "executing" ||
                        state.state ===
                        "waiting_response"
                ).length;

            const completedExecutions =
                runtimeStates.filter(
                    (state) =>
                        state.state ===
                        "completed"
                ).length;

            const failedExecutions =
                runtimeStates.filter(
                    (state) =>
                        state.state ===
                        "failed"
                ).length;

            /*
            |--------------------------------------------------------------------------
            | Reminder Metrics
            |--------------------------------------------------------------------------
            */

            const activeSessions =
                sessions.filter(
                    (session) =>
                        session.status ===
                        "active" ||
                        session.status ===
                        "pending"
                ).length;

            const snoozedSessions =
                sessions.filter(
                    (session) =>
                        session.status ===
                        "snoozed"
                ).length;

            const completedSessions =
                sessions.filter(
                    (session) =>
                        session.status ===
                        "completed"
                ).length;

            const missedSessions =
                sessions.filter(
                    (session) =>
                        session.status ===
                        "missed" ||
                        session.status ===
                        "expired"
                ).length;

            /*
            |--------------------------------------------------------------------------
            | Notification Metrics
            |--------------------------------------------------------------------------
            */

            const sentNotifications =
                notifications.filter(
                    (item) =>
                        item.status ===
                        "sent" ||
                        item.status ===
                        "delivered"
                ).length;

            const failedNotifications =
                notifications.filter(
                    (item) =>
                        item.status ===
                        "failed"
                ).length;

            const clickedNotifications =
                notifications.filter(
                    (item) =>
                        item.status ===
                        "clicked"
                ).length;

            /*
            |--------------------------------------------------------------------------
            | Queue Metrics
            |--------------------------------------------------------------------------
            */

            const queueState =
                RuntimeWorkflowQueueService.getState();

            /*
            |--------------------------------------------------------------------------
            | Retry Metrics
            |--------------------------------------------------------------------------
            */

            const retryState =
                RuntimeWorkflowRetryService.getState();

            /*
            |--------------------------------------------------------------------------
            | Dispatcher Metrics
            |--------------------------------------------------------------------------
            */

            const dispatcherState =
                RuntimeEventDispatcherService.getState();

            /*
            |--------------------------------------------------------------------------
            | Observer Metrics
            |--------------------------------------------------------------------------
            */

            const health =
                RuntimeObserverService.generateReport();

            const bottleneck =
                RuntimeObserverService.detectQueueBottlenecks();

            const staleExecutions =
                RuntimeObserverService.detectStaleExecutions();

            /*
            |--------------------------------------------------------------------------
            | Metrics Snapshot
            |--------------------------------------------------------------------------
            */

            const snapshot:
                RuntimeMetricsSnapshot =
            {
                workflows: {
                    activeExecutions,

                    completed:
                        completedExecutions,

                    failed:
                        failedExecutions,
                },

                reminders: {
                    activeSessions,

                    snoozedSessions,

                    completedSessions,

                    missedSessions,
                },

                notifications: {
                    sent:
                        sentNotifications,

                    failed:
                        failedNotifications,

                    clicked:
                        clickedNotifications,
                },

                queue: {
                    active:
                        RuntimeWorkflowQueueService.isProcessing(),

                    size:
                        RuntimeWorkflowQueueService.size(),

                    processed:
                        queueState.processed,

                    failed:
                        queueState.failed,
                },

                retry: {
                    active:
                        RuntimeWorkflowRetryService.isRunning(),

                    size:
                        RuntimeWorkflowRetryService
                            .getQueue()
                            .length,

                    processed:
                        retryState.processed,

                    failed:
                        retryState.failed,
                },

                events: {
                    total:
                        events.length,

                    dispatched:
                        dispatcherState.dispatched,

                    failedDispatches:
                        dispatcherState.failed,
                },

                executions: {
                    stale:
                        staleExecutions.length,
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

                health: {
                    healthy:
                        health.healthy,

                    bottleneck,
                },

                generatedAt:
                    Date.now(),
            };

            logInfo(
                "Runtime metrics snapshot generated",
                snapshot
            );

            return snapshot;
        } catch (error) {
            logError(
                "Failed generating runtime metrics snapshot",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Print Metrics
    |--------------------------------------------------------------------------
    */

    static print():
        void {
        try {
            const metrics =
                this.snapshot();

            logInfo(
                "========== RUNTIME METRICS =========="
            );

            logInfo(
                "Workflow Metrics",
                metrics.workflows
            );

            logInfo(
                "Reminder Metrics",
                metrics.reminders
            );

            logInfo(
                "Notification Metrics",
                metrics.notifications
            );

            logInfo(
                "Queue Metrics",
                metrics.queue
            );

            logInfo(
                "Retry Metrics",
                metrics.retry
            );

            logInfo(
                "Event Metrics",
                metrics.events
            );

            logInfo(
                "Execution Metrics",
                metrics.executions
            );

            logInfo(
                "AI Metrics",
                metrics.ai
            );

            logInfo(
                "Health Metrics",
                metrics.health
            );

            logInfo(
                "====================================="
            );
        } catch (error) {
            logError(
                "Failed printing runtime metrics",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Workflow Success Rate
    |--------------------------------------------------------------------------
    */

    static getWorkflowSuccessRate():
        number {
        try {
            const runtimeStates =
                RuntimeStateService.getAll();

            const completed =
                runtimeStates.filter(
                    (state) =>
                        state.state ===
                        "completed"
                ).length;

            const failed =
                runtimeStates.filter(
                    (state) =>
                        state.state ===
                        "failed"
                ).length;

            const total =
                completed + failed;

            if (total === 0) {
                return 0;
            }

            return Math.round(
                (completed /
                    total) *
                100
            );
        } catch (error) {
            logError(
                "Failed calculating workflow success rate",
                error
            );

            return 0;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Notification Failure Rate
    |--------------------------------------------------------------------------
    */

    static getNotificationFailureRate():
        number {
        try {
            const notifications =
                NotificationHistoryService.getAll();

            const failed =
                notifications.filter(
                    (item) =>
                        item.status ===
                        "failed"
                ).length;

            if (
                notifications.length === 0
            ) {
                return 0;
            }

            return Math.round(
                (failed /
                    notifications.length) *
                100
            );
        } catch (error) {
            logError(
                "Failed calculating notification failure rate",
                error
            );

            return 0;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Is Healthy
    |--------------------------------------------------------------------------
    */

    static isHealthy():
        boolean {
        try {
            const metrics =
                this.snapshot();

            return (
                metrics.health
                    .healthy &&
                !metrics.health
                    .bottleneck
            );
        } catch (error) {
            logError(
                "Runtime metrics health check failed",
                error
            );

            return false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Detect Critical State
    |--------------------------------------------------------------------------
    */

    static detectCriticalState():
        boolean {
        try {
            const metrics =
                this.snapshot();

            const critical =
                metrics.queue.size >
                200 ||
                metrics.retry.size >
                100 ||
                metrics.executions
                    .stale > 50 ||
                metrics.events
                    .failedDispatches >
                25;

            if (critical) {
                logWarn(
                    "Critical runtime state detected",
                    metrics
                );
            }

            return critical;
        } catch (error) {
            logError(
                "Critical state detection failed",
                error
            );

            return false;
        }
    }
}