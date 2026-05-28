// src/core/integrations/device-workflow-action-bridge.service.ts

import * as Brightness from "expo-brightness";
import { Vibration, Platform } from "react-native";

import {
    WorkflowExecutionStep,
} from "../workflows/workflow-execution-planner.service";

import {
    DeviceNotificationService,
} from "./device-notification.service";

import {
    DeviceAudioService,
} from "./device-audio.service";

import {
    DeviceSpeechService,
} from "./device-speech.service";

import {
    DeviceStorageService,
} from "./device-storage.service";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Device Workflow Action Bridge
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - connect workflow actions to real device APIs
| - execute native integrations
| - bridge automation runtime to mobile runtime
|
| IMPORTANT:
| This becomes the REAL
| action execution bridge.
|
|
*/

export class DeviceWorkflowActionBridgeService {
    /*
    |--------------------------------------------------------------------------
    | Execute Action
    |--------------------------------------------------------------------------
    */

    static async execute(
        step:
            WorkflowExecutionStep
    ): Promise<unknown> {
        try {
            logInfo(
                "Executing device workflow action",
                {
                    actionId:
                        step.actionId,

                    actionType:
                        step.actionType,
                }
            );

            switch (
            step.actionType
            ) {
                /*
                |--------------------------------------------------------------------------
                | Notification
                |--------------------------------------------------------------------------
                */

                case "notification":
                    return await this.notification(
                        step
                    );

                /*
                |--------------------------------------------------------------------------
                | Assistant Message
                |--------------------------------------------------------------------------
                */

                case "assistant_message":
                    return await this.assistantMessage(
                        step
                    );

                /*
                |--------------------------------------------------------------------------
                | Alarm
                |--------------------------------------------------------------------------
                */

                case "sound_alarm":
                    return await this.soundAlarm(
                        step
                    );

                /*
                |--------------------------------------------------------------------------
                | State Update
                |--------------------------------------------------------------------------
                */

                case "update_state":
                    return await this.updateState(
                        step
                    );

                /*
                |--------------------------------------------------------------------------
                | Delay
                |--------------------------------------------------------------------------
                */

                case "delay":
                    return await this.delay(
                        step
                    );

                /*
                |--------------------------------------------------------------------------
                | Custom
                |--------------------------------------------------------------------------
                */

                case "custom":
                    return await this.custom(
                        step
                    );

                /*
                |--------------------------------------------------------------------------
                | Display Brightness
                |--------------------------------------------------------------------------
                */

                case "set_brightness":
                    return await this.setBrightness(
                        step
                    );

                /*
                |--------------------------------------------------------------------------
                | Silent Mode
                |--------------------------------------------------------------------------
                */

                case "set_silent":
                    return await this.setSilent(
                        step
                    );

                /*
                |--------------------------------------------------------------------------
                | Vibration
                |--------------------------------------------------------------------------
                */

                case "vibrate":
                    return await this.vibrate(
                        step
                    );

                default:
                    logWarn(
                        "Unsupported workflow action",
                        {
                            type:
                                step.actionType,
                        }
                    );

                    return null;
            }
        } catch (error) {
            logError(
                "Device workflow action execution failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Notification Action
    |--------------------------------------------------------------------------
    */

    private static async notification(
        step:
            WorkflowExecutionStep
    ): Promise<unknown> {
        const notificationId =
            await DeviceNotificationService.send(
                {
                    title:
                        String(
                            step.config.title ??
                            "Assistant"
                        ),

                    body:
                        String(
                            step.config.body ??
                            ""
                        ),

                    sound:
                        step.config.sound !==
                        false,

                    data:
                        step.config,
                }
            );

        return {
            type:
                "notification",

            notificationId,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Assistant Message
    |--------------------------------------------------------------------------
    */

    private static async assistantMessage(
        step:
            WorkflowExecutionStep
    ): Promise<unknown> {
        const message =
            String(
                step.config.message ??
                ""
            );

        /*
        |--------------------------------------------------------------------------
        | Speak Assistant Message
        |--------------------------------------------------------------------------
        */

        await DeviceSpeechService.assistant(
            message
        );

        return {
            type:
                "assistant_message",

            message,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Sound Alarm
    |--------------------------------------------------------------------------
    */

    private static async soundAlarm(
        step:
            WorkflowExecutionStep
    ): Promise<unknown> {
        await DeviceAudioService.playAlarm();

        return {
            type:
                "sound_alarm",
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Update State
    |--------------------------------------------------------------------------
    */

    private static async updateState(
        step:
            WorkflowExecutionStep
    ): Promise<unknown> {
        const key =
            String(
                step.config.key ??
                "runtime_state"
            );

        const value =
            step.config.value;

        await DeviceStorageService.set(
            key,
            value
        );

        return {
            type:
                "update_state",

            key,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Delay Action
    |--------------------------------------------------------------------------
    */

    private static async delay(
        step:
            WorkflowExecutionStep
    ): Promise<unknown> {
        const duration =
            Number(
                step.config.duration ??
                1000
            );

        await new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    duration
                )
        );

        return {
            type:
                "delay",

            duration,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Custom Action
    |--------------------------------------------------------------------------
    */

    private static async custom(
        step:
            WorkflowExecutionStep
    ): Promise<unknown> {
        return {
            type:
                "custom",

            config:
                step.config,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Set Brightness Action
    |--------------------------------------------------------------------------
    */

    private static async setBrightness(
        step: WorkflowExecutionStep
    ): Promise<unknown> {
        const brightness = Number(step.config.brightness ?? 0.5);
        let simulated = false;
        try {
            const { status } = await Brightness.requestPermissionsAsync();
            if (status === "granted") {
                if (Platform.OS === 'android') {
                    try {
                        await Brightness.setSystemBrightnessAsync(brightness);
                        logInfo("System display brightness adjusted via expo-brightness", { brightness });
                    } catch (sysError) {
                        logWarn("Failed to set system brightness on Android, falling back to window brightness", { error: sysError, brightness });
                        await Brightness.setBrightnessAsync(brightness);
                    }
                } else {
                    await Brightness.setBrightnessAsync(brightness);
                    logInfo("Display brightness adjusted via expo-brightness", { brightness });
                }
            } else {
                simulated = true;
                logWarn("Brightness permission not granted, simulating brightness adjustment", { brightness });
            }
        } catch (error) {
            simulated = true;
            logWarn("Failed to adjust brightness, falling back to simulation", { error, brightness });
        }
        return {
            type: "set_brightness",
            brightness,
            simulated,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Set Silent Action
    |--------------------------------------------------------------------------
    */

    private static async setSilent(
        step: WorkflowExecutionStep
    ): Promise<unknown> {
        const silent = Boolean(step.config.silent ?? true);
        let simulated = false;
        try {
            if (silent) {
                await DeviceAudioService.setVolume(0);
                logInfo("Device audio muted via DeviceAudioService");
            } else {
                await DeviceAudioService.setVolume(1);
                logInfo("Device audio unmuted via DeviceAudioService");
            }
        } catch (error) {
            simulated = true;
            logWarn("Failed to toggle silent mode, simulating", { error, silent });
        }
        return {
            type: "set_silent",
            silent,
            simulated,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Vibrate Action
    |--------------------------------------------------------------------------
    */

    private static async vibrate(
        step: WorkflowExecutionStep
    ): Promise<unknown> {
        let simulated = false;
        try {
            Vibration.vibrate();
            logInfo("Triggered haptic vibration feedback");
        } catch (error) {
            simulated = true;
            logWarn("Vibration failed, simulating", { error });
        }
        return {
            type: "vibrate",
            status: "done",
            simulated,
        };
    }
}