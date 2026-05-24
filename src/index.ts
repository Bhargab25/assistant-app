// src/index.ts

import {
    bootstrap,
} from "./app/bootstrap";

import {
    logInfo,
    logError,
} from "./shared/utils";

/*
|--------------------------------------------------------------------------
| Platform Entry Point
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - start application runtime
| - bootstrap intelligent platform
| - handle fatal startup failures
|
| IMPORTANT:
| This becomes the ROOT ENTRYPOINT
| of the entire platform.
|
*/

async function start():
    Promise<void> {
    try {
        logInfo(
            "Starting intelligent automation platform..."
        );

        /*
        |--------------------------------------------------------------------------
        | Bootstrap Platform
        |--------------------------------------------------------------------------
        */

        await bootstrap();

        logInfo(
            "Platform started successfully"
        );
    } catch (error) {
        logError(
            "Fatal platform startup failure",
            error
        );

        /*
        |--------------------------------------------------------------------------
        | Future:
        | Crash reporting / telemetry
        |--------------------------------------------------------------------------
        */

        process.exit(1);
    }
}

/*
|--------------------------------------------------------------------------
| Start Platform
|--------------------------------------------------------------------------
*/

void start();