// src/core/runtime/runtime-health.service.ts

import {
    ReminderSessionService,
} from "../reminders/reminder-session.service";

import {
    RuntimeStateService,
} from "./runtime-state.service";

import {
    RuntimeEventStore,
} from "./runtime-event.store";

import {
    NotificationHistoryService,
} from "../notifications/notification-history.service";

import {
    logInfo,
    logWarn,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Runtime Health Report
|--------------------------------------------------------------------------
*/

export type RuntimeHealthReport =
    {
        healthy: boolean;

        timestamp: number;

        metrics: {
            activeSessions: number;

            activeExecutions: number;

            runtimeEvents: number;

            failedNotifications: number;

            pendingRetries: number;
        };

        warnings: string[];
    };

/*
|--------------------------------------------------------------------------
| Runtime Health Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - runtime diagnostics
| - runtime metrics
| - failure visibility
| - observability support
| - health monitoring
|
| IMPORTANT:
| This becomes critical later for:
| - production monitoring
| - debugging
| - AI diagnostics
| - runtime analytics
|
*/

export class RuntimeHealthService {
    /*
    |--------------------------------------------------------------------------
    | Generate Health Report
    |--------------------------------------------------------------------------
    */

    static generateReport():
        RuntimeHealthReport {
        /*
        |--------------------------------------------------------------------------
        | Runtime Metrics
        |--------------------------------------------------------------------------
        */

        const activeSessions =
            ReminderSessionService
                .getActiveSessions()
                .length;

        const activeExecutions =
            RuntimeStateService
                .getActiveExecutions()
                .length;

        const runtimeEvents =
            RuntimeEventStore
                .getAll().length;

        const failedNotifications =
            NotificationHistoryService
                .getFailed().length;

        /*
        |--------------------------------------------------------------------------
        | Warnings
        |--------------------------------------------------------------------------
        */

        const warnings:
            string[] = [];

        /*
        |--------------------------------------------------------------------------
        | Notification Failures
        |--------------------------------------------------------------------------
        */

        if (
            failedNotifications > 10
        ) {
            warnings.push(
                "High notification failure rate detected"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Stuck Executions
        |--------------------------------------------------------------------------
        */

        if (
            activeExecutions > 25
        ) {
            warnings.push(
                "Large number of active executions"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Session Overload
        |--------------------------------------------------------------------------
        */

        if (
            activeSessions > 50
        ) {
            warnings.push(
                "High active session count"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Health Status
        |--------------------------------------------------------------------------
        */

        const healthy =
            warnings.length === 0;

        /*
        |--------------------------------------------------------------------------
        | Report
        |--------------------------------------------------------------------------
        */

        const report:
            RuntimeHealthReport =
        {
            healthy,

            timestamp:
                Date.now(),

            metrics: {
                activeSessions,

                activeExecutions,

                runtimeEvents,

                failedNotifications,

                pendingRetries: 0,
            },

            warnings,
        };

        /*
        |--------------------------------------------------------------------------
        | Logging
        |--------------------------------------------------------------------------
        */

        if (healthy) {
            logInfo(
                "Runtime health check passed",
                report.metrics
            );
        } else {
            logWarn(
                "Runtime health warnings detected",
                warnings
            );
        }

        return report;
    }

    /*
    |--------------------------------------------------------------------------
    | Is Healthy
    |--------------------------------------------------------------------------
    */

    static isHealthy():
        boolean {
        return this
            .generateReport()
            .healthy;
    }

    /*
    |--------------------------------------------------------------------------
    | Get Runtime Summary
    |--------------------------------------------------------------------------
    */

    static getSummary() {
        const report =
            this.generateReport();

        return {
            healthy:
                report.healthy,

            activeSessions:
                report.metrics
                    .activeSessions,

            activeExecutions:
                report.metrics
                    .activeExecutions,

            failedNotifications:
                report.metrics
                    .failedNotifications,

            warnings:
                report.warnings,
        };
    }
}