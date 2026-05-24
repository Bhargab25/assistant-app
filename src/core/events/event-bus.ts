// src/core/events/event-bus.ts

/*
|--------------------------------------------------------------------------
| Event Types
|--------------------------------------------------------------------------
*/

export type EventPayload = Record<
    string,
    any
>;

export type EventHandler = (
    payload?: EventPayload
) => void | Promise<void>;

type EventMap = {
    [eventName: string]: EventHandler[];
};

/*
|--------------------------------------------------------------------------
| Event Bus
|--------------------------------------------------------------------------
|
| Central communication layer.
|
| Purpose:
| - decouple modules
| - avoid tight dependencies
| - allow scalable automation
|
| Example:
|
| EventBus.emit("USER_ENTERED_OFFICE")
|
| Then multiple workflows/modules can react independently.
|
*/

export class EventBus {
    /*
    |--------------------------------------------------------------------------
    | Registered Events
    |--------------------------------------------------------------------------
    */

    private static events: EventMap = {};

    /*
    |--------------------------------------------------------------------------
    | Subscribe To Event
    |--------------------------------------------------------------------------
    */

    static on(
        eventName: string,
        handler: EventHandler
    ): void {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }

        this.events[eventName].push(
            handler
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Subscribe Once
    |--------------------------------------------------------------------------
    */

    static once(
        eventName: string,
        handler: EventHandler
    ): void {
        const wrapper: EventHandler =
            async (payload) => {
                await handler(payload);

                this.off(
                    eventName,
                    wrapper
                );
            };

        this.on(eventName, wrapper);
    }

    /*
    |--------------------------------------------------------------------------
    | Remove Listener
    |--------------------------------------------------------------------------
    */

    static off(
        eventName: string,
        handler: EventHandler
    ): void {
        const handlers =
            this.events[eventName];

        if (!handlers) {
            return;
        }

        this.events[eventName] =
            handlers.filter(
                (h) => h !== handler
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Emit Event
    |--------------------------------------------------------------------------
    */

    static async emit(
        eventName: string,
        payload?: EventPayload
    ): Promise<void> {
        const handlers =
            this.events[eventName];

        if (!handlers?.length) {
            return;
        }

        for (const handler of handlers) {
            try {
                await handler(payload);
            } catch (error) {
                console.error(
                    `Event handler failed for "${eventName}"`,
                    error
                );
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Remove All Listeners
    |--------------------------------------------------------------------------
    */

    static clear(): void {
        this.events = {};
    }

    /*
    |--------------------------------------------------------------------------
    | Debug Registered Events
    |--------------------------------------------------------------------------
    */

    static getEvents(): EventMap {
        return this.events;
    }
}