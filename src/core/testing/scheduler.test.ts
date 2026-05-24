// src/core/testing/scheduler.test.ts

import { SchedulerService } from "../scheduler/scheduler.service";

import { TriggerService } from "../triggers/trigger.service";

import { ActionService } from "../actions/action.service";

import { WorkflowFactory } from "../workflows/workflow.factory";

/*
|--------------------------------------------------------------------------
| Mock Services
|--------------------------------------------------------------------------
*/

jest.mock("../triggers/trigger.service");

jest.mock("../actions/action.service");

/*
|--------------------------------------------------------------------------
| Scheduler Tests
|--------------------------------------------------------------------------
|
| Tests:
| - scheduler orchestration
| - trigger evaluation flow
| - action execution flow
| - workflow processing
|
*/

describe(
    "SchedulerService",
    () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        /*
        |--------------------------------------------------------------------------
        | Process Workflow
        |--------------------------------------------------------------------------
        */

        describe(
            "processWorkflow",
            () => {
                test(
                    "should execute workflow when trigger matches",
                    async () => {
                        /*
                        |--------------------------------------------------------------------------
                        | Create Workflow
                        |--------------------------------------------------------------------------
                        */

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
                            });

                        /*
                        |--------------------------------------------------------------------------
                        | Mock Trigger Match
                        |--------------------------------------------------------------------------
                        */

                        (
                            TriggerService.evaluateWorkflow as jest.Mock
                        ).mockResolvedValue(
                            true
                        );

                        /*
                        |--------------------------------------------------------------------------
                        | Execute
                        |--------------------------------------------------------------------------
                        */

                        await SchedulerService.processWorkflow(
                            workflow
                        );

                        /*
                        |--------------------------------------------------------------------------
                        | Assertions
                        |--------------------------------------------------------------------------
                        */

                        expect(
                            TriggerService.evaluateWorkflow
                        ).toHaveBeenCalledWith(
                            workflow
                        );

                        expect(
                            ActionService.executeWorkflow
                        ).toHaveBeenCalledWith(
                            workflow
                        );
                    }
                );

                test(
                    "should skip workflow when trigger does not match",
                    async () => {
                        const workflow =
                            WorkflowFactory.create({
                                name:
                                    "Skipped Workflow",

                                trigger: {
                                    type:
                                        "interval",

                                    everyMinutes: 120,
                                },

                                actions: [
                                    {
                                        type:
                                            "notify",

                                        title:
                                            "Reminder",

                                        message:
                                            "Test",
                                    },
                                ],
                            });

                        /*
                        |--------------------------------------------------------------------------
                        | Mock Trigger Failure
                        |--------------------------------------------------------------------------
                        */

                        (
                            TriggerService.evaluateWorkflow as jest.Mock
                        ).mockResolvedValue(
                            false
                        );

                        /*
                        |--------------------------------------------------------------------------
                        | Execute
                        |--------------------------------------------------------------------------
                        */

                        await SchedulerService.processWorkflow(
                            workflow
                        );

                        /*
                        |--------------------------------------------------------------------------
                        | Assertions
                        |--------------------------------------------------------------------------
                        */

                        expect(
                            ActionService.executeWorkflow
                        ).not.toHaveBeenCalled();
                    }
                );

                test(
                    "should handle trigger errors safely",
                    async () => {
                        const workflow =
                            WorkflowFactory.create({
                                name:
                                    "Error Workflow",

                                trigger: {
                                    type:
                                        "interval",

                                    everyMinutes: 30,
                                },

                                actions: [],
                            });

                        /*
                        |--------------------------------------------------------------------------
                        | Mock Error
                        |--------------------------------------------------------------------------
                        */

                        (
                            TriggerService.evaluateWorkflow as jest.Mock
                        ).mockRejectedValue(
                            new Error(
                                "Trigger failed"
                            )
                        );

                        /*
                        |--------------------------------------------------------------------------
                        | Execute
                        |--------------------------------------------------------------------------
                        */

                        await expect(
                            SchedulerService.processWorkflow(
                                workflow
                            )
                        ).resolves.not.toThrow();
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Scheduler Lifecycle
        |--------------------------------------------------------------------------
        */

        describe(
            "scheduler lifecycle",
            () => {
                test(
                    "should start scheduler safely",
                    async () => {
                        await expect(
                            SchedulerService.start()
                        ).resolves.not.toThrow();
                    }
                );

                test(
                    "should stop scheduler safely",
                    () => {
                        expect(() => {
                            SchedulerService.stop();
                        }).not.toThrow();
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Tick Execution
        |--------------------------------------------------------------------------
        */

        describe(
            "scheduler tick",
            () => {
                test(
                    "should execute tick safely",
                    async () => {
                        await expect(
                            SchedulerService.tick()
                        ).resolves.not.toThrow();
                    }
                );
            }
        );
    }
);