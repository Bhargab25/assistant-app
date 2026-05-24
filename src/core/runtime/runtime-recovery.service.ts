// src/core/runtime/runtime-recovery.service.ts

import {
    ReminderSessionService,
} from "../reminders/reminder-session.service";

import {
    RuntimeStateService,
} from "./runtime-state.service";

import {
    AlarmService,
} from "../scheduler/alarm.service";

import {
    WorkflowService,
} from "../workflows/workflow.service";

import {
    RuntimeStateRepository,
} from "../storage/repositories/runtime-state.repository";

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
    generateId,
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Recovery Report
|--------------------------------------------------------------------------
*/

export type RuntimeRecoveryReport =
    {
        recovered: number;

        requeued: number;

        failed: number;

        recoveredAt: number;
    };

/*
|--------------------------------------------------------------------------
| Runtime Recovery Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - restore workflows after restart
| - recover interrupted sessions
| - recover active executions
| - re-register alarms
| - rebuild runtime state
| - recover from crashes/reboots
|
| IMPORTANT:
| Mobile operating systems aggressively
| terminate background applications.
|
| Recovery infrastructure is CRITICAL.
|
*/

export class RuntimeRecoveryService {
    /*
    |--------------------------------------------------------------------------
    | Recover Runtime
    |--------------------------------------------------------------------------
    */

    static async recover():
        Promise<
            RuntimeRecoveryReport
        > {
        try {
            logInfo(
                "Starting runtime recovery..."
            );

            /*
            |--------------------------------------------------------------------------
            | Restore Workflows
            |--------------------------------------------------------------------------
            */

            await this.restoreWorkflows();

            /*
            |--------------------------------------------------------------------------
            | Recover Sessions
            |--------------------------------------------------------------------------
            */

            await this.recoverSessions();

            /*
            |--------------------------------------------------------------------------
            | Recover Executions
            |--------------------------------------------------------------------------
            */

            const report =
                await this.recoverExecutions();

            logInfo(
                "Runtime recovery completed",
                report
            );

            return report;
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
    | Restore Workflows
    |--------------------------------------------------------------------------
    */

    private static async restoreWorkflows():
        Promise<void> {
        try {
            const workflows =
                await WorkflowService.findAll();

            const enabledWorkflows =
                workflows.filter(
                    (
                        workflow
                    ) =>
                        workflow.enabled
                );

            for (const workflow of enabledWorkflows) {
                try {
                    await AlarmService.registerWorkflow(
                        workflow
                    );

                    logInfo(
                        "Workflow restored",
                        {
                            workflowId:
                                workflow.id,
                        }
                    );
                } catch (error) {
                    logError(
                        "Workflow restore failed",
                        {
                            workflowId:
                                workflow.id,

                            error,
                        }
                    );
                }
            }

            logInfo(
                "Workflow restoration completed",
                {
                    restored:
                        enabledWorkflows.length,
                }
            );
        } catch (error) {
            logError(
                "Failed restoring workflows",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Recover Sessions
    |--------------------------------------------------------------------------
    */

    private static async recoverSessions():
        Promise<void> {
        try {
            const sessions =
                ReminderSessionService.getActiveSessions();

            for (const session of sessions) {
                /*
                |--------------------------------------------------------------------------
                | Recover Expired Snoozed Session
                |--------------------------------------------------------------------------
                */

                if (
                    session.status ===
                    "snoozed" &&
                    session.snoozeUntil &&
                    session.snoozeUntil <
                    Date.now()
                ) {
                    await ReminderSessionService.activate(
                        session.id
                    );

                    logWarn(
                        "Recovered expired snoozed session",
                        {
                            sessionId:
                                session.id,
                        }
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Expire Stale Pending Session
                |--------------------------------------------------------------------------
                */

                if (
                    session.status ===
                    "pending" &&
                    Date.now() -
                    session.createdAt >
                    1000 *
                    60 *
                    60
                ) {
                    await ReminderSessionService.expire(
                        session.id
                    );

                    logWarn(
                        "Expired stale pending session",
                        {
                            sessionId:
                                session.id,
                        }
                    );
                }
            }

            logInfo(
                "Session recovery completed",
                {
                    recovered:
                        sessions.length,
                }
            );
        } catch (error) {
            logError(
                "Session recovery failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Recover Executions
    |--------------------------------------------------------------------------
    */

    private static async recoverExecutions():
        Promise<
            RuntimeRecoveryReport
        > {
        try {
            const activeStates =
                await RuntimeStateRepository.findActive();

            let recovered = 0;

            let requeued = 0;

            let failed = 0;

            for (const state of activeStates) {
                try {
                    logInfo(
                        "Recovering workflow execution",
                        {
                            workflowId:
                                state.workflowId,

                            state:
                                state.state,
                        }
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Restore Runtime State
                    |--------------------------------------------------------------------------
                    */

                    RuntimeStateService.setState(
                        state
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Recovery Event
                    |--------------------------------------------------------------------------
                    */

                    RuntimeEventStore.add({
                        id: generateId(),

                        type:
                            "runtime.recovery.detected",

                        workflowId:
                            state.workflowId,

                        executionId:
                            state.executionId,

                        payload: {
                            state:
                                state.state,
                        },

                        timestamp:
                            Date.now(),
                    });

                    /*
                    |--------------------------------------------------------------------------
                    | Recovery Strategy
                    |--------------------------------------------------------------------------
                    */

                    switch (
                    state.state
                    ) {
                        case "executing":
                        case "waiting_response":
                            RuntimeWorkflowRetryService.schedule(
                                {
                                    workflowId:
                                        state.workflowId,

                                    reason:
                                        "runtime_recovery",

                                    metadata: {
                                        recovered:
                                            true,
                                    },
                                }
                            );

                            requeued += 1;

                            break;

                        case "retry_pending":
                            RuntimeWorkflowQueueService.enqueue(
                                {
                                    workflowId:
                                        state.workflowId,

                                    trigger:
                                        "retry",

                                    metadata: {
                                        recovered:
                                            true,
                                    },
                                },
                                "high"
                            );

                            requeued += 1;

                            break;

                        default:
                            break;
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Detect Stale Executions
                    |--------------------------------------------------------------------------
                    */

                    const age =
                        Date.now() -
                        state.updatedAt;

                    if (
                        age >
                        1000 *
                        60 *
                        60 *
                        2
                    ) {
                        RuntimeStateService.markFailed(
                            state.workflowId,
                            "Recovered stale execution"
                        );

                        logWarn(
                            "Recovered stale execution",
                            {
                                workflowId:
                                    state.workflowId,
                            }
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Recovery Complete Event
                    |--------------------------------------------------------------------------
                    */

                    RuntimeEventStore.add({
                        id: generateId(),

                        type:
                            "runtime.recovery.completed",

                        workflowId:
                            state.workflowId,

                        executionId:
                            state.executionId,

                        payload: {
                            recovered:
                                true,
                        },

                        timestamp:
                            Date.now(),
                    });

                    recovered += 1;

                    logInfo(
                        "Workflow recovered successfully",
                        {
                            workflowId:
                                state.workflowId,
                        }
                    );
                } catch (error) {
                    failed += 1;

                    logWarn(
                        "Workflow recovery failed",
                        {
                            workflowId:
                                state.workflowId,

                            error,
                        }
                    );
                }
            }

            return {
                recovered,

                requeued,

                failed,

                recoveredAt:
                    Date.now(),
            };
        } catch (error) {
            logError(
                "Execution recovery failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Recover Single Workflow
    |--------------------------------------------------------------------------
    */

    static async recoverWorkflow(
        workflowId: string
    ): Promise<boolean> {
        try {
            const state =
                await RuntimeStateRepository.findByWorkflow(
                    workflowId
                );

            if (!state) {
                logWarn(
                    "Workflow recovery skipped",
                    {
                        workflowId,
                    }
                );

                return false;
            }

            /*
            |--------------------------------------------------------------------------
            | Restore State
            |--------------------------------------------------------------------------
            */

            RuntimeStateService.setState(
                state
            );

            /*
            |--------------------------------------------------------------------------
            | Queue Retry Recovery
            |--------------------------------------------------------------------------
            */

            RuntimeWorkflowRetryService.schedule(
                {
                    workflowId,

                    reason:
                        "manual_recovery",

                    metadata: {
                        recovered:
                            true,
                    },
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Recovery Event
            |--------------------------------------------------------------------------
            */

            RuntimeEventStore.add({
                id: generateId(),

                type:
                    "runtime.workflow.recovered",

                workflowId,

                executionId:
                    state.executionId,

                payload: {
                    state:
                        state.state,
                },

                timestamp:
                    Date.now(),
            });

            logInfo(
                "Workflow recovered manually",
                {
                    workflowId,
                }
            );

            return true;
        } catch (error) {
            logError(
                "Manual workflow recovery failed",
                error
            );

            return false;
        }
    }
}