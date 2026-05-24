// src/core/testing/retry.test.ts

import { RetryService } from "../scheduler/retry.service";

import { NotificationService } from "../notifications/notification.service";

import { WorkflowFactory } from "../workflows/workflow.factory";

/*
|--------------------------------------------------------------------------
| Mock Notification Service
|--------------------------------------------------------------------------
*/

jest.mock(
    "../notifications/notification.service",
    () => ({
        NotificationService: {
            sendNow: jest.fn(),
        },
    })
);

/*
|--------------------------------------------------------------------------
| Retry Engine Tests
|--------------------------------------------------------------------------
|
| Tests:
| - retry registration
| - retry queue processing
| - escalation behavior
| - persistent follow-up logic
|
*/

describe(
    "RetryService",
    () => {
        beforeEach(() => {
            jest.clearAllMocks();

            RetryService.clearQueue();
        });

        /*
        |--------------------------------------------------------------------------
        | Retry Registration
        |--------------------------------------------------------------------------
        */

        describe(
            "register",
            () => {
                test(
                    "should register retry task",
                    async () => {
                        const workflow =
                            WorkflowFactory.create({
                                name:
                                    "Hydration Reminder",

                                trigger: {
                                    type:
                                        "interval",

                                    everyMinutes: 60,
                                },

                                actions: [
                                    {
                                        type:
                                            "notify",

                                        title:
                                            "Reminder",

                                        message:
                                            "Drink water",
                                    },
                                ],

                                retryPolicy: {
                                    enabled: true,

                                    retryAfterMinutes: 15,

                                    maxRetries: 3,
                                },
                            });

                        await RetryService.register(
                            workflow,
                            "Reminder",
                            "Drink water"
                        );

                        const queue =
                            RetryService.getQueue();

                        expect(
                            queue.length
                        ).toBe(1);

                        expect(
                            queue[0].workflowId
                        ).toBe(workflow.id);
                    }
                );

                test(
                    "should ignore disabled retry policy",
                    async () => {
                        const workflow =
                            WorkflowFactory.create({
                                name:
                                    "Disabled Retry",

                                trigger: {
                                    type:
                                        "interval",

                                    everyMinutes: 60,
                                },

                                actions: [],

                                retryPolicy: {
                                    enabled: false,

                                    retryAfterMinutes: 15,

                                    maxRetries: 3,
                                },
                            });

                        await RetryService.register(
                            workflow,
                            "Reminder",
                            "Test"
                        );

                        const queue =
                            RetryService.getQueue();

                        expect(
                            queue.length
                        ).toBe(0);
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Queue Processing
        |--------------------------------------------------------------------------
        */

        describe(
            "processQueue",
            () => {
                test(
                    "should process retry queue safely",
                    async () => {
                        await expect(
                            RetryService.processQueue()
                        ).resolves.not.toThrow();
                    }
                );

                test(
                    "should send retry notification",
                    async () => {
                        const workflow =
                            WorkflowFactory.create({
                                name:
                                    "Retry Workflow",

                                trigger: {
                                    type:
                                        "interval",

                                    everyMinutes: 10,
                                },

                                actions: [],

                                retryPolicy: {
                                    enabled: true,

                                    retryAfterMinutes: 0,

                                    maxRetries: 1,
                                },
                            });

                        await RetryService.register(
                            workflow,
                            "Retry Reminder",
                            "Retry message"
                        );

                        await RetryService.processQueue();

                        expect(
                            NotificationService.sendNow
                        ).toHaveBeenCalled();
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Escalation Logic
        |--------------------------------------------------------------------------
        */

        describe(
            "handleEscalation",
            () => {
                test(
                    "should escalate after max retries",
                    async () => {
                        const workflow =
                            WorkflowFactory.create({
                                name:
                                    "Escalation Workflow",

                                trigger: {
                                    type:
                                        "interval",

                                    everyMinutes: 5,
                                },

                                actions: [],

                                retryPolicy: {
                                    enabled: true,

                                    retryAfterMinutes: 0,

                                    maxRetries: 0,
                                },
                            });

                        await RetryService.register(
                            workflow,
                            "Escalation Reminder",
                            "Escalate now"
                        );

                        await RetryService.processQueue();

                        expect(
                            NotificationService.sendNow
                        ).toHaveBeenCalledWith(
                            "Reminder Escalated",
                            "Escalate now"
                        );
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Queue Management
        |--------------------------------------------------------------------------
        */

        describe(
            "queue management",
            () => {
                test(
                    "should clear retry queue",
                    () => {
                        RetryService.clearQueue();

                        expect(
                            RetryService.getQueue()
                                .length
                        ).toBe(0);
                    }
                );

                test(
                    "should return retry queue",
                    () => {
                        const queue =
                            RetryService.getQueue();

                        expect(
                            Array.isArray(queue)
                        ).toBe(true);
                    }
                );
            }
        );
    }
);