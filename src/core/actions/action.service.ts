// src/core/actions/action.service.ts

import {
    Action,
    Workflow,
} from "../workflows/types";

import { NotificationService } from "../notifications/notification.service";

import { WorkflowLogRepository } from "../storage/workflow-log.repository";

import { RetryService } from "../scheduler/retry.service";

import { ReminderStorage } from "../reminders/reminder.storage";

import { ReminderRuntime } from "../reminders/reminder.runtime";

/*
|--------------------------------------------------------------------------
| Action Service
|--------------------------------------------------------------------------
|
| Responsible for:
| - executing workflow actions
| - notification dispatch
| - retry registration
| - future automation actions
|
*/

export class ActionService {
    /*
    |--------------------------------------------------------------------------
    | Execute Workflow Actions
    |--------------------------------------------------------------------------
    */

    static async executeWorkflow(
        workflow: Workflow
    ): Promise<void> {
        for (const action of workflow.actions) {
            await this.executeAction(
                workflow,
                action
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Execute Single Action
    |--------------------------------------------------------------------------
    */

    static async executeAction(
        workflow: Workflow,
        action: Action
    ): Promise<void> {
        /*
        |--------------------------------------------------------------------------
        | Notify Action
        |--------------------------------------------------------------------------
        */

        if (action.type === "notify") {
            await this.executeNotifyAction(
                workflow,
                action.title,
                action.message
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Ask Action
        |--------------------------------------------------------------------------
        */

        if (action.type === "ask") {
            await this.executeAskAction(
                workflow,
                action.question
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Repeat Action
        |--------------------------------------------------------------------------
        */

        if (action.type === "repeat") {
            await this.executeRepeatAction(
                workflow,
                action.intervalMinutes
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Notify Action
    |--------------------------------------------------------------------------
    */

    static async executeNotifyAction(
        workflow: Workflow,
        title: string,
        message: string
    ): Promise<void> {
        /*
        |--------------------------------------------------------------------------
        | Check for Matching Reminder → Full-Screen Alarm
        |--------------------------------------------------------------------------
        |
        | When a workflow fires a "notify" action, check if the notification title
        | matches an active reminder. If so, trigger the FULL-SCREEN ALARM instead
        | of sending a plain push notification banner.
        |
        | This is the bridge between the workflow scheduler tick system and the
        | reminder alarm runtime.
        |
        */

        try {
            console.log(
                `[ActionService] executeNotifyAction called with title: "${title}", message: "${message}"`
            );
            
            const allReminders =
                await ReminderStorage.getAll();

            console.log(`[ActionService] Found ${allReminders.length} total reminders in storage.`);
            allReminders.forEach(r => {
                console.log(`[ActionService] Reminder ID: ${r.id}, Active: ${r.runtime.active}, Title: "${r.title}"`);
            });

            const matchingReminder =
                allReminders.find(
                    (r) => {
                        if (!r.runtime.active) return false;
                        
                        const rTitle = r.title.toLowerCase().trim();
                        const nTitle = title.toLowerCase().trim();
                        const nMessage = message.toLowerCase().trim();

                        return (
                            rTitle === nTitle ||
                            rTitle === nMessage ||
                            nMessage.includes(rTitle) ||
                            nTitle.includes(rTitle)
                        );
                    }
                );

            if (matchingReminder) {
                console.log(
                    "[ActionService] Workflow notify matched a reminder — triggering full-screen alarm",
                    {
                        workflowId: workflow.id,
                        reminderId: matchingReminder.id,
                    }
                );

                await ReminderRuntime.triggerReminder(
                    matchingReminder
                );

                /*
                |--------------------------------------------------------------------------
                | Log Event
                |--------------------------------------------------------------------------
                */

                await WorkflowLogRepository.create({
                    workflowId: workflow.id,
                    eventType: "notification_sent",
                    status: "success",
                    message: `Full-screen alarm triggered for reminder: ${matchingReminder.title}`,
                    createdAt:
                        new Date().toISOString(),
                });

                return;
            }
        } catch (reminderCheckError) {
            console.error(
                "[ActionService] Failed to check for matching reminder:",
                reminderCheckError
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Fallback: Plain Notification (no matching reminder found)
        |--------------------------------------------------------------------------
        */

        await NotificationService.sendNow(
            title,
            message
        );

        /*
        |--------------------------------------------------------------------------
        | Register Retry
        |--------------------------------------------------------------------------
        */

        await RetryService.register(
            workflow,
            title,
            message
        );

        /*
        |--------------------------------------------------------------------------
        | Log Event
        |--------------------------------------------------------------------------
        */

        await WorkflowLogRepository.create({
            workflowId: workflow.id,
            eventType: "notification_sent",
            status: "success",
            message,
            createdAt:
                new Date().toISOString(),
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Ask Action
    |--------------------------------------------------------------------------
    */

    static async executeAskAction(
        workflow: Workflow,
        question: string
    ): Promise<void> {
        await NotificationService.sendNow(
            "Question",
            question
        );

        await RetryService.register(
            workflow,
            "Question",
            question
        );

        await WorkflowLogRepository.create({
            workflowId: workflow.id,
            eventType: "question_sent",
            status: "success",
            message: question,
            createdAt:
                new Date().toISOString(),
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Repeat Action
    |--------------------------------------------------------------------------
    |
    | Placeholder for future:
    | - recurring task registration
    | - chained workflows
    | - loop automation
    |
    */

    static async executeRepeatAction(
        workflow: Workflow,
        intervalMinutes: number
    ): Promise<void> {
        await WorkflowLogRepository.create({
            workflowId: workflow.id,
            eventType: "repeat_action_triggered",
            status: "pending",
            message: `Repeat interval: ${intervalMinutes} minutes`,
            createdAt:
                new Date().toISOString(),
        });
    }
}