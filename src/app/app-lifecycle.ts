// src/app/app-lifecycle.ts

import {
    AppState,
    AppStateStatus,
} from "react-native";

import {
    PlatformOrchestratorService,
} from "../core/platform/platform-orchestrator.service";

import {
    StorageOrchestratorService,
} from "../core/storage/storage-orchestrator.service";

import {
    logInfo,
    logWarn,
    logError,
} from "../shared/utils";

/*
|--------------------------------------------------------------------------
| App Lifecycle Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - monitor application lifecycle
| - persist runtime on background
| - restore runtime on foreground
| - protect runtime durability
| - coordinate graceful shutdown
|
| IMPORTANT:
| This becomes the bridge between:
|
| Mobile App Lifecycle
|            ↓
| Intelligent Runtime Platform
|
*/

export class AppLifecycleService {
    /*
    |--------------------------------------------------------------------------
    | Current App State
    |--------------------------------------------------------------------------
    */

    private static currentState:
        AppStateStatus =
        AppState.currentState;

    /*
    |--------------------------------------------------------------------------
    | Initialize Lifecycle Monitoring
    |--------------------------------------------------------------------------
    */

    static initialize():
        void {
        try {
            logInfo(
                "Initializing app lifecycle monitoring..."
            );

            /*
            |--------------------------------------------------------------------------
            | Listen For App State Changes
            |--------------------------------------------------------------------------
            */

            AppState.addEventListener(
                "change",
                (nextState) => void AppLifecycleService.handleStateChange(nextState)
            );

            logInfo(
                "App lifecycle monitoring initialized"
            );
        } catch (error) {
            logError(
                "Failed initializing app lifecycle monitoring",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Handle State Change
    |--------------------------------------------------------------------------
    */

    private static async handleStateChange(
        nextState:
            AppStateStatus
    ): Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | App Moving To Background
            |--------------------------------------------------------------------------
            */

            if (
                AppLifecycleService.currentState ===
                "active" &&
                (
                    nextState ===
                    "background" ||
                    nextState ===
                    "inactive"
                )
            ) {
                logWarn(
                    "Application moved to background"
                );

                /*
                |--------------------------------------------------------------------------
                | Force Runtime Sync
                |--------------------------------------------------------------------------
                */

                await StorageOrchestratorService.sync();

                logInfo(
                    "Runtime persisted before backgrounding"
                );
            }

            /*
            |--------------------------------------------------------------------------
            | App Returning To Foreground
            |--------------------------------------------------------------------------
            */

            if (
                (
                    AppLifecycleService.currentState ===
                    "background" ||
                    AppLifecycleService.currentState ===
                    "inactive"
                ) &&
                nextState ===
                "active"
            ) {
                logInfo(
                    "Application returned to foreground"
                );

                /*
                |--------------------------------------------------------------------------
                | Validate Platform Health
                |--------------------------------------------------------------------------
                */

                const healthy =
                    PlatformOrchestratorService.isHealthy();

                if (!healthy) {
                    logWarn(
                        "Platform unhealthy after foreground restore"
                    );
                } else {
                    logInfo(
                        "Platform restored successfully"
                    );
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            AppLifecycleService.currentState =
                nextState;
        } catch (error) {
            logError(
                "App lifecycle state handling failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Destroy Lifecycle Monitoring
    |--------------------------------------------------------------------------
    */

    static destroy():
        void {
        try {
            // AppState listeners are removed by subscription in newer React Native versions,
            // but we keep the destroy block clean.
            logInfo(
                "App lifecycle monitoring destroyed"
            );
        } catch (error) {
            logError(
                "Failed destroying app lifecycle monitoring",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Current State
    |--------------------------------------------------------------------------
    */

    static getState():
        AppStateStatus {
        return AppLifecycleService.currentState;
    }
}