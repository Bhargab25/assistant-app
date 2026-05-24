// src/core/assistant/assistant-runtime-kernel.service.ts

import {
    AssistantRuntimeService,
} from "./assistant-runtime.service";

import {
    AssistantLearningLoopService,
} from "./assistant-learning-loop.service";

import {
    AssistantMemoryService,
} from "./assistant-memory.service";

import {
    AssistantOrchestratorService,
} from "./assistant-orchestrator.service";

import {
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Assistant Runtime Kernel State
|--------------------------------------------------------------------------
*/

type AssistantRuntimeKernelState =
    {
        initialized: boolean;

        learningEnabled: boolean;

        startedAt?: number;
    };

/*
|--------------------------------------------------------------------------
| Assistant Runtime Kernel
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - bootstrap assistant systems
| - initialize conversational runtime
| - start assistant learning loop
| - warm assistant memory/context
| - orchestrate assistant lifecycle
|
| IMPORTANT:
| This becomes the MASTER
| conversational intelligence kernel.
|
*/

export class AssistantRuntimeKernelService {
    /*
    |--------------------------------------------------------------------------
    | Kernel State
    |--------------------------------------------------------------------------
    */

    private static state:
        AssistantRuntimeKernelState =
        {
            initialized: false,

            learningEnabled: false,
        };

    /*
    |--------------------------------------------------------------------------
    | Initialize Kernel
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
                "Initializing assistant runtime kernel..."
            );

            /*
            |--------------------------------------------------------------------------
            | Initialize Assistant Runtime
            |--------------------------------------------------------------------------
            */

            AssistantRuntimeService.initialize();

            /*
            |--------------------------------------------------------------------------
            | Warm Initial Context
            |--------------------------------------------------------------------------
            */

            AssistantOrchestratorService.generateResponse();

            /*
            |--------------------------------------------------------------------------
            | Seed Memory
            |--------------------------------------------------------------------------
            */

            AssistantMemoryService.capture();

            /*
            |--------------------------------------------------------------------------
            | Start Learning Loop
            |--------------------------------------------------------------------------
            */

            AssistantLearningLoopService.start();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state = {
                initialized: true,

                learningEnabled: true,

                startedAt:
                    Date.now(),
            };

            logInfo(
                "Assistant runtime kernel initialized"
            );
        } catch (error) {
            logError(
                "Assistant runtime kernel initialization failed",
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
            | Stop Learning Loop
            |--------------------------------------------------------------------------
            */

            AssistantLearningLoopService.stop();

            /*
            |--------------------------------------------------------------------------
            | Shutdown Runtime
            |--------------------------------------------------------------------------
            */

            AssistantRuntimeService.shutdown();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state.learningEnabled =
                false;

            logInfo(
                "Assistant runtime kernel shutdown complete"
            );
        } catch (error) {
            logError(
                "Assistant runtime kernel shutdown failed",
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
        AssistantRuntimeKernelState {
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
                .learningEnabled
        );
    }
}