// src/core/workflows/validators.ts

import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Trigger Schemas
|--------------------------------------------------------------------------
*/

export const TimeTriggerSchema = z.object({
    type: z.literal("time"),
    time: z.string(),
});

export const IntervalTriggerSchema = z.object({
    type: z.literal("interval"),
    everyMinutes: z.number().positive(),
});

export const GeofenceTriggerSchema = z.object({
    type: z.union([
        z.literal("geofence_enter"),
        z.literal("geofence_exit"),
    ]),
    locationId: z.string(),
});

export const TriggerSchema = z.union([
    TimeTriggerSchema,
    IntervalTriggerSchema,
    GeofenceTriggerSchema,
]);

/*
|--------------------------------------------------------------------------
| Condition Schemas
|--------------------------------------------------------------------------
*/

export const TimeRangeConditionSchema = z.object({
    type: z.literal("time_range"),
    start: z.string(),
    end: z.string(),
});

export const WeekdayConditionSchema = z.object({
    type: z.literal("weekday"),
    days: z.array(z.number().min(0).max(6)),
});

export const ConditionSchema = z.union([
    TimeRangeConditionSchema,
    WeekdayConditionSchema,
]);

/*
|--------------------------------------------------------------------------
| Action Schemas
|--------------------------------------------------------------------------
*/

export const NotifyActionSchema = z.object({
    type: z.literal("notify"),
    title: z.string(),
    message: z.string(),
});

export const AskActionSchema = z.object({
    type: z.literal("ask"),
    question: z.string(),
});

export const RepeatActionSchema = z.object({
    type: z.literal("repeat"),
    intervalMinutes: z.number().positive(),
    maxRetries: z.number().optional(),
});

export const ActionSchema = z.union([
    NotifyActionSchema,
    AskActionSchema,
    RepeatActionSchema,
]);

/*
|--------------------------------------------------------------------------
| Retry Policy Schema
|--------------------------------------------------------------------------
*/

export const RetryPolicySchema = z.object({
    enabled: z.boolean(),
    retryAfterMinutes: z.number().min(0),
    maxRetries: z.number().min(0),
});

/*
|--------------------------------------------------------------------------
| Workflow Schema
|--------------------------------------------------------------------------
*/

export const WorkflowSchema = z.object({
    id: z.string(),

    name: z.string(),

    enabled: z.boolean(),

    trigger: TriggerSchema,

    conditions: z.array(ConditionSchema).optional(),

    actions: z.array(ActionSchema),

    retryPolicy: RetryPolicySchema.optional(),

    state: z.union([
        z.literal("idle"),
        z.literal("active"),
        z.literal("paused"),
        z.literal("completed"),
        z.literal("retrying"),
    ]),

    createdAt: z.string(),

    updatedAt: z.string(),
});

/*
|--------------------------------------------------------------------------
| Export Types
|--------------------------------------------------------------------------
*/

export type WorkflowInput = z.infer<typeof WorkflowSchema>;