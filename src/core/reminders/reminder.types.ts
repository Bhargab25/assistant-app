/*
|--------------------------------------------------------------------------
| Reminder Place Type
|--------------------------------------------------------------------------
*/

export type ReminderPlaceType =
    | "home"
    | "office"
    | "gym"
    | "school"
    | "custom";

/*
|--------------------------------------------------------------------------
| Reminder Priority
|--------------------------------------------------------------------------
*/

export type ReminderPriority =
    | "low"
    | "medium"
    | "high"
    | "critical";

/*
|--------------------------------------------------------------------------
| Reminder Repeat Type
|--------------------------------------------------------------------------
*/

export type ReminderRepeatType =
    | "none"
    | "daily"
    | "weekly"
    | "monthly"
    | "custom";

/*
|--------------------------------------------------------------------------
| Reminder Status
|--------------------------------------------------------------------------
*/

export type ReminderStatus =
    | "pending"
    | "ringing"
    | "completed"
    | "skipped"
    | "snoozed"
    | "missed";

/*
|--------------------------------------------------------------------------
| Reminder Place
|--------------------------------------------------------------------------
*/

export type ReminderPlace =
    {
        id: string;

        name: string;

        type:
        ReminderPlaceType;

        latitude?: number;

        longitude?: number;

        radius?: number;
    };

/*
|--------------------------------------------------------------------------
| Reminder Alarm
|--------------------------------------------------------------------------
*/

export type ReminderAlarm =
    {
        enabled: boolean;

        sound?: string;

        volume?: number;

        vibration?: boolean;

        fullScreen?: boolean;

        loop?: boolean;
    };

/*
|--------------------------------------------------------------------------
| Reminder Assistant
|--------------------------------------------------------------------------
*/

export type ReminderAssistant =
    {
        enabled: boolean;

        voiceEnabled: boolean;

        smartSnooze: boolean;

        aiSuggestions: boolean;

        motivationalMode: boolean;
    };

/*
|--------------------------------------------------------------------------
| Reminder Schedule
|--------------------------------------------------------------------------
*/

export type ReminderSchedule =
    {
        date: string;

        time: string;

        repeat:
        ReminderRepeatType;

        timezone?: string;
    };

/*
|--------------------------------------------------------------------------
| Reminder Runtime
|--------------------------------------------------------------------------
*/

export type ReminderRuntime =
    {
        lastTriggeredAt?: number;

        completedCount: number;

        skippedCount: number;

        snoozedCount: number;

        missedCount: number;

        active: boolean;
    };

/*
|--------------------------------------------------------------------------
| Reminder Entity
|--------------------------------------------------------------------------
|
| THIS IS THE REAL
| APP CORE ENTITY
|
*/

export type Reminder =
    {
        id: string;

        title: string;

        description?: string;

        status:
        ReminderStatus;

        priority:
        ReminderPriority;

        schedule:
        ReminderSchedule;

        place?: ReminderPlace;

        assistant:
        ReminderAssistant;

        alarm:
        ReminderAlarm;

        runtime:
        ReminderRuntime;

        createdAt: number;

        updatedAt: number;
    };