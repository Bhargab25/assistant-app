// src/core/workflows/types.ts

/*
|--------------------------------------------------------------------------
| Trigger Types
|--------------------------------------------------------------------------
*/

export type TimeTrigger = {
    type: "time";
    time: string; // HH:mm
};

export type IntervalTrigger = {
    type: "interval";
    everyMinutes: number;
};

export type GeofenceTrigger = {
    type: "geofence_enter" | "geofence_exit";
    locationId: string;
};

export type Trigger =
    | TimeTrigger
    | IntervalTrigger
    | GeofenceTrigger;

/*
|--------------------------------------------------------------------------
| Condition Types
|--------------------------------------------------------------------------
*/

export type TimeRangeCondition = {
    type: "time_range";
    start: string; // HH:mm
    end: string;   // HH:mm
};

export type WeekdayCondition = {
    type: "weekday";
    days: number[]; // 0 = Sunday
};

export type Condition =
    | TimeRangeCondition
    | WeekdayCondition;

/*
|--------------------------------------------------------------------------
| Action Types
|--------------------------------------------------------------------------
*/

export type NotifyAction = {
    type: "notify";
    title: string;
    message: string;
};

export type AskAction = {
    type: "ask";
    question: string;
};

export type RepeatAction = {
    type: "repeat";
    intervalMinutes: number;
    maxRetries?: number;
};

export type Action =
    | NotifyAction
    | AskAction
    | RepeatAction;

/*
|--------------------------------------------------------------------------
| Retry Policy
|--------------------------------------------------------------------------
*/

export type RetryPolicy = {
    enabled: boolean;
    retryAfterMinutes: number;
    maxRetries: number;
};

/*
|--------------------------------------------------------------------------
| Workflow State
|--------------------------------------------------------------------------
*/

export type WorkflowState =
    | "idle"
    | "active"
    | "paused"
    | "completed"
    | "retrying";

/*
|--------------------------------------------------------------------------
| Main Workflow Type
|--------------------------------------------------------------------------
*/

export type Workflow = {
    id: string;

    name: string;

    enabled: boolean;

    trigger: Trigger;

    conditions?: Condition[];

    actions: Action[];

    retryPolicy?: RetryPolicy;

    state: WorkflowState;

    createdAt: string;

    updatedAt: string;
};