// src/core/testing/event-bus.test.ts

import { EventBus } from "../events/event-bus";

/*
|--------------------------------------------------------------------------
| Event Bus Tests
|--------------------------------------------------------------------------
|
| Tests:
| - event subscription
| - event emission
| - one-time listeners
| - listener removal
| - async event handling
|
*/

describe(
    "EventBus",
    () => {
        beforeEach(() => {
            EventBus.clear();
        });

        /*
        |--------------------------------------------------------------------------
        | Event Subscription
        |--------------------------------------------------------------------------
        */

        describe(
            "on + emit",
            () => {
                test(
                    "should subscribe and receive event",
                    async () => {
                        const handler =
                            jest.fn();

                        EventBus.on(
                            "TEST_EVENT",
                            handler
                        );

                        await EventBus.emit(
                            "TEST_EVENT",
                            {
                                message:
                                    "hello",
                            }
                        );

                        expect(
                            handler
                        ).toHaveBeenCalled();

                        expect(
                            handler
                        ).toHaveBeenCalledWith(
                            {
                                message:
                                    "hello",
                            }
                        );
                    }
                );

                test(
                    "should support multiple listeners",
                    async () => {
                        const first =
                            jest.fn();

                        const second =
                            jest.fn();

                        EventBus.on(
                            "MULTI_EVENT",
                            first
                        );

                        EventBus.on(
                            "MULTI_EVENT",
                            second
                        );

                        await EventBus.emit(
                            "MULTI_EVENT"
                        );

                        expect(
                            first
                        ).toHaveBeenCalled();

                        expect(
                            second
                        ).toHaveBeenCalled();
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | One-Time Listener
        |--------------------------------------------------------------------------
        */

        describe(
            "once",
            () => {
                test(
                    "should trigger only once",
                    async () => {
                        const handler =
                            jest.fn();

                        EventBus.once(
                            "ONCE_EVENT",
                            handler
                        );

                        await EventBus.emit(
                            "ONCE_EVENT"
                        );

                        await EventBus.emit(
                            "ONCE_EVENT"
                        );

                        expect(
                            handler
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Remove Listener
        |--------------------------------------------------------------------------
        */

        describe(
            "off",
            () => {
                test(
                    "should remove listener",
                    async () => {
                        const handler =
                            jest.fn();

                        EventBus.on(
                            "REMOVE_EVENT",
                            handler
                        );

                        EventBus.off(
                            "REMOVE_EVENT",
                            handler
                        );

                        await EventBus.emit(
                            "REMOVE_EVENT"
                        );

                        expect(
                            handler
                        ).not.toHaveBeenCalled();
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Async Listeners
        |--------------------------------------------------------------------------
        */

        describe(
            "async handlers",
            () => {
                test(
                    "should support async listeners",
                    async () => {
                        const asyncHandler =
                            jest.fn(
                                async () => {
                                    return Promise.resolve();
                                }
                            );

                        EventBus.on(
                            "ASYNC_EVENT",
                            asyncHandler
                        );

                        await EventBus.emit(
                            "ASYNC_EVENT"
                        );

                        expect(
                            asyncHandler
                        ).toHaveBeenCalled();
                    }
                );

                test(
                    "should not crash on async failure",
                    async () => {
                        EventBus.on(
                            "ERROR_EVENT",
                            async () => {
                                throw new Error(
                                    "Handler failed"
                                );
                            }
                        );

                        await expect(
                            EventBus.emit(
                                "ERROR_EVENT"
                            )
                        ).resolves.not.toThrow();
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Clear Events
        |--------------------------------------------------------------------------
        */

        describe(
            "clear",
            () => {
                test(
                    "should remove all listeners",
                    async () => {
                        const handler =
                            jest.fn();

                        EventBus.on(
                            "CLEAR_EVENT",
                            handler
                        );

                        EventBus.clear();

                        await EventBus.emit(
                            "CLEAR_EVENT"
                        );

                        expect(
                            handler
                        ).not.toHaveBeenCalled();
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Debug Events
        |--------------------------------------------------------------------------
        */

        describe(
            "getEvents",
            () => {
                test(
                    "should expose registered events",
                    () => {
                        const handler =
                            jest.fn();

                        EventBus.on(
                            "DEBUG_EVENT",
                            handler
                        );

                        const events =
                            EventBus.getEvents();

                        expect(
                            events.DEBUG_EVENT
                        ).toBeDefined();

                        expect(
                            events.DEBUG_EVENT
                                .length
                        ).toBe(1);
                    }
                );
            }
        );
    }
);