// src/core/storage/storage-sync.service.ts

import {
    RuntimeEventStore,
} from "../runtime/runtime-event.store";

import {
    RuntimeStateService,
} from "../runtime/runtime-state.service";

import {
    NotificationHistoryService,
} from "../notifications/notification-history.service";

import {
    AIMemoryService,
} from "../ai/ai-memory.service";

import {
    AIEvolutionService,
} from "../ai/ai-evolution.service";

import {
    AssistantMemoryService,
} from "../assistant/assistant-memory.service";

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
| Storage Sync Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - sync in-memory runtime → SQLite
| - restore persisted state → memory
| - maintain runtime durability
| - support crash recovery
|
| IMPORTANT:
| This becomes the bridge between:
|
| Runtime Memory
|       ↕
| SQLite Persistence
|
*/

export class StorageSyncService {
    /*
    |--------------------------------------------------------------------------
    | Persist Runtime
    |--------------------------------------------------------------------------
    */

    static async persist():
        Promise<void> {
        try {
            logInfo(
                "Persisting runtime state..."
            );

            /*
            |--------------------------------------------------------------------------
            | Persist Events
            |--------------------------------------------------------------------------
            */

            const events =
                RuntimeEventStore.getAll();

            for (const event of events) {
                await RuntimeEventRepository.create(
                    event
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Persist Runtime States
            |--------------------------------------------------------------------------
            */

            const runtimeStates =
                RuntimeStateService.getAll();

            for (const state of runtimeStates) {
                await RuntimeStateRepository.save(
                    state
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Persist Notifications
            |--------------------------------------------------------------------------
            */

            const notifications =
                NotificationHistoryService.getAll();

            for (const notification of notifications) {
                await NotificationHistoryRepository.create(
                    notification
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Persist AI Memory
            |--------------------------------------------------------------------------
            */

            const aiMemory =
                AIMemoryService.getAll();

            for (const memory of aiMemory) {
                await AIMemoryRepository.create(
                    memory
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Persist Assistant Memory
            |--------------------------------------------------------------------------
            */

            const assistantMemory =
                AssistantMemoryService.getAll();

            for (const memory of assistantMemory) {
                await AssistantMemoryRepository.create(
                    memory
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Persist AI Evolution
            |--------------------------------------------------------------------------
            */

            const evolutionHistory =
                AIEvolutionService.getHistory();

            for (const evolution of evolutionHistory) {
                await AIEvolutionRepository.create(
                    evolution
                );
            }

            logInfo(
                "Runtime persistence completed",
                {
                    events:
                        events.length,

                    runtimeStates:
                        runtimeStates.length,

                    notifications:
                        notifications.length,

                    aiMemory:
                        aiMemory.length,

                    assistantMemory:
                        assistantMemory.length,

                    evolutionHistory:
                        evolutionHistory.length,
                }
            );
        } catch (error) {
            logError(
                "Runtime persistence failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Runtime
    |--------------------------------------------------------------------------
    */

    static async restore():
        Promise<void> {
        try {
            logInfo(
                "Restoring persisted runtime..."
            );

            /*
            |--------------------------------------------------------------------------
            | Restore Events
            |--------------------------------------------------------------------------
            */

            const events =
                await RuntimeEventRepository.findAll();

            for (const event of events) {
                RuntimeEventStore.getAll().push(
                    event
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Restore Runtime States
            |--------------------------------------------------------------------------
            */

            const runtimeStates =
                await RuntimeStateRepository.findAll();

            for (const state of runtimeStates) {
                RuntimeStateService.getAll().push(
                    state
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Restore Notifications
            |--------------------------------------------------------------------------
            */

            const notifications =
                await NotificationHistoryRepository.findAll();

            for (const notification of notifications) {
                NotificationHistoryService
                    .getAll()
                    .push(notification);
            }

            /*
            |--------------------------------------------------------------------------
            | Restore AI Memory
            |--------------------------------------------------------------------------
            */

            const aiMemory =
                await AIMemoryRepository.findAll();

            for (const memory of aiMemory) {
                AIMemoryService.getAll().push(
                    memory
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Restore Assistant Memory
            |--------------------------------------------------------------------------
            */

            const assistantMemory =
                await AssistantMemoryRepository.findAll();

            for (const memory of assistantMemory) {
                AssistantMemoryService
                    .getAll()
                    .push(memory);
            }

            /*
            |--------------------------------------------------------------------------
            | Restore Evolution History
            |--------------------------------------------------------------------------
            */

            const evolutionHistory =
                await AIEvolutionRepository.findAll();

            for (const evolution of evolutionHistory) {
                AIEvolutionService
                    .getHistory()
                    .push(evolution);
            }

            logInfo(
                "Runtime restoration completed",
                {
                    events:
                        events.length,

                    runtimeStates:
                        runtimeStates.length,

                    notifications:
                        notifications.length,

                    aiMemory:
                        aiMemory.length,

                    assistantMemory:
                        assistantMemory.length,

                    evolutionHistory:
                        evolutionHistory.length,
                }
            );
        } catch (error) {
            logError(
                "Runtime restoration failed",
                error
            );

            throw error;
        }
    }
}