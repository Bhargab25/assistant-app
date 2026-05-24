// src/core/assistant/assistant-memory.service.ts

import {
    generateId,
    logInfo,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Assistant Memory Entry
|--------------------------------------------------------------------------
*/

export type AssistantMemoryEntry =
    {
        id: string;

        summary: string;

        recommendations: string[];

        insights: string[];

        createdAt: number;
    };

/*
|--------------------------------------------------------------------------
| Assistant Memory Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - persist assistant summaries
| - retain conversational intelligence
| - build assistant memory timeline
| - support future AI conversations
|
| IMPORTANT:
| This becomes the foundation for:
| - conversational history
| - assistant continuity
| - contextual memory
| - long-term AI interactions
|
*/

export class AssistantMemoryService {
    /*
    |--------------------------------------------------------------------------
    | Memory Store
    |--------------------------------------------------------------------------
    |
    | TEMPORARY:
    | Replace later with SQLite/vector memory.
    |
    */

    private static memory:
        AssistantMemoryEntry[] =
        [];

    /*
    |--------------------------------------------------------------------------
    | Capture Snapshot
    |--------------------------------------------------------------------------
    */

    static capture():
        AssistantMemoryEntry {
        const { AssistantOrchestratorService } = require("./assistant-orchestrator.service");

        /*
        |--------------------------------------------------------------------------
        | Generate Assistant Response
        |--------------------------------------------------------------------------
        */

        const response =
            AssistantOrchestratorService.generateResponse();

        /*
        |--------------------------------------------------------------------------
        | Create Entry
        |--------------------------------------------------------------------------
        */

        const entry:
            AssistantMemoryEntry =
        {
            id: generateId(),

            summary:
                response.summary,

            recommendations:
                response.recommendations,

            insights:
                response.insights,

            createdAt:
                Date.now(),
        };

        /*
        |--------------------------------------------------------------------------
        | Persist
        |--------------------------------------------------------------------------
        */

        this.memory.push(
            entry
        );

        logInfo(
            "Assistant memory captured",
            {
                memoryId:
                    entry.id,
            }
        );

        return entry;
    }

    /*
    |--------------------------------------------------------------------------
    | Get All Memory
    |--------------------------------------------------------------------------
    */

    static getAll():
        AssistantMemoryEntry[] {
        return this.memory;
    }

    /*
    |--------------------------------------------------------------------------
    | Latest Entries
    |--------------------------------------------------------------------------
    */

    static latest(
        limit = 10
    ): AssistantMemoryEntry[] {
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
    | Search Memory
    |--------------------------------------------------------------------------
    */

    static search(
        keyword: string
    ): AssistantMemoryEntry[] {
        const query =
            keyword.toLowerCase();

        return this.memory.filter(
            (entry) =>
                entry.summary
                    .toLowerCase()
                    .includes(query) ||
                entry.recommendations.some(
                    (
                        recommendation
                    ) =>
                        recommendation
                            .toLowerCase()
                            .includes(query)
                ) ||
                entry.insights.some(
                    (insight) =>
                        insight
                            .toLowerCase()
                            .includes(query)
                )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Clear Memory
    |--------------------------------------------------------------------------
    */

    static clear():
        void {
        this.memory = [];
    }
}