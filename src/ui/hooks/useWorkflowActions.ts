// src/ui/hooks/useWorkflowActions.ts

import { Alert } from "react-native";

import { useNavigation } from "@react-navigation/native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../navigation/AppNavigator";

import { Workflow } from "../../core/workflows/types";

import { useWorkflowStore } from "../../shared/store/workflow.store";

/*
|--------------------------------------------------------------------------
| Navigation Type
|--------------------------------------------------------------------------
*/

type Navigation =
    NativeStackNavigationProp<RootStackParamList>;

/*
|--------------------------------------------------------------------------
| Workflow Actions Hook
|--------------------------------------------------------------------------
|
| Centralized workflow UI actions.
|
| Responsibilities:
| - navigation
| - workflow actions
| - confirmations
| - UI orchestration
|
*/

export function useWorkflowActions() {
    /*
    |--------------------------------------------------------------------------
    | Navigation
    |--------------------------------------------------------------------------
    */

    const navigation =
        useNavigation<Navigation>();

    /*
    |--------------------------------------------------------------------------
    | Store
    |--------------------------------------------------------------------------
    */

    const {
        enableWorkflow,

        disableWorkflow,

        deleteWorkflow,
    } = useWorkflowStore();

    /*
    |--------------------------------------------------------------------------
    | Open Workflow Details
    |--------------------------------------------------------------------------
    */

    const openWorkflow =
        (
            workflow: Workflow
        ) => {
            navigation.navigate(
                "WorkflowDetails",
                {
                    workflowId:
                        workflow.id,
                }
            );
        };

    /*
    |--------------------------------------------------------------------------
    | Open Create Workflow
    |--------------------------------------------------------------------------
    */

    const openCreateWorkflow =
        () => {
            navigation.navigate(
                "MainTabs",
                {
                    screen: "Create"
                } as any
            );
        };

    /*
    |--------------------------------------------------------------------------
    | Toggle Workflow
    |--------------------------------------------------------------------------
    */

    const toggleWorkflow =
        async (
            workflow: Workflow
        ) => {
            try {
                if (workflow.enabled) {
                    await disableWorkflow(
                        workflow.id
                    );
                } else {
                    await enableWorkflow(
                        workflow.id
                    );
                }
            } catch (error) {
                console.error(error);

                Alert.alert(
                    "Error",
                    "Failed to update workflow"
                );
            }
        };

    /*
    |--------------------------------------------------------------------------
    | Delete Workflow
    |--------------------------------------------------------------------------
    */

    const removeWorkflow =
        (
            workflow: Workflow
        ) => {
            Alert.alert(
                "Delete Workflow",
                `Are you sure you want to delete "${workflow.name}"?`,
                [
                    {
                        text: "Cancel",

                        style: "cancel",
                    },

                    {
                        text: "Delete",

                        style:
                            "destructive",

                        onPress:
                            async () => {
                                try {
                                    await deleteWorkflow(
                                        workflow.id
                                    );
                                } catch (error) {
                                    console.error(
                                        error
                                    );

                                    Alert.alert(
                                        "Error",
                                        "Failed to delete workflow"
                                    );
                                }
                            },
                    },
                ]
            );
        };

    return {
        openWorkflow,

        openCreateWorkflow,

        toggleWorkflow,

        removeWorkflow,
    };
}