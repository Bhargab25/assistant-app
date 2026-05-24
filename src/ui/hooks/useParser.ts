// src/ui/hooks/useParser.ts

import { useState } from "react";

import { Alert } from "react-native";

import { ParserService } from "../../core/parser/parser.service";

import { Workflow } from "../../core/workflows/types";

import { Intent } from "../../core/parser/intent.types";

import { useWorkflowStore } from "../../shared/store/workflow.store";

/*
|--------------------------------------------------------------------------
| Use Parser Hook
|--------------------------------------------------------------------------
|
| Handles:
| - NLP parsing
| - workflow preview
| - workflow creation
| - parser loading/error states
|
*/

export function useParser() {
    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    const [input, setInput] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [intent, setIntent] =
        useState<Intent | null>(null);

    const [workflow, setWorkflow] =
        useState<Workflow | null>(null);

    /*
    |--------------------------------------------------------------------------
    | Store
    |--------------------------------------------------------------------------
    */

    const { loadWorkflows } =
        useWorkflowStore();

    /*
    |--------------------------------------------------------------------------
    | Reset Parser
    |--------------------------------------------------------------------------
    */

    const reset = () => {
        setIntent(null);

        setWorkflow(null);

        setError(null);
    };

    /*
    |--------------------------------------------------------------------------
    | Parse Input
    |--------------------------------------------------------------------------
    */

    const parse =
        async (): Promise<boolean> => {
            try {
                /*
                |--------------------------------------------------------------------------
                | Validate
                |--------------------------------------------------------------------------
                */

                if (!input.trim()) {
                    setError(
                        "Please enter an instruction"
                    );

                    return false;
                }

                setLoading(true);

                setError(null);

                /*
                |--------------------------------------------------------------------------
                | Parse Input
                |--------------------------------------------------------------------------
                */

                const result =
                    await ParserService.parse(
                        input
                    );

                /*
                |--------------------------------------------------------------------------
                | Failure
                |--------------------------------------------------------------------------
                */

                if (!result.success) {
                    setError(
                        result.error ??
                        "Parser failed"
                    );

                    return false;
                }

                /*
                |--------------------------------------------------------------------------
                | Save State
                |--------------------------------------------------------------------------
                */

                setIntent(
                    result.intent ?? null
                );

                setWorkflow(
                    result.workflow ?? null
                );

                return true;
            } catch (error) {
                console.error(error);

                setError(
                    "Failed to parse instruction"
                );

                return false;
            } finally {
                setLoading(false);
            }
        };

    /*
    |--------------------------------------------------------------------------
    | Save Workflow
    |--------------------------------------------------------------------------
    */

    const saveWorkflow =
        async (): Promise<boolean> => {
            try {
                setLoading(true);

                setError(null);

                /*
                |--------------------------------------------------------------------------
                | Parse & Save
                |--------------------------------------------------------------------------
                */

                const result =
                    await ParserService.parseAndSave(
                        input
                    );

                if (!result.success) {
                    setError(
                        result.error ??
                        "Failed to save workflow"
                    );

                    return false;
                }

                /*
                |--------------------------------------------------------------------------
                | Reload Workflows
                |--------------------------------------------------------------------------
                */

                await loadWorkflows();

                /*
                |--------------------------------------------------------------------------
                | Reset State
                |--------------------------------------------------------------------------
                */

                setInput("");

                setIntent(null);

                setWorkflow(null);

                Alert.alert(
                    "Success",
                    "Workflow created successfully"
                );

                return true;
            } catch (error) {
                console.error(error);

                setError(
                    "Failed to save workflow"
                );

                return false;
            } finally {
                setLoading(false);
            }
        };

    /*
    |--------------------------------------------------------------------------
    | Clear Error
    |--------------------------------------------------------------------------
    */

    const clearError = () => {
        setError(null);
    };

    return {
        /*
        |--------------------------------------------------------------------------
        | State
        |--------------------------------------------------------------------------
        */

        input,

        loading,

        error,

        intent,

        workflow,

        /*
        |--------------------------------------------------------------------------
        | Actions
        |--------------------------------------------------------------------------
        */

        setInput,

        parse,

        saveWorkflow,

        reset,

        clearError,
    };
}