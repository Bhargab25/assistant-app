// src/core/testing/workflow.test.ts

import { WorkflowFactory } from "../workflows/workflow.factory";

import { WorkflowBuilder } from "../parser/workflow.builder";

import { WorkflowSchema } from "../workflows/validators";

import { IntentDetector } from "../parser/intent.detector";

/*
|--------------------------------------------------------------------------
| Workflow Engine Tests
|--------------------------------------------------------------------------
|
| Tests:
| - workflow generation
| - workflow validation
| - workflow defaults
| - NLP → Workflow conversion
|
*/

describe(
    "Workflow Engine",
    () => {
        /*
        |--------------------------------------------------------------------------
        | Workflow Factory
        |--------------------------------------------------------------------------
        */

        describe(
            "WorkflowFactory",
            () => {
                test(
                    "should create valid workflow",
                    () => {
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

                        expect(
                            workflow.id
                        ).toBeDefined();

                        expect(
                            workflow.enabled
                        ).toBe(true);

                        expect(
                            workflow.state
                        ).toBe("idle");
                    }
                );

                test(
                    "should generate unique IDs",
                    () => {
                        const first =
                            WorkflowFactory.generateId();

                        const second =
                            WorkflowFactory.generateId();

                        expect(
                            first
                        ).not.toBe(second);
                    }
                );

                test(
                    "should clone workflow safely",
                    () => {
                        const original =
                            WorkflowFactory.create({
                                name:
                                    "Original Workflow",

                                trigger: {
                                    type:
                                        "interval",

                                    everyMinutes: 30,
                                },

                                actions: [
                                    {
                                        type:
                                            "notify",

                                        title:
                                            "Reminder",

                                        message:
                                            "Stretch",
                                    },
                                ],
                            });

                        const clone =
                            WorkflowFactory.clone(
                                original
                            );

                        expect(
                            clone.id
                        ).not.toBe(
                            original.id
                        );

                        expect(
                            clone.name
                        ).toBe(
                            original.name
                        );
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Workflow Validation
        |--------------------------------------------------------------------------
        */

        describe(
            "Workflow Validation",
            () => {
                test(
                    "should validate correct workflow",
                    () => {
                        const workflow =
                            WorkflowFactory.create({
                                name:
                                    "Test Workflow",

                                trigger: {
                                    type:
                                        "interval",

                                    everyMinutes: 15,
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

                        expect(() => {
                            WorkflowSchema.parse(
                                workflow
                            );
                        }).not.toThrow();
                    }
                );

                test(
                    "should reject invalid workflow",
                    () => {
                        expect(() => {
                            WorkflowSchema.parse({
                                invalid: true,
                            });
                        }).toThrow();
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Workflow Builder
        |--------------------------------------------------------------------------
        */

        describe(
            "WorkflowBuilder",
            () => {
                test(
                    "should build interval workflow",
                    () => {
                        const intent =
                            IntentDetector.detect(
                                "Every 1 hour remind me to drink water"
                            );

                        const workflow =
                            WorkflowBuilder.build(
                                intent
                            );

                        expect(
                            workflow.trigger.type
                        ).toBe(
                            "interval"
                        );

                        expect(
                            workflow.actions.length
                        ).toBeGreaterThan(
                            0
                        );
                    }
                );

                test(
                    "should build location workflow",
                    () => {
                        const intent =
                            IntentDetector.detect(
                                "When I enter office remind me to drink water"
                            );

                        const workflow =
                            WorkflowBuilder.build(
                                intent
                            );

                        expect(
                            workflow.trigger.type
                        ).toBe(
                            "geofence_enter"
                        );
                    }
                );

                test(
                    "should include retry policy",
                    () => {
                        const intent =
                            IntentDetector.detect(
                                "Every 30 minutes remind me to stretch"
                            );

                        const workflow =
                            WorkflowBuilder.build(
                                intent
                            );

                        expect(
                            workflow.retryPolicy
                        ).toBeDefined();

                        expect(
                            workflow.retryPolicy?.enabled
                        ).toBe(true);
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Empty Workflow
        |--------------------------------------------------------------------------
        */

        test(
            "should create default empty workflow",
            () => {
                const workflow =
                    WorkflowFactory.createEmpty();

                expect(
                    workflow.name
                ).toBe(
                    "New Workflow"
                );

                expect(
                    workflow.actions.length
                ).toBeGreaterThan(
                    0
                );
            }
        );
    }
);