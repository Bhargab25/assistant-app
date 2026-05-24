// src/core/triggers/trigger.service.ts

import dayjs from "dayjs";

import {
    Trigger,
    Workflow,
} from "../workflows/types";

import { WorkflowLogRepository } from "../storage/workflow-log.repository";

/*
|--------------------------------------------------------------------------
| Trigger Service
|--------------------------------------------------------------------------
|
| Responsible for:
| - evaluating triggers
| - evaluating conditions
| - future context detection
| - geofence activation
|
*/

export class TriggerService {
    /*
    |--------------------------------------------------------------------------
    | Evaluate Workflow Trigger
    |--------------------------------------------------------------------------
    */

    static async evaluateWorkflow(
        workflow: Workflow
    ): Promise<boolean> {
        /*
        |--------------------------------------------------------------------------
        | Workflow Disabled
        |--------------------------------------------------------------------------
        */

        if (!workflow.enabled) {
            return false;
        }

        /*
        |--------------------------------------------------------------------------
        | Workflow Paused
        |--------------------------------------------------------------------------
        */

        if (workflow.state === "paused") {
            return false;
        }

        /*
        |--------------------------------------------------------------------------
        | Evaluate Trigger
        |--------------------------------------------------------------------------
        */

        const triggerMatched =
            await this.evaluateTrigger(
                workflow.trigger,
                workflow
            );

        if (!triggerMatched) {
            return false;
        }

        /*
        |--------------------------------------------------------------------------
        | Evaluate Conditions
        |--------------------------------------------------------------------------
        */

        const conditionsMatched =
            await this.evaluateConditions(
                workflow
            );

        return conditionsMatched;
    }

    /*
    |--------------------------------------------------------------------------
    | Evaluate Trigger
    |--------------------------------------------------------------------------
    */

    static async evaluateTrigger(
        trigger: Trigger,
        workflow: Workflow
    ): Promise<boolean> {
        /*
        |--------------------------------------------------------------------------
        | Time Trigger
        |--------------------------------------------------------------------------
        */

        if (trigger.type === "time") {
            const now =
                dayjs().format("HH:mm");

            return now === trigger.time;
        }

        /*
        |--------------------------------------------------------------------------
        | Interval Trigger
        |--------------------------------------------------------------------------
        */

        if (trigger.type === "interval") {
            const logs = await WorkflowLogRepository.findByWorkflowId(workflow.id);
            const lastExecution = logs.find(
                (log) =>
                    log.eventType === "workflow_executed" &&
                    log.status === "success"
            );

            const referenceTime = lastExecution
                ? dayjs(lastExecution.createdAt)
                : dayjs(workflow.createdAt);

            const elapsedSeconds = dayjs().diff(referenceTime, "second");

            return elapsedSeconds >= trigger.everyMinutes * 60;
        }

        /*
        |--------------------------------------------------------------------------
        | Geofence Enter
        |--------------------------------------------------------------------------
        |
        | Will connect later with:
        | - location engine
        | - geofence manager
        |
        */

        if (
            trigger.type ===
            "geofence_enter"
        ) {
            return false;
        }

        /*
        |--------------------------------------------------------------------------
        | Geofence Exit
        |--------------------------------------------------------------------------
        */

        if (
            trigger.type ===
            "geofence_exit"
        ) {
            return false;
        }

        return false;
    }

    /*
    |--------------------------------------------------------------------------
    | Evaluate Conditions
    |--------------------------------------------------------------------------
    */

    static async evaluateConditions(
        workflow: Workflow
    ): Promise<boolean> {
        /*
        |--------------------------------------------------------------------------
        | No Conditions
        |--------------------------------------------------------------------------
        */

        if (
            !workflow.conditions ||
            workflow.conditions.length === 0
        ) {
            return true;
        }

        for (const condition of workflow.conditions) {
            /*
            |--------------------------------------------------------------------------
            | Time Range Condition
            |--------------------------------------------------------------------------
            */

            if (
                condition.type ===
                "time_range"
            ) {
                const now =
                    dayjs().format("HH:mm");

                if (
                    now < condition.start ||
                    now > condition.end
                ) {
                    return false;
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Weekday Condition
            |--------------------------------------------------------------------------
            */

            if (
                condition.type ===
                "weekday"
            ) {
                const currentDay =
                    dayjs().day();

                if (
                    !condition.days.includes(
                        currentDay
                    )
                ) {
                    return false;
                }
            }
        }

        return true;
    }
}
