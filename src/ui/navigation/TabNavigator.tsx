// src/ui/navigation/TabNavigator.tsx

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";

import DebugScreen from "../screens/DebugScreen";

import CreateWorkflowScreen from "../screens/CreateWorkflowScreen";

import AssistantChatScreen from "../screens/assistant/AssistantChatScreen";

/*
|--------------------------------------------------------------------------
| Tab Param List
|--------------------------------------------------------------------------
*/

export type RootTabParamList = {
  Home: undefined;

  Chat: undefined;

  Create: undefined;

  Debug: undefined;
};

/*
|--------------------------------------------------------------------------
| Bottom Tabs
|--------------------------------------------------------------------------
*/

const Tab = createBottomTabNavigator<RootTabParamList>();

/*
|--------------------------------------------------------------------------
| Tab Navigator
|--------------------------------------------------------------------------
|
| Main application module navigation.
|
| Modules:
| - Home
| - Chat
| - Create Workflow
| - Debug Runtime
|
|*/

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShadowVisible: false,

        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          height: 64,

          paddingBottom: 8,

          paddingTop: 8,
        },

        tabBarLabelStyle: {
          fontSize: 12,

          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Workflows",
        }}
      />

      <Tab.Screen
        name="Chat"
        component={AssistantChatScreen}
        options={{
          title: "Assistant",
        }}
      />

      <Tab.Screen
        name="Create"
        component={CreateWorkflowScreen}
        options={{
          title: "Create",
        }}
      />

      <Tab.Screen
        name="Debug"
        component={DebugScreen}
        options={{
          title: "Debug",
        }}
      />
    </Tab.Navigator>
  );
}

