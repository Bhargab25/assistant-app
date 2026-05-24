// src/core/geofence/location.service.ts

import dayjs from "dayjs";

import {
    GeofenceService,
    GeofenceRegion,
} from "./geofence.service";

import {
    LocationRepository,
    SavedLocation,
} from "./location.repository";

import { EventBus } from "../events/event-bus";

import {
    GEOFENCE_EVENTS,
} from "../events/events.constants";

/*
|--------------------------------------------------------------------------
| Location Service
|--------------------------------------------------------------------------
|
| Business logic layer for:
| - saved locations
| - geofence registration
| - geofence lifecycle
| - location workflows
|
*/

export class LocationService {
    /*
    |--------------------------------------------------------------------------
    | Create Location
    |--------------------------------------------------------------------------
    */

    static async create(
        payload: {
            name: string;

            latitude: number;

            longitude: number;

            radius?: number;
        }
    ): Promise<SavedLocation> {
        const location: SavedLocation = {
            id: this.generateId(),

            name: payload.name,

            latitude: payload.latitude,

            longitude: payload.longitude,

            radius: payload.radius ?? 100,

            createdAt:
                dayjs().toISOString(),
        };

        /*
        |--------------------------------------------------------------------------
        | Save Location
        |--------------------------------------------------------------------------
        */

        await LocationRepository.create(
            location
        );

        /*
        |--------------------------------------------------------------------------
        | Register Geofence
        |--------------------------------------------------------------------------
        */

        await this.registerGeofence(
            location
        );

        return location;
    }

    /*
    |--------------------------------------------------------------------------
    | Update Location
    |--------------------------------------------------------------------------
    */

    static async update(
        locationId: string,
        updates: Partial<SavedLocation>
    ): Promise<SavedLocation | null> {
        const existing =
            await LocationRepository.findById(
                locationId
            );

        if (!existing) {
            return null;
        }

        const updated: SavedLocation = {
            ...existing,

            ...updates,
        };

        await LocationRepository.update(
            updated
        );

        /*
        |--------------------------------------------------------------------------
        | Re-register Geofence
        |--------------------------------------------------------------------------
        */

        await this.registerGeofence(
            updated
        );

        return updated;
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Location
    |--------------------------------------------------------------------------
    */

    static async delete(
        locationId: string
    ): Promise<void> {
        await LocationRepository.delete(
            locationId
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Find By ID
    |--------------------------------------------------------------------------
    */

    static async findById(
        locationId: string
    ): Promise<SavedLocation | null> {
        return LocationRepository.findById(
            locationId
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Find All Locations
    |--------------------------------------------------------------------------
    */

    static async findAll(): Promise<
        SavedLocation[]
    > {
        return LocationRepository.findAll();
    }

    /*
    |--------------------------------------------------------------------------
    | Register Geofence
    |--------------------------------------------------------------------------
    */

    static async registerGeofence(
        location: SavedLocation
    ): Promise<void> {
        const region: GeofenceRegion =
            GeofenceService.createRegion({
                identifier: location.id,

                latitude: location.latitude,

                longitude: location.longitude,

                radius: location.radius,
            });

        await GeofenceService.startMonitoring(
            [region]
        );

        console.log(
            `Geofence registered: ${location.name}`
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Register All Geofences
    |--------------------------------------------------------------------------
    */

    static async registerAllGeofences(): Promise<void> {
        const locations =
            await LocationRepository.findAll();

        const regions: GeofenceRegion[] =
            locations.map((location) =>
                GeofenceService.createRegion({
                    identifier:
                        location.id,

                    latitude:
                        location.latitude,

                    longitude:
                        location.longitude,

                    radius:
                        location.radius,
                })
            );

        await GeofenceService.startMonitoring(
            regions
        );

        console.log(
            `Registered ${regions.length} geofences`
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Handle Enter Event
    |--------------------------------------------------------------------------
    */

    static async handleEnter(
        locationId: string
    ): Promise<void> {
        const location =
            await LocationRepository.findById(
                locationId
            );

        if (!location) {
            return;
        }

        console.log(
            `Entered location: ${location.name}`
        );

        await EventBus.emit(
            GEOFENCE_EVENTS.ENTERED,
            {
                locationId:
                    location.id,

                locationName:
                    location.name,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Handle Exit Event
    |--------------------------------------------------------------------------
    */

    static async handleExit(
        locationId: string
    ): Promise<void> {
        const location =
            await LocationRepository.findById(
                locationId
            );

        if (!location) {
            return;
        }

        console.log(
            `Exited location: ${location.name}`
        );

        await EventBus.emit(
            GEOFENCE_EVENTS.EXITED,
            {
                locationId:
                    location.id,

                locationName:
                    location.name,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Location ID
    |--------------------------------------------------------------------------
    */

    static generateId(): string {
        return (
            "loc_" +
            Math.random()
                .toString(36)
                .substring(2, 12)
        );
    }
}