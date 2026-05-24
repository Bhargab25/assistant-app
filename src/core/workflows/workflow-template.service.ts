// src/core/workflows/workflow-template.service.ts

import {
    WorkflowDefinition,
    WorkflowDefinitionService,
} from "./workflow-definition.service";

import {
    generateId,
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Workflow Template
|--------------------------------------------------------------------------
*/

export type WorkflowTemplate =
    {
        id: string;

        name: string;

        description: string;

        category:
        | "reminder"
        | "assistant"
        | "notification"
        | "automation"
        | "productivity";

        workflow:
        Omit<
            WorkflowDefinition,
            | "id"
            | "createdAt"
            | "updatedAt"
        >;
    };

/*
|--------------------------------------------------------------------------
| Workflow Template Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - provide starter workflows
| - generate reusable automation templates
| - simplify workflow creation
|
| IMPORTANT:
| This becomes the FIRST
| user-facing workflow system.
|
*/

export class WorkflowTemplateService {
    /*
    |--------------------------------------------------------------------------
    | Templates
    |--------------------------------------------------------------------------
    */

    private static templates:
        WorkflowTemplate[] =
        [
            /*
            |--------------------------------------------------------------------------
            | Morning Reminder
            |--------------------------------------------------------------------------
            */

            {
                id: generateId(),

                name:
                    "Morning Reminder",

                description:
                    "Daily morning reminder notification",

                category:
                    "reminder",

                workflow: {
                    name:
                        "Morning Reminder Workflow",

                    description:
                        "Daily morning productivity reminder",

                    enabled: true,

                    trigger:
                        "schedule",

                    schedule:
                        "86400000",

                    actions: [
                        {
                            id:
                                generateId(),

                            type:
                                "notification",

                            name:
                                "Morning Notification",

                            enabled: true,

                            config: {
                                title:
                                    "Good Morning",

                                body:
                                    "Start your day with focus and energy.",
                            },
                        },
                    ],
                },
            },

            /*
            |--------------------------------------------------------------------------
            | Assistant Greeting
            |--------------------------------------------------------------------------
            */

            {
                id: generateId(),

                name:
                    "Assistant Greeting",

                description:
                    "Assistant welcome message",

                category:
                    "assistant",

                workflow: {
                    name:
                        "Assistant Greeting Workflow",

                    description:
                        "Send assistant greeting",

                    enabled: true,

                    trigger:
                        "assistant",

                    actions: [
                        {
                            id:
                                generateId(),

                            type:
                                "assistant_message",

                            name:
                                "Greeting Message",

                            enabled: true,

                            config: {
                                message:
                                    "Hello! How can I assist you today?",
                            },
                        },
                    ],
                },
            },

            /*
            |--------------------------------------------------------------------------
            | Focus Mode
            |--------------------------------------------------------------------------
            */

            {
                id: generateId(),

                name:
                    "Focus Mode",

                description:
                    "Enable focus mode reminder",

                category:
                    "productivity",

                workflow: {
                    name:
                        "Focus Mode Workflow",

                    description:
                        "Productivity focus workflow",

                    enabled: true,

                    trigger:
                        "manual",

                    actions: [
                        {
                            id:
                                generateId(),

                            type:
                                "notification",

                            name:
                                "Focus Reminder",

                            enabled: true,

                            config: {
                                title:
                                    "Focus Mode",

                                body:
                                    "Stay focused on your important tasks.",
                            },
                        },

                        {
                            id:
                                generateId(),

                            type:
                                "assistant_message",

                            name:
                                "Focus Assistant",

                            enabled: true,

                            delayMs: 2000,

                            config: {
                                message:
                                    "Focus mode activated successfully.",
                            },
                        },
                    ],
                },
            },
        ];

    /*
    |--------------------------------------------------------------------------
    | Get Templates
    |--------------------------------------------------------------------------
    */

    static getAll():
        WorkflowTemplate[] {
        return this.templates;
    }

    /*
    |--------------------------------------------------------------------------
    | Find Template
    |--------------------------------------------------------------------------
    */

    static findById(
        templateId: string
    ):
        WorkflowTemplate | null {
        return (
            this.templates.find(
                (
                    template
                ) =>
                    template.id ===
                    templateId
            ) ?? null
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Create Workflow From Template
    |--------------------------------------------------------------------------
    */

    static createWorkflow(
        templateId: string
    ):
        WorkflowDefinition | null {
        try {
            const template =
                this.findById(
                    templateId
                );

            if (!template) {
                return null;
            }

            const workflow =
                WorkflowDefinitionService.create(
                    {
                        ...template.workflow,
                    }
                );

            logInfo(
                "Workflow created from template",
                {
                    templateId,

                    workflowId:
                        workflow.id,
                }
            );

            return workflow;
        } catch (error) {
            logError(
                "Workflow template creation failed",
                error
            );

            return null;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Get Templates By Category
    |--------------------------------------------------------------------------
    */

    static getByCategory(
        category:
            WorkflowTemplate["category"]
    ):
        WorkflowTemplate[] {
        return this.templates.filter(
            (
                template
            ) =>
                template.category ===
                category
        );
    }
}