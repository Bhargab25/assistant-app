// src/core/parser/parser.examples.ts

/*
|--------------------------------------------------------------------------
| Parser Example Dataset
|--------------------------------------------------------------------------
|
| Used for:
| - parser testing
| - NLP validation
| - regression testing
| - future AI training
| - demo workflows
|
*/

export const PARSER_EXAMPLES = [
    /*
    |--------------------------------------------------------------------------
    | Time Reminders
    |--------------------------------------------------------------------------
    */

    {
        input:
            "Remind me at 9 PM to take medicine",

        expectedIntent:
            "time_reminder",
    },

    {
        input:
            "Tomorrow morning remind me to call mom",

        expectedIntent:
            "time_reminder",
    },

    /*
    |--------------------------------------------------------------------------
    | Interval Reminders
    |--------------------------------------------------------------------------
    */

    {
        input:
            "Every 1 hour remind me to drink water",

        expectedIntent:
            "interval_reminder",
    },

    {
        input:
            "Every 30 minutes remind me to stretch",

        expectedIntent:
            "interval_reminder",
    },

    /*
    |--------------------------------------------------------------------------
    | Location Reminders
    |--------------------------------------------------------------------------
    */

    {
        input:
            "When I am in office remind me to drink water",

        expectedIntent:
            "location_reminder",
    },

    {
        input:
            "When I enter gym remind me to start workout",

        expectedIntent:
            "location_reminder",
    },

    /*
    |--------------------------------------------------------------------------
    | Follow-Up Reminders
    |--------------------------------------------------------------------------
    */

    {
        input:
            "If I don't respond remind me again after 15 minutes",

        expectedIntent:
            "followup_reminder",
    },

    {
        input:
            "Remind me again after 30 minutes if ignored",

        expectedIntent:
            "followup_reminder",
    },

    /*
    |--------------------------------------------------------------------------
    | Habit Reminders
    |--------------------------------------------------------------------------
    */

    {
        input:
            "Every day remind me to meditate",

        expectedIntent:
            "habit_reminder",
    },

    {
        input:
            "Every night remind me to journal",

        expectedIntent:
            "habit_reminder",
    },

    /*
    |--------------------------------------------------------------------------
    | Medicine Reminders
    |--------------------------------------------------------------------------
    */

    {
        input:
            "Remind me to take vitamin D at 8 AM",

        expectedIntent:
            "medicine_reminder",
    },

    {
        input:
            "Take insulin every day at 7 PM",

        expectedIntent:
            "medicine_reminder",
    },

    {
        input:
            "set display brightness to 80% at 9 PM",

        expectedIntent:
            "brightness_adjustment",
    },

    {
        input:
            "bajar el brillo al 20%",

        expectedIntent:
            "brightness_adjustment",
    },

    {
        input:
            "mettre la luminosité à 50% au gymnase",

        expectedIntent:
            "brightness_adjustment",
    },

    {
        input:
            "helligkeit auf 10% am abend",

        expectedIntent:
            "brightness_adjustment",
    },

    {
        input:
            "poner en silencio a las 3 PM",

        expectedIntent:
            "silent_mode",
    },

    {
        input:
            "activar vibrar cuando llegue a casa",

        expectedIntent:
            "silent_mode",
    },

    {
        input:
            "silence the phone when I enter office",

        expectedIntent:
            "silent_mode",
    },

    {
        input:
            "stummmodus aktivieren",

        expectedIntent:
            "silent_mode",
    },

    {
        input:
            "when I enter gym, silent mode and 100% brightness",

        expectedIntent:
            "smart_routine",
    },

    {
        input:
            "rutina de mañana",

        expectedIntent:
            "smart_routine",
    },

    {
        input:
            "gym routine",

        expectedIntent:
            "smart_routine",
    },

    /*
    |--------------------------------------------------------------------------
    | Unknown Inputs
    |--------------------------------------------------------------------------
    */

    {
        input:
            "What is the weather today?",

        expectedIntent:
            "unknown",
    },

    {
        input:
            "Tell me a joke",

        expectedIntent:
            "unknown",
    },
] as const;

/*
|--------------------------------------------------------------------------
| Quick NLP Stress Cases
|--------------------------------------------------------------------------
*/

export const NLP_EDGE_CASES = [
    "Every hour remind me",

    "Remind me tomorrow",

    "At 5",

    "Office reminder",

    "Medicine",

    "",

    "    ",

    "every 999999 minutes",

    "When I enter office every hour remind water",

    "If ignored remind again after 2 hours",
];