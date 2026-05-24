// src/core/testing/parser.test.ts

import { IntentDetector } from "../parser/intent.detector";

import {
    PARSER_EXAMPLES,
    NLP_EDGE_CASES,
} from "../parser/parser.examples";

/*
|--------------------------------------------------------------------------
| Parser Tests
|--------------------------------------------------------------------------
|
| Tests:
| - intent detection
| - NLP reliability
| - parser regression
| - edge case handling
|
*/

describe(
    "IntentDetector",
    () => {
        /*
        |--------------------------------------------------------------------------
        | Main Parser Examples
        |--------------------------------------------------------------------------
        */

        describe(
            "Parser Examples",
            () => {
                PARSER_EXAMPLES.forEach(
                    (example) => {
                        test(
                            `should detect ${example.expectedIntent} for: "${example.input}"`,
                            () => {
                                const result =
                                    IntentDetector.detect(
                                        example.input
                                    );

                                expect(
                                    result.intent
                                ).toBe(
                                    example.expectedIntent
                                );
                            }
                        );
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Edge Cases
        |--------------------------------------------------------------------------
        */

        describe(
            "Edge Cases",
            () => {
                NLP_EDGE_CASES.forEach(
                    (input) => {
                        test(
                            `should not crash for edge case: "${input}"`,
                            () => {
                                expect(() => {
                                    IntentDetector.detect(
                                        input
                                    );
                                }).not.toThrow();
                            }
                        );
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Interval Reminder
        |--------------------------------------------------------------------------
        */

        test(
            "should extract interval correctly",
            () => {
                const result =
                    IntentDetector.detect(
                        "Every 2 hours remind me to drink water"
                    );

                expect(
                    result.intent
                ).toBe(
                    "interval_reminder"
                );

                if (
                    result.intent ===
                    "interval_reminder"
                ) {
                    expect(
                        result.everyMinutes
                    ).toBe(120);
                }
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Location Reminder
        |--------------------------------------------------------------------------
        */

        test(
            "should extract location correctly",
            () => {
                const result =
                    IntentDetector.detect(
                        "When I enter office remind me to drink water"
                    );

                expect(
                    result.intent
                ).toBe(
                    "location_reminder"
                );

                if (
                    result.intent ===
                    "location_reminder"
                ) {
                    expect(
                        result.locationName
                    ).toBe("office");
                }
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Follow-Up Reminder
        |--------------------------------------------------------------------------
        */

        test(
            "should extract retry interval correctly",
            () => {
                const result =
                    IntentDetector.detect(
                        "If I don't respond remind me again after 30 minutes"
                    );

                expect(
                    result.intent
                ).toBe(
                    "followup_reminder"
                );

                if (
                    result.intent ===
                    "followup_reminder"
                ) {
                    expect(
                        result.retryAfterMinutes
                    ).toBe(30);
                }
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Time Units (sec, min, hour) and Dates (day, date, month)
        |--------------------------------------------------------------------------
        */

        describe(
            "Detailed Time Units and Dates",
            () => {
                test(
                    "should extract seconds (0.5 minutes for 30s) correctly",
                    () => {
                        const result =
                            IntentDetector.detect(
                                "Every 30 seconds remind me to stretch"
                            );

                        expect(result.intent).toBe("interval_reminder");
                        if (result.intent === "interval_reminder") {
                            expect(result.everyMinutes).toBe(0.5);
                        }
                    }
                );

                test(
                    "should extract implicit singular seconds correctly",
                    () => {
                        const result =
                            IntentDetector.detect(
                                "Every second remind me to breathe"
                            );

                        expect(result.intent).toBe("interval_reminder");
                        if (result.intent === "interval_reminder") {
                            expect(result.everyMinutes).toBe(1 / 60);
                        }
                    }
                );

                test(
                    "should extract explicit minutes correctly",
                    () => {
                        const result =
                            IntentDetector.detect(
                                "Every 5 minutes remind me to walk"
                            );

                        expect(result.intent).toBe("interval_reminder");
                        if (result.intent === "interval_reminder") {
                            expect(result.everyMinutes).toBe(5);
                        }
                    }
                );

                test(
                    "should extract implicit minutes correctly",
                    () => {
                        const result =
                            IntentDetector.detect(
                                "every minute remind me to sit up straight"
                            );

                        expect(result.intent).toBe("interval_reminder");
                        if (result.intent === "interval_reminder") {
                            expect(result.everyMinutes).toBe(1);
                        }
                    }
                );

                test(
                    "should extract explicit hours correctly",
                    () => {
                        const result =
                            IntentDetector.detect(
                                "Every 2 hours remind me to drink water"
                            );

                        expect(result.intent).toBe("interval_reminder");
                        if (result.intent === "interval_reminder") {
                            expect(result.everyMinutes).toBe(120);
                        }
                    }
                );

                test(
                    "should extract implicit hours correctly",
                    () => {
                        const result =
                            IntentDetector.detect(
                                "every hour remind me to rest"
                            );

                        expect(result.intent).toBe("interval_reminder");
                        if (result.intent === "interval_reminder") {
                            expect(result.everyMinutes).toBe(60);
                        }
                    }
                );

                test(
                    "should parse relative days (tomorrow) correctly",
                    () => {
                        const result =
                            IntentDetector.detect(
                                "Remind me tomorrow at 3pm to study"
                            );

                        expect(result.intent).toBe("time_reminder");
                    }
                );

                test(
                    "should parse days of the week (Monday) correctly",
                    () => {
                        const result =
                            IntentDetector.detect(
                                "Remind me on Monday at 9am to check email"
                            );

                        expect(result.intent).toBe("time_reminder");
                    }
                );

                test(
                    "should parse dates and months (June 15th) correctly",
                    () => {
                        const result =
                            IntentDetector.detect(
                                "Remind me on June 15th at 10:00 to renew subscription"
                            );

                        expect(result.intent).toBe("time_reminder");
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Unknown Input
        |--------------------------------------------------------------------------
        */

        test(
            "should return unknown for unsupported input",
            () => {
                const result =
                    IntentDetector.detect(
                        "Tell me a joke"
                    );

                expect(
                    result.intent
                ).toBe("unknown");
            }
        );
    }
);