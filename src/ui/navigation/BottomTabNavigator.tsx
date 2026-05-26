import Ionicons from "@expo/vector-icons/Ionicons";

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

import { useTheme } from "../../shared/store/theme.store";

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
|
*/

export default function BottomTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          height: 74,

          paddingBottom: 10,

          paddingTop: 10,

          backgroundColor: colors.surface,

          borderTopColor: colors.borderLight,
        },

        tabBarActiveTintColor: colors.primary,

        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      {/* Dashboard */}

      <Tab.Screen
        name="Dashboard"
        component={HomeDashboardScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Reminders */}

      <Tab.Screen
        name="Reminders"
        component={ReminderListScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "alarm" : "alarm-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Analytics */}

      <Tab.Screen
        name="Analytics"
        component={DashboardAnalyticsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "stats-chart" : "stats-chart-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Automation */}

      <Tab.Screen
        name="Automation"
        component={ReminderAutomationScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "flash" : "flash-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Settings */}

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
