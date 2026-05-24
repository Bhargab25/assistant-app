// src/ui/navigation/navigation.service.ts

import {
    createNavigationContainerRef,
} from "@react-navigation/native";

import {
    RootStackParamList,
} from "./AppNavigator";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Global Navigation Ref
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Enables navigation OUTSIDE React components.
|
| REQUIRED FOR:
|
| - alarm runtime navigation
| - workflow runtime navigation
| - notification click navigation
| - background reminder launches
| - assistant runtime routing
|
*/

export const navigationRef =
    createNavigationContainerRef<
        RootStackParamList
    >();

/*
|--------------------------------------------------------------------------
| Navigation Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - runtime navigation
| - alarm screen launch
| - background workflow routing
| - notification routing
| - assistant-first navigation
| - dashboard routing
|
*/

export class NavigationService {
    private static pendingScreen: string | null = null;
    private static pendingParams: any = null;

    static onNavigationReady(): void {
        logInfo("Navigation container is ready");
        if (this.pendingScreen) {
            const screen = this.pendingScreen as any;
            const params = this.pendingParams;
            this.pendingScreen = null;
            this.pendingParams = null;
            
            setTimeout(() => {
                this.navigate(screen, params);
            }, 100);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Navigate
    |--------------------------------------------------------------------------
    */

    static navigate<
        T extends keyof RootStackParamList
    >(
        screen: T,

        params?:
            RootStackParamList[T]
    ): void {
        try {
            /*
            |--------------------------------------------------------------------------
            | Navigation Ready
            |--------------------------------------------------------------------------
            */

            if (
                !navigationRef.isReady()
            ) {
                logWarn(
                    "Navigation container is not ready, queuing navigation",
                    { screen, params }
                );

                this.pendingScreen = screen;
                this.pendingParams = params;

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Navigate
            |--------------------------------------------------------------------------
            */

            navigationRef.navigate(
                screen,
                params
            );

            logInfo(
                "Navigation executed",
                {
                    screen,

                    params,
                }
            );
        } catch (error) {
            logError(
                "Navigation failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Go Back
    |--------------------------------------------------------------------------
    */

    static goBack():
        void {
        try {
            if (
                navigationRef.canGoBack()
            ) {
                navigationRef.goBack();

                logInfo(
                    "Navigation back executed"
                );
            }
        } catch (error) {
            logError(
                "Navigation back failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Open Full Screen Alarm
    |--------------------------------------------------------------------------
    |
    | Used by:
    |
    | - reminder runtime
    | - workflow runtime
    | - notification actions
    | - background reminder engine
    |
    */

    static openAlarm(
        reminderId: string
    ): void {
        try {
            this.navigate(
                "ReminderAlarm",
                {
                    reminderId,
                }
            );

            logInfo(
                "Reminder alarm opened",
                {
                    reminderId,
                }
            );
        } catch (error) {
            logError(
                "Alarm navigation failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Open Reminder Details
    |--------------------------------------------------------------------------
    */

    static openReminderDetails(
        reminderId: string
    ): void {
        try {
            this.navigate(
                "ReminderDetails",
                {
                    reminderId,
                }
            );

            logInfo(
                "Reminder details opened",
                {
                    reminderId,
                }
            );
        } catch (error) {
            logError(
                "Reminder details navigation failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Open Reminder Edit
    |--------------------------------------------------------------------------
    */

    static openEditReminder(
        reminderId: string
    ): void {
        try {
            this.navigate(
                "EditReminder",
                {
                    reminderId,
                }
            );

            logInfo(
                "Reminder edit opened",
                {
                    reminderId,
                }
            );
        } catch (error) {
            logError(
                "Reminder edit navigation failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Open Assistant
    |--------------------------------------------------------------------------
    */

    static openAssistant():
        void {
        try {
            this.navigate(
                "AssistantChat"
            );

            logInfo(
                "Assistant screen opened"
            );
        } catch (error) {
            logError(
                "Assistant navigation failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Open Dashboard
    |--------------------------------------------------------------------------
    */

    static openDashboard():
        void {
        try {
            this.navigate(
                "ReminderDashboard"
            );

            logInfo(
                "Reminder dashboard opened"
            );
        } catch (error) {
            logError(
                "Dashboard navigation failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Open Recommendations
    |--------------------------------------------------------------------------
    */

    static openRecommendations():
        void {
        try {
            this.navigate(
                "ReminderRecommendations"
            );

            logInfo(
                "Recommendations opened"
            );
        } catch (error) {
            logError(
                "Recommendations navigation failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Open Reminder Creation
    |--------------------------------------------------------------------------
    */

    static openCreateReminder():
        void {
        try {
            this.navigate(
                "AssistantChat"
            );

            logInfo(
                "AI Assistant chat opened for reminder creation"
            );
        } catch (error) {
            logError(
                "Create reminder navigation failed",
                error
            );
        }
    }
}