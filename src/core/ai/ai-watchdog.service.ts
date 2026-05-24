// src/core/ai/ai-watchdog.service.ts

import {
    AIOrchestratorService,
} from "./ai-orchestrator.service";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| AI Watchdog Report
|--------------------------------------------------------------------------
*/

export type AIWatchdogReport =
    {
        healthy: boolean;

        warnings: string[];

        metrics: {
            insights: number;

            recommendations: number;

            patterns: number;

            memoryRecords: number;
        };

        checkedAt: number;
    };

/*
|--------------------------------------------------------------------------
| AI Watchdog Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - monitor AI runtime health
| - validate AI pipeline outputs
| - detect intelligence degradation
| - ensure AI consistency
|
| IMPORTANT:
| This becomes critical later for:
| - production AI monitoring
| - AI reliability
| - behavioral engine stability
|
*/

export class AIWatchdogService {
    /*
    |--------------------------------------------------------------------------
    | Generate Health Report
    |--------------------------------------------------------------------------
    */

    static generateReport():
        AIWatchdogReport {
        try {
            /*
            |--------------------------------------------------------------------------
            | Snapshot
            |--------------------------------------------------------------------------
            */

            const snapshot =
                AIOrchestratorService.generateSnapshot();

            /*
            |--------------------------------------------------------------------------
            | Warnings
            |--------------------------------------------------------------------------
            */

            const warnings:
                string[] = [];

            /*
            |--------------------------------------------------------------------------
            | Empty Insights
            |--------------------------------------------------------------------------
            */

            if (
                snapshot.insights
                    .length === 0
            ) {
                warnings.push(
                    "No AI insights generated"
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Empty Recommendations
            |--------------------------------------------------------------------------
            */

            if (
                snapshot
                    .recommendations
                    .length === 0
            ) {
                warnings.push(
                    "No recommendations generated"
                );
            }

            /*
            |--------------------------------------------------------------------------
            | No Patterns
            |--------------------------------------------------------------------------
            */

            if (
                snapshot.patterns
                    .length === 0
            ) {
                warnings.push(
                    "No behavioral patterns detected"
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Weak Memory
            |--------------------------------------------------------------------------
            */

            if (
                snapshot.memory
                    .length < 3
            ) {
                warnings.push(
                    "AI memory is still limited"
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Health Status
            |--------------------------------------------------------------------------
            */

            const healthy =
                warnings.length <= 2;

            /*
            |--------------------------------------------------------------------------
            | Report
            |--------------------------------------------------------------------------
            */

            const report:
                AIWatchdogReport =
            {
                healthy,

                warnings,

                metrics: {
                    insights:
                        snapshot.insights
                            .length,

                    recommendations:
                        snapshot
                            .recommendations
                            .length,

                    patterns:
                        snapshot.patterns
                            .length,

                    memoryRecords:
                        snapshot.memory
                            .length,
                },

                checkedAt:
                    Date.now(),
            };

            /*
            |--------------------------------------------------------------------------
            | Logging
            |--------------------------------------------------------------------------
            */

            if (healthy) {
                logInfo(
                    "AI watchdog health check passed",
                    report.metrics
                );
            } else {
                logWarn(
                    "AI watchdog warnings detected",
                    warnings
                );
            }

            return report;
        } catch (error) {
            logError(
                "AI watchdog failed",
                error
            );

            return {
                healthy: false,

                warnings: [
                    "AI watchdog execution failed",
                ],

                metrics: {
                    insights: 0,

                    recommendations: 0,

                    patterns: 0,

                    memoryRecords: 0,
                },

                checkedAt:
                    Date.now(),
            };
        }
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
    | Start AI Monitoring
    |--------------------------------------------------------------------------
    */

    static startMonitoring():
        NodeJS.Timeout {
        logInfo(
            "AI watchdog monitoring started"
        );

        return setInterval(
            () => {
                this.generateReport();
            },
            1000 * 60 * 10
        );
    }
}