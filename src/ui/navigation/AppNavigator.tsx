import { NavigationContainer } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { navigationRef, NavigationService } from "./navigation.service";

/*
|--------------------------------------------------------------------------
| Bottom Tabs
|--------------------------------------------------------------------------
*/

import BottomTabNavigator from "./BottomTabNavigator";

/*
|--------------------------------------------------------------------------
| Reminder Screens
|--------------------------------------------------------------------------
*/

import EditReminderScreen from "../screens/reminders/EditReminderScreen";

import ReminderDetailsScreen from "../screens/reminders/ReminderDetailsScreen";

import ReminderDashboardScreen from "../screens/reminders/ReminderDashboardScreen";

import ReminderRecommendationsScreen from "../screens/reminders/ReminderRecommendationsScreen";

import MapSelectionScreen from "../screens/reminders/MapSelectionScreen";


/*
|--------------------------------------------------------------------------
| Assistant Screens
|--------------------------------------------------------------------------
*/

import AssistantChatScreen from "../screens/assistant/AssistantChatScreen";

/*
|--------------------------------------------------------------------------
| Alarm Runtime
|--------------------------------------------------------------------------
*/

import ReminderAlarmScreen from "../screens/alarm/ReminderAlarmScreen";

/*
|--------------------------------------------------------------------------
| Root Stack Params
|--------------------------------------------------------------------------
*/

export type RootStackParamList = {
  /*
    |--------------------------------------------------------------------------
    | Main App
    |--------------------------------------------------------------------------
    */

  MainTabs: undefined;

  /*
    |--------------------------------------------------------------------------
    | Assistant
    |--------------------------------------------------------------------------
    */

  AssistantChat: undefined;

  /*
    |--------------------------------------------------------------------------
    | Reminder Screens
    |--------------------------------------------------------------------------
    */

  EditReminder: {
    reminderId: string;
  };

  ReminderDetails: {
    reminderId: string;
  };

  ReminderDashboard: undefined;

  ReminderRecommendations: undefined;

  MapSelection: {
    locationName: string;
    onSave: () => void;
  };


  /*
    |--------------------------------------------------------------------------
    | Alarm Runtime
    |--------------------------------------------------------------------------
    */

  ReminderAlarm: {
    reminderId: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/*
|--------------------------------------------------------------------------
| App Navigator
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - root app navigation
| - assistant-first routing
| - reminder routing
| - conversational assistant UX
| - full screen alarm runtime
| - workflow runtime navigation
| - intelligent automation routing
|
*/

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef} onReady={() => NavigationService.onNavigationReady()}>
      <Stack.Navigator
        initialRouteName={"MainTabs"}
        screenOptions={{
          headerShown: false,

          animation: "slide_from_right",
        }}
      >
        {/* Main Application */}

        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

        {/* Assistant */}

        <Stack.Screen name="AssistantChat" component={AssistantChatScreen} />



        {/* Reminder Editing */}

        <Stack.Screen name="EditReminder" component={EditReminderScreen} />

        {/* Reminder Details */}

        <Stack.Screen
          name="ReminderDetails"
          component={ReminderDetailsScreen}
        />

        {/* Reminder Dashboard */}

        <Stack.Screen
          name="ReminderDashboard"
          component={ReminderDashboardScreen}
        />

        {/* AI Recommendations */}

        <Stack.Screen
          name="ReminderRecommendations"
          component={ReminderRecommendationsScreen}
        />

        {/* Map Selection */}

        <Stack.Screen
          name="MapSelection"
          component={MapSelectionScreen}
          options={{
            presentation: "modal",
          }}
        />

        {/* Full Screen Alarm Runtime */}

        <Stack.Screen
          name="ReminderAlarm"
          component={ReminderAlarmScreen}
          options={{
            headerShown: false,

            presentation: "fullScreenModal",

            animation: "fade",

            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
