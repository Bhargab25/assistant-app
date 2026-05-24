// src/core/scheduler/retry.service.ts

import dayjs from "dayjs";

import { NotificationService } from "../notifications/notification.service";

import { Workflow } from "../workflows/types";

import { WorkflowLogRepository } from "../storage/workflow-log.repository";

/*
|--------------------------------------------------------------------------
| Retry Task Type
|--------------------------------------------------------------------------
*/

type RetryTask = {
    workflowId: string;

    title: string;

    message: string;

    retryCount: number;

    maxRetries: number;

    retryAfterMinutes: number;

    scheduledAt: string;
};

/*
|--------------------------------------------------------------------------
| Retry Service
|--------------------------------------------------------------------------
|
| Handles:
| - ignored reminders
| - retry scheduling
| - escalation logic
| - persistent follow-up behavior
|
*/

export class RetryService {
    /*
    |--------------------------------------------------------------------------
    | In-Memory Retry Queue
    |--------------------------------------------------------------------------
    |
    | Later:
    | move to persistent SQLite queue
    |
    */

    private static retryQueue: RetryTask[] = [];

    /*
    |--------------------------------------------------------------------------
    | Register Retry Task
    |--------------------------------------------------------------------------
    */

    static async register(
        workflow: Workflow,
        title: string,
        message: string
    ): Promise<void> {
        if (!workflow.retryPolicy?.enabled) {
            return;
        }

        const retryTask: RetryTask = {
            workflowId: workflow.id,

            title,

            message,

            retryCount: 0,

            maxRetries:
                workflow.retryPolicy.maxRetries,

            retryAfterMinutes:
                workflow.retryPolicy.retryAfterMinutes,

            scheduledAt: dayjs()
                .add(
                    workflow.retryPolicy.retryAfterMinutes,
                    "minute"
                )
                .toISOString(),
        };

        this.retryQueue.push(retryTask);

        await WorkflowLogRepository.create({
            workflowId: workflow.id,
            eventType: "retry_registered",
            status: "pending",
            message: `Retry scheduled after ${retryTask.retryAfterMinutes} minutes`,
            createdAt: new Date().toISOString(),
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Process Retry Queue
    |--------------------------------------------------------------------------
    */

    static async processQueue(): Promise<void> {
        const now = dayjs();

        for (const task of this.retryQueue) {
            const scheduledTime = dayjs(task.scheduledAt);

            /*
            |--------------------------------------------------------------------------
            | Not Ready Yet
            |--------------------------------------------------------------------------
            */

            if (now.isBefore(scheduledTime)) {
                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Retry Limit Reached
            |--------------------------------------------------------------------------
            */

            if (task.retryCount >= task.maxRetries) {
                await this.handleEscalation(task);

                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Send Retry Notification
            |--------------------------------------------------------------------------
            */

            await NotificationService.sendNow(
                task.title,
                task.message
            );

            task.retryCount += 1;

            task.scheduledAt = dayjs()
                .add(task.retryAfterMinutes, "minute")
                .toISOString();

            await WorkflowLogRepository.create({
                workflowId: task.workflowId,
                eventType: "retry_sent",
                status: "success",
                message: `Retry #${task.retryCount} sent`,
                createdAt: new Date().toISOString(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Cleanup Completed Tasks
        |--------------------------------------------------------------------------
        */

        this.retryQueue = this.retryQueue.filter(
            (task) => task.retryCount < task.maxRetries
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Handle Escalation
    |--------------------------------------------------------------------------
    */

    static async handleEscalation(
        task: RetryTask
    ): Promise<void> {
        await NotificationService.sendNow(
            "Reminder Escalated",
            task.message
        );

        await WorkflowLogRepository.create({
            workflowId: task.workflowId,
            eventType: "retry_escalated",
            status: "warning",
            message: "Retry escalation triggered",
            createdAt: new Date().toISOString(),
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Clear Queue
    |--------------------------------------------------------------------------
    */

    static clearQueue(): void {
        this.retryQueue = [];
    }

    /*
    |--------------------------------------------------------------------------
    | Get Queue
    |--------------------------------------------------------------------------
    */

    static getQueue(): RetryTask[] {
        return this.retryQueue;
    }
}