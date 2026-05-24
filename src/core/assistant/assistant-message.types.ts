// src/core/assistant/assistant-message.types.ts

import {
    Reminder,
} from "../reminders/reminder.types";

/*
|--------------------------------------------------------------------------
| Assistant Role
|--------------------------------------------------------------------------
*/

export type AssistantRole =
    | "system"
    | "assistant"
    | "user";

/*
|--------------------------------------------------------------------------
| Assistant Card Type
|--------------------------------------------------------------------------
*/

export type AssistantCardType =
    | "reminder"
    | "workflow"
    | "recommendation"
    | "insight"
    | "alert";

/*
|--------------------------------------------------------------------------
| Assistant Card
|--------------------------------------------------------------------------
|
| Conversational rich UI cards
| rendered inside assistant chat.
|
*/

export type AssistantCard =
    {
        type:
        AssistantCardType;

        title?: string;

        description?: string;

        data?: unknown;
    };

/*
|--------------------------------------------------------------------------
| Assistant Action
|--------------------------------------------------------------------------
*/

export type AssistantAction =
    {
        id: string;

        label: string;

        type:
        | "edit"
        | "delete"
        | "pause"
        | "resume"
        | "open"
        | "confirm"
        | "dismiss";

        payload?: Record<
            string,
            unknown
        >;
    };

/*
|--------------------------------------------------------------------------
| Assistant Message
|--------------------------------------------------------------------------
*/

export type AssistantMessage =
    {
        id: string;

        role:
        AssistantRole;

        content: string;

        createdAt: number;

        /*
        |--------------------------------------------------------------------------
        | Metadata
        |--------------------------------------------------------------------------
        */

        metadata?: Record<
            string,
            unknown
        >;

        /*
        |--------------------------------------------------------------------------
        | Conversational Reminder Card
        |--------------------------------------------------------------------------
        */

        reminder?:
        Reminder;

        /*
        |--------------------------------------------------------------------------
        | Generic Assistant Card
        |--------------------------------------------------------------------------
        */

        card?:
        AssistantCard;

        /*
        |--------------------------------------------------------------------------
        | Interactive Actions
        |--------------------------------------------------------------------------
        */

        actions?:
        AssistantAction[];
    };

/*
|--------------------------------------------------------------------------
| Assistant Conversation
|--------------------------------------------------------------------------
*/

export type AssistantConversation =
    {
        id: string;

        title?: string;

        messages:
        AssistantMessage[];

        createdAt: number;

        updatedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Assistant Command
|--------------------------------------------------------------------------
*/

export type AssistantCommand =
    {
        command: string;

        confidence: number;

        parameters?: Record<
            string,
            unknown
        >;
    };

/*
|--------------------------------------------------------------------------
| Assistant Runtime Context
|--------------------------------------------------------------------------
|
| Used for conversational memory
| and pending intent handling.
|
*/

export type AssistantRuntimeContext =
    {
        activeConversationId?: string;

        pendingIntentId?: string;

        activeReminderId?: string;

        lastMessageAt?: number;

        typing?: boolean;
    };