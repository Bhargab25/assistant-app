// src/shared/utils/id.ts

// RFC 4122 v4 compliant pure JS UUID generator
const uuid = (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/*
|--------------------------------------------------------------------------
| ID Utilities
|--------------------------------------------------------------------------
|
| Centralized ID generation utilities.
|
| IMPORTANT:
| Never scatter random ID generation across the app.
|
| Benefits:
| - consistent identifiers
| - easier debugging
| - traceable runtime entities
| - scalable persistence architecture
|
*/

/*
|--------------------------------------------------------------------------
| Generic ID
|--------------------------------------------------------------------------
*/

export const generateId =
    (): string => {
        return uuid();
    };

/*
|--------------------------------------------------------------------------
| Workflow ID
|--------------------------------------------------------------------------
*/

export const generateWorkflowId =
    (): string => {
        return `wf_${uuid()}`;
    };

/*
|--------------------------------------------------------------------------
| Retry Task ID
|--------------------------------------------------------------------------
*/

export const generateRetryId =
    (): string => {
        return `retry_${uuid()}`;
    };

/*
|--------------------------------------------------------------------------
| Notification ID
|--------------------------------------------------------------------------
*/

export const generateNotificationId =
    (): string => {
        return `notif_${uuid()}`;
    };

/*
|--------------------------------------------------------------------------
| Event ID
|--------------------------------------------------------------------------
*/

export const generateEventId =
    (): string => {
        return `event_${uuid()}`;
    };

/*
|--------------------------------------------------------------------------
| Session ID
|--------------------------------------------------------------------------
*/

export const generateSessionId =
    (): string => {
        return `session_${uuid()}`;
    };

/*
|--------------------------------------------------------------------------
| Parser ID
|--------------------------------------------------------------------------
*/

export const generateParserId =
    (): string => {
        return `parser_${uuid()}`;
    };

/*
|--------------------------------------------------------------------------
| Runtime Trace ID
|--------------------------------------------------------------------------
*/

export const generateTraceId =
    (): string => {
        return `trace_${uuid()}`;
    };