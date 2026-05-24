// src/core/platform/platform-runtime.service.ts

import {
    RuntimeOrchestratorService,
} from "../runtime/runtime-orchestrator.service";

import {
    AIRuntimeKernelService,
} from "../ai/ai-runtime-kernel.service";

import {
    AssistantRuntimeKernelService,
} from "../assistant/assistant-runtime-kernel.service";

import {
    RuntimeWatchdogService,
} from "../runtime/runtime-watchdog.service";

import {
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Platform Runtime State
|--------------------------------------------------------------------------
*/

type PlatformRuntimeState =
    {
        initialized: boolean;

        startedAt?: number;

        runtimeReady: boolean;

        aiReady: boolean;

        assistantReady: boolean;
    };

/*
|--------------------------------------------------------------------------
| Platform Runtime Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - bootstrap entire platform
| - initialize all runtime kernels
| - orchestrate system lifecycle
| - manage platform startup/shutdown
|
| IMPORTANT:
| This becomes the MASTER SYSTEM ENTRYPOINT.
|
*/

export class PlatformRuntimeService {
    /*
    |--------------------------------------------------------------------------
    | Platform State
    |--------------------------------------------------------------------------
    */

    private static state:
        PlatformRuntimeState =
        {
            initialized: false,

            runtimeReady: false,

            aiReady: false,

            assistantReady: false,
        };

    /*
    |--------------------------------------------------------------------------
    | Initialize Platform
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
                "Initializing platform runtime..."
            );

            /*
            |--------------------------------------------------------------------------
            | Initialize Runtime Engine
            |--------------------------------------------------------------------------
            */

            await RuntimeOrchestratorService.initialize();

            /*
            |--------------------------------------------------------------------------
            | Start Runtime Watchdog
            |--------------------------------------------------------------------------
            */

            RuntimeWatchdogService.start();

            /*
            |--------------------------------------------------------------------------
            | Initialize AI Kernel
            |--------------------------------------------------------------------------
            */

            AIRuntimeKernelService.initialize();

            /*
            |--------------------------------------------------------------------------
            | Initialize Assistant Kernel
            |--------------------------------------------------------------------------
            */

            AssistantRuntimeKernelService.initialize();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state = {
                initialized: true,

                startedAt:
                    Date.now(),

                runtimeReady:
                    true,

                aiReady:
                    AIRuntimeKernelService.isReady(),

                assistantReady:
                    AssistantRuntimeKernelService.isReady(),
            };

            logInfo(
                "Platform runtime initialized"
            );
        } catch (error) {
            logError(
                "Platform runtime initialization failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Shutdown Platform
    |--------------------------------------------------------------------------
    */

    static async shutdown():
        Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Stop Runtime Watchdog
            |--------------------------------------------------------------------------
            */

            RuntimeWatchdogService.stop();

            /*
            |--------------------------------------------------------------------------
            | Shutdown Assistant Kernel
            |--------------------------------------------------------------------------
            */

            AssistantRuntimeKernelService.shutdown();

            /*
            |--------------------------------------------------------------------------
            | Shutdown AI Kernel
            |--------------------------------------------------------------------------
            */

            AIRuntimeKernelService.shutdown();

            /*
            |--------------------------------------------------------------------------
            | Shutdown Runtime Engine
            |--------------------------------------------------------------------------
            */

            await RuntimeOrchestratorService.shutdown();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state.runtimeReady =
                false;

            this.state.aiReady =
                false;

            this.state.assistantReady =
                false;

            logInfo(
                "Platform runtime shutdown complete"
            );
        } catch (error) {
            logError(
                "Platform runtime shutdown failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Platform State
    |--------------------------------------------------------------------------
    */

    static getState():
        PlatformRuntimeState {
        return this.state;
    }

    /*
    |--------------------------------------------------------------------------
    | Platform Health
    |--------------------------------------------------------------------------
    */

    static isHealthy():
        boolean {
        return (
            this.state
                .runtimeReady &&
            this.state.aiReady &&
            this.state
                .assistantReady
        );
    }
}