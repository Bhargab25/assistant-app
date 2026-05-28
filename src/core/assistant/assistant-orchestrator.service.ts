import AsyncStorage from "@react-native-async-storage/async-storage";

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
    IntentDetector,
} from "../parser/intent.detector";

import {
    WorkflowBuilder,
} from "../parser/workflow.builder";

import {
    WorkflowService,
} from "../workflows/workflow.service";

import {
    WorkflowDefinitionService,
} from "../workflows/workflow-definition.service";

import {
    WorkflowRuntimeService,
} from "../workflows/workflow-runtime.service";

import {
    logInfo,
    logError,
} from "../../shared/utils";

import { LocationService } from "../geofence/location.service";
import { GeofenceService } from "../geofence/geofence.service";

const STORAGE_KEY = "@assistant_pending_intent";

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
            | Spelling Auto-Correction & Help check
            |--------------------------------------------------------------------------
            */
            const correctedMessage = this.correctSpelling(userMessage);
            const hasCorrection = correctedMessage.trim().toLowerCase() !== userMessage.trim().toLowerCase();

            const lowerMsg = correctedMessage.toLowerCase().trim();
            const isHelp = 
                lowerMsg.includes("what work") || 
                lowerMsg.includes("what can i do") || 
                lowerMsg.includes("what can you do") || 
                lowerMsg.includes("help") || 
                lowerMsg.includes("capabilities") || 
                lowerMsg.includes("ayuda") || 
                lowerMsg.includes("hilfe") || 
                lowerMsg === "work" ||
                lowerMsg === "hello" ||
                lowerMsg === "hi";

            if (isHelp) {
                return {
                    reply: `Hello! 🤖 I am **A.E.G.I.S. Core**, your privacy-first, offline AI Assistant. Here is what I can help you automate on your device:\n\n` +
                           `⏰ **Smart Reminders**\n` +
                           `  - *"Remind me to call Mom tomorrow morning"* or *"Remind me to drink water every 30 minutes"*.\n\n` +
                           `📍 **Location Reminders**\n` +
                           `  - *"Remind me to check email when I enter the office"*.\n\n` +
                           `🔆 **Display Brightness**\n` +
                           `  - *"Set display brightness to 80% at 9 PM"* or *"Dim display"*.\n\n` +
                           `🤫 **Silent & Vibrate Modes**\n` +
                           `  - *"Silence my phone when I enter office"* or *"Activar vibrar cuando llegue a casa"*.\n\n` +
                           `🏃‍♂️ **Automation Routines**\n` +
                           `  - Combine actions, e.g., *"When I enter gym, silent mode and 100% brightness"*.\n\n` +
                           `How can I guide you today?`,
                    completed: false
                };
            }

            /*
            |--------------------------------------------------------------------------
            | Parse Intent
            |--------------------------------------------------------------------------
            */
            const detected = IntentDetector.detect(correctedMessage);
            const replyPrefix = hasCorrection && detected.intent !== "unknown" ? `*(Interpreted: "${correctedMessage}")*\n\n` : "";

            if (detected.intent === "unknown") {
                return {
                    reply: replyPrefix + `I'm not sure I understood that request. 🤖 I can help you set reminders, adjust display brightness, toggle silent mode, or schedule smart routines.\n\n` +
                           `Try saying:\n` +
                           `- *"Remind me to take my medicine at 8 PM"*\n` +
                           `- *"Dim the display to 20% at 10 PM"*\n` +
                           `- *"Silence my phone when I enter office"*\n\n` +
                           `What would you like to do?`,
                    completed: false
                };
            }

            /*
            |--------------------------------------------------------------------------
            | Process Brightness Intent
            |--------------------------------------------------------------------------
            */
            if (detected.intent === "brightness_adjustment") {
                const hasTime = !!detected.time;
                const hasLocation = !!detected.locationName;
                const isImmediate = (detected as any).immediate;

                if (!hasTime && !hasLocation && !isImmediate) {
                    await PendingIntentService.create({
                        type: "brightness_adjustment",
                        originalMessage: userMessage,
                        extractedData: {
                            brightnessLevel: detected.brightnessLevel,
                        },
                        missingFields: [
                            {
                                field: "trigger_type",
                                question: "When should I apply this display brightness? (You can say: 'Now', 'At a specific time' e.g. 10 PM, or 'When entering a location' e.g. gym)",
                                resolved: false
                            }
                        ]
                    });

                    return {
                        reply: replyPrefix + "When should I apply this display brightness? (You can say: 'Now', 'At a specific time' e.g. 10 PM, or 'When entering a location' e.g. gym)",
                        completed: false
                    };
                }

                const workflow = WorkflowBuilder.build(detected);

                if (isImmediate) {
                    await this.executeWorkflowInMemory(workflow);
                    return {
                        reply: replyPrefix + `Perfect! I've set your display brightness to ${Math.round(detected.brightnessLevel * 100)}% immediately.`,
                        completed: true,
                        originalMessage: userMessage
                    };
                }

                await WorkflowService.create(workflow);

                const schedStr = detected.time ? `at ${detected.time}` : `when entering ${detected.locationName}`;
                return {
                    reply: replyPrefix + `Perfect! I've scheduled your display brightness adjustment to ${Math.round(detected.brightnessLevel * 100)}% ${schedStr}.`,
                    completed: true,
                    originalMessage: userMessage
                };
            }

            /*
            |--------------------------------------------------------------------------
            | Process Silent Mode Intent
            |--------------------------------------------------------------------------
            */
            if (detected.intent === "silent_mode") {
                const hasTime = !!detected.time;
                const hasLocation = !!detected.locationName;
                const isImmediate = (detected as any).immediate;

                if (!hasTime && !hasLocation && !isImmediate) {
                    await PendingIntentService.create({
                        type: "silent_mode",
                        originalMessage: userMessage,
                        extractedData: {
                            silentEnabled: detected.silentEnabled,
                            vibrateEnabled: detected.vibrateEnabled,
                        },
                        missingFields: [
                            {
                                field: "trigger_type",
                                question: "When should I activate silent mode? (You can say: 'Now', 'At a specific time' e.g. 8 PM, or 'When entering a location' e.g. office)",
                                resolved: false
                            }
                        ]
                    });

                    return {
                        reply: replyPrefix + "When should I activate silent mode? (You can say: 'Now', 'At a specific time' e.g. 8 PM, or 'When entering a location' e.g. office)",
                        completed: false
                    };
                }

                const workflow = WorkflowBuilder.build(detected);

                if (isImmediate) {
                    await this.executeWorkflowInMemory(workflow);
                    return {
                        reply: replyPrefix + `Perfect! I've activated silent mode immediately.`,
                        completed: true,
                        originalMessage: userMessage
                    };
                }

                await WorkflowService.create(workflow);

                const schedStr = detected.time ? `at ${detected.time}` : `when entering ${detected.locationName}`;
                return {
                    reply: replyPrefix + `Perfect! I've scheduled silent mode ${schedStr}.`,
                    completed: true,
                    originalMessage: userMessage
                };
            }

            /*
            |--------------------------------------------------------------------------
            | Process Smart Routine Intent
            |--------------------------------------------------------------------------
            */
            if (detected.intent === "smart_routine") {
                const hasTime = !!detected.time;
                const hasLocation = !!detected.locationName;

                if (!hasTime && !hasLocation) {
                    await PendingIntentService.create({
                        type: "smart_routine",
                        originalMessage: userMessage,
                        extractedData: {
                            routineName: detected.routineName,
                            brightnessLevel: detected.brightnessLevel ?? 0.8,
                            silentEnabled: detected.silentEnabled ?? true,
                            vibrateEnabled: detected.vibrateEnabled ?? true,
                        },
                        missingFields: [
                            {
                                field: "trigger_type",
                                question: `When should I trigger this ${detected.routineName.replace("_", " ")}? (You can say: 'At a specific time' or 'When entering a location' e.g. gym)`,
                                resolved: false
                            }
                        ]
                    });

                    return {
                        reply: replyPrefix + `When should I trigger this ${detected.routineName.replace("_", " ")}? (You can say: 'At a specific time' or 'When entering a location' e.g. gym)`,
                        completed: false
                    };
                }

                await PendingIntentService.create({
                    type: "smart_routine",
                    originalMessage: userMessage,
                    extractedData: {
                        routineName: detected.routineName,
                        brightnessLevel: detected.brightnessLevel ?? 0.8,
                        silentEnabled: detected.silentEnabled ?? true,
                        vibrateEnabled: detected.vibrateEnabled ?? true,
                        time: detected.time,
                        locationName: detected.locationName
                    },
                    missingFields: [
                        {
                            field: "routine_confirmation",
                            question: `I've configured the ${detected.routineName.replace("_", " ")} to trigger when entering ${detected.locationName || "the location"}. Would you like me to save this routine? (Yes/No)`,
                            resolved: false
                        }
                    ]
                });

                return {
                    reply: replyPrefix + `I've configured the ${detected.routineName.replace("_", " ")} to trigger when entering ${detected.locationName || "the location"}. Would you like me to save this routine? (Yes/No)`,
                    completed: false
                };
            }

            /*
            |--------------------------------------------------------------------------
            | Process Reminders Intent
            |--------------------------------------------------------------------------
            */
            const parsedIntent: ParsedAssistantIntent = {
                intent: "create_reminder",
                task: (detected as any).message ?? (detected as any).medicineName ?? "Reminder",
                location: (detected as any).locationName,
                interval: (detected as any).everyMinutes ? `${(detected as any).everyMinutes} minutes` : ((detected as any).frequency),
                time: (detected as any).time,
                raw: userMessage,
            };

            let locationRegistered = false;
            if (parsedIntent.location) {
                try {
                    const locations = await LocationService.findAll();
                    locationRegistered = locations.some(
                        (loc) => loc.name.toLowerCase() === parsedIntent.location!.toLowerCase()
                    );
                } catch (error) {
                    console.error("Checking registered locations failed:", error);
                }
            }
            parsedIntent.locationRegistered = locationRegistered;

            const missingFields: PendingIntentMissingField[] = [];

            if (!parsedIntent.interval && !parsedIntent.time) {
                missingFields.push({
                    field: "interval",
                    question: "How often should I remind you?",
                    resolved: false,
                });
            }

            if (parsedIntent.location && !parsedIntent.locationRegistered) {
                missingFields.push({
                    field: "location_confirmation",
                    question: `I don't know where your ${parsedIntent.location} is. Would you like to use your current location, choose it on a map, or cancel?`,
                    resolved: false,
                });
            }

            if (missingFields.length > 0) {
                await PendingIntentService.create({
                    type: "create_reminder",
                    originalMessage: userMessage,
                    extractedData: parsedIntent as any,
                    missingFields,
                });

                return {
                    reply: replyPrefix + missingFields[0].question,
                    completed: false
                };
            }

            await this.createReminderFromIntent(parsedIntent);

            return {
                reply: replyPrefix + "Perfect. Your intelligent reminder has been created.",
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

        if (!currentField) {
            return null;
        }

        const answer = userMessage.toLowerCase().trim();

        // 1. Check custom dialog types first
        if (pending.type === "brightness_adjustment") {
            if (currentField.field === "trigger_type") {
                let resolved = false;

                if (answer.includes("now") || answer.includes("jetzt") || answer.includes("ahora") || answer.includes("maintenant")) {
                    pending.extractedData.triggerType = "now";
                    resolved = true;
                } else {
                    const parsedTime = this.parseTimeString(answer);
                    if (parsedTime) {
                        pending.extractedData.triggerType = "time";
                        pending.extractedData.time = parsedTime;
                        resolved = true;
                    } else {
                        let location: string | undefined;
                        const locMatch = answer.match(/(?:at|in|enter|reach|leave|leaving|arrive at)\s+(?:the\s+)?([a-z0-9]+)/i);
                        if (locMatch && locMatch[1]) {
                            location = locMatch[1];
                        } else if (answer.includes("gym") || answer.includes("gimnasio")) {
                            location = "gym";
                        } else if (answer.includes("office") || answer.includes("work") || answer.includes("trabajo")) {
                            location = "office";
                        } else if (answer.includes("home") || answer.includes("casa")) {
                            location = "home";
                        }

                        if (location) {
                            pending.extractedData.triggerType = "location";
                            pending.extractedData.locationName = location;
                            resolved = true;
                        }
                    }
                }

                if (!resolved) {
                    return {
                        reply: "I couldn't recognize that trigger. Please specify if you want it: 'Now', at a specific time (e.g., 'at 9 PM'), or when entering a location (e.g., 'at gym').",
                        completed: false
                    };
                }

                currentField.resolved = true;
                pending.currentStep += 1;
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
            } else if (currentField.field === "brightness_level") {
                let parsedLevel: number | undefined;

                const percentMatch = answer.match(/(\d+)\s*%/);
                if (percentMatch) {
                    parsedLevel = Number(percentMatch[1]) / 100;
                } else if (answer.includes("dim") || answer.includes("low") || answer.includes("bajo") || answer.includes("bas") || answer.includes("niedrig")) {
                    parsedLevel = 0.15;
                } else if (answer.includes("max") || answer.includes("high") || answer.includes("alto") || answer.includes("haut") || answer.includes("hoch")) {
                    parsedLevel = 1.0;
                } else if (answer.includes("medium") || answer.includes("medio") || answer.includes("moyen") || answer.includes("mittel")) {
                    parsedLevel = 0.5;
                }

                if (parsedLevel === undefined) {
                    return {
                        reply: "I didn't catch the brightness level. Please specify a percentage (e.g., 80%) or a level like 'low', 'medium', or 'high'.",
                        completed: false
                    };
                }

                pending.extractedData.brightnessLevel = parsedLevel;
                currentField.resolved = true;
                pending.currentStep += 1;
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
            }
        }

        else if (pending.type === "silent_mode") {
            if (currentField.field === "trigger_type") {
                let resolved = false;

                if (answer.includes("now") || answer.includes("jetzt") || answer.includes("ahora") || answer.includes("maintenant")) {
                    pending.extractedData.triggerType = "now";
                    resolved = true;
                } else {
                    const parsedTime = this.parseTimeString(answer);
                    if (parsedTime) {
                        pending.extractedData.triggerType = "time";
                        pending.extractedData.time = parsedTime;
                        resolved = true;
                    } else {
                        let location: string | undefined;
                        const locMatch = answer.match(/(?:at|in|enter|reach|leave|leaving|arrive at)\s+(?:the\s+)?([a-z0-9]+)/i);
                        if (locMatch && locMatch[1]) {
                            location = locMatch[1];
                        } else if (answer.includes("gym") || answer.includes("gimnasio")) {
                            location = "gym";
                        } else if (answer.includes("office") || answer.includes("work") || answer.includes("trabajo")) {
                            location = "office";
                        } else if (answer.includes("home") || answer.includes("casa")) {
                            location = "home";
                        }

                        if (location) {
                            pending.extractedData.triggerType = "location";
                            pending.extractedData.locationName = location;
                            resolved = true;
                        }
                    }
                }

                if (!resolved) {
                    return {
                        reply: "I couldn't recognize that trigger. Please specify if you want it: 'Now', at a specific time (e.g., 'at 8 PM'), or when entering a location (e.g., 'at office').",
                        completed: false
                    };
                }

                currentField.resolved = true;
                pending.currentStep += 1;
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
            }
        }

        else if (pending.type === "smart_routine") {
            if (currentField.field === "trigger_type") {
                let resolved = false;

                const parsedTime = this.parseTimeString(answer);
                if (parsedTime) {
                    pending.extractedData.triggerType = "time";
                    pending.extractedData.time = parsedTime;
                    resolved = true;
                } else {
                    let location: string | undefined;
                    const locMatch = answer.match(/(?:at|in|enter|reach|leave|leaving|arrive at)\s+(?:the\s+)?([a-z0-9]+)/i);
                    if (locMatch && locMatch[1]) {
                        location = locMatch[1];
                    } else if (answer.includes("gym") || answer.includes("gimnasio")) {
                        location = "gym";
                    } else if (answer.includes("office") || answer.includes("work") || answer.includes("trabajo")) {
                        location = "office";
                    } else if (answer.includes("home") || answer.includes("casa")) {
                        location = "home";
                    }

                    if (location) {
                        pending.extractedData.triggerType = "location";
                        pending.extractedData.locationName = location;
                        resolved = true;
                    }
                }

                if (!resolved) {
                    return {
                        reply: "Please specify when to trigger the routine. You can say a specific time (e.g., 'at 9 PM') or entering a location (e.g., 'when entering gym').",
                        completed: false
                    };
                }

                currentField.resolved = true;
                pending.currentStep += 1;
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
            } else if (currentField.field === "routine_confirmation") {
                const isNo = /\b(no|never|cancel|stop|nein|non)\b/i.test(answer);
                const isYes = /\b(yes|yep|sure|ok|sí|ja|jawohl|oui)\b/i.test(answer);

                if (isNo) {
                    await PendingIntentService.clear();
                    return {
                        reply: "Routine creation cancelled.",
                        completed: false
                    };
                } else if (!isYes) {
                    return {
                        reply: "Please answer with 'Yes' to confirm and save the routine, or 'No' to cancel.",
                        completed: false
                    };
                }

                pending.extractedData.confirmed = true;
                currentField.resolved = true;
                pending.currentStep += 1;
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
            }
        }

        // 2. Fallback to default reminder location_confirmation dialog
        else if (currentField.field === "location_confirmation") {
            // User closed the map screen without saving — abort immediately
            if (answer.includes("[system:map_cancelled]")) {
                await PendingIntentService.clear();
                return {
                    reply: "No problem! The map was closed without saving. I've cancelled the location-based reminder. Let me know if you'd like to try again.",
                    completed: false
                };
            }
            
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

        // 3. Process completed check
        if (pending.currentStep >= pending.missingFields.length) {
            const data = pending.extractedData;
            const type = pending.type;

            if (type === "brightness_adjustment") {
                const level = Number(data.brightnessLevel ?? 0.5);
                const triggerType = data.triggerType;
                let time = data.time as string | undefined;
                let locationName = data.locationName as string | undefined;

                const intent: any = {
                    intent: "brightness_adjustment",
                    confidence: 1.0,
                    originalText: pending.originalMessage,
                    brightnessLevel: level,
                    time: triggerType === "time" ? time : undefined,
                    locationName: triggerType === "location" ? locationName : undefined
                };

                const workflow = WorkflowBuilder.build(intent);

                if (triggerType === "now" || (!time && !locationName)) {
                    await this.executeWorkflowInMemory(workflow);
                    await PendingIntentService.clear();
                    return {
                        reply: `Perfect! I've set your display brightness to ${Math.round(level * 100)}% immediately.`,
                        completed: true
                    };
                }

                await WorkflowService.create(workflow);
                await PendingIntentService.clear();

                const schedStr = time ? `at ${time}` : `when entering ${locationName}`;
                return {
                    reply: `Perfect! I've scheduled your display brightness adjustment to ${Math.round(level * 100)}% ${schedStr}.`,
                    completed: true
                };
            }

            if (type === "silent_mode") {
                const silent = Boolean(data.silentEnabled ?? true);
                const vibrate = Boolean(data.vibrateEnabled ?? false);
                const triggerType = data.triggerType;
                let time = data.time as string | undefined;
                let locationName = data.locationName as string | undefined;

                const intent: any = {
                    intent: "silent_mode",
                    confidence: 1.0,
                    originalText: pending.originalMessage,
                    silentEnabled: silent,
                    vibrateEnabled: vibrate,
                    time: triggerType === "time" ? time : undefined,
                    locationName: triggerType === "location" ? locationName : undefined
                };

                const workflow = WorkflowBuilder.build(intent);

                if (triggerType === "now" || (!time && !locationName)) {
                    await this.executeWorkflowInMemory(workflow);
                    await PendingIntentService.clear();
                    return {
                        reply: `Perfect! I've activated silent mode immediately.`,
                        completed: true
                    };
                }

                await WorkflowService.create(workflow);
                await PendingIntentService.clear();

                const schedStr = time ? `at ${time}` : `when entering ${locationName}`;
                return {
                    reply: `Perfect! I've scheduled silent mode ${schedStr}.`,
                    completed: true
                };
            }

            if (type === "smart_routine") {
                const confirmed = data.confirmed === true;
                if (!confirmed) {
                    await PendingIntentService.clear();
                    return {
                        reply: `Understood, routine cancelled. Let me know if you need anything else.`,
                        completed: false
                    };
                }

                const routineName = String(data.routineName ?? "gym_routine");
                const level = data.brightnessLevel !== undefined ? Number(data.brightnessLevel) : undefined;
                const silent = data.silentEnabled !== undefined ? Boolean(data.silentEnabled) : undefined;
                const vibrate = data.vibrateEnabled !== undefined ? Boolean(data.vibrateEnabled) : undefined;
                let time = data.time as string | undefined;
                let locationName = data.locationName as string | undefined;

                const intent: any = {
                    intent: "smart_routine",
                    confidence: 1.0,
                    originalText: pending.originalMessage,
                    routineName,
                    brightnessLevel: level,
                    silentEnabled: silent,
                    vibrateEnabled: vibrate,
                    time: time,
                    locationName: locationName
                };

                const workflow = WorkflowBuilder.build(intent);
                await WorkflowService.create(workflow);
                await PendingIntentService.clear();

                const triggerDesc = time ? `at ${time}` : locationName ? `when entering ${locationName}` : "manually";
                return {
                    reply: `Perfect! Your ${routineName.replace("_", " ")} routine has been configured and scheduled to trigger ${triggerDesc}.`,
                    completed: true
                };
            }
        }

        // 4. Default workflow for reminders
        const result =
            await PendingIntentService.resolveStep(
                userMessage
            );

        if (
            !result.completed
        ) {
            return {
                reply: result.nextQuestion ?? "Please continue.",
                completed: false
            };
        }

        if (
            !result.intent
        ) {
            return {
                reply: "I couldn't complete that reminder.",
                completed: false
            };
        }

        const finalData =
            result.intent
                .extractedData;

        await this.createReminderFromIntent(
            finalData as unknown as ParsedAssistantIntent
        );

        await PendingIntentService.clear();

        return {
            reply: `Perfect. ${finalData.location || "office"} has been registered. Your intelligent reminder has been created.`,
            completed: true,
            originalMessage: pending.originalMessage
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Execute Workflow In Memory
    |--------------------------------------------------------------------------
    */

    private static async executeWorkflowInMemory(workflow: any): Promise<void> {
        const workflowDef: any = {
            id: workflow.id,
            name: workflow.name,
            enabled: workflow.enabled,
            trigger: (workflow.trigger.type === "time" ? "schedule" :
                     workflow.trigger.type === "interval" ? "schedule" :
                     (workflow.trigger.type === "geofence_enter" || workflow.trigger.type === "geofence_exit") ? "event" : "manual") as any,
            schedule: workflow.trigger.type === "interval"
                ? String(workflow.trigger.everyMinutes * 60 * 1000)
                : (workflow.trigger.type === "time" ? workflow.trigger.time : undefined),
            actions: workflow.actions.map((act: any, idx: number) => ({
                id: act.id || `${workflow.id}_action_${idx}`,
                type: (act.type === "notify" ? "notification" :
                      act.type === "ask" ? "notification" :
                      act.type === "set_brightness" ? "set_brightness" :
                      act.type === "set_silent" ? "set_silent" :
                      act.type === "vibrate" ? "vibrate" : "custom") as any,
                name: act.name || `Action ${idx}`,
                enabled: act.enabled !== false,
                config: act.type === "notify" ? { title: act.title, body: act.message } :
                        act.type === "ask" ? { title: "Question", body: act.question } :
                        act.type === "set_brightness" ? { brightness: act.config.brightness } :
                        act.type === "set_silent" ? { silent: act.config.silent } :
                        act.type === "vibrate" ? (act.config || {}) : {},
            })),
            createdAt: new Date(workflow.createdAt).getTime(),
            updatedAt: new Date(workflow.updatedAt).getTime(),
        };
        WorkflowDefinitionService.register(workflowDef);
        await WorkflowRuntimeService.execute(workflowDef.id);
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

    /*
    |--------------------------------------------------------------------------
    | Spelling Correction and Time Utilities
    |--------------------------------------------------------------------------
    */

    private static levenshteinDistance(a: string, b: string): number {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(
                            matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1  // deletion
                        )
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    private static correctSpelling(input: string): string {
        const vocabulary = [
            "brightness", "brighten", "dim", "brillo", "luminosité", "helligkeit",
            "silent", "silence", "vibrate", "mute", "silencio", "vibrar", "mutear",
            "silencieux", "silenceur", "vibreur", "muet", "lautlos", "vibrieren", "stumm", "aktivieren",
            "routine", "rutina", "gym", "office", "work", "home", "gimnasio",
            "remind", "reminder", "reminders", "recuerda", "recordatorio", "erinnere",
            "erinnerung", "rappelle", "rappel", "tomorrow", "every", "minutes", "hours",
            "capabilities", "help", "ayuda", "hilfe"
        ];

        const words = input.split(/\s+/);
        const correctedWords = words.map(word => {
            const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (cleanWord.length <= 2) return word;
            
            let bestMatch = cleanWord;
            let minDistance = 999;
            
            for (const vocab of vocabulary) {
                const dist = this.levenshteinDistance(cleanWord, vocab);
                if (dist < minDistance) {
                    minDistance = dist;
                    bestMatch = vocab;
                }
            }
            
            const threshold = cleanWord.length <= 5 ? 1 : 2;
            if (minDistance <= threshold) {
                const isCapitalized = word[0] === word[0].toUpperCase();
                let result = bestMatch;
                if (isCapitalized) {
                    result = result[0].toUpperCase() + result.slice(1);
                }
                const suffix = word.slice(cleanWord.length);
                return result + suffix;
            }
            
            return word;
        });
        return correctedWords.join(" ");
    }

    private static parseTimeString(str: string): string | null {
        const clean = str.toLowerCase().trim();
        const match = clean.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
        if (match) {
            let h = parseInt(match[1]);
            const m = match[2] ? match[2] : "00";
            const ampm = match[3] ? match[3].toLowerCase() : null;
            if (ampm === "pm" && h < 12) h += 12;
            if (ampm === "am" && h === 12) h = 0;
            return `${String(h).padStart(2, "0")}:${m}`;
        }
        return null;
    }
}