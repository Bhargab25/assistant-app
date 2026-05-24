// src/core/geofence/geofence.task.ts

import * as TaskManager from "expo-task-manager";

import * as Location from "expo-location";

import { GeofenceService } from "./geofence.service";

/*
|--------------------------------------------------------------------------
| Geofence Task Name
|--------------------------------------------------------------------------
*/

export const GEOFENCE_TASK_NAME =
    "GEOFENCE_TASK";

/*
|--------------------------------------------------------------------------
| Define Background Geofence Task
|--------------------------------------------------------------------------
|
| This task is triggered by the operating system
| even when the app is in the background.
|
*/

TaskManager.defineTask(
    GEOFENCE_TASK_NAME,
    async ({ data, error }) => {
        /*
        |--------------------------------------------------------------------------
        | Handle Errors
        |--------------------------------------------------------------------------
        */

        if (error) {
            console.error(
                "Geofence task error:",
                error
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Data
        |--------------------------------------------------------------------------
        */

        if (!data) {
            return;
        }

        const {
            eventType,
            region,
        } = data as {
            eventType: Location.GeofencingEventType;

            region: {
                identifier: string;

                latitude: number;

                longitude: number;

                radius: number;
            };
        };

        console.log(
            "Geofence background event:",
            eventType,
            region
        );

        /*
        |--------------------------------------------------------------------------
        | Handle Enter Event
        |--------------------------------------------------------------------------
        */

        if (
            eventType ===
            Location.GeofencingEventType.Enter
        ) {
            await GeofenceService.handleEnter(
                {
                    identifier:
                        region.identifier,

                    latitude:
                        region.latitude,

                    longitude:
                        region.longitude,

                    radius:
                        region.radius,
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Handle Exit Event
        |--------------------------------------------------------------------------
        */

        if (
            eventType ===
            Location.GeofencingEventType.Exit
        ) {
            await GeofenceService.handleExit(
                {
                    identifier:
                        region.identifier,

                    latitude:
                        region.latitude,

                    longitude:
                        region.longitude,

                    radius:
                        region.radius,
                }
            );
        }
    }
);