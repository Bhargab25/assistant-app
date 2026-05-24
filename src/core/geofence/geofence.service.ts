// src/core/geofence/geofence.service.ts

import * as Location from "expo-location";

import { EventBus } from "../events/event-bus";

import {
    GEOFENCE_EVENTS,
} from "../events/events.constants";

/*
|--------------------------------------------------------------------------
| Geofence Region Type
|--------------------------------------------------------------------------
*/

export type GeofenceRegion = {
    identifier: string;

    latitude: number;

    longitude: number;

    radius: number;

    notifyOnEnter?: boolean;

    notifyOnExit?: boolean;
};

/*
|--------------------------------------------------------------------------
| Geofence Service
|--------------------------------------------------------------------------
|
| Responsible for:
| - location permissions
| - geofence registration
| - geofence monitoring
| - geofence event emission
|
*/

export class GeofenceService {
    /*
    |--------------------------------------------------------------------------
    | Request Permissions
    |--------------------------------------------------------------------------
    */

    static async requestPermissions(): Promise<boolean> {
        const foreground =
            await Location.requestForegroundPermissionsAsync();

        if (
            foreground.status !== "granted"
        ) {
            return false;
        }

        const background =
            await Location.requestBackgroundPermissionsAsync();

        return (
            background.status === "granted"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get Current Location
    |--------------------------------------------------------------------------
    */

    static async getCurrentLocation() {
        return await Location.getCurrentPositionAsync({
            accuracy:
                Location.Accuracy.Balanced,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Start Geofence Monitoring
    |--------------------------------------------------------------------------
    |
    | NOTE:
    | Expo geofencing requires TaskManager setup.
    | Full integration comes later.
    |
    */

    static async startMonitoring(
        regions: GeofenceRegion[]
    ): Promise<void> {
        console.log(
            "Starting geofence monitoring",
            regions
        );

        /*
        |--------------------------------------------------------------------------
        | Placeholder
        |--------------------------------------------------------------------------
        |
        | Later:
        | Location.startGeofencingAsync()
        |
        */
    }

    /*
    |--------------------------------------------------------------------------
    | Stop Geofence Monitoring
    |--------------------------------------------------------------------------
    */

    static async stopMonitoring(): Promise<void> {
        console.log(
            "Stopping geofence monitoring"
        );

        /*
        |--------------------------------------------------------------------------
        | Placeholder
        |--------------------------------------------------------------------------
        |
        | Later:
        | Location.stopGeofencingAsync()
        |
        */
    }

    /*
    |--------------------------------------------------------------------------
    | Handle Geofence Enter
    |--------------------------------------------------------------------------
    */

    static async handleEnter(
        region: GeofenceRegion
    ): Promise<void> {
        console.log(
            "Entered geofence:",
            region.identifier
        );

        await EventBus.emit(
            GEOFENCE_EVENTS.ENTERED,
            {
                regionId:
                    region.identifier,

                latitude:
                    region.latitude,

                longitude:
                    region.longitude,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Handle Geofence Exit
    |--------------------------------------------------------------------------
    */

    static async handleExit(
        region: GeofenceRegion
    ): Promise<void> {
        console.log(
            "Exited geofence:",
            region.identifier
        );

        await EventBus.emit(
            GEOFENCE_EVENTS.EXITED,
            {
                regionId:
                    region.identifier,

                latitude:
                    region.latitude,

                longitude:
                    region.longitude,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Create Region
    |--------------------------------------------------------------------------
    */

    static createRegion(
        data: {
            identifier: string;

            latitude: number;

            longitude: number;

            radius?: number;
        }
    ): GeofenceRegion {
        return {
            identifier:
                data.identifier,

            latitude:
                data.latitude,

            longitude:
                data.longitude,

            radius:
                data.radius ?? 100,

            notifyOnEnter: true,

            notifyOnExit: true,
        };
    }
}