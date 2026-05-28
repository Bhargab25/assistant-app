// src/core/ai/ai-memory.service.ts

import {
    RuntimeEventStore,
} from "../runtime/runtime-event.store";

import {
    ReminderSessionService,
} from "../reminders/reminder-session.service";

import {
    PatternDetectionService,
} from "./pattern-detection.service";

import {
    generateId,
    logInfo,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| AI Memory Record
|--------------------------------------------------------------------------
*/

export type AIMemoryRecord =
    {
        id: string;

        category:
        | "behavior"
        | "workflow"
        | "engagement"
        | "timing"
        | "optimization";

        summary: string;

        confidence: number;

        createdAt: number;

        metadata?: Record<
            string,
            unknown
        >;
    };

/*
|--------------------------------------------------------------------------
| AI Memory Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - persist learned behavior
| - retain historical intelligence
| - build long-term AI memory
| - provide contextual AI signals
|
| IMPORTANT:
| This becomes the long-term
| intelligence memory layer.
|
*/

export class AIMemoryService {
    /*
    |--------------------------------------------------------------------------
    | Memory Store
    |--------------------------------------------------------------------------
    |
    | TEMPORARY:
    | Replace later with SQLite/vector DB.
    |
    */

    private static memory:
        AIMemoryRecord[] = [];

    /*
    |--------------------------------------------------------------------------
    | Build Memory
    |--------------------------------------------------------------------------
    */

    static buildMemory():
        AIMemoryRecord[] {
        const records:
            AIMemoryRecord[] = [];

        /*
        |--------------------------------------------------------------------------
        | Data Sources
        |--------------------------------------------------------------------------
        */

        const patterns =
            PatternDetectionService.detect();

        const sessions =
            ReminderSessionService.getAll();

        const events =
            RuntimeEventStore.getAll();

        /*
        |--------------------------------------------------------------------------
        | Frequent Snoozing Memory
        |--------------------------------------------------------------------------
        */

        const snoozedCount =
            sessions.filter(
                (session) =>
                    session.status ===
                    "snoozed"
            ).length;

        if (
            snoozedCount >= 5
        ) {
            records.push({
                id:
                    "memory-heavy-snoozing",

                category:
                    "behavior",

                summary:
                    "User frequently snoozes reminders before completion.",

                confidence: 82,

                createdAt:
                    Date.now(),

                metadata: {
                    snoozedCount,
                },
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Strong Completion Memory
        |--------------------------------------------------------------------------
        */

        const completedCount =
            sessions.filter(
                (session) =>
                    session.status ===
                    "completed"
            ).length;

        if (
            completedCount >= 10
        ) {
            records.push({
                id:
                    "memory-strong-completion",

                category:
                    "engagement",

                summary:
                    "User demonstrates strong reminder completion discipline.",

                confidence: 91,

                createdAt:
                    Date.now(),

                metadata: {
                    completedCount,
                },
            });
        }

        /*
        |--------------------------------------------------------------------------
        | High Activity Memory
        |--------------------------------------------------------------------------
        */

        if (
            events.length >= 300
        ) {
            records.push({
                id:
                    "memory-high-activity",

                category:
                    "workflow",

                summary:
                    "User actively engages with automation workflows.",

                confidence: 87,

                createdAt:
                    Date.now(),

                metadata: {
                    eventCount:
                        events.length,
                },
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Morning Productivity Memory
        |--------------------------------------------------------------------------
        */

        const morningPattern =
            patterns.find(
                (pattern) =>
                    pattern.id ===
                    "morning-activity-pattern"
            );

        if (
            morningPattern
        ) {
            records.push({
                id:
                    "memory-morning-productivity",

                category:
                    "timing",

                summary:
                    "User tends to be most productive during morning hours.",

                confidence:
                    morningPattern.confidence,

                createdAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Night Activity Memory
        |--------------------------------------------------------------------------
        */

        const nightPattern =
            patterns.find(
                (pattern) =>
                    pattern.id ===
                    "night-activity-pattern"
            );

        if (
            nightPattern
        ) {
            records.push({
                id:
                    "memory-night-activity",

                category:
                    "timing",

                summary:
                    "User frequently interacts with reminders late at night.",

                confidence:
                    nightPattern.confidence,

                createdAt:
                    Date.now(),
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Persist Memory
        |--------------------------------------------------------------------------
        */

        this.memory.push(
            ...records
        );

        logInfo(
            "AI memory generated",
            {
                count:
                    records.length,
            }
        );

        return records;
    }

    /*
    |--------------------------------------------------------------------------
    | Remember Custom Record
    |--------------------------------------------------------------------------
    */

    static remember(payload: {
        category: AIMemoryRecord["category"] | string;
        summary: string;
        confidence: number;
        metadata?: Record<string, unknown>;
    }): AIMemoryRecord {
        const record: AIMemoryRecord = {
            id: generateId(),
            category: (["behavior", "workflow", "engagement", "timing", "optimization"].includes(payload.category)
                ? payload.category
                : "workflow") as AIMemoryRecord["category"],
            summary: payload.summary,
            confidence: payload.confidence,
            createdAt: Date.now(),
            metadata: payload.metadata,
        };

        this.memory.push(record);

        logInfo("AI memory remembered", {
            recordId: record.id,
            category: record.category,
        });

        return record;
    }

    /*
    |--------------------------------------------------------------------------
    | Get Memory
    |--------------------------------------------------------------------------
    */

    static getAll():
        AIMemoryRecord[] {
        return this.memory;
    }

    /*
    |--------------------------------------------------------------------------
    | Find By Category
    |--------------------------------------------------------------------------
    */

    static findByCategory(
        category:
            AIMemoryRecord["category"]
    ): AIMemoryRecord[] {
        return this.memory.filter(
            (record) =>
                record.category ===
                category
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Latest Memory
    |--------------------------------------------------------------------------
    */

    static latest(
        limit = 20
    ): AIMemoryRecord[] {
        return [...this.memory]
            .sort(
                (a, b) =>
                    b.createdAt -
                    a.createdAt
            )
            .slice(0, limit);
    }

    /*
    |--------------------------------------------------------------------------
    | Clear Memory
    |--------------------------------------------------------------------------
    */

    static clear(): void {
        this.memory = [];
    }
}