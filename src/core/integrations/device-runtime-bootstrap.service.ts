// src/core/integrations/device-runtime-bootstrap.service.ts

import {
    DeviceNotificationService,
} from "./device-notification.service";

import {
    DeviceAudioService,
} from "./device-audio.service";

import {
    DeviceSpeechService,
} from "./device-speech.service";

import {
    DeviceStorageService,
} from "./device-storage.service";

import {
    DeviceBackgroundTaskService,
} from "./device-background-task.service";

import {
    WorkflowRegistryService,
} from "../workflows/workflow-registry.service";

import {
    RuntimeOrchestratorService,
} from "../runtime/runtime-orchestrator.service";

import {
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Device Runtime Bootstrap State
|--------------------------------------------------------------------------
*/

type DeviceRuntimeBootstrapState =
    {
        initialized: boolean;

        notificationsReady: boolean;

        audioReady: boolean;

        speechReady: boolean;

        storageReady: boolean;

        backgroundReady: boolean;

        workflowReady: boolean;

        runtimeReady: boolean;

        startedAt?: number;
    };

/*
|--------------------------------------------------------------------------
| Device Runtime Bootstrap Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - initialize device integrations
| - initialize runtime systems
| - initialize workflows
| - bootstrap assistant runtime
|
| IMPORTANT:
| This becomes the MAIN
| mobile runtime bootstrap layer.
|
*/

export class DeviceRuntimeBootstrapService {
    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    private static state:
        DeviceRuntimeBootstrapState =
        {
            initialized: false,

            notificationsReady:
                false,

            audioReady: false,

            speechReady: false,

            storageReady: false,

            backgroundReady:
                false,

            workflowReady:
                false,

            runtimeReady:
                false,
        };

    /*
    |--------------------------------------------------------------------------
    | Initialize Device Runtime
    |--------------------------------------------------------------------------
    */

    static async initialize():
        Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Prevent Duplicate Init
            |--------------------------------------------------------------------------
            */

            if (
                this.state
                    .initialized
            ) {
                return;
            }

            logInfo(
                "Initializing device runtime bootstrap..."
            );

            /*
            |--------------------------------------------------------------------------
            | Device Notifications
            |--------------------------------------------------------------------------
            */

            await DeviceNotificationService.initialize();

            this.state.notificationsReady =
                true;

            /*
            |--------------------------------------------------------------------------
            | Device Audio
            |--------------------------------------------------------------------------
            */

            await DeviceAudioService.initialize();

            this.state.audioReady =
                true;

            /*
            |--------------------------------------------------------------------------
            | Device Speech
            |--------------------------------------------------------------------------
            */

            await DeviceSpeechService.initialize();

            this.state.speechReady =
                true;

            /*
            |--------------------------------------------------------------------------
            | Device Storage
            |--------------------------------------------------------------------------
            */

            this.state.storageReady =
                true;

            /*
            |--------------------------------------------------------------------------
            | Background Runtime
            |--------------------------------------------------------------------------
            */

            await DeviceBackgroundTaskService.initialize();

            this.state.backgroundReady =
                true;

            /*
            |--------------------------------------------------------------------------
            | Workflow Runtime
            |--------------------------------------------------------------------------
            */

            await WorkflowRegistryService.initialize();

            this.state.workflowReady =
                true;

            /*
            |--------------------------------------------------------------------------
            | Runtime Orchestrator
            |--------------------------------------------------------------------------
            */

            await RuntimeOrchestratorService.initialize();

            this.state.runtimeReady =
                true;

            /*
            |--------------------------------------------------------------------------
            | Finalize State
            |--------------------------------------------------------------------------
            */

            this.state.initialized =
                true;

            this.state.startedAt =
                Date.now();

            logInfo(
                "Device runtime bootstrap initialized",
                this.state
            );
        } catch (error) {
            logError(
                "Device runtime bootstrap failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    static getState():
        DeviceRuntimeBootstrapState {
        return this.state;
    }

    /*
    |--------------------------------------------------------------------------
    | Is Ready
    |--------------------------------------------------------------------------
    */

    static isReady():
        boolean {
        return (
            this.state
                .initialized &&
            this.state
                .runtimeReady &&
            this.state
                .workflowReady
        );
    }
}