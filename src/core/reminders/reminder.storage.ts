// src/core/reminders/reminder.storage.ts

import AsyncStorage
    from "@react-native-async-storage/async-storage";

import {
    Reminder,
    ReminderStatus,
} from "./reminder.types";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Storage Keys
|--------------------------------------------------------------------------
*/

const STORAGE_KEYS =
{
    reminders:
        "@smart_reminders",

    activeReminder:
        "@active_reminder",
};

/*
|--------------------------------------------------------------------------
| Reminder Storage
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - persistent reminder storage
| - active reminder persistence
| - runtime recovery
| - reminder CRUD persistence
| - storage serialization
|
| THIS IS THE CORE
| PERSISTENCE LAYER
|
*/

export class ReminderStorage {
    /*
    |--------------------------------------------------------------------------
    | Get All Reminders
    |--------------------------------------------------------------------------
    */

    static async getAll():
        Promise<
            Reminder[]
        > {
        try {
            const raw =
                await AsyncStorage.getItem(
                    STORAGE_KEYS.reminders
                );

            if (!raw) {
                return [];
            }

            const reminders =
                JSON.parse(
                    raw
                ) as Reminder[];

            return reminders;
        } catch (error) {
            logError(
                "Failed loading reminders",
                error
            );

            return [];
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Save All Reminders
    |--------------------------------------------------------------------------
    */

    private static async saveAll(
        reminders:
            Reminder[]
    ): Promise<void> {
        try {
            await AsyncStorage.setItem(
                STORAGE_KEYS.reminders,
                JSON.stringify(
                    reminders
                )
            );

            logInfo(
                "Reminders persisted",
                {
                    total:
                        reminders.length,
                }
            );
        } catch (error) {
            logError(
                "Reminder persistence failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Create Reminder
    |--------------------------------------------------------------------------
    */

    static async create(
        reminder:
            Reminder
    ): Promise<void> {
        try {
            const reminders =
                await this.getAll();

            reminders.push(
                reminder
            );

            await this.saveAll(
                reminders
            );

            logInfo(
                "Reminder stored",
                {
                    reminderId:
                        reminder.id,
                }
            );
        } catch (error) {
            logError(
                "Reminder create failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Update Reminder
    |--------------------------------------------------------------------------
    */

    static async update(
        reminderId: string,

        updates:
            Partial<
                Reminder
            >
    ): Promise<void> {
        try {
            const reminders =
                await this.getAll();

            const updated =
                reminders.map(
                    (
                        reminder
                    ) => {
                        if (
                            reminder.id !==
                            reminderId
                        ) {
                            return reminder;
                        }

                        return {
                            ...reminder,

                            ...updates,

                            updatedAt:
                                Date.now(),
                        };
                    }
                );

            await this.saveAll(
                updated
            );

            logInfo(
                "Reminder updated",
                {
                    reminderId,
                }
            );
        } catch (error) {
            logError(
                "Reminder update failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Reminder
    |--------------------------------------------------------------------------
    */

    static async delete(
        reminderId: string
    ): Promise<void> {
        try {
            const reminders =
                await this.getAll();

            const filtered =
                reminders.filter(
                    (
                        reminder
                    ) =>
                        reminder.id !==
                        reminderId
                );

            await this.saveAll(
                filtered
            );

            logInfo(
                "Reminder deleted",
                {
                    reminderId,
                }
            );
        } catch (error) {
            logError(
                "Reminder delete failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Get Reminder By ID
    |--------------------------------------------------------------------------
    */

    static async getById(
        reminderId: string
    ):
        Promise<
            Reminder | null
        > {
        try {
            const reminders =
                await this.getAll();

            const reminder =
                reminders.find(
                    (
                        item
                    ) =>
                        item.id ===
                        reminderId
                );

            return (
                reminder ??
                null
            );
        } catch (error) {
            logError(
                "Reminder lookup failed",
                error
            );

            return null;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Update Status
    |--------------------------------------------------------------------------
    */

    static async updateStatus(
        reminderId: string,

        status:
            ReminderStatus
    ): Promise<void> {
        try {
            await this.update(
                reminderId,
                {
                    status,
                }
            );

            logInfo(
                "Reminder status updated",
                {
                    reminderId,

                    status,
                }
            );
        } catch (error) {
            logError(
                "Reminder status update failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Set Active Reminder
    |--------------------------------------------------------------------------
    */

    static async setActiveReminder(
        reminder:
            Reminder
    ): Promise<void> {
        try {
            await AsyncStorage.setItem(
                STORAGE_KEYS.activeReminder,
                JSON.stringify(
                    reminder
                )
            );

            logInfo(
                "Active reminder persisted",
                {
                    reminderId:
                        reminder.id,
                }
            );
        } catch (error) {
            logError(
                "Active reminder persistence failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Get Active Reminder
    |--------------------------------------------------------------------------
    */

    static async getActiveReminder():
        Promise<
            Reminder | null
        > {
        try {
            const raw =
                await AsyncStorage.getItem(
                    STORAGE_KEYS.activeReminder
                );

            if (!raw) {
                return null;
            }

            return JSON.parse(
                raw
            ) as Reminder;
        } catch (error) {
            logError(
                "Failed loading active reminder",
                error
            );

            return null;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Clear Active Reminder
    |--------------------------------------------------------------------------
    */

    static async clearActiveReminder():
        Promise<void> {
        try {
            await AsyncStorage.removeItem(
                STORAGE_KEYS.activeReminder
            );

            logInfo(
                "Active reminder cleared"
            );
        } catch (error) {
            logError(
                "Failed clearing active reminder",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Clear All
    |--------------------------------------------------------------------------
    */

    static async clearAll():
        Promise<void> {
        try {
            await AsyncStorage.multiRemove(
                [
                    STORAGE_KEYS.reminders,

                    STORAGE_KEYS.activeReminder,
                ]
            );

            logWarn(
                "All reminder storage cleared"
            );
        } catch (error) {
            logError(
                "Storage clear failed",
                error
            );
        }
    }
}