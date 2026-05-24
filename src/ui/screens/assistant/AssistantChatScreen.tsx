import { useEffect, useMemo, useRef, useState } from "react";

import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  DeviceEventEmitter,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigation } from "@react-navigation/native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation/AppNavigator";

import { AssistantMessage } from "../../../core/assistant/assistant-message.types";

import { generateId } from "../../../shared/utils";

import { ParserService } from "../../../core/parser/parser.service";

import { AssistantOrchestratorService } from "../../../core/assistant/assistant-orchestrator.service";

import { useWorkflowStore } from "../../../shared/store/workflow.store";

import ReminderAssistantCard from "../reminders/ReminderAssistantCard";

import ReminderEditSheet from "../reminders/ReminderEditSheet";

import { ReminderService } from "../../../core/reminders/reminder.service";

import { Reminder } from "../../../core/reminders/reminder.types";

/*
|--------------------------------------------------------------------------
| Assistant Chat Screen
|--------------------------------------------------------------------------
*/

export default function AssistantChatScreen() {
  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [input, setInput] = useState("");

  const [typing, setTyping] = useState(false);

  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const [editVisible, setEditVisible] = useState(false);

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: generateId(),

      role: "assistant",

      content:
        "🤖 Hello! I am your intelligent AI Workflow Assistant.\n\nYou can naturally talk to me like:\n\n• “Remind me every 1 hour to drink water at office”\n• “Wake me at 6 AM tomorrow”\n• “When I enter gym remind me to workout”\n• “Every night remind me to take medicine”",

      createdAt: Date.now(),
    },
  ]);

  /*
  |--------------------------------------------------------------------------
  | Workflow Store
  |--------------------------------------------------------------------------
  */

  const { loadWorkflows } = useWorkflowStore();

  /*
  |--------------------------------------------------------------------------
  | Refs
  |--------------------------------------------------------------------------
  */

  const listRef = useRef<FlatList>(null);

  /*
  |--------------------------------------------------------------------------
  | Open Reminder Edit
  |--------------------------------------------------------------------------
  */

  const openReminderEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);

    setEditVisible(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Save Reminder Edit
  |--------------------------------------------------------------------------
  */

  const saveReminderEdit = async (updates: Partial<Reminder>) => {
    try {
      if (!editingReminder) {
        return;
      }

      /*
        |--------------------------------------------------------------------------
        | Update Reminder
        |--------------------------------------------------------------------------
        */

      await ReminderService.update(
        editingReminder.id,

        {
          ...editingReminder,
          ...updates,
        },
      );

      /*
        |--------------------------------------------------------------------------
        | Reload Updated Reminder
        |--------------------------------------------------------------------------
        */

      const updated = await ReminderService.getById(editingReminder.id);

      if (!updated) {
        return;
      }

      /*
        |--------------------------------------------------------------------------
        | Update Messages
        |--------------------------------------------------------------------------
        */

      setMessages((previous) =>
        previous.map((message) => {
          if (message.reminder?.id !== updated.id) {
            return message;
          }

          return {
            ...message,

            reminder: updated,
          };
        }),
      );

      /*
        |--------------------------------------------------------------------------
        | Assistant Update Message
        |--------------------------------------------------------------------------
        */

      const updatedMessage: AssistantMessage = {
        id: generateId(),

        role: "assistant",

        content: "✅ Your reminder has been updated successfully.",

        createdAt: Date.now(),

        reminder: updated,
      };

      setMessages((previous) => [...previous, updatedMessage]);

      /*
        |--------------------------------------------------------------------------
        | Close Edit
        |--------------------------------------------------------------------------
        */

      setEditVisible(false);

      setEditingReminder(null);
    } catch (error) {
      console.error("Reminder update failed", error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Reminder
  |--------------------------------------------------------------------------
  */

  const deleteReminder = async (reminder: Reminder, messageId: string) => {
    try {
      await ReminderService.delete(reminder.id);

      setMessages((previous) =>
        previous.filter((message) => message.id !== messageId),
      );
    } catch (error) {
      console.error("Reminder deletion failed", error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Toggle Reminder
  |--------------------------------------------------------------------------
  */

  const toggleReminder = async (reminder: Reminder, messageId: string) => {
    try {
      await ReminderService.toggleActive(
        reminder.id,

        !reminder.runtime.active,
      );

      const updated = await ReminderService.getById(reminder.id);

      if (!updated) {
        return;
      }

      setMessages((previous) =>
        previous.map((message) => {
          if (message.id !== messageId) {
            return message;
          }

          return {
            ...message,

            reminder: updated,
          };
        }),
      );
    } catch (error) {
      console.error("Reminder toggle failed", error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Auto Scroll
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({
        animated: true,
      });
    }, 120);
  }, [messages]);

  /*
  |--------------------------------------------------------------------------
  | Send Message
  |--------------------------------------------------------------------------
  */

  const sendMessage = async (textOverride?: string) => {
    try {
      const trimmed = (textOverride !== undefined ? textOverride : input).trim();


      if (!trimmed) {
        return;
      }

      /*
        |--------------------------------------------------------------------------
        | User Message
        |--------------------------------------------------------------------------
        */

      const isSystemMessage = trimmed.startsWith("[system:");

      if (!isSystemMessage) {
        const userMessage: AssistantMessage = {
          id: generateId(),
          role: "user",
          content: trimmed,
          createdAt: Date.now(),
        };

        setMessages((previous) => [...previous, userMessage]);
      }

      if (textOverride === undefined) {
        setInput("");
      }

      setTyping(true);

      setTimeout(async () => {
        try {
          /*
              |--------------------------------------------------------------------------
              | Assistant Runtime
              |--------------------------------------------------------------------------
              */

          const result =
            await AssistantOrchestratorService.processMessage(trimmed);

          /*
              |--------------------------------------------------------------------------
              | Assistant Message
              |--------------------------------------------------------------------------
              */

          let replyContent = result.reply;
          let shouldOpenMap = false;
          let mapLocationName = "";

          const mapActionMatch = replyContent.match(/\[ACTION:OPEN_MAP:(.*?)\]/);
          if (mapActionMatch) {
            shouldOpenMap = true;
            mapLocationName = mapActionMatch[1];
            replyContent = replyContent.replace(mapActionMatch[0], "").trim();
          }

          if (!isSystemMessage) {
            const assistantMessage: AssistantMessage = {
              id: generateId(),
              role: "assistant",
              content: replyContent,
              createdAt: Date.now(),
            };
            setMessages((previous) => [...previous, assistantMessage]);
          }

          if (shouldOpenMap) {
            navigation.navigate("MapSelection", {
              locationName: mapLocationName,
            });
          }

          /*
              |--------------------------------------------------------------------------
              | NLP Parsing (Only when orchestration is complete)
              |--------------------------------------------------------------------------
              */

          if (result.completed && result.originalMessage) {
            const parseResult = await ParserService.parseAndSave(result.originalMessage);

            /*
                |--------------------------------------------------------------------------
                | Workflow Created
                |--------------------------------------------------------------------------
                */

            if (parseResult.success && parseResult.workflow) {
              await loadWorkflows();

              /*
                  |--------------------------------------------------------------------------
                  | Workflow Message
                  |--------------------------------------------------------------------------
                  */

              const workflowMessage: AssistantMessage = {
                id: generateId(),

                role: "assistant",

                content: `✅ Intelligent automation workflow created successfully.\n\n📌 Workflow: ${parseResult.workflow.name}\n\nThe automation is now active inside the background runtime scheduler.`,

                createdAt: Date.now(),
              };

              setMessages((previous) => [...previous, workflowMessage]);

              /*
                  |--------------------------------------------------------------------------
                  | Load Reminders
                  |--------------------------------------------------------------------------
                  */

              const reminders = await ReminderService.getAll();

              /*
                  |--------------------------------------------------------------------------
                  | Latest Reminder
                  |--------------------------------------------------------------------------
                  */

              const latestReminder = reminders[reminders.length - 1];

              /*
                  |--------------------------------------------------------------------------
                  | Reminder Card
                  |--------------------------------------------------------------------------
                  */

              if (latestReminder) {
                const reminderCardMessage: AssistantMessage = {
                  id: generateId(),

                  role: "assistant",

                  content: "Here is your intelligent reminder:",

                  createdAt: Date.now(),

                  reminder: latestReminder,
                };

                setMessages((previous) => [...previous, reminderCardMessage]);
              }
            }
          }
        } catch (innerError) {
          console.error("Assistant runtime failed", innerError);

          /*
              |--------------------------------------------------------------------------
              | Runtime Error
              |--------------------------------------------------------------------------
              */

          const errorMessage: AssistantMessage = {
            id: generateId(),

            role: "assistant",

            content:
              "⚠️ I encountered an internal issue while processing your request.",

            createdAt: Date.now(),
          };

          setMessages((previous) => [...previous, errorMessage]);
        } finally {
          setTyping(false);
        }
      }, 700);
    } catch (error) {
      console.error("Failed sending message", error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Map Saved Listener
  |--------------------------------------------------------------------------
  */
  
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('MAP_LOCATION_SAVED', () => {
      sendMessage("[system:map_saved]");
    });
    return () => subscription.remove();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Render Message
  |--------------------------------------------------------------------------
  */

  const renderMessage = ({ item }: { item: AssistantMessage }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageRow,

          isUser ? styles.userRow : styles.assistantRow,
        ]}
      >
        <View
          style={[
            styles.messageBubble,

            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          {/* Message */}

          {!!item.content && (
            <Text
              style={[
                styles.messageText,

                isUser ? styles.userText : styles.assistantText,
              ]}
            >
              {item.content}
            </Text>
          )}

          {/* Reminder Card */}

          {item.reminder && (
            <ReminderAssistantCard
              reminder={item.reminder}
              onEdit={() => openReminderEdit(item.reminder!)}
              onDelete={() => deleteReminder(item.reminder!, item.id)}
              onToggle={() => toggleReminder(item.reminder!, item.id)}
            />
          )}
        </View>
      </View>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Header Title
  |--------------------------------------------------------------------------
  */

  const title = useMemo(() => "AI Assistant", []);

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>

          <Text style={styles.headerSubtitle}>
            Intelligent Workflow Assistant
          </Text>
        </View>

        {/* Messages */}

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Typing */}

        {typing && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <Text style={styles.typingText}>Assistant is thinking...</Text>
            </View>
          </View>
        )}

        {/* Input */}

        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask or automate something..."
            placeholderTextColor="#9ca3af"
            style={styles.input}
            multiline
          />

          <Pressable style={styles.sendButton} onPress={() => sendMessage()}>
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>

        {/* Reminder Edit Sheet */}

        <ReminderEditSheet
          visible={editVisible}
          reminder={editingReminder}
          onClose={() => {
            setEditVisible(false);

            setEditingReminder(null);
          }}
          onSave={saveReminderEdit}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#f5f7fb",
  },

  keyboard: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 20,

    paddingVertical: 18,

    borderBottomWidth: 1,

    borderBottomColor: "#e5e7eb",

    backgroundColor: "#ffffff",
  },

  headerTitle: {
    fontSize: 26,

    fontWeight: "700",

    color: "#111827",
  },

  headerSubtitle: {
    marginTop: 4,

    fontSize: 14,

    color: "#6b7280",
  },

  messagesContainer: {
    padding: 16,

    paddingBottom: 32,
  },

  messageRow: {
    marginBottom: 14,

    flexDirection: "row",
  },

  assistantRow: {
    justifyContent: "flex-start",
  },

  userRow: {
    justifyContent: "flex-end",
  },

  messageBubble: {
    maxWidth: "82%",

    borderRadius: 20,

    paddingHorizontal: 16,

    paddingVertical: 14,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.05,

    shadowRadius: 2,

    elevation: 1,
  },

  assistantBubble: {
    backgroundColor: "#ffffff",
  },

  userBubble: {
    backgroundColor: "#2563eb",
  },

  messageText: {
    fontSize: 16,

    lineHeight: 24,
  },

  assistantText: {
    color: "#111827",
  },

  userText: {
    color: "#ffffff",
  },

  typingContainer: {
    paddingHorizontal: 16,

    paddingBottom: 10,
  },

  typingBubble: {
    alignSelf: "flex-start",

    backgroundColor: "#ffffff",

    borderRadius: 18,

    paddingHorizontal: 14,

    paddingVertical: 12,
  },

  typingText: {
    color: "#6b7280",

    fontSize: 14,

    fontStyle: "italic",
  },

  inputContainer: {
    flexDirection: "row",

    alignItems: "flex-end",

    paddingHorizontal: 12,

    paddingVertical: 12,

    borderTopWidth: 1,

    borderTopColor: "#e5e7eb",

    backgroundColor: "#ffffff",
  },

  input: {
    flex: 1,

    minHeight: 48,

    maxHeight: 120,

    borderWidth: 1,

    borderColor: "#d1d5db",

    borderRadius: 16,

    paddingHorizontal: 14,

    paddingVertical: 12,

    fontSize: 16,

    backgroundColor: "#f9fafb",

    color: "#111827",
  },

  sendButton: {
    marginLeft: 10,

    backgroundColor: "#2563eb",

    borderRadius: 14,

    paddingHorizontal: 18,

    paddingVertical: 14,
  },

  sendButtonText: {
    color: "#ffffff",

    fontWeight: "600",

    fontSize: 15,
  },
});
