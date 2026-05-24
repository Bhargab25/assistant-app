import { Text } from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

import HomeDashboardScreen from "../screens/dashboard/HomeDashboardScreen";

/*
|--------------------------------------------------------------------------
| Reminders
|--------------------------------------------------------------------------
*/

import ReminderListScreen from "../screens/reminders/ReminderListScreen";

/*
|--------------------------------------------------------------------------
| Analytics
|--------------------------------------------------------------------------
*/

import DashboardAnalyticsScreen from "../screens/dashboard/DashboardAnalyticsScreen";

/*
|--------------------------------------------------------------------------
| Automation
|--------------------------------------------------------------------------
*/

import ReminderAutomationScreen from "../screens/reminders/ReminderAutomationScreen";

/*
|--------------------------------------------------------------------------
| Settings
|--------------------------------------------------------------------------
*/

import SettingsScreen from "../screens/settings/SettingsScreen";

/*
|--------------------------------------------------------------------------
| Tab Navigator
|--------------------------------------------------------------------------
*/

export type BottomTabParamList = {
  Dashboard: undefined;

  Reminders: undefined;

  Analytics: undefined;

  Automation: undefined;

  Settings: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

/*
|--------------------------------------------------------------------------
| Bottom Tab Navigator
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - primary application navigation
| - module navigation
| - assistant navigation structure
| - runtime module entrypoints
|
*/

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          height: 74,

          paddingBottom: 10,

          paddingTop: 10,
        },

        tabBarActiveTintColor: "#2563eb",

        tabBarInactiveTintColor: "#6b7280",
      }}
    >
      {/* Dashboard */}

      <Tab.Screen
        name="Dashboard"
        component={HomeDashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text
              style={{
                fontSize: 20,

                color,
              }}
            >
              🏠
            </Text>
          ),
        }}
      />

      {/* Reminders */}

      <Tab.Screen
        name="Reminders"
        component={ReminderListScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text
              style={{
                fontSize: 20,

                color,
              }}
            >
              ⏰
            </Text>
          ),
        }}
      />

      {/* Analytics */}

      <Tab.Screen
        name="Analytics"
        component={DashboardAnalyticsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text
              style={{
                fontSize: 20,

                color,
              }}
            >
              📊
            </Text>
          ),
        }}
      />

      {/* Automation */}

      <Tab.Screen
        name="Automation"
        component={ReminderAutomationScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text
              style={{
                fontSize: 20,

                color,
              }}
            >
              ⚡
            </Text>
          ),
        }}
      />

      {/* Settings */}

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text
              style={{
                fontSize: 20,

                color,
              }}
            >
              ⚙️
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
