// src/core/ai/ai-runtime-kernel.service.ts

import {
    AIRuntimeService,
} from "./ai-runtime.service";

import {
    AIEventProcessorService,
} from "./ai-event-processor.service";

import {
    AILearningLoopService,
} from "./ai-learning-loop.service";

import {
    AIWatchdogService,
} from "./ai-watchdog.service";

import {
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| AI Runtime Kernel State
|--------------------------------------------------------------------------
*/

type AIRuntimeKernelState =
    {
        initialized: boolean;

        startedAt?: number;

        learningEnabled: boolean;

        monitoringEnabled: boolean;
    };

/*
|--------------------------------------------------------------------------
| AI Runtime Kernel
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - bootstrap all AI subsystems
| - initialize AI event processing
| - start AI learning loop
| - start AI monitoring
| - orchestrate AI lifecycle
|
| IMPORTANT:
| This becomes the MASTER AI BOOTSTRAP LAYER.
|
*/

export class AIRuntimeKernelService {
    /*
    |--------------------------------------------------------------------------
    | Kernel State
    |--------------------------------------------------------------------------
    */

    private static state:
        AIRuntimeKernelState =
        {
            initialized: false,

            learningEnabled: false,

            monitoringEnabled: false,
        };

    /*
    |--------------------------------------------------------------------------
    | Initialize AI Kernel
    |--------------------------------------------------------------------------
    */

    static initialize():
        void {
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
                "Initializing AI runtime kernel..."
            );

            /*
            |--------------------------------------------------------------------------
            | Initialize AI Runtime
            |--------------------------------------------------------------------------
            */

            AIRuntimeService.initialize();

            /*
            |--------------------------------------------------------------------------
            | Initialize Event Processing
            |--------------------------------------------------------------------------
            */

            AIEventProcessorService.initialize();

            /*
            |--------------------------------------------------------------------------
            | Start Learning Loop
            |--------------------------------------------------------------------------
            */

            AILearningLoopService.start();

            /*
            |--------------------------------------------------------------------------
            | Start AI Monitoring
            |--------------------------------------------------------------------------
            */

            AIWatchdogService.startMonitoring();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state = {
                initialized: true,

                startedAt:
                    Date.now(),

                learningEnabled:
                    true,

                monitoringEnabled:
                    true,
            };

            logInfo(
                "AI runtime kernel initialized"
            );
        } catch (error) {
            logError(
                "AI runtime kernel initialization failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Shutdown Kernel
    |--------------------------------------------------------------------------
    */

    static shutdown():
        void {
        try {
            /*
            |--------------------------------------------------------------------------
            | Stop Learning
            |--------------------------------------------------------------------------
            */

            AILearningLoopService.stop();

            /*
            |--------------------------------------------------------------------------
            | Shutdown Runtime
            |--------------------------------------------------------------------------
            */

            AIRuntimeService.shutdown();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state.learningEnabled =
                false;

            this.state.monitoringEnabled =
                false;

            logInfo(
                "AI runtime kernel shutdown complete"
            );
        } catch (error) {
            logError(
                "AI runtime kernel shutdown failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Kernel State
    |--------------------------------------------------------------------------
    */

    static getState():
        AIRuntimeKernelState {
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
                .learningEnabled &&
            this.state
                .monitoringEnabled
        );
    }
}