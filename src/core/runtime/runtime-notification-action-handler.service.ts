// src/core/runtime/runtime-notification-action-handler.service.ts

import {
    NotificationResponse,
} from "expo-notifications";

import {
    NotificationActions,
} from "../notifications/notification.actions";

import {
    RuntimeActionExecutorService,
    RuntimeActionType,
} from "./runtime-action-executor.service";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Runtime Notification Action Handler
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - bridge notification actions → runtime
| - parse notification payloads
| - validate action execution
| - execute workflow actions
|
| IMPORTANT:
| This becomes the REAL runtime input layer.
|
*/

export class RuntimeNotificationActionHandlerService {
    /*
    |--------------------------------------------------------------------------
    | Initialize Handler
    |--------------------------------------------------------------------------
    */

    static initialize():
        void {
        try {
            logInfo(
                "Initializing runtime notification action handler..."
            );

            /*
            |--------------------------------------------------------------------------
            | Register Notification Listener
            |--------------------------------------------------------------------------
            */

            NotificationActions.registerResponseListener(
                async (
                    response
                ) => {
                    await this.handle(
                        response
                    );
                }
            );

            logInfo(
                "Runtime notification action handler initialized"
            );
        } catch (error) {
            logError(
                "Failed initializing runtime notification action handler",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Handle Notification Response
    |--------------------------------------------------------------------------
    */

    static async handle(
        response:
            NotificationResponse
    ): Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Extract Action
            |--------------------------------------------------------------------------
            */

            const action =
                NotificationActions.getActionIdentifier(
                    response
                ) as RuntimeActionType;

            /*
            |--------------------------------------------------------------------------
            | Extract Notification Data
            |--------------------------------------------------------------------------
            */

            const data =
                NotificationActions.getNotificationData(
                    response
                );

            logInfo(
                "Runtime notification action received",
                {
                    action,

                    data,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Validate Workflow
            |--------------------------------------------------------------------------
            */

            if (
                !data?.workflowId
            ) {
                logWarn(
                    "Notification action missing workflowId"
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Execute Runtime Action
            |--------------------------------------------------------------------------
            */

            await RuntimeActionExecutorService.execute(
                action,
                {
                    workflowId:
                        data.workflowId,

                    notificationId:
                        data.notificationId,

                    sessionId:
                        data.sessionId,

                    metadata: {
                        source:
                            "notification_action",

                        rawPayload:
                            data,
                    },
                }
            );

            logInfo(
                "Runtime notification action processed successfully"
            );
        } catch (error) {
            logError(
                "Runtime notification action handling failed",
                error
            );
        }
    }
}