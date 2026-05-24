// src/core/events/event-listeners.ts

import { EventBus } from "./event-bus";

import {
    WORKFLOW_EVENTS,
    NOTIFICATION_EVENTS,
    RETRY_EVENTS,
    SCHEDULER_EVENTS,
    GEOFENCE_EVENTS,
    APP_EVENTS,
} from "./events.constants";

import { WorkflowLogRepository } from "../storage/workflow-log.repository";

/*
|--------------------------------------------------------------------------
| Event Listeners
|--------------------------------------------------------------------------
|
| Centralized event subscriptions.
|
| Purpose:
| - analytics
| - logging
| - workflow reactions
| - debugging
| - future AI learning
|
*/

export class EventListeners {
    /*
    |--------------------------------------------------------------------------
    | Register All Listeners
    |--------------------------------------------------------------------------
    */

    static register(): void {
        this.registerWorkflowListeners();

        this.registerNotificationListeners();

        this.registerRetryListeners();

        this.registerSchedulerListeners();

        this.registerGeofenceListeners();

        this.registerAppListeners();
    }

    /*
    |--------------------------------------------------------------------------
    | Workflow Listeners
    |--------------------------------------------------------------------------
    */

    static registerWorkflowListeners(): void {
        EventBus.on(
            WORKFLOW_EVENTS.CREATED,
            async (payload) => {
                console.log(
                    "Workflow created",
                    payload
                );

                if (!payload?.workflowId) {
                    return;
                }

                await WorkflowLogRepository.create({
                    workflowId:
                        payload.workflowId,

                    eventType:
                        "workflow_created",

                    status: "success",

                    message:
                        payload.message ??
                        "Workflow created",

                    createdAt:
                        new Date().toISOString(),
                });
            }
        );

        EventBus.on(
            WORKFLOW_EVENTS.EXECUTED,
            async (payload) => {
                console.log(
                    "Workflow executed",
                    payload
                );
            }
        );

        EventBus.on(
            WORKFLOW_EVENTS.FAILED,
            async (payload) => {
                console.error(
                    "Workflow failed",
                    payload
                );
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Notification Listeners
    |--------------------------------------------------------------------------
    */

    static registerNotificationListeners(): void {
        EventBus.on(
            NOTIFICATION_EVENTS.SENT,
            async (payload) => {
                console.log(
                    "Notification sent",
                    payload
                );
            }
        );

        EventBus.on(
            NOTIFICATION_EVENTS.DONE,
            async (payload) => {
                console.log(
                    "Notification completed",
                    payload
                );
            }
        );

        EventBus.on(
            NOTIFICATION_EVENTS.SNOOZED,
            async (payload) => {
                console.log(
                    "Notification snoozed",
                    payload
                );
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Retry Listeners
    |--------------------------------------------------------------------------
    */

    static registerRetryListeners(): void {
        EventBus.on(
            RETRY_EVENTS.REGISTERED,
            async (payload) => {
                console.log(
                    "Retry registered",
                    payload
                );
            }
        );

        EventBus.on(
            RETRY_EVENTS.ESCALATED,
            async (payload) => {
                console.warn(
                    "Retry escalated",
                    payload
                );
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Scheduler Listeners
    |--------------------------------------------------------------------------
    */

    static registerSchedulerListeners(): void {
        EventBus.on(
            SCHEDULER_EVENTS.STARTED,
            async () => {
                console.log(
                    "Scheduler started"
                );
            }
        );

        EventBus.on(
            SCHEDULER_EVENTS.TICK,
            async () => {
                console.log(
                    "Scheduler tick"
                );
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Geofence Listeners
    |--------------------------------------------------------------------------
    */

    static registerGeofenceListeners(): void {
        EventBus.on(
            GEOFENCE_EVENTS.ENTERED,
            async (payload) => {
                console.log(
                    "Geofence entered",
                    payload
                );
            }
        );

        EventBus.on(
            GEOFENCE_EVENTS.EXITED,
            async (payload) => {
                console.log(
                    "Geofence exited",
                    payload
                );
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | App Lifecycle Listeners
    |--------------------------------------------------------------------------
    */

    static registerAppListeners(): void {
        EventBus.on(
            APP_EVENTS.BOOTSTRAPPED,
            async () => {
                console.log(
                    "Application bootstrapped"
                );
            }
        );

        EventBus.on(
            APP_EVENTS.FOREGROUND,
            async () => {
                console.log(
                    "App moved to foreground"
                );
            }
        );

        EventBus.on(
            APP_EVENTS.BACKGROUND,
            async () => {
                console.log(
                    "App moved to background"
                );
            }
        );
    }
}