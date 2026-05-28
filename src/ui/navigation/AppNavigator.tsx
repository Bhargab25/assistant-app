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

import ManageLocationsScreen from "../screens/settings/ManageLocationsScreen";



/*
|--------------------------------------------------------------------------
| Alarm Runtime
|--------------------------------------------------------------------------
*/

import ReminderAlarmScreen from "../screens/alarm/ReminderAlarmScreen";

import { RootStackParamList } from "./types";

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

        {/* Location Management */}

        <Stack.Screen
          name="ManageLocations"
          component={ManageLocationsScreen}
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
