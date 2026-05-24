// src/core/parser/intent.types.ts

/*
|--------------------------------------------------------------------------
| Intent Types
|--------------------------------------------------------------------------
|
| Represents high-level user intentions extracted
| from natural language input.
|
| Example:
| "Remind me every hour to drink water"
| → interval_reminder
|
*/

export type IntentType =
    | "time_reminder"
    | "interval_reminder"
    | "location_reminder"
    | "conditional_reminder"
    | "followup_reminder"
    | "habit_reminder"
    | "medicine_reminder"
    | "unknown";

/*
|--------------------------------------------------------------------------
| Base Parsed Intent
|--------------------------------------------------------------------------
*/

export type ParsedIntent = {
    intent: IntentType;

    confidence: number;

    originalText: string;
};

/*
|--------------------------------------------------------------------------
| Time Reminder Intent
|--------------------------------------------------------------------------
*/

export type TimeReminderIntent =
    ParsedIntent & {
        intent: "time_reminder";

        time: string;

        message: string;
    };

/*
|--------------------------------------------------------------------------
| Interval Reminder Intent
|--------------------------------------------------------------------------
*/

export type IntervalReminderIntent =
    ParsedIntent & {
        intent: "interval_reminder";

        everyMinutes: number;

        message: string;
    };

/*
|--------------------------------------------------------------------------
| Location Reminder Intent
|--------------------------------------------------------------------------
*/

export type LocationReminderIntent =
    ParsedIntent & {
        intent: "location_reminder";

        locationName: string;

        message: string;

        everyMinutes?: number;
    };

/*
|--------------------------------------------------------------------------
| Conditional Reminder Intent
|--------------------------------------------------------------------------
*/

export type ConditionalReminderIntent =
    ParsedIntent & {
        intent: "conditional_reminder";

        condition: string;

        message: string;
    };

/*
|--------------------------------------------------------------------------
| Follow-Up Reminder Intent
|--------------------------------------------------------------------------
*/

export type FollowUpReminderIntent =
    ParsedIntent & {
        intent: "followup_reminder";

        message: string;

        retryAfterMinutes: number;
    };

/*
|--------------------------------------------------------------------------
| Habit Reminder Intent
|--------------------------------------------------------------------------
*/

export type HabitReminderIntent =
    ParsedIntent & {
        intent: "habit_reminder";

        frequency: string;

        message: string;
    };

/*
|--------------------------------------------------------------------------
| Medicine Reminder Intent
|--------------------------------------------------------------------------
*/

export type MedicineReminderIntent =
    ParsedIntent & {
        intent: "medicine_reminder";

        medicineName: string;

        dosage?: string;

        time: string;
    };

/*
|--------------------------------------------------------------------------
| Unknown Intent
|--------------------------------------------------------------------------
*/

export type UnknownIntent =
    ParsedIntent & {
        intent: "unknown";
    };

/*
|--------------------------------------------------------------------------
| Union Intent Type
|--------------------------------------------------------------------------
*/

export type Intent =
    | TimeReminderIntent
    | IntervalReminderIntent
    | LocationReminderIntent
    | ConditionalReminderIntent
    | FollowUpReminderIntent
    | HabitReminderIntent
    | MedicineReminderIntent
    | UnknownIntent;