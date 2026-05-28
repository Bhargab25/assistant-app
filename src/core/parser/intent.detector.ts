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
        | Intention Keywords Identification
        |--------------------------------------------------------------------------
        */
        const isBrightness = 
            normalized.includes("brightness") || normalized.includes("dim") || normalized.includes("brighten") ||
            normalized.includes("brillo") ||
            normalized.includes("luminosité") ||
            normalized.includes("helligkeit");

        const isSilent = 
            normalized.includes("silent") || normalized.includes("silence") || normalized.includes("vibrate") || normalized.includes("mute") ||
            normalized.includes("silencio") || normalized.includes("silenciar") || normalized.includes("vibrar") || normalized.includes("mutear") ||
            normalized.includes("silencieux") || normalized.includes("silenceur") || normalized.includes("vibreur") || normalized.includes("muet") ||
            normalized.includes("lautlos") || normalized.includes("vibrieren") || normalized.includes("stumm");

        const isRoutine = 
            normalized.includes("routine") || normalized.includes("rutina") || (isBrightness && isSilent);

        /*
        |--------------------------------------------------------------------------
        | Intent Classification Precedence
        |--------------------------------------------------------------------------
        */
        if (isRoutine) {
            return this.detectSmartRoutine(input);
        }

        if (isBrightness) {
            return this.detectBrightnessAdjustment(input);
        }

        if (isSilent) {
            return this.detectSilentMode(input);
        }

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
                         normalized.includes("do") ||
                         normalized.includes("recuerda") ||
                         normalized.includes("recordatorio") ||
                         normalized.includes("alerta") ||
                         normalized.includes("notificar") ||
                         normalized.includes("erinnere") ||
                         normalized.includes("erinnerung") ||
                         normalized.includes("rappelle") ||
                         normalized.includes("rappel");

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

            case "brightness_adjustment":
                return "Brightness Adjustment";

            case "silent_mode":
                return "Silent Mode";

            case "smart_routine":
                return "Smart Routine";

            default:
                return "Unknown";
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Detect Brightness Adjustment
    |--------------------------------------------------------------------------
    */

    static detectBrightnessAdjustment(input: string): Intent {
        const normalized = input.toLowerCase();
        let brightnessLevel = 0.5; // default medium

        const percentMatch = normalized.match(/(\d+)\s*%/);
        if (percentMatch) {
            brightnessLevel = Number(percentMatch[1]) / 100;
        } else {
            if (normalized.includes("dim") || normalized.includes("low") || normalized.includes("bajo") || normalized.includes("bas") || normalized.includes("niedrig")) {
                brightnessLevel = 0.15;
            } else if (normalized.includes("max") || normalized.includes("high") || normalized.includes("alto") || normalized.includes("haut") || normalized.includes("hoch")) {
                brightnessLevel = 1.0;
            } else if (normalized.includes("medium") || normalized.includes("medio") || normalized.includes("moyen") || normalized.includes("mittel")) {
                brightnessLevel = 0.5;
            }
        }

        const parsedDate = chrono.parseDate(input);
        const locationName = this.extractLocationName(input);
        const isImmediate = 
            normalized.includes("now") || 
            normalized.includes("immediately") ||
            normalized.includes("ahora") || 
            normalized.includes("inmediatamente") ||
            normalized.includes("maintenant") || 
            normalized.includes("tout de suite") ||
            normalized.includes("jetzt") || 
            normalized.includes("sofort");

        return {
            intent: "brightness_adjustment",
            confidence: 0.9,
            originalText: input,
            brightnessLevel,
            time: (parsedDate && !isImmediate) ? parsedDate.toISOString() : undefined,
            locationName: locationName !== "unknown" ? locationName : undefined,
            immediate: isImmediate || undefined,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Detect Silent Mode
    |--------------------------------------------------------------------------
    */

    static detectSilentMode(input: string): Intent {
        const normalized = input.toLowerCase();
        let silentEnabled = true;
        let vibrateEnabled = false;

        if (
            normalized.includes("off") || 
            normalized.includes("desactivar") || 
            normalized.includes("désactiver") || 
            normalized.includes("aus") ||
            normalized.includes("disable") ||
            normalized.includes("unmute")
        ) {
            silentEnabled = false;
        }

        if (
            normalized.includes("vibrate") || 
            normalized.includes("vibrar") || 
            normalized.includes("vibreur") || 
            normalized.includes("vibrieren")
        ) {
            vibrateEnabled = true;
        }

        const parsedDate = chrono.parseDate(input);
        const locationName = this.extractLocationName(input);
        const isImmediate = 
            normalized.includes("now") || 
            normalized.includes("immediately") ||
            normalized.includes("ahora") || 
            normalized.includes("inmediatamente") ||
            normalized.includes("maintenant") || 
            normalized.includes("tout de suite") ||
            normalized.includes("jetzt") || 
            normalized.includes("sofort");

        return {
            intent: "silent_mode",
            confidence: 0.9,
            originalText: input,
            silentEnabled,
            vibrateEnabled,
            time: (parsedDate && !isImmediate) ? parsedDate.toISOString() : undefined,
            locationName: locationName !== "unknown" ? locationName : undefined,
            immediate: isImmediate || undefined,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Detect Smart Routine
    |--------------------------------------------------------------------------
    */

    static detectSmartRoutine(input: string): Intent {
        const normalized = input.toLowerCase();
        let routineName = "custom_routine";

        if (normalized.includes("gym") || normalized.includes("gimnasio") || normalized.includes("sport")) {
            routineName = "gym_routine";
        } else if (normalized.includes("morning") || normalized.includes("mañana") || normalized.includes("matin") || normalized.includes("morgen")) {
            routineName = "morning_routine";
        } else if (normalized.includes("focus") || normalized.includes("work") || normalized.includes("trabajo") || normalized.includes("travail") || normalized.includes("arbeit")) {
            routineName = "focus_routine";
        }

        let brightnessLevel = normalized.includes("brightness") || normalized.includes("brillo") || normalized.includes("helligkeit") ? 0.8 : undefined;
        let silentEnabled = normalized.includes("silent") || normalized.includes("silencio") || normalized.includes("lautlos") ? true : undefined;
        let vibrateEnabled = normalized.includes("vibrate") || normalized.includes("vibrar") || normalized.includes("vibrieren") ? true : undefined;

        const parsedDate = chrono.parseDate(input);
        const locationName = this.extractLocationName(input);
        const isImmediate = 
            normalized.includes("now") || 
            normalized.includes("immediately") ||
            normalized.includes("ahora") || 
            normalized.includes("inmediatamente") ||
            normalized.includes("maintenant") || 
            normalized.includes("tout de suite") ||
            normalized.includes("jetzt") || 
            normalized.includes("sofort");

        return {
            intent: "smart_routine",
            confidence: 0.95,
            originalText: input,
            routineName,
            brightnessLevel,
            silentEnabled,
            vibrateEnabled,
            locationName: locationName !== "unknown" ? locationName : undefined,
            time: (parsedDate && !isImmediate) ? parsedDate.toISOString() : undefined,
            immediate: isImmediate || undefined,
        };
    }
}