// src/core/geofence/location.repository.ts

import { db } from "../storage/database";

/*
|--------------------------------------------------------------------------
| Saved Location Type
|--------------------------------------------------------------------------
*/

export type SavedLocation = {
    id: string;

    name: string;

    latitude: number;

    longitude: number;

    radius: number;

    createdAt: string;
};

/*
|--------------------------------------------------------------------------
| Location Repository
|--------------------------------------------------------------------------
|
| Handles persistent saved locations.
|
| Examples:
| - Home
| - Office
| - Gym
| - Hospital
| - School
|
*/

export class LocationRepository {
    /*
    |--------------------------------------------------------------------------
    | Create Location
    |--------------------------------------------------------------------------
    */

    static async create(
        location: SavedLocation
    ): Promise<void> {
        const query = `
      INSERT INTO locations (
        id,
        name,
        latitude,
        longitude,
        radius,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?);
    `;

        await db.runAsync(query, [
            location.id,

            location.name,

            location.latitude,

            location.longitude,

            location.radius,

            location.createdAt,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Location
    |--------------------------------------------------------------------------
    */

    static async update(
        location: SavedLocation
    ): Promise<void> {
        const query = `
      UPDATE locations
      SET
        name = ?,
        latitude = ?,
        longitude = ?,
        radius = ?
      WHERE id = ?;
    `;

        await db.runAsync(query, [
            location.name,

            location.latitude,

            location.longitude,

            location.radius,

            location.id,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Location
    |--------------------------------------------------------------------------
    */

    static async delete(
        locationId: string
    ): Promise<void> {
        const query = `
      DELETE FROM locations
      WHERE id = ?;
    `;

        await db.runAsync(query, [
            locationId,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Find By ID
    |--------------------------------------------------------------------------
    */

    static async findById(
        locationId: string
    ): Promise<SavedLocation | null> {
        const query = `
      SELECT *
      FROM locations
      WHERE id = ?
      LIMIT 1;
    `;

        const result =
            await db.getFirstAsync<{
                id: string;

                name: string;

                latitude: number;

                longitude: number;

                radius: number;

                created_at: string;
            }>(query, [locationId]);

        if (!result) {
            return null;
        }

        return {
            id: result.id,

            name: result.name,

            latitude: result.latitude,

            longitude: result.longitude,

            radius: result.radius,

            createdAt:
                result.created_at,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Find All Locations
    |--------------------------------------------------------------------------
    */

    static async findAll(): Promise<
        SavedLocation[]
    > {
        const query = `
      SELECT *
      FROM locations
      ORDER BY created_at DESC;
    `;

        const results =
            await db.getAllAsync<{
                id: string;

                name: string;

                latitude: number;

                longitude: number;

                radius: number;

                created_at: string;
            }>(query);

        return results.map((item) => ({
            id: item.id,

            name: item.name,

            latitude: item.latitude,

            longitude: item.longitude,

            radius: item.radius,

            createdAt:
                item.created_at,
        }));
    }

    /*
    |--------------------------------------------------------------------------
    | Clear All Locations
    |--------------------------------------------------------------------------
    */

    static async clearAll(): Promise<void> {
        const query = `
      DELETE FROM locations;
    `;

        await db.runAsync(query);
    }
}