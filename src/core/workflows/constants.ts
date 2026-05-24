// src/core/workflows/constants.ts

/*
|--------------------------------------------------------------------------
| Workflow States
|--------------------------------------------------------------------------
*/

export const WORKFLOW_STATES = {
    IDLE: "idle",
    ACTIVE: "active",
    PAUSED: "paused",
    COMPLETED: "completed",
    RETRYING: "retrying",
} as const;

/*
|--------------------------------------------------------------------------
| Trigger Types
|--------------------------------------------------------------------------
*/

export const TRIGGER_TYPES = {
    TIME: "time",
    INTERVAL: "interval",
    GEOFENCE_ENTER: "geofence_enter",
    GEOFENCE_EXIT: "geofence_exit",
} as const;

/*
|--------------------------------------------------------------------------
| Condition Types
|--------------------------------------------------------------------------
*/

export const CONDITION_TYPES = {
    TIME_RANGE: "time_range",
    WEEKDAY: "weekday",
} as const;

/*
|--------------------------------------------------------------------------
| Action Types
|--------------------------------------------------------------------------
*/

export const ACTION_TYPES = {
    NOTIFY: "notify",
    ASK: "ask",
    REPEAT: "repeat",
} as const;

/*
|--------------------------------------------------------------------------
| Retry Defaults
|--------------------------------------------------------------------------
*/

export const RETRY_DEFAULTS = {
    ENABLED: true,
    RETRY_AFTER_MINUTES: 15,
    MAX_RETRIES: 3,
};

/*
|--------------------------------------------------------------------------
| Notification Defaults
|--------------------------------------------------------------------------
*/

export const NOTIFICATION_DEFAULTS = {
    CHANNEL_ID: "default",
    SOUND: true,
    VIBRATE: true,
};

/*
|--------------------------------------------------------------------------
| Scheduler Defaults
|--------------------------------------------------------------------------
*/

export const SCHEDULER_DEFAULTS = {
    CHECK_INTERVAL_MS: 60 * 1000, // 1 minute
};

/*
|--------------------------------------------------------------------------
| Geofence Defaults
|--------------------------------------------------------------------------
*/

export const GEOFENCE_DEFAULTS = {
    RADIUS_METERS: 100,
};

/*
|--------------------------------------------------------------------------
| Storage Keys
|--------------------------------------------------------------------------
*/

export const STORAGE_KEYS = {
    WORKFLOWS: "workflows",
    LOCATIONS: "locations",
    SETTINGS: "settings",
};