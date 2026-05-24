// src/shared/store/workflow.store.ts

import { create } from "zustand";

import { Workflow } from "../../core/workflows/types";

import { WorkflowService } from "../../core/workflows/workflow.service";

/*
|--------------------------------------------------------------------------
| Workflow Store State
|--------------------------------------------------------------------------
*/

type WorkflowStore = {
    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    workflows: Workflow[];

    loading: boolean;

    error: string | null;

    /*
    |--------------------------------------------------------------------------
    | Actions
    |--------------------------------------------------------------------------
    */

    loadWorkflows: () => Promise<void>;

    createWorkflow: (
        workflow: Partial<Workflow>
    ) => Promise<void>;

    updateWorkflow: (
        workflowId: string,
        updates: Partial<Workflow>
    ) => Promise<void>;

    deleteWorkflow: (
        workflowId: string
    ) => Promise<void>;

    enableWorkflow: (
        workflowId: string
    ) => Promise<void>;

    disableWorkflow: (
        workflowId: string
    ) => Promise<void>;

    clearError: () => void;
};

/*
|--------------------------------------------------------------------------
| Workflow Store
|--------------------------------------------------------------------------
|
| Global reactive workflow state.
|
| Responsibilities:
| - synchronize UI with workflow engine
| - manage loading state
| - manage errors
| - provide reactive updates
|
*/

export const useWorkflowStore =
    create<WorkflowStore>(
        (set, get) => ({
            /*
            |--------------------------------------------------------------------------
            | Initial State
            |--------------------------------------------------------------------------
            */

            workflows: [],

            loading: false,

            error: null,

            /*
            |--------------------------------------------------------------------------
            | Load Workflows
            |--------------------------------------------------------------------------
            */

            loadWorkflows:
                async () => {
                    try {
                        set({
                            loading: true,

                            error: null,
                        });

                        const workflows =
                            await WorkflowService.findAll();

                        set({
                            workflows,

                            loading: false,
                        });
                    } catch (error) {
                        console.error(
                            "Failed to load workflows:",
                            error
                        );

                        set({
                            loading: false,

                            error:
                                "Failed to load workflows",
                        });
                    }
                },

            /*
            |--------------------------------------------------------------------------
            | Create Workflow
            |--------------------------------------------------------------------------
            */

            createWorkflow:
                async (payload) => {
                    try {
                        set({
                            loading: true,

                            error: null,
                        });

                        await WorkflowService.create(
                            payload
                        );

                        await get().loadWorkflows();
                    } catch (error) {
                        console.error(
                            "Failed to create workflow:",
                            error
                        );

                        set({
                            loading: false,

                            error:
                                "Failed to create workflow",
                        });
                    }
                },

            /*
            |--------------------------------------------------------------------------
            | Update Workflow
            |--------------------------------------------------------------------------
            */

            updateWorkflow:
                async (
                    workflowId,
                    updates
                ) => {
                    try {
                        set({
                            loading: true,

                            error: null,
                        });

                        await WorkflowService.update(
                            workflowId,
                            updates
                        );

                        await get().loadWorkflows();
                    } catch (error) {
                        console.error(
                            "Failed to update workflow:",
                            error
                        );

                        set({
                            loading: false,

                            error:
                                "Failed to update workflow",
                        });
                    }
                },

            /*
            |--------------------------------------------------------------------------
            | Delete Workflow
            |--------------------------------------------------------------------------
            */

            deleteWorkflow:
                async (
                    workflowId
                ) => {
                    try {
                        set({
                            loading: true,

                            error: null,
                        });

                        await WorkflowService.delete(
                            workflowId
                        );

                        await get().loadWorkflows();
                    } catch (error) {
                        console.error(
                            "Failed to delete workflow:",
                            error
                        );

                        set({
                            loading: false,

                            error:
                                "Failed to delete workflow",
                        });
                    }
                },

            /*
            |--------------------------------------------------------------------------
            | Enable Workflow
            |--------------------------------------------------------------------------
            */

            enableWorkflow:
                async (
                    workflowId
                ) => {
                    try {
                        await WorkflowService.enable(
                            workflowId
                        );

                        await get().loadWorkflows();
                    } catch (error) {
                        console.error(
                            "Failed to enable workflow:",
                            error
                        );
                    }
                },

            /*
            |--------------------------------------------------------------------------
            | Disable Workflow
            |--------------------------------------------------------------------------
            */

            disableWorkflow:
                async (
                    workflowId
                ) => {
                    try {
                        await WorkflowService.disable(
                            workflowId
                        );

                        await get().loadWorkflows();
                    } catch (error) {
                        console.error(
                            "Failed to disable workflow:",
                            error
                        );
                    }
                },

            /*
            |--------------------------------------------------------------------------
            | Clear Error
            |--------------------------------------------------------------------------
            */

            clearError: () => {
                set({
                    error: null,
                });
            },
        })
    );