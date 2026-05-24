// src/core/integrations/device-workflow-action-bridge.service.ts

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
}