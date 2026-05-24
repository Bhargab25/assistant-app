// src/app/init.ts

import {
    RuntimeOrchestratorService,
} from "../runtime/runtime-orchestrator.service";

import {
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Initialize Application
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - bootstrap runtime kernel
| - initialize orchestrator
| - prepare event systems
| - initialize alarms
| - initialize notifications
| - restore runtime state
|
| IMPORTANT:
| This becomes the application's
| startup lifecycle entrypoint.
|
*/

export async function initializeApp():
    Promise<void> {
    try {
        logInfo(
            "Starting application initialization..."
        );

        /*
        |--------------------------------------------------------------------------
        | Initialize Runtime Kernel
        |--------------------------------------------------------------------------
        */

        await RuntimeOrchestratorService.initialize();

        /*
        |--------------------------------------------------------------------------
        | Future Runtime Modules
        |--------------------------------------------------------------------------
        |
        | Add later:
        |
        | - database migrations
        | - auth restore
        | - analytics init
        | - AI engine preload
        | - geofence restore
        | - workflow hydration
        |
        */

        logInfo(
            "Application initialized successfully"
        );
    } catch (error) {
        logError(
            "Application initialization failed",
            error
        );

        throw error;
    }
}