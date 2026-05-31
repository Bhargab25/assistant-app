// src/core/reminders/reminder.service.ts

import {
    Reminder,
    ReminderPlace,
    ReminderPriority,
    ReminderRepeatType,
} from "./reminder.types";

import {
    ReminderStorage,
} from "./reminder.storage";

import {
    ReminderScheduler,
} from "./reminder.scheduler";

import {
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Create Reminder Input
|--------------------------------------------------------------------------
*/

export type CreateReminderInput =
    {
        title: string;

        description?: string;

        date: string;

        time: string;

        repeat?:
        ReminderRepeatType;

        priority?:
        ReminderPriority;

        place?:
        ReminderPlace;
    };

/*
|--------------------------------------------------------------------------
| Reminder Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - reminder CRUD
| - reminder scheduling
| - reminder runtime creation
| - place integration
| - alarm integration
|
| THIS BECOMES THE REAL
| APP BUSINESS LOGIC LAYER
|
*/

export class ReminderService {
    /*
    |--------------------------------------------------------------------------
    | Create Reminder
    |--------------------------------------------------------------------------
    */

    static async create(
        input:
            CreateReminderInput
    ): Promise<Reminder> {
        try {
            logInfo(
                "Creating reminder...",
                input
            );

            /*
            |--------------------------------------------------------------------------
            | Reminder Entity
            |--------------------------------------------------------------------------
            */

            const reminder:
                Reminder =
            {
                id:
                    this.generateId(),

                title:
                    input.title,

                description:
                    input.description,

                status:
                    "pending",

                priority:
                    input.priority ??
                    "medium",

                schedule:
                {
                    date:
                        input.date,

                    time:
                        input.time,

                    repeat:
                        input.repeat ??
                        "none",
                },

                place:
                    input.place,

                assistant:
                {
                    enabled:
                        true,

                    voiceEnabled:
                        true,

                    smartSnooze:
                        true,

                    aiSuggestions:
                        true,

                    motivationalMode:
                        true,
                },

                alarm:
                {
                    enabled:
                        true,

                    sound:
                        "default",

                    volume:
                        1,

                    vibration:
                        true,

                    fullScreen:
                        true,

                    loop:
                        true,
                },

                runtime:
                {
                    lastTriggeredAt:
                        undefined,

                    completedCount:
                        0,

                    skippedCount:
                        0,

                    snoozedCount:
                        0,

                    missedCount:
                        0,

                    active:
                        true,
                },

                createdAt:
                    Date.now(),

                updatedAt:
                    Date.now(),
            };

            /*
            |--------------------------------------------------------------------------
            | Persist Reminder
            |--------------------------------------------------------------------------
            */

            await ReminderStorage.create(
                reminder
            );

            /*
            |--------------------------------------------------------------------------
            | Schedule Reminder
            |--------------------------------------------------------------------------
            */

            await ReminderScheduler.schedule(
                reminder
            );

            logInfo(
                "Reminder created successfully",
                {
                    reminderId:
                        reminder.id,
                }
            );

            return reminder;
        } catch (error) {
            logError(
                "Reminder creation failed",
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
            logInfo(
                "Updating reminder...",
                {
                    reminderId,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Persist Updates
            |--------------------------------------------------------------------------
            */

            await ReminderStorage.update(
                reminderId,
                updates
            );

            /*
            |--------------------------------------------------------------------------
            | Reload Reminder
            |--------------------------------------------------------------------------
            */

            const updatedReminder =
                await ReminderStorage.getById(
                    reminderId
                );

            if (
                updatedReminder
            ) {
                /*
                |--------------------------------------------------------------------------
                | Reschedule Alarm
                |--------------------------------------------------------------------------
                */

                await ReminderScheduler.reschedule(
                    updatedReminder
                );
            }

            logInfo(
                "Reminder updated successfully"
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
            logInfo(
                "Deleting reminder...",
                {
                    reminderId,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Cancel Schedule
            |--------------------------------------------------------------------------
            */

            await ReminderScheduler.cancel(
                reminderId
            );

            /*
            |--------------------------------------------------------------------------
            | Delete Reminder
            |--------------------------------------------------------------------------
            */

            await ReminderStorage.delete(
                reminderId
            );

            logInfo(
                "Reminder deleted successfully"
            );
        } catch (error) {
            logError(
                "Reminder deletion failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Get All Reminders
    |--------------------------------------------------------------------------
    */

    static async getAll():
        Promise<
            Reminder[]
        > {
        return ReminderStorage.getAll();
    }

    /*
    |--------------------------------------------------------------------------
    | Get Reminder
    |--------------------------------------------------------------------------
    */

    static async getById(
        reminderId: string
    ):
        Promise<
            Reminder | null
        > {
        return ReminderStorage.getById(
            reminderId
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Toggle Reminder
    |--------------------------------------------------------------------------
    */

    static async toggleActive(
        reminderId: string,

        active: boolean
    ): Promise<void> {
        try {
            const updates: Partial<Reminder> = {
                runtime:
                {
                    lastTriggeredAt:
                        undefined,

                    completedCount:
                        0,

                    skippedCount:
                        0,

                    snoozedCount:
                        0,

                    missedCount:
                        0,

                    active,
                },
            };

            if (active) {
                updates.status = "pending";
            }

            await ReminderStorage.update(
                reminderId,
                updates
            );

            const reminder =
                await ReminderStorage.getById(
                    reminderId
                );

            if (!reminder) {
                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Schedule / Cancel
            |--------------------------------------------------------------------------
            */

            if (active) {
                await ReminderScheduler.schedule(
                    reminder
                );
            } else {
                await ReminderScheduler.cancel(
                    reminderId
                );
            }

            logInfo(
                "Reminder active state updated",
                {
                    reminderId,

                    active,
                }
            );
        } catch (error) {
            logError(
                "Reminder toggle failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Generate ID
    |--------------------------------------------------------------------------
    */

    private static generateId():
        string {
        return `reminder_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 9)}`;
    }
}