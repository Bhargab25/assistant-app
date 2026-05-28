// src/core/parser/workflow.builder.ts

import {
    Intent,
    TimeReminderIntent,
    IntervalReminderIntent,
    LocationReminderIntent,
    FollowUpReminderIntent,
    BrightnessAdjustmentIntent,
    SilentModeIntent,
    SmartRoutineIntent,
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

            case "brightness_adjustment":
                return this.buildBrightnessAdjustment(
                    intent as BrightnessAdjustmentIntent
                );

            case "silent_mode":
                return this.buildSilentMode(
                    intent as SilentModeIntent
                );

            case "smart_routine":
                return this.buildSmartRoutine(
                    intent as SmartRoutineIntent
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

    /*
    |--------------------------------------------------------------------------
    | Build Brightness Adjustment
    |--------------------------------------------------------------------------
    */

    static buildBrightnessAdjustment(
        intent: BrightnessAdjustmentIntent
    ): Workflow {
        const trigger = intent.time
            ? { type: "time", time: intent.time }
            : intent.locationName
                ? { type: "geofence_enter", locationId: intent.locationName }
                : { type: "manual" };

        return WorkflowFactory.create({
            name: `Brightness Adjustment (${Math.round(intent.brightnessLevel * 100)}%)`,
            trigger: trigger as any,
            actions: [
                {
                    id: Math.random().toString(36).substring(7),
                    type: "set_brightness",
                    name: "Set Display Brightness",
                    enabled: true,
                    config: {
                        brightness: intent.brightnessLevel,
                    },
                } as any,
            ],
            state: "idle",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Build Silent Mode
    |--------------------------------------------------------------------------
    */

    static buildSilentMode(
        intent: SilentModeIntent
    ): Workflow {
        const trigger = intent.time
            ? { type: "time", time: intent.time }
            : intent.locationName
                ? { type: "geofence_enter", locationId: intent.locationName }
                : { type: "manual" };

        const actions: any[] = [
            {
                id: Math.random().toString(36).substring(7),
                type: "set_silent",
                name: "Toggle Silent Mode",
                enabled: true,
                config: {
                    silent: intent.silentEnabled,
                },
            }
        ];

        if (intent.vibrateEnabled) {
            actions.push({
                id: Math.random().toString(36).substring(7),
                type: "vibrate",
                name: "Trigger Haptic Vibration",
                enabled: true,
                config: {},
            });
        }

        return WorkflowFactory.create({
            name: `Silent Mode (${intent.silentEnabled ? "On" : "Off"})`,
            trigger: trigger as any,
            actions: actions as any,
            state: "idle",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Build Smart Routine
    |--------------------------------------------------------------------------
    */

    static buildSmartRoutine(
        intent: SmartRoutineIntent
    ): Workflow {
        const trigger = intent.time
            ? { type: "time", time: intent.time }
            : intent.locationName
                ? { type: "geofence_enter", locationId: intent.locationName }
                : { type: "manual" };

        const actions = [];

        if (intent.silentEnabled !== undefined) {
            actions.push({
                id: Math.random().toString(36).substring(7),
                type: "set_silent",
                name: "Toggle Silent Mode",
                enabled: true,
                config: {
                    silent: intent.silentEnabled,
                },
            });
        }

        if (intent.brightnessLevel !== undefined) {
            actions.push({
                id: Math.random().toString(36).substring(7),
                type: "set_brightness",
                name: "Set Display Brightness",
                enabled: true,
                config: {
                    brightness: intent.brightnessLevel,
                },
            });
        }

        if (intent.vibrateEnabled) {
            actions.push({
                id: Math.random().toString(36).substring(7),
                type: "vibrate",
                name: "Trigger Haptic Vibration",
                enabled: true,
                config: {},
            });
        }

        return WorkflowFactory.create({
            name: `Smart Routine - ${intent.routineName.replace("_", " ")}`,
            trigger: trigger as any,
            actions: actions as any,
            state: "idle",
        });
    }

    static supports(
        intent: Intent
    ): boolean {
        return [
            "time_reminder",

            "interval_reminder",

            "location_reminder",

            "followup_reminder",

            "brightness_adjustment",

            "silent_mode",

            "smart_routine",
        ].includes(intent.intent);
    }
}