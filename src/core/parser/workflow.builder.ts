// src/core/parser/workflow.builder.ts

import {
    Intent,
    TimeReminderIntent,
    IntervalReminderIntent,
    LocationReminderIntent,
    FollowUpReminderIntent,
} from "./intent.types";

import { Workflow } from "../workflows/types";

import { WorkflowFactory } from "../workflows/workflow.factory";

/*
|--------------------------------------------------------------------------
| Workflow Builder
|--------------------------------------------------------------------------
|
| Converts:
|
| Natural Language Intent
|            ↓
| Structured Workflow JSON
|
| This becomes the intelligence bridge between:
| - NLP
| - Automation Engine
|
*/

export class WorkflowBuilder {
    /*
    |--------------------------------------------------------------------------
    | Build Workflow From Intent
    |--------------------------------------------------------------------------
    */

    static build(
        intent: Intent
    ): Workflow {
        switch (intent.intent) {
            /*
            |--------------------------------------------------------------------------
            | Time Reminder
            |--------------------------------------------------------------------------
            */

            case "time_reminder":
                return this.buildTimeReminder(
                    intent
                );

            /*
            |--------------------------------------------------------------------------
            | Interval Reminder
            |--------------------------------------------------------------------------
            */

            case "interval_reminder":
                return this.buildIntervalReminder(
                    intent
                );

            /*
            |--------------------------------------------------------------------------
            | Location Reminder
            |--------------------------------------------------------------------------
            */

            case "location_reminder":
                return this.buildLocationReminder(
                    intent
                );

            /*
            |--------------------------------------------------------------------------
            | Follow-Up Reminder
            |--------------------------------------------------------------------------
            */

            case "followup_reminder":
                return this.buildFollowupReminder(
                    intent
                );

            default:
                throw new Error(
                    `Unsupported intent: ${intent.intent}`
                );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Build Time Reminder
    |--------------------------------------------------------------------------
    */

    static buildTimeReminder(
        intent: TimeReminderIntent
    ): Workflow {
        return WorkflowFactory.create({
            name:
                "Time Reminder",

            trigger: {
                type: "time",

                time: intent.time,
            },

            actions: [
                {
                    type: "notify",

                    title: "Reminder",

                    message:
                        intent.message,
                },
            ],

            state: "idle",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Build Interval Reminder
    |--------------------------------------------------------------------------
    */

    static buildIntervalReminder(
        intent: IntervalReminderIntent
    ): Workflow {
        return WorkflowFactory.create({
            name:
                "Interval Reminder",

            trigger: {
                type: "interval",

                everyMinutes:
                    intent.everyMinutes,
            },

            actions: [
                {
                    type: "notify",

                    title: "Reminder",

                    message:
                        intent.message,
                },
            ],

            retryPolicy: {
                enabled: true,

                retryAfterMinutes: 15,

                maxRetries: 3,
            },

            state: "idle",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Build Location Reminder
    |--------------------------------------------------------------------------
    */

    static buildLocationReminder(
        intent: LocationReminderIntent
    ): Workflow {
        return WorkflowFactory.create({
            name:
                `Location Reminder - ${intent.locationName}`,

            trigger: {
                type:
                    "geofence_enter",

                locationId:
                    intent.locationName,
            },

            actions: [
                {
                    type: "notify",

                    title: "Location Reminder",

                    message:
                        intent.message,
                },
            ],

            retryPolicy: {
                enabled: true,

                retryAfterMinutes: 15,

                maxRetries: 3,
            },

            state: "idle",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Build Follow-Up Reminder
    |--------------------------------------------------------------------------
    */

    static buildFollowupReminder(
        intent: FollowUpReminderIntent
    ): Workflow {
        return WorkflowFactory.create({
            name:
                "Follow-Up Reminder",

            trigger: {
                type: "interval",

                everyMinutes:
                    intent.retryAfterMinutes,
            },

            actions: [
                {
                    type: "notify",

                    title:
                        "Follow-Up Reminder",

                    message:
                        intent.message,
                },
            ],

            retryPolicy: {
                enabled: true,

                retryAfterMinutes:
                    intent.retryAfterMinutes,

                maxRetries: 5,
            },

            state: "idle",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Build Support
    |--------------------------------------------------------------------------
    */

    static supports(
        intent: Intent
    ): boolean {
        return [
            "time_reminder",

            "interval_reminder",

            "location_reminder",

            "followup_reminder",
        ].includes(intent.intent);
    }
}