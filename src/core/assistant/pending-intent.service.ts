// src/core/assistant/pending-intent.service.ts

import AsyncStorage
    from "@react-native-async-storage/async-storage";

import {
    generateId,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Pending Intent Types
|--------------------------------------------------------------------------
*/

export type PendingIntentType =
    | "create_reminder"
    | "location_resolution"
    | "time_resolution"
    | "interval_resolution"
    | "confirmation"
    | "brightness_adjustment"
    | "silent_mode"
    | "smart_routine";

/*
|--------------------------------------------------------------------------
| Pending Intent Field
|--------------------------------------------------------------------------
*/

export interface PendingIntentMissingField {
    field: string;

    question: string;

    resolved: boolean;
}

/*
|--------------------------------------------------------------------------
| Pending Intent
|--------------------------------------------------------------------------
*/

export interface PendingIntent {
    id: string;

    type:
    PendingIntentType;

    originalMessage: string;

    extractedData:
    Record<
        string,
        unknown
    >;

    missingFields:
    PendingIntentMissingField[];

    currentStep: number;

    createdAt: number;

    expiresAt: number;
}

/*
|--------------------------------------------------------------------------
| Storage Key
|--------------------------------------------------------------------------
*/

const STORAGE_KEY =
    "@assistant_pending_intent";

/*
|--------------------------------------------------------------------------
| Pending Intent Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - multi-turn assistant memory
| - incomplete intent recovery
| - follow-up question generation
| - temporary assistant context
| - conversational workflow completion
|
| EXAMPLE:
|
| User:
| "Remind me to drink water at office"
|
| Missing:
| - frequency
|
| Assistant:
| "How often should I remind you?"
|
*/

export class PendingIntentService {
    /*
    |--------------------------------------------------------------------------
    | Create Pending Intent
    |--------------------------------------------------------------------------
    */

    static async create(
        params: {
            type:
            PendingIntentType;

            originalMessage: string;

            extractedData:
            Record<
                string,
                unknown
            >;

            missingFields:
            PendingIntentMissingField[];
        }
    ):
        Promise<
            PendingIntent
        > {
        const pending:
            PendingIntent = {
            id: generateId(),

            type:
                params.type,

            originalMessage:
                params.originalMessage,

            extractedData:
                params.extractedData,

            missingFields:
                params.missingFields,

            currentStep: 0,

            createdAt:
                Date.now(),

            expiresAt:
                Date.now() +
                1000 *
                60 *
                30,
        };

        await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                pending
            )
        );

        return pending;
    }

    /*
    |--------------------------------------------------------------------------
    | Get Pending Intent
    |--------------------------------------------------------------------------
    */

    static async get():
        Promise<
            PendingIntent | null
        > {
        try {
            const raw =
                await AsyncStorage.getItem(
                    STORAGE_KEY
                );

            if (!raw) {
                return null;
            }

            const intent =
                JSON.parse(
                    raw
                ) as PendingIntent;

            /*
            |--------------------------------------------------------------------------
            | Expired
            |--------------------------------------------------------------------------
            */

            if (
                Date.now() >
                intent.expiresAt
            ) {
                await this.clear();

                return null;
            }

            return intent;
        } catch (
        error
        ) {
            console.error(
                "Pending intent load failed",
                error
            );

            return null;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Has Pending Intent
    |--------------------------------------------------------------------------
    */

    static async hasPending():
        Promise<boolean> {
        const pending =
            await this.get();

        return (
            pending !== null
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Resolve Current Step
    |--------------------------------------------------------------------------
    */

    static async resolveStep(
        answer: string
    ):
        Promise<{
            completed: boolean;

            nextQuestion?: string;

            intent?:
            PendingIntent;
        }> {
        const pending =
            await this.get();

        if (!pending) {
            return {
                completed:
                    true,
            };
        }

        /*
        |--------------------------------------------------------------------------
        | Current Missing Field
        |--------------------------------------------------------------------------
        */

        const currentField =
            pending.missingFields[
            pending.currentStep
            ];

        if (
            !currentField
        ) {
            await this.clear();

            return {
                completed:
                    true,
            };
        }

        /*
        |--------------------------------------------------------------------------
        | Save Resolution
        |--------------------------------------------------------------------------
        */

        pending.extractedData[
            currentField.field
        ] = answer;

        currentField.resolved =
            true;

        pending.currentStep += 1;

        /*
        |--------------------------------------------------------------------------
        | Finished
        |--------------------------------------------------------------------------
        */

        if (
            pending.currentStep >=
            pending.missingFields
                .length
        ) {
            await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    pending
                )
            );

            return {
                completed:
                    true,

                intent:
                    pending,
            };
        }

        /*
        |--------------------------------------------------------------------------
        | Continue Conversation
        |--------------------------------------------------------------------------
        */

        const nextField =
            pending.missingFields[
            pending.currentStep
            ];

        await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                pending
            )
        );

        return {
            completed:
                false,

            nextQuestion:
                nextField.question,

            intent:
                pending,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Clear Pending Intent
    |--------------------------------------------------------------------------
    */

    static async clear():
        Promise<void> {
        await AsyncStorage.removeItem(
            STORAGE_KEY
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get Current Question
    |--------------------------------------------------------------------------
    */

    static async getCurrentQuestion():
        Promise<
            string | null
        > {
        const pending =
            await this.get();

        if (!pending) {
            return null;
        }

        const field =
            pending.missingFields[
            pending.currentStep
            ];

        if (!field) {
            return null;
        }

        return field.question;
    }
}