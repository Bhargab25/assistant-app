// src/core/assistant/assistant-orchestrator.service.ts

import {
    AssistantContextService,
} from "./assistant-context.service";

import {
    AIOrchestratorService,
} from "../ai/ai-orchestrator.service";

import {
    RecommendationEngineService,
} from "../ai/recommendation-engine.service";

import {
    InsightEngineService,
} from "../ai/insight-engine.service";

import {
    PendingIntentService,
    PendingIntentMissingField,
} from "./pending-intent.service";

import {
    ReminderService,
} from "../reminders/reminder.service";

import {
    logInfo,
    logError,
} from "../../shared/utils";

import { LocationService } from "../geofence/location.service";
import { GeofenceService } from "../geofence/geofence.service";

export interface AssistantOrchestrationResult {
    reply: string;
    completed: boolean;
    originalMessage?: string;
}

/*
|--------------------------------------------------------------------------
| Assistant Response
|--------------------------------------------------------------------------
*/

export type AssistantResponse =
    {
        summary: string;

        recommendations: string[];

        insights: string[];

        context: string;

        generatedAt: number;
    };

/*
|--------------------------------------------------------------------------
| Parsed Assistant Intent
|--------------------------------------------------------------------------
*/

export interface ParsedAssistantIntent {
    intent: string;

    task?: string;

    location?: string;

    interval?: string;

    time?: string;

    raw: string;

    locationRegistered?: boolean;
}

/*
|--------------------------------------------------------------------------
| Assistant Orchestrator Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - orchestrate assistant intelligence
| - manage conversational memory
| - resolve missing intent fields
| - create reminders from conversation
| - aggregate insights/recommendations
| - support AI assistant workflows
|
*/

export class AssistantOrchestratorService {
    /*
    |--------------------------------------------------------------------------
    | Generate Assistant Response
    |--------------------------------------------------------------------------
    */

    static generateResponse():
        AssistantResponse {
        try {
            /*
            |--------------------------------------------------------------------------
            | Assistant Context
            |--------------------------------------------------------------------------
            */

            const context =
                AssistantContextService.generate();

            /*
            |--------------------------------------------------------------------------
            | AI Snapshot
            |--------------------------------------------------------------------------
            */

            const snapshot =
                AIOrchestratorService.generateSnapshot();

            /*
            |--------------------------------------------------------------------------
            | Recommendations
            |--------------------------------------------------------------------------
            */

            const recommendations =
                RecommendationEngineService.generate();

            /*
            |--------------------------------------------------------------------------
            | Insights
            |--------------------------------------------------------------------------
            */

            const insights =
                InsightEngineService.generateInsights();

            /*
            |--------------------------------------------------------------------------
            | Build Summary
            |--------------------------------------------------------------------------
            */

            const summary =
                this.buildSummary(
                    context
                );

            /*
            |--------------------------------------------------------------------------
            | Build Response
            |--------------------------------------------------------------------------
            */

            const response:
                AssistantResponse =
            {
                summary,

                recommendations:
                    recommendations.map(
                        (
                            recommendation
                        ) =>
                            recommendation.title
                    ),

                insights:
                    insights.map(
                        (
                            insight
                        ) =>
                            insight.title
                    ),

                context:
                    snapshot.context
                        .productivityLevel,

                generatedAt:
                    Date.now(),
            };

            logInfo(
                "Assistant response generated",
                {
                    recommendations:
                        response
                            .recommendations
                            .length,

                    insights:
                        response.insights
                            .length,
                }
            );

            return response;
        } catch (error) {
            logError(
                "Assistant orchestrator failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Process User Message
    |--------------------------------------------------------------------------
    |
    | MAIN conversational runtime.
    |
    */

    static async processMessage(
        userMessage: string
    ):
        Promise<AssistantOrchestrationResult> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Resolve Pending Conversation
            |--------------------------------------------------------------------------
            */

            const pendingResponse =
                await this.resolvePendingConversation(
                    userMessage
                );

            if (
                pendingResponse
            ) {
                return pendingResponse;
            }

            /*
            |--------------------------------------------------------------------------
            | Parse Intent
            |--------------------------------------------------------------------------
            */

            const parsedIntent =
                await this.parseIntent(
                    userMessage
                );

            /*
            |--------------------------------------------------------------------------
            | Unsupported Intent
            |--------------------------------------------------------------------------
            */

            if (
                parsedIntent.intent !==
                "create_reminder"
            ) {
                return {
                    reply: "I currently support intelligent reminder creation.",
                    completed: false
                };
            }

            /*
            |--------------------------------------------------------------------------
            | Missing Fields
            |--------------------------------------------------------------------------
            */

            const missingFields:
                PendingIntentMissingField[] =
                [];

            /*
            |--------------------------------------------------------------------------
            | Frequency Missing
            |--------------------------------------------------------------------------
            */

            if (
                !parsedIntent.interval &&
                !parsedIntent.time
            ) {
                missingFields.push(
                    {
                        field:
                            "interval",

                        question:
                            "How often should I remind you?",

                        resolved:
                            false,
                    }
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Location Resolution
            |--------------------------------------------------------------------------
            */

            if (
                parsedIntent.location &&
                !parsedIntent.locationRegistered
            ) {
                missingFields.push(
                    {
                        field:
                            "location_confirmation",

                        question:
                            `I don't know where your ${parsedIntent.location} is. Would you like to use your current location, choose it on a map, or cancel?`,

                        resolved:
                            false,
                    }
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Create Pending Intent
            |--------------------------------------------------------------------------
            */

            if (
                missingFields.length > 0
            ) {
                await PendingIntentService.create(
                    {
                        type:
                            "create_reminder",

                        originalMessage:
                            userMessage,

                        extractedData:
                            parsedIntent,

                        missingFields,
                    }
                );

                return {
                    reply: missingFields[0].question,
                    completed: false
                };
            }

            /*
            |--------------------------------------------------------------------------
            | Create Reminder
            |--------------------------------------------------------------------------
            */

            await this.createReminderFromIntent(
                parsedIntent
            );

            return {
                reply: "Perfect. Your intelligent reminder has been created.",
                completed: true,
                originalMessage: userMessage
            };
        } catch (error) {
            logError(
                "Assistant message processing failed",
                error
            );

            return {
                reply: "Something went wrong while processing your request.",
                completed: false
            };
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Resolve Pending Conversation
    |--------------------------------------------------------------------------
    */

    private static async resolvePendingConversation(
        userMessage: string
    ):
        Promise<AssistantOrchestrationResult | null> {
        const hasPending =
            await PendingIntentService.hasPending();

        if (!hasPending) {
            return null;
        }

        const pending = await PendingIntentService.get();
        if (!pending) {
            return null;
        }

        const currentField =
            pending.missingFields[
            pending.currentStep
            ];

        if (currentField && currentField.field === "location_confirmation") {
            const answer = userMessage.toLowerCase();
            
            if (answer.includes("[system:map_saved]")) {
                // Location was already saved by the Map UI, so we just fall through to resolveStep
            } else {
                const isCancel = /\b(cancel|no|stop|abort|dont|don't)\b/i.test(answer) || answer.includes("never mind") || answer.includes("nevermind");
                const isMap = /\b(map|choose|pick|select|open|screen|show|drawer|pin|drop|register)\b/i.test(answer);
                const isCurrent = /\b(current|here|yes|yep|sure|ok|yeah|y|location|me|myself|gps)\b/i.test(answer) || answer.includes("current location") || answer.includes("my location");
                
                if (isMap) {
                    return {
                        reply: `[ACTION:OPEN_MAP:${pending.extractedData.location || "office"}] Let's pick your location on the map.`,
                        completed: false
                    };
                }
                
                if (!isCurrent && (isCancel || !isMap)) {
                    await PendingIntentService.clear();
                    return {
                        reply: "Location registration cancelled. I won't create the reminder.",
                        completed: false
                    };
                }
                
                // Auto-register location coordinates
                const locName = (pending.extractedData.location as string) || "office";
                let latitude = 37.422;
                let longitude = -122.084;
                try {
                    const perm = await GeofenceService.requestPermissions();
                    if (perm) {
                        const pos = await GeofenceService.getCurrentLocation();
                        latitude = pos.coords.latitude;
                        longitude = pos.coords.longitude;
                    }
                } catch (e) {
                    console.error("Failed to get current location during auto-registration:", e);
                }
                
                await LocationService.create({
                    name: locName,
                    latitude,
                    longitude,
                });
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Resolve Step
        |--------------------------------------------------------------------------
        */

        const result =
            await PendingIntentService.resolveStep(
                userMessage
            );

        /*
        |--------------------------------------------------------------------------
        | Continue Conversation
        |--------------------------------------------------------------------------
        */

        if (
            !result.completed
        ) {
            return {
                reply: result.nextQuestion ?? "Please continue.",
                completed: false
            };
        }

        /*
        |--------------------------------------------------------------------------
        | Missing Intent
        |--------------------------------------------------------------------------
        */

        if (
            !result.intent
        ) {
            return {
                reply: "I couldn't complete that reminder.",
                completed: false
            };
        }

        /*
        |--------------------------------------------------------------------------
        | Finalized Intent
        |--------------------------------------------------------------------------
        */

        const data =
            result.intent
                .extractedData;

        /*
        |--------------------------------------------------------------------------
        | Create Reminder
        |--------------------------------------------------------------------------
        */

        await this.createReminderFromIntent(
            data as ParsedAssistantIntent
        );

        /*
        |--------------------------------------------------------------------------
        | Clear Pending Intent
        |--------------------------------------------------------------------------
        */

        await PendingIntentService.clear();

        return {
            reply: `Perfect. ${data.location || "office"} has been registered. Your intelligent reminder has been created.`,
            completed: true,
            originalMessage: pending.originalMessage
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Create Reminder From Intent
    |--------------------------------------------------------------------------
    */

    private static async createReminderFromIntent(
        intent:
            ParsedAssistantIntent
    ):
        Promise<void> {
        await ReminderService.create(
            {
                title:
                    intent.task ??
                    "Reminder",

                description:
                    intent.raw,

                priority:
                    "medium",

                date:
                    new Date()
                        .toISOString()
                        .split("T")[0],

                time:
                    intent.time ??
                    this.formatCurrentTime(),

                repeat:
                    intent.interval
                        ? "daily"
                        : "none",

                place:
                    intent.location
                        ? {
                            id:
                                intent.location,

                            name:
                                intent.location,

                            type:
                                "custom",
                        }
                        : undefined,
            }
        );
    }

    private static formatCurrentTime(): string {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const strMinutes = minutes < 10 ? "0" + minutes : minutes;
        const strHours = hours < 10 ? "0" + hours : hours;
        return `${strHours}:${strMinutes} ${ampm}`;
    }

    /*
    |--------------------------------------------------------------------------
    | Parse Intent
    |--------------------------------------------------------------------------
    |
    | TEMP NLP
    | Later connect your NLP engine.
    |
    */

    private static async parseIntent(
        message: string
    ):
        Promise<ParsedAssistantIntent> {
        const lower =
            message.toLowerCase();

        /*
        |--------------------------------------------------------------------------
        | Intent
        |--------------------------------------------------------------------------
        */

        const intent =
            lower.includes(
                "remind"
            )
                ? "create_reminder"
                : "unknown";

        /*
        |--------------------------------------------------------------------------
        | Location
        |--------------------------------------------------------------------------
        */

        let location: string | undefined;

        const locMatch = lower.match(/(?:at|in|enter|reach|leave|leaving|arrive at)\s+(?:the\s+)?([a-z0-9]+)/i);
        
        if (locMatch && locMatch[1]) {
            location = locMatch[1];
        }

        // Fallbacks for common locations if not caught by preposition
        if (!location && lower.includes("home")) {
            location = "home";
        }

        if (!location && lower.includes("office")) {
            location = "office";
        }


        /*
        |--------------------------------------------------------------------------
        | Interval
        |--------------------------------------------------------------------------
        */

        let interval:
            string | undefined;

        const normalizedMsg = lower
            .replace(/\bone\b/g, "1")
            .replace(/\btwo\b/g, "2")
            .replace(/\bthree\b/g, "3")
            .replace(/\bfour\b/g, "4")
            .replace(/\bfive\b/g, "5")
            .replace(/\bten\b/g, "10");

        const intervalMatch = normalizedMsg.match(
            /every\s+(\d+)\s*(second|seconds|sec|secs|minute|minutes|min|mins|hour|hours)/i
        );

        if (intervalMatch) {
            interval = `${intervalMatch[1]} ${intervalMatch[2]}`;
        } else {
            const implicitMatch = normalizedMsg.match(
                /every\s+(second|sec|minute|min|hour)/i
            );
            if (implicitMatch) {
                interval = `1 ${implicitMatch[1]}`;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Task
        |--------------------------------------------------------------------------
        */

        let task =
            "Reminder";

        if (
            lower.includes(
                "drink water"
            )
        ) {
            task =
                "Drink Water";
        }

        if (
            lower.includes(
                "medicine"
            )
        ) {
            task =
                "Take Medicine";
        }

        let locationRegistered = false;
        if (location) {
            try {
                const locations = await LocationService.findAll();
                locationRegistered = locations.some(
                    (loc) => loc.name.toLowerCase() === location!.toLowerCase()
                );
            } catch (error) {
                console.error("Failed checking registered locations:", error);
            }
        }

        return {
            intent,

            task,

            location,

            interval,

            raw:
                message,

            locationRegistered,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Build Summary
    |--------------------------------------------------------------------------
    */

    private static buildSummary(
        context: ReturnType<
            typeof AssistantContextService.generate
        >
    ): string {
        /*
        |--------------------------------------------------------------------------
        | Healthy + High Productivity
        |--------------------------------------------------------------------------
        */

        if (
            context.runtime
                .healthy &&
            context.ai
                .productivityLevel ===
            "high"
        ) {
            return "Your automation system is healthy and performing very efficiently.";
        }

        /*
        |--------------------------------------------------------------------------
        | Runtime Issues
        |--------------------------------------------------------------------------
        */

        if (
            !context.runtime
                .healthy
        ) {
            return "Your automation runtime has some health warnings that may affect workflow reliability.";
        }

        /*
        |--------------------------------------------------------------------------
        | Medium Productivity
        |--------------------------------------------------------------------------
        */

        if (
            context.ai
                .productivityLevel ===
            "medium"
        ) {
            return "Your automation activity is stable, with opportunities for optimization.";
        }

        /*
        |--------------------------------------------------------------------------
        | Low Productivity
        |--------------------------------------------------------------------------
        */

        return "Your engagement levels are currently low. AI recommendations may help improve productivity.";
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Chat Prompt
    |--------------------------------------------------------------------------
    */

    static generateChatPrompt():
        string {
        const response =
            this.generateResponse();

        return `
Assistant Summary:
${response.summary}

Recommendations:
${response.recommendations.join(
            ", "
        )}

Insights:
${response.insights.join(
            ", "
        )}

Context:
${response.context}
    `.trim();
    }
}