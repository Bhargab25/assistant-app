// src/shared/utils/logger.ts

import {
    logger,
} from "react-native-logs";

/*
|--------------------------------------------------------------------------
| Logger Configuration
|--------------------------------------------------------------------------
|
| Centralized runtime logging system.
|
| IMPORTANT:
| Never use raw console.log across the app.
|
| Benefits:
| - structured logging
| - runtime observability
| - easier debugging
| - production filtering
| - remote logging support later
|
*/

const config = {
    severity: "debug",

    transportOptions: {
        colors: {
            info: "blue",

            warn: "yellow",

            error: "red",

            debug: "white",
        },
    },

    enabled: true,

    async: true,

    dateFormat: "time",
};

/*
|--------------------------------------------------------------------------
| App Logger
|--------------------------------------------------------------------------
*/

export const appLogger =
    logger.createLogger(config as any);

/*
|--------------------------------------------------------------------------
| Logger Helpers
|--------------------------------------------------------------------------
*/

export const logInfo = (
    message: string,
    payload?: unknown
) => {
    appLogger.info(
        message,
        payload ?? ""
    );
};

export const logWarn = (
    message: string,
    payload?: unknown
) => {
    appLogger.warn(
        message,
        payload ?? ""
    );
};

export const logError = (
    message: string,
    payload?: unknown
) => {
    appLogger.error(
        message,
        payload ?? ""
    );
};

export const logDebug = (
    message: string,
    payload?: unknown
) => {
    appLogger.debug(
        message,
        payload ?? ""
    );
};

/*
|--------------------------------------------------------------------------
| Runtime Event Logger
|--------------------------------------------------------------------------
*/

export const logRuntimeEvent =
    (
        event: string,
        data?: unknown
    ) => {
        appLogger.info(
            `[RUNTIME] ${event}`,
            data ?? ""
        );
    };

/*
|--------------------------------------------------------------------------
| Workflow Logger
|--------------------------------------------------------------------------
*/

export const logWorkflow =
    (
        workflowId: string,
        message: string,
        payload?: unknown
    ) => {
        appLogger.info(
            `[WORKFLOW:${workflowId}] ${message}`,
            payload ?? ""
        );
    };

/*
|--------------------------------------------------------------------------
| Parser Logger
|--------------------------------------------------------------------------
*/

export const logParser =
    (
        input: string,
        result?: unknown
    ) => {
        appLogger.debug(
            `[PARSER] ${input}`,
            result ?? ""
        );
    };