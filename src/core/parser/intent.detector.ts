// src/core/parser/intent.detector.ts

import * as chrono from "chrono-node";

import nlp from "compromise";

import {
    Intent,
    IntentType,
} from "./intent.types";

/*
|--------------------------------------------------------------------------
| Intent Detector
|--------------------------------------------------------------------------
|
| First NLP pipeline stage.
|
| Responsibilities:
| - detect user intent
| - extract basic entities
| - estimate confidence
|
| Pipeline:
|
| Raw Text
|    ↓
| Intent Detection
|    ↓
| Entity Extraction
|    ↓
| Structured Intent
|
*/

export class IntentDetector {
    /*
    |--------------------------------------------------------------------------
    | Detect Intent
    |--------------------------------------------------------------------------
    */

    static detect(
        input: string
    ): Intent {
        const normalized =
            input.trim().toLowerCase();

        /*
        |--------------------------------------------------------------------------
        | Unknown Check (general queries that aren't reminders)
        |--------------------------------------------------------------------------
        */
        const isRemind = normalized.includes("remind") ||
                         normalized.includes("reminder") ||
                         normalized.includes("alert") ||
                         normalized.includes("notify") ||
                         normalized.includes("take") ||
                         normalized.includes("do");

        if (!isRemind && (
            normalized.includes("weather") ||
            normalized.includes("joke") ||
            normalized.includes("what is") ||
            normalized.includes("tell me")
        )) {
            return {
                intent: "unknown",
                confidence: 0.2,
                originalText: input,
            };
        }

        /*
        |--------------------------------------------------------------------------
        | Medicine Reminder
        |--------------------------------------------------------------------------
        */
        if (
            normalized.includes("insulin") ||
            normalized.includes("vitamin") ||
            normalized.includes("pill") ||
            normalized.includes("tablet") ||
            normalized.includes("aspirin")
        ) {
            return this.detectMedicineReminder(input);
        }

        /*
        |--------------------------------------------------------------------------
        | Habit Reminder
        |--------------------------------------------------------------------------
        */
        if (
            normalized.includes("every day") ||
            normalized.includes("every night") ||
            normalized.includes("every morning") ||
            normalized.includes("every evening") ||
            normalized.includes("every week") ||
            normalized.includes("daily") ||
            normalized.includes("weekly") ||
            normalized.includes("nightly")
        ) {
            return this.detectHabitReminder(input);
        }

        /*
        |--------------------------------------------------------------------------
        | Location Reminder
        |--------------------------------------------------------------------------
        */

        if (
            normalized.includes(
                "when i am in"
            ) ||
            normalized.includes(
                "when i enter"
            )
        ) {
            return this.detectLocationReminder(
                input
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Interval Reminder
        |--------------------------------------------------------------------------
        */

        if (
            normalized.includes(
                "every"
            )
        ) {
            return this.detectIntervalReminder(
                input
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Follow-Up Reminder
        |--------------------------------------------------------------------------
        */

        if (
            normalized.includes(
                "remind me again"
            ) ||
            normalized.includes(
                "if i don't respond"
            )
        ) {
            return this.detectFollowupReminder(
                input
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Time Reminder
        |--------------------------------------------------------------------------
        */

        const parsedDate =
            chrono.parseDate(input);

        if (parsedDate) {
            return this.detectTimeReminder(
                input,
                parsedDate
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Unknown Intent
        |--------------------------------------------------------------------------
        */

        return {
            intent: "unknown",

            confidence: 0.2,

            originalText: input,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Detect Time Reminder
    |--------------------------------------------------------------------------
    */

    static detectTimeReminder(
        input: string,
        parsedDate: Date
    ): Intent {
        const message =
            this.extractReminderMessage(
                input
            );

        return {
            intent: "time_reminder",

            confidence: 0.9,

            originalText: input,

            time:
                parsedDate.toISOString(),

            message,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Detect Interval Reminder
    |--------------------------------------------------------------------------
    */

    static detectIntervalReminder(
        input: string
    ): Intent {
        const everyMinutes =
            this.extractIntervalMinutes(
                input
            );

        const message =
            this.extractReminderMessage(
                input
            );

        return {
            intent:
                "interval_reminder",

            confidence: 0.85,

            originalText: input,

            everyMinutes,

            message,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Detect Location Reminder
    |--------------------------------------------------------------------------
    */

    static detectLocationReminder(
        input: string
    ): Intent {
        const message =
            this.extractReminderMessage(
                input
            );

        const locationName =
            this.extractLocationName(
                input
            );

        const everyMinutes =
            this.extractIntervalMinutes(
                input
            );

        return {
            intent:
                "location_reminder",

            confidence: 0.85,

            originalText: input,

            locationName,

            message,

            everyMinutes,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Detect Follow-Up Reminder
    |--------------------------------------------------------------------------
    */

    static detectFollowupReminder(
        input: string
    ): Intent {
        return {
            intent:
                "followup_reminder",

            confidence: 0.8,

            originalText: input,

            message:
                this.extractReminderMessage(
                    input
                ),

            retryAfterMinutes:
                this.extractRetryMinutes(
                    input
                ),
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Detect Medicine Reminder
    |--------------------------------------------------------------------------
    */

    static detectMedicineReminder(
        input: string
    ): Intent {
        const normalized = input.toLowerCase();
        let medicineName = "medicine";
        const medMatch = input.match(/(vitamin\s+[a-zA-Z0-9]+|insulin|aspirin|medicine|pill|tablet)/i);
        if (medMatch) {
            medicineName = medMatch[0];
        }

        const parsedDate = chrono.parseDate(input) || new Date();

        return {
            intent: "medicine_reminder",
            confidence: 0.9,
            originalText: input,
            medicineName,
            time: parsedDate.toISOString(),
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Detect Habit Reminder
    |--------------------------------------------------------------------------
    */

    static detectHabitReminder(
        input: string
    ): Intent {
        const normalized = input.toLowerCase();
        let frequency = "daily";
        if (normalized.includes("night")) {
            frequency = "nightly";
        } else if (normalized.includes("week")) {
            frequency = "weekly";
        }

        const message = this.extractReminderMessage(input);

        return {
            intent: "habit_reminder",
            confidence: 0.9,
            originalText: input,
            frequency,
            message,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Extract Reminder Message
    |--------------------------------------------------------------------------
    */

    static extractReminderMessage(
        input: string
    ): string {
        const doc = nlp(input);

        const text =
            doc.text();

        /*
        |--------------------------------------------------------------------------
        | Simple Heuristic
        |--------------------------------------------------------------------------
        */

        const match =
            text.match(
                /to (.+)/i
            );

        if (match?.[1]) {
            return match[1].trim();
        }

        return text;
    }

    /*
    |--------------------------------------------------------------------------
    | Extract Interval Minutes
    |--------------------------------------------------------------------------
    */

    static extractIntervalMinutes(
        input: string
    ): number {
        const normalized = input.toLowerCase()
            .replace(/\bone\b/g, "1")
            .replace(/\btwo\b/g, "2")
            .replace(/\bthree\b/g, "3")
            .replace(/\bfour\b/g, "4")
            .replace(/\bfive\b/g, "5")
            .replace(/\bten\b/g, "10");

        // 1. Matches patterns like: "every 30 seconds", "every 2 minutes", "every 3 hours"
        const numberMatch = normalized.match(
            /every\s+(\d+)\s*(second|seconds|sec|secs|minute|minutes|min|mins|hour|hours)/i
        );

        if (numberMatch) {
            const value = Number(numberMatch[1]);
            const unit = numberMatch[2];

            if (unit.startsWith("sec")) {
                return value / 60; // convert seconds to minutes
            }
            if (unit.startsWith("hour")) {
                return value * 60; // convert hours to minutes
            }
            return value;
        }

        // 2. Matches patterns like: "every second", "every minute", "every hour" (where number 1 is implicit)
        const implicitMatch = normalized.match(
            /every\s+(second|sec|minute|min|hour)/i
        );

        if (implicitMatch) {
            const unit = implicitMatch[1];
            if (unit.startsWith("sec")) {
                return 1 / 60;
            }
            if (unit.startsWith("hour")) {
                return 60;
            }
            return 1;
        }

        return 60; // fallback
    }

    /*
    |--------------------------------------------------------------------------
    | Extract Retry Minutes
    |--------------------------------------------------------------------------
    */

    static extractRetryMinutes(
        input: string
    ): number {
        const normalized = input.toLowerCase();

        const match = normalized.match(
            /after\s+(\d+)\s*(second|seconds|sec|secs|minute|minutes|min|mins|hour|hours)/i
        );

        if (match) {
            const value = Number(match[1]);
            const unit = match[2];

            if (unit.startsWith("sec")) {
                return value / 60;
            }
            if (unit.startsWith("hour")) {
                return value * 60;
            }
            return value;
        }

        const implicitMatch = normalized.match(
            /after\s+(second|sec|minute|min|hour)/i
        );

        if (implicitMatch) {
            const unit = implicitMatch[1];
            if (unit.startsWith("sec")) {
                return 1 / 60;
            }
            if (unit.startsWith("hour")) {
                return 60;
            }
            return 1;
        }

        return 15; // fallback
    }

    /*
    |--------------------------------------------------------------------------
    | Extract Location Name
    |--------------------------------------------------------------------------
    */

    static extractLocationName(
        input: string
    ): string {
        const match =
            input.match(
                /(?:at|in|enter|reach|leave|leaving|arrive at)\s+(?:the\s+)?([a-zA-Z0-9]+)/i
            );

        if (!match?.[1]) {
            return "unknown";
        }

        return match[1];
    }

    /*
    |--------------------------------------------------------------------------
    | Get Intent Label
    |--------------------------------------------------------------------------
    */

    static getIntentLabel(
        type: IntentType
    ): string {
        switch (type) {
            case "time_reminder":
                return "Time Reminder";

            case "interval_reminder":
                return "Interval Reminder";

            case "location_reminder":
                return "Location Reminder";

            case "conditional_reminder":
                return "Conditional Reminder";

            case "followup_reminder":
                return "Follow-Up Reminder";

            case "habit_reminder":
                return "Habit Reminder";

            case "medicine_reminder":
                return "Medicine Reminder";

            default:
                return "Unknown";
        }
    }
}