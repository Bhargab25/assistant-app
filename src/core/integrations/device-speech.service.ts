// src/core/integrations/device-speech.service.ts

import * as Speech from "expo-speech";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Assistant Voice Type
|--------------------------------------------------------------------------
*/

export type AssistantVoiceType =
    | "default"
    | "calm"
    | "motivational"
    | "serious";

/*
|--------------------------------------------------------------------------
| Speech Options
|--------------------------------------------------------------------------
*/

export type DeviceSpeechOptions =
    {
        language?: string;

        pitch?: number;

        rate?: number;

        volume?: number;
    };

/*
|--------------------------------------------------------------------------
| Device Speech State
|--------------------------------------------------------------------------
*/

type DeviceSpeechState =
    {
        initialized: boolean;

        speaking: boolean;

        language: string;

        voiceType:
        AssistantVoiceType;

        currentText?: string;
    };

/*
|--------------------------------------------------------------------------
| Device Speech Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - text-to-speech
| - assistant voice output
| - spoken alarms
| - motivational reminders
| - speech runtime management
| - speech interruption handling
|
| IMPORTANT:
| This becomes the REAL
| assistant voice engine.
|
*/

export class DeviceSpeechService {
    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    private static state:
        DeviceSpeechState =
        {
            initialized: false,

            speaking: false,

            language:
                "en-US",

            voiceType:
                "default",
        };

    /*
    |--------------------------------------------------------------------------
    | Initialize Speech
    |--------------------------------------------------------------------------
    */

    static async initialize():
        Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Already Initialized
            |--------------------------------------------------------------------------
            */

            if (
                this.state
                    .initialized
            ) {
                return;
            }

            logInfo(
                "Initializing device speech..."
            );

            /*
            |--------------------------------------------------------------------------
            | Validate Runtime
            |--------------------------------------------------------------------------
            */

            const available =
                await Speech.isSpeakingAsync();

            logInfo(
                "Speech runtime available",
                {
                    available,
                }
            );

            this.state.initialized =
                true;

            logInfo(
                "Device speech initialized"
            );
        } catch (error) {
            logError(
                "Speech initialization failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Speak Text
    |--------------------------------------------------------------------------
    */

    static async speak(
        text: string,

        options:
            DeviceSpeechOptions =
            {}
    ): Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Empty Text
            |--------------------------------------------------------------------------
            */

            if (
                !text.trim()
            ) {
                logWarn(
                    "Speech text empty"
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Initialize Runtime
            |--------------------------------------------------------------------------
            */

            await this.initialize();

            /*
            |--------------------------------------------------------------------------
            | Stop Existing Speech
            |--------------------------------------------------------------------------
            */

            await this.stop();

            logInfo(
                "Starting speech output",
                {
                    text,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Runtime State
            |--------------------------------------------------------------------------
            */

            this.state.speaking =
                true;

            this.state.currentText =
                text;

            /*
            |--------------------------------------------------------------------------
            | Speak
            |--------------------------------------------------------------------------
            */

            return new Promise<void>((resolve) => {
                let resolved = false;
                const done = () => {
                    if (resolved) return;
                    resolved = true;
                    resolve();
                };

                Speech.speak(
                    text,
                    {
                        language:
                            options.language ??
                            this.state
                                .language,

                        pitch:
                            options.pitch ??
                            1,

                        rate:
                            options.rate ??
                            1,

                        volume:
                            options.volume ??
                            1,

                        onDone: () => {
                            this.state.speaking =
                                false;

                            this.state.currentText =
                                undefined;

                            logInfo(
                                "Speech completed"
                            );

                            done();
                        },

                        onStopped: () => {
                            this.state.speaking =
                                false;

                            this.state.currentText =
                                undefined;

                            logInfo(
                                "Speech stopped"
                            );

                            done();
                        },

                        onError: (
                            error
                        ) => {
                            this.state.speaking =
                                false;

                            this.state.currentText =
                                undefined;

                            logError(
                                "Speech playback error",
                                error
                            );

                            done();
                        },
                    }
                );

                // Safety timeout: resolve if speech doesn't finish or report status within 10 seconds
                setTimeout(() => {
                    if (!resolved) {
                        logWarn("Speech timeout reached, resolving safety lock");
                        done();
                    }
                }, 10000);
            });
        } catch (error) {
            this.state.speaking =
                false;

            this.state.currentText =
                undefined;

            logError(
                "Speech output failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Assistant Voice
    |--------------------------------------------------------------------------
    */

    static async assistant(
        message: string
    ): Promise<void> {
        try {
            switch (
            this.state
                .voiceType
            ) {
                /*
                |--------------------------------------------------------------------------
                | Calm Assistant
                |--------------------------------------------------------------------------
                */

                case "calm":
                    await this.speak(
                        message,
                        {
                            language:
                                "en-US",

                            pitch:
                                0.95,

                            rate:
                                0.85,
                        }
                    );

                    break;

                /*
                |--------------------------------------------------------------------------
                | Motivational Assistant
                |--------------------------------------------------------------------------
                */

                case "motivational":
                    await this.speak(
                        message,
                        {
                            language:
                                "en-US",

                            pitch:
                                1.2,

                            rate:
                                1,
                        }
                    );

                    break;

                /*
                |--------------------------------------------------------------------------
                | Serious Assistant
                |--------------------------------------------------------------------------
                */

                case "serious":
                    await this.speak(
                        message,
                        {
                            language:
                                "en-US",

                            pitch:
                                0.85,

                            rate:
                                0.8,
                        }
                    );

                    break;

                /*
                |--------------------------------------------------------------------------
                | Default Assistant
                |--------------------------------------------------------------------------
                */

                default:
                    await this.speak(
                        message,
                        {
                            language:
                                "en-US",

                            pitch:
                                1,

                            rate:
                                0.95,
                        }
                    );

                    break;
            }

            logInfo(
                "Assistant speech completed"
            );
        } catch (error) {
            logError(
                "Assistant speech failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Motivational Alarm
    |--------------------------------------------------------------------------
    */

    static async motivationalAlarm(
        reminderTitle: string
    ): Promise<void> {
        try {
            const message =
                `Wake up. ${reminderTitle}. Let's stay productive today.`;

            await this.assistant(
                message
            );

            logInfo(
                "Motivational alarm spoken"
            );
        } catch (error) {
            logError(
                "Motivational alarm failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Stop Speech
    |--------------------------------------------------------------------------
    */

    static async stop():
        Promise<void> {
        try {
            Speech.stop();

            this.state.speaking =
                false;

            this.state.currentText =
                undefined;

            logInfo(
                "Speech stopped"
            );
        } catch (error) {
            logError(
                "Speech stop failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Change Language
    |--------------------------------------------------------------------------
    */

    static setLanguage(
        language: string
    ): void {
        this.state.language =
            language;

        logInfo(
            "Speech language updated",
            {
                language,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Set Assistant Voice Type
    |--------------------------------------------------------------------------
    */

    static setVoiceType(
        voiceType:
            AssistantVoiceType
    ): void {
        this.state.voiceType =
            voiceType;

        logInfo(
            "Assistant voice updated",
            {
                voiceType,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Is Speaking
    |--------------------------------------------------------------------------
    */

    static isSpeaking():
        boolean {
        return this.state
            .speaking;
    }

    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    static getState():
        DeviceSpeechState {
        return this.state;
    }
}