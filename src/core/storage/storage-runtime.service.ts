// src/core/storage/storage-runtime.service.ts

import {
    DatabaseService,
} from "./database.service";

import {
    RuntimeEventRepository,
} from "./repositories/runtime-event.repository";

import {
    RuntimeStateRepository,
} from "./repositories/runtime-state.repository";

import {
    NotificationHistoryRepository,
} from "./repositories/notification-history.repository";

import {
    AIMemoryRepository,
} from "./repositories/ai-memory.repository";

import {
    AssistantMemoryRepository,
} from "./repositories/assistant-memory.repository";

import {
    AIEvolutionRepository,
} from "./repositories/ai-evolution.repository";

import {
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Storage Runtime State
|--------------------------------------------------------------------------
*/

type StorageRuntimeState =
    {
        initialized: boolean;

        startedAt?: number;
    };

/*
|--------------------------------------------------------------------------
| Storage Runtime Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - bootstrap persistence layer
| - initialize SQLite runtime
| - validate repositories
| - prepare storage infrastructure
|
| IMPORTANT:
| This becomes the ROOT
| persistence runtime kernel.
|
*/

export class StorageRuntimeService {
    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    private static state:
        StorageRuntimeState =
        {
            initialized: false,
        };

    /*
    |--------------------------------------------------------------------------
    | Initialize Storage Runtime
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
                "Initializing storage runtime..."
            );

            /*
            |--------------------------------------------------------------------------
            | Initialize Database
            |--------------------------------------------------------------------------
            */

            await DatabaseService.initialize();

            /*
            |--------------------------------------------------------------------------
            | Validate Repositories
            |--------------------------------------------------------------------------
            */

            await this.validateRepositories();

            /*
            |--------------------------------------------------------------------------
            | Update State
            |--------------------------------------------------------------------------
            */

            this.state = {
                initialized: true,

                startedAt:
                    Date.now(),
            };

            logInfo(
                "Storage runtime initialized"
            );
        } catch (error) {
            logError(
                "Storage runtime initialization failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Repositories
    |--------------------------------------------------------------------------
    */

    private static async validateRepositories():
        Promise<void> {
        /*
        |--------------------------------------------------------------------------
        | Runtime Events
        |--------------------------------------------------------------------------
        */

        await RuntimeEventRepository.findAll();

        /*
        |--------------------------------------------------------------------------
        | Runtime States
        |--------------------------------------------------------------------------
        */

        await RuntimeStateRepository.findAll();

        /*
        |--------------------------------------------------------------------------
        | Notifications
        |--------------------------------------------------------------------------
        */

        await NotificationHistoryRepository.findAll();

        /*
        |--------------------------------------------------------------------------
        | AI Memory
        |--------------------------------------------------------------------------
        */

        await AIMemoryRepository.findAll();

        /*
        |--------------------------------------------------------------------------
        | Assistant Memory
        |--------------------------------------------------------------------------
        */

        await AssistantMemoryRepository.findAll();

        /*
        |--------------------------------------------------------------------------
        | AI Evolution
        |--------------------------------------------------------------------------
        */

        await AIEvolutionRepository.findAll();

        logInfo(
            "Storage repositories validated"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    static getState():
        StorageRuntimeState {
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