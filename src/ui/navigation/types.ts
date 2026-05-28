// src/ui/navigation/types.ts

export type BottomTabParamList = {
  Dashboard: undefined;

  Reminders: undefined;

  AssistantChat: undefined;

  Analytics: undefined;

  Automation: undefined;

  Settings: undefined;
};

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
  };

  ManageLocations: undefined;

  /*
  |--------------------------------------------------------------------------
  | Alarm Runtime
  |--------------------------------------------------------------------------
  */

  ReminderAlarm: {
    reminderId: string;
  };

  WorkflowDetails: {
    workflowId: string;
  };

  ActiveAlarm: {
    reminderId: string;
  };
};
