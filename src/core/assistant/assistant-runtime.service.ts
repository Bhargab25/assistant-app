// src/core/assistant/assistant-runtime.service.ts

import {
    AssistantOrchestratorService,
} from "./assistant-orchestrator.service";

import {
    AIRuntimeKernelService,
} from "../ai/ai-runtime-kernel.service";

import {
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Assistant Runtime State
|--------------------------------------------------------------------------
*/

type AssistantRuntimeState =
    {
        initialized: boolean;

        startedAt?: number;

        lastResponseAt?: number;
    };

/*
|--------------------------------------------------------------------------
| Assistant Runtime Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - bootstrap assistant systems
| - initialize conversational intelligence
| - connect assistant ↔ AI runtime
| - manage assistant lifecycle
|
| IMPORTANT:
| This becomes the runtime entrypoint for:
| - AI assistant
| - conversational workflows
| - future voice assistant
| - contextual automation chat
|
*/

export class AssistantRuntimeService {
    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    private static state:
        AssistantRuntimeState =
        {
            initialized: false,
        };

    /*
    |--------------------------------------------------------------------------
    | Initialize Assistant Runtime
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
                "Initializing assistant runtime..."
            );

            /*
            |--------------------------------------------------------------------------
            | Ensure AI Kernel Ready
            |--------------------------------------------------------------------------
            */

            AIRuntimeKernelService.initialize();

            /*
            |--------------------------------------------------------------------------
            | Warm Assistant Context
            |--------------------------------------------------------------------------
            */

            AssistantOrchestratorService.generateResponse();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state = {
                initialized: true,

                startedAt:
                    Date.now(),

                lastResponseAt:
                    Date.now(),
            };

            logInfo(
                "Assistant runtime initialized"
            );
        } catch (error) {
            logError(
                "Assistant runtime initialization failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Assistant Response
    |--------------------------------------------------------------------------
    */

    static ask():
        ReturnType<
            typeof AssistantOrchestratorService.generateResponse
        > {
        try {
            const response =
                AssistantOrchestratorService.generateResponse();

            this.state.lastResponseAt =
                Date.now();

            logInfo(
                "Assistant response served"
            );

            return response;
        } catch (error) {
            logError(
                "Assistant request failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Shutdown Assistant
    |--------------------------------------------------------------------------
    */

    static shutdown():
        void {
        try {
            this.state
                .initialized =
                false;

            logInfo(
                "Assistant runtime shutdown complete"
            );
        } catch (error) {
            logError(
                "Assistant runtime shutdown failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    static getState():
        AssistantRuntimeState {
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
                .initialized
        );
    }
}