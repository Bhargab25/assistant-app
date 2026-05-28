// src/core/testing/assistant.test.ts

jest.mock("expo-av", () => ({
    Audio: {
        Sound: jest.fn(),
        setIsEnabledAsync: jest.fn(),
        setAudioModeAsync: jest.fn(),
    },
    InterruptionModeAndroid: {},
    InterruptionModeIOS: {},
}));

jest.mock("@react-navigation/native", () => ({
    createNavigationContainerRef: () => ({
        isReady: jest.fn(() => true),
        navigate: jest.fn(),
        goBack: jest.fn(),
        canGoBack: jest.fn(() => true),
    }),
}));

jest.mock("expo-notifications", () => ({
    scheduleNotificationAsync: jest.fn(),
    cancelScheduledNotificationAsync: jest.fn(),
    cancelAllScheduledNotificationsAsync: jest.fn(),
    getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
    getPermissionsAsync: jest.fn(),
    requestPermissionsAsync: jest.fn(),
    addNotificationResponseReceivedListener: jest.fn(),
    setNotificationHandler: jest.fn(),
    setNotificationChannelAsync: jest.fn(),
    AndroidImportance: {
        HIGH: 4,
        MAX: 5,
        DEFAULT: 3,
    },
    AndroidNotificationPriority: {
        MAX: 2,
        HIGH: 1,
        DEFAULT: 0,
    },
    AndroidNotificationVisibility: {
        PUBLIC: 1,
    },
    SchedulableTriggerInputTypes: {
        DATE: "date",
        TIME_INTERVAL: "timeInterval",
    },
}));

let mockStorage: Record<string, string> = {};
jest.mock("@react-native-async-storage/async-storage", () => ({
    setItem: jest.fn((key, value) => {
        mockStorage[key] = value;
        return Promise.resolve();
    }),
    getItem: jest.fn((key) => {
        return Promise.resolve(mockStorage[key] || null);
    }),
    removeItem: jest.fn((key) => {
        delete mockStorage[key];
        return Promise.resolve();
    }),
    clear: jest.fn(() => {
        mockStorage = {};
        return Promise.resolve();
    }),
    multiSet: jest.fn(),
    multiGet: jest.fn(() => Promise.resolve([])),
    getAllKeys: jest.fn(() => Promise.resolve([])),
}));

let mockWorkflows: Record<string, any> = {};
jest.mock("expo-sqlite", () => ({
    openDatabaseSync: jest.fn(() => ({
        execSync: jest.fn(),
        prepareSync: jest.fn(() => ({
            executeSync: jest.fn(() => ({
                getFirstSync: jest.fn(),
                getAllSync: jest.fn(() => []),
            })),
            finalizeSync: jest.fn(),
        })),
        execAsync: jest.fn(() => Promise.resolve()),
        runAsync: jest.fn((query, params) => {
            if (query && query.includes("INSERT INTO workflows")) {
                const id = params[0];
                const json = params[2];
                mockWorkflows[id] = { workflow_json: json };
            }
            return Promise.resolve({ changes: 1, lastInsertRowId: 1 });
        }),
        getFirstAsync: jest.fn((query, params) => {
            const normalized = query ? query.toLowerCase() : "";
            if (normalized.includes("workflows") && normalized.includes("id = ?")) {
                const id = params[0];
                return Promise.resolve(mockWorkflows[id] || null);
            }
            return Promise.resolve(null);
        }),
        getAllAsync: jest.fn(() => Promise.resolve([])),
    })),
}));

jest.mock("expo-brightness", () => ({
    requestPermissionsAsync: jest.fn(),
    getBrightnessAsync: jest.fn(),
    setBrightnessAsync: jest.fn(),
}));

jest.mock("expo-speech", () => ({
    speak: jest.fn(),
    stop: jest.fn(),
    isSpeakingAsync: jest.fn(),
}));

jest.mock("expo-location", () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
    startLocationUpdatesAsync: jest.fn(),
    stopLocationUpdatesAsync: jest.fn(),
}));

import { AssistantOrchestratorService } from "../assistant/assistant-orchestrator.service";
import { PendingIntentService } from "../assistant/pending-intent.service";

describe("AssistantOrchestratorService", () => {
    beforeEach(async () => {
        await PendingIntentService.clear();
        mockWorkflows = {};
    });

    afterEach(async () => {
        await PendingIntentService.clear();
        mockWorkflows = {};
    });

    test("should auto-correct spelling of key terms", () => {
        const testCases = [
            { input: "bajar el brilo al 20%", expected: "bajar el brillo al 20%" },
            { input: "set display brightnes to 80%", expected: "set display brightness to 80%" },
            { input: "stummmodus aktiviren", expected: "stummmodus aktivieren" },
            { input: "silente my phone", expected: "silent my phone" }
        ];

        for (const tc of testCases) {
            const corrected = (AssistantOrchestratorService as any).correctSpelling(tc.input);
            expect(corrected).toBe(tc.expected);
        }
    });

    test("should respond with capabilities guide on help query", async () => {
        const result = await AssistantOrchestratorService.processMessage("help");
        expect(result.completed).toBe(false);
        expect(result.reply).toContain("A.E.G.I.S. Core");
        expect(result.reply).toContain("Smart Reminders");
        expect(result.reply).toContain("Display Brightness");
    });

    test("should trigger trigger_type query for brightness adjustments without triggers", async () => {
        const result = await AssistantOrchestratorService.processMessage("set display brightness to 15%");
        expect(result.completed).toBe(false);
        expect(result.reply).toContain("When should I apply this display brightness?");
        
        const hasPending = await PendingIntentService.hasPending();
        expect(hasPending).toBe(true);

        const pending = await PendingIntentService.get();
        expect(pending?.type).toBe("brightness_adjustment");
    });

    test("should trigger trigger_type query for silent mode without triggers", async () => {
        const result = await AssistantOrchestratorService.processMessage("silence my phone");
        expect(result.completed).toBe(false);
        expect(result.reply).toContain("When should I activate silent mode?");
        
        const hasPending = await PendingIntentService.hasPending();
        expect(hasPending).toBe(true);
 
        const pending = await PendingIntentService.get();
        expect(pending?.type).toBe("silent_mode");
    });

    test("should resolve pending brightness adjustment with 'Now' and create workflow successfully", async () => {
        let result = await AssistantOrchestratorService.processMessage("Dim Display");
        expect(result.completed).toBe(false);
        expect(result.reply).toContain("When should I apply this display brightness?");
 
        result = await AssistantOrchestratorService.processMessage("Now");
        expect(result.completed).toBe(true);
        expect(result.reply).toContain("Perfect! I've set your display brightness to 15% immediately.");
 
        const hasPending = await PendingIntentService.hasPending();
        expect(hasPending).toBe(false);
    });
 
    test("should resolve pending silent mode with 'Now' and create workflow successfully", async () => {
        let result = await AssistantOrchestratorService.processMessage("silence my phone");
        expect(result.completed).toBe(false);
        expect(result.reply).toContain("When should I activate silent mode?");
 
        result = await AssistantOrchestratorService.processMessage("Now");
        expect(result.completed).toBe(true);
        expect(result.reply).toContain("Perfect! I've activated silent mode immediately.");
 
        const hasPending = await PendingIntentService.hasPending();
        expect(hasPending).toBe(false);
    });

    test("should execute brightness adjustment immediately in-memory when 'now' is in message and not save to DB", async () => {
        const result = await AssistantOrchestratorService.processMessage("Dim Display Now");
        expect(result.completed).toBe(true);
        expect(result.reply).toContain("Perfect! I've set your display brightness to 15% immediately.");
        
        const ids = Object.keys(mockWorkflows);
        expect(ids.length).toBe(0);
    });

    test("should execute silent mode immediately in-memory when 'now' is in message and not save to DB", async () => {
        const result = await AssistantOrchestratorService.processMessage("silence my phone now");
        expect(result.completed).toBe(true);
        expect(result.reply).toContain("Perfect! I've activated silent mode immediately.");
        
        const ids = Object.keys(mockWorkflows);
        expect(ids.length).toBe(0);
    });
});
