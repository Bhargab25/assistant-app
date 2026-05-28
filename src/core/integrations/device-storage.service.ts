// src/core/integrations/device-storage.service.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Device Storage Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - persistent storage
| - workflow persistence
| - runtime persistence
| - assistant memory persistence
|
| IMPORTANT:
| This becomes the REAL
| persistence layer.
|
*/

export class DeviceStorageService {
    /*
    |--------------------------------------------------------------------------
    | Set Value
    |--------------------------------------------------------------------------
    */

    static async set(
        key: string,
        value: unknown
    ): Promise<void> {
        try {
            const serialized =
                JSON.stringify(
                    value
                );

            await AsyncStorage.setItem(
                key,
                serialized
            );

            logInfo(
                "Storage value saved",
                {
                    key,
                }
            );
        } catch (error) {
            logError(
                "Storage set failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Get Value
    |--------------------------------------------------------------------------
    */

    static async get<T>(
        key: string
    ): Promise<T | null> {
        try {
            const value =
                await AsyncStorage.getItem(
                    key
                );

            if (!value) {
                return null;
            }

            return JSON.parse(
                value
            ) as T;
        } catch (error) {
            logError(
                "Storage get failed",
                error
            );

            return null;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Remove Value
    |--------------------------------------------------------------------------
    */

    static async remove(
        key: string
    ): Promise<void> {
        try {
            await AsyncStorage.removeItem(
                key
            );

            logInfo(
                "Storage value removed",
                {
                    key,
                }
            );
        } catch (error) {
            logError(
                "Storage remove failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Clear Storage
    |--------------------------------------------------------------------------
    */

    static async clear():
        Promise<void> {
        try {
            await AsyncStorage.clear();

            logWarn(
                "Device storage cleared"
            );
        } catch (error) {
            logError(
                "Storage clear failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Multi Set
    |--------------------------------------------------------------------------
    */

    static async multiSet(
        entries: Record<
            string,
            unknown
        >
    ): Promise<void> {
        try {
            const payload =
                Object.entries(
                    entries
                ).map(
                    ([key, value]) => [
                        key,
                        JSON.stringify(
                            value
                        ),
                    ] as [string, string]
                );

            await AsyncStorage.multiSet(
                payload
            );

            logInfo(
                "Storage multi-set completed",
                {
                    count:
                        payload.length,
                }
            );
        } catch (error) {
            logError(
                "Storage multi-set failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Multi Get
    |--------------------------------------------------------------------------
    */

    static async multiGet<T>(
        keys: string[]
    ): Promise<
        Record<
            string,
            T | null
        >
    > {
        try {
            const values =
                await AsyncStorage.multiGet(
                    keys
                );

            const result:
                Record<
                    string,
                    T | null
                > = {};

            for (const [
                key,
                value,
            ] of values) {
                result[key] =
                    value
                        ? JSON.parse(
                            value
                        )
                        : null;
            }

            return result;
        } catch (error) {
            logError(
                "Storage multi-get failed",
                error
            );

            return {};
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Has Key
    |--------------------------------------------------------------------------
    */

    static async has(
        key: string
    ): Promise<boolean> {
        try {
            const value =
                await AsyncStorage.getItem(
                    key
                );

            return value !== null;
        } catch (error) {
            logError(
                "Storage has-key check failed",
                error
            );

            return false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Get All Keys
    |--------------------------------------------------------------------------
    */

    static async keys():
        Promise<string[]> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            return [...keys];
        } catch (error) {
            logError(
                "Storage key retrieval failed",
                error
            );

            return [];
        }
    }
}