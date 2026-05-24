// src/core/parser/parser.service.ts

import { IntentDetector } from "./intent.detector";

import { WorkflowBuilder } from "./workflow.builder";

import { Intent } from "./intent.types";

import { Workflow } from "../workflows/types";

import { WorkflowService } from "../workflows/workflow.service";

/*
|--------------------------------------------------------------------------
| Parser Result Type
|--------------------------------------------------------------------------
*/

export type ParserResult = {
    success: boolean;

    intent?: Intent;

    workflow?: Workflow;

    error?: string;
};

/*
|--------------------------------------------------------------------------
| Parser Service
|--------------------------------------------------------------------------
|
| High-level NLP orchestration layer.
|
| Pipeline:
|
| Raw User Input
|        ↓
| Intent Detection
|        ↓
| Workflow Building
|        ↓
| Workflow Validation
|        ↓
| Persist Workflow
|
*/

export class ParserService {
    /*
    |--------------------------------------------------------------------------
    | Parse User Input
    |--------------------------------------------------------------------------
    */

    static async parse(
        input: string
    ): Promise<ParserResult> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Validate Input
            |--------------------------------------------------------------------------
            */

            if (!input.trim()) {
                return {
                    success: false,

                    error:
                        "Input cannot be empty",
                };
            }

            /*
            |--------------------------------------------------------------------------
            | Detect Intent
            |--------------------------------------------------------------------------
            */

            const intent =
                IntentDetector.detect(
                    input
                );

            /*
            |--------------------------------------------------------------------------
            | Unknown Intent
            |--------------------------------------------------------------------------
            */

            if (
                intent.intent ===
                "unknown"
            ) {
                return {
                    success: false,

                    intent,

                    error:
                        "Could not understand request",
                };
            }

            /*
            |--------------------------------------------------------------------------
            | Unsupported Intent
            |--------------------------------------------------------------------------
            */

            if (
                !WorkflowBuilder.supports(
                    intent
                )
            ) {
                return {
                    success: false,

                    intent,

                    error:
                        "Intent not supported yet",
                };
            }

            /*
            |--------------------------------------------------------------------------
            | Build Workflow
            |--------------------------------------------------------------------------
            */

            const workflow =
                WorkflowBuilder.build(
                    intent
                );

            return {
                success: true,

                intent,

                workflow,
            };
        } catch (error) {
            console.error(
                "Parser failed:",
                error
            );

            return {
                success: false,

                error: String(error),
            };
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Parse & Save Workflow
    |--------------------------------------------------------------------------
    */

    static async parseAndSave(
        input: string
    ): Promise<ParserResult> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Parse Input
            |--------------------------------------------------------------------------
            */

            const result =
                await this.parse(input);

            if (
                !result.success ||
                !result.workflow
            ) {
                return result;
            }

            /*
            |--------------------------------------------------------------------------
            | Persist Workflow
            |--------------------------------------------------------------------------
            */

            const savedWorkflow =
                await WorkflowService.create(
                    result.workflow
                );

            return {
                success: true,

                intent:
                    result.intent,

                workflow:
                    savedWorkflow,
            };
        } catch (error) {
            console.error(
                "Parse and save failed:",
                error
            );

            return {
                success: false,

                error: String(error),
            };
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Explain Intent
    |--------------------------------------------------------------------------
    */

    static explainIntent(
        intent: Intent
    ): string {
        switch (intent.intent) {
            case "time_reminder":
                return `Time reminder at ${intent.time}`;

            case "interval_reminder":
                return `Reminder every ${intent.everyMinutes} minutes`;

            case "location_reminder":
                return `Location reminder for ${intent.locationName}`;

            case "followup_reminder":
                return `Follow-up reminder after ${intent.retryAfterMinutes} minutes`;

            default:
                return "Unknown intent";
        }
    }
}