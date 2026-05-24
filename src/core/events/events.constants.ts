// src/core/events/events.constants.ts

/*
|--------------------------------------------------------------------------
| Workflow Events
|--------------------------------------------------------------------------
*/

export const WORKFLOW_EVENTS = {
    CREATED: "WORKFLOW_CREATED",

    UPDATED: "WORKFLOW_UPDATED",

    DELETED: "WORKFLOW_DELETED",

    ENABLED: "WORKFLOW_ENABLED",

    DISABLED: "WORKFLOW_DISABLED",

    PAUSED: "WORKFLOW_PAUSED",

    RESUMED: "WORKFLOW_RESUMED",

    EXECUTED: "WORKFLOW_EXECUTED",

    FAILED: "WORKFLOW_FAILED",
} as const;

/*
|--------------------------------------------------------------------------
| Notification Events
|--------------------------------------------------------------------------
*/

export const NOTIFICATION_EVENTS = {
    SENT: "NOTIFICATION_SENT",

    DELIVERED: "NOTIFICATION_DELIVERED",

    OPENED: "NOTIFICATION_OPENED",

    DISMISSED: "NOTIFICATION_DISMISSED",

    DONE: "NOTIFICATION_DONE",

    SNOOZED: "NOTIFICATION_SNOOZED",

    SKIPPED: "NOTIFICATION_SKIPPED",

    REMIND_LATER:
        "NOTIFICATION_REMIND_LATER",
} as const;

/*
|--------------------------------------------------------------------------
| Retry Events
|--------------------------------------------------------------------------
*/

export const RETRY_EVENTS = {
    REGISTERED: "RETRY_REGISTERED",

    SENT: "RETRY_SENT",

    ESCALATED: "RETRY_ESCALATED",

    CANCELLED: "RETRY_CANCELLED",
} as const;

/*
|--------------------------------------------------------------------------
| Scheduler Events
|--------------------------------------------------------------------------
*/

export const SCHEDULER_EVENTS = {
    STARTED: "SCHEDULER_STARTED",

    STOPPED: "SCHEDULER_STOPPED",

    TICK: "SCHEDULER_TICK",
} as const;

/*
|--------------------------------------------------------------------------
| Geofence Events
|--------------------------------------------------------------------------
*/

export const GEOFENCE_EVENTS = {
    ENTERED: "GEOFENCE_ENTERED",

    EXITED: "GEOFENCE_EXITED",
} as const;

/*
|--------------------------------------------------------------------------
| User Context Events
|--------------------------------------------------------------------------
*/

export const CONTEXT_EVENTS = {
    USER_ENTERED_OFFICE:
        "USER_ENTERED_OFFICE",

    USER_LEFT_OFFICE:
        "USER_LEFT_OFFICE",

    USER_WAKE_UP:
        "USER_WAKE_UP",

    USER_SLEEP:
        "USER_SLEEP",
} as const;

/*
|--------------------------------------------------------------------------
| App Lifecycle Events
|--------------------------------------------------------------------------
*/

export const APP_EVENTS = {
    BOOTSTRAPPED:
        "APP_BOOTSTRAPPED",

    FOREGROUND:
        "APP_FOREGROUND",

    BACKGROUND:
        "APP_BACKGROUND",

    TERMINATED:
        "APP_TERMINATED",
} as const;