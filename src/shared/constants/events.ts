// src/shared/constants/events.ts

/*
|--------------------------------------------------------------------------
| Runtime Events
|--------------------------------------------------------------------------
|
| Centralized application event names.
|
| IMPORTANT:
| Never hardcode event strings throughout the app.
|
| Benefits:
| - avoids typos
| - improves refactoring
| - event discoverability
| - scalable event-driven architecture
|
*/

export const EVENTS = {
    /*
    |--------------------------------------------------------------------------
    | App Lifecycle
    |--------------------------------------------------------------------------
    */

    APP_INITIALIZED:
        "APP_INITIALIZED",

    APP_BACKGROUND:
        "APP_BACKGROUND",

    APP_FOREGROUND:
        "APP_FOREGROUND",

    /*
    |--------------------------------------------------------------------------
    | Workflow Events
    |--------------------------------------------------------------------------
    */

    WORKFLOW_CREATED:
        "WORKFLOW_CREATED",

    WORKFLOW_UPDATED:
        "WORKFLOW_UPDATED",

    WORKFLOW_DELETED:
        "WORKFLOW_DELETED",

    WORKFLOW_ENABLED:
        "WORKFLOW_ENABLED",

    WORKFLOW_DISABLED:
        "WORKFLOW_DISABLED",

    WORKFLOW_STARTED:
        "workflow.execution.started",

    WORKFLOW_COMPLETED:
        "workflow.execution.completed",

    WORKFLOW_FAILED:
        "workflow.execution.failed",

    WORKFLOW_TRIGGERED:
        "workflow.triggered",

    /*
    |--------------------------------------------------------------------------
    | Trigger Events
    |--------------------------------------------------------------------------
    */

    TRIGGER_MATCHED:
        "TRIGGER_MATCHED",

    TRIGGER_FAILED:
        "TRIGGER_FAILED",

    /*
    |--------------------------------------------------------------------------
    | Action Events
    |--------------------------------------------------------------------------
    */

    ACTION_EXECUTED:
        "ACTION_EXECUTED",

    ACTION_FAILED:
        "ACTION_FAILED",

    /*
    |--------------------------------------------------------------------------
    | Scheduler Events
    |--------------------------------------------------------------------------
    */

    SCHEDULER_STARTED:
        "SCHEDULER_STARTED",

    SCHEDULER_STOPPED:
        "SCHEDULER_STOPPED",

    SCHEDULER_TICK:
        "SCHEDULER_TICK",

    /*
    |--------------------------------------------------------------------------
    | Retry Events
    |--------------------------------------------------------------------------
    */

    RETRY_REGISTERED:
        "RETRY_REGISTERED",

    RETRY_EXECUTED:
        "RETRY_EXECUTED",

    RETRY_ESCALATED:
        "RETRY_ESCALATED",

    /*
    |--------------------------------------------------------------------------
    | Parser Events
    |--------------------------------------------------------------------------
    */

    PARSER_STARTED:
        "PARSER_STARTED",

    PARSER_COMPLETED:
        "PARSER_COMPLETED",

    PARSER_FAILED:
        "PARSER_FAILED",

    /*
    |--------------------------------------------------------------------------
    | Notification Events
    |--------------------------------------------------------------------------
    */

    NOTIFICATION_SENT:
        "NOTIFICATION_SENT",

    NOTIFICATION_FAILED:
        "NOTIFICATION_FAILED",

    /*
    |--------------------------------------------------------------------------
    | Geofence Events
    |--------------------------------------------------------------------------
    */

    GEOFENCE_ENTER:
        "GEOFENCE_ENTER",

    GEOFENCE_EXIT:
        "GEOFENCE_EXIT",

    /*
    |--------------------------------------------------------------------------
    | Debug Events
    |--------------------------------------------------------------------------
    */

    DEBUG_EVENT:
        "DEBUG_EVENT",
} as const;

/*
|--------------------------------------------------------------------------
| Event Type
|--------------------------------------------------------------------------
*/

export type AppEvent =
    typeof EVENTS[keyof typeof EVENTS] | string;