// src/core/integrations/device-usage-monitor.service.ts

import { AppState, AppStateStatus } from "react-native";
import { DeviceStorageService } from "./device-storage.service";
import { logInfo, logWarn, logError } from "../../shared/utils";

export interface UsageMetric {
    timestamp: number;
    hour: number;
    appState: "active" | "background" | "inactive";
    brightness: number;
    volume: number;
    location?: string;
}

const STORAGE_KEY = "device_usage_metrics";
const MAX_METRICS = 150;

export class DeviceUsageMonitorService {
    private static metrics: UsageMetric[] = [];
    private static initialized = false;

    static async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            logInfo("Initializing Device Usage Monitor...");
            const stored = await DeviceStorageService.get<UsageMetric[]>(STORAGE_KEY);
            if (stored && stored.length > 0) {
                this.metrics = stored;
                logInfo(`Loaded ${stored.length} usage metrics from storage.`);
            } else {
                logInfo("No usage metrics found. Generating mock historical activity logs...");
                this.metrics = this.generateMockMetrics();
                await DeviceStorageService.set(STORAGE_KEY, this.metrics);
                logInfo(`Generated and saved ${this.metrics.length} mock usage metrics.`);
            }

            // Register AppState listener
            AppState.addEventListener("change", this.handleAppStateChange);

            this.initialized = true;
            logInfo("Device Usage Monitor initialized successfully.");
        } catch (error) {
            logError("Failed to initialize Device Usage Monitor", error);
        }
    }

    static async logMetric(metric: Partial<UsageMetric>): Promise<void> {
        try {
            const newMetric: UsageMetric = {
                timestamp: Date.now(),
                hour: new Date().getHours(),
                appState: (AppState.currentState === "active" ? "active" : "background") as any,
                brightness: metric.brightness ?? 0.5,
                volume: metric.volume ?? 0.5,
                location: metric.location,
                ...metric,
            };

            this.metrics.push(newMetric);

            // Cap at MAX_METRICS
            if (this.metrics.length > MAX_METRICS) {
                this.metrics = this.metrics.slice(this.metrics.length - MAX_METRICS);
            }

            await DeviceStorageService.set(STORAGE_KEY, this.metrics);
            logInfo("Logged new device usage metric", newMetric);
        } catch (error) {
            logError("Failed to log device usage metric", error);
        }
    }

    static getMetricsSync(): UsageMetric[] {
        return this.metrics;
    }

    static async getMetrics(): Promise<UsageMetric[]> {
        if (!this.initialized) {
            await this.initialize();
        }
        return this.metrics;
    }

    private static handleAppStateChange = (nextAppState: AppStateStatus) => {
        const stateMapping: Record<AppStateStatus, "active" | "background" | "inactive"> = {
            active: "active",
            background: "background",
            inactive: "inactive",
            extension: "background",
            unknown: "inactive",
        } as any;

        const appStateStr = stateMapping[nextAppState] || "inactive";
        void this.logMetric({
            appState: appStateStr,
        });
    };

    private static generateMockMetrics(): UsageMetric[] {
        const mockData: UsageMetric[] = [];
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        const oneDay = 24 * oneHour;

        // Generate data for the past 7 days
        for (let day = 7; day >= 0; day--) {
            const dayStart = now - day * oneDay;

            // Generate a few samples for each day to build specific patterns
            
            // 1. Late-night high brightness pattern: active at 11 PM (23:00) with high brightness
            mockData.push({
                timestamp: dayStart - (now % oneDay) + 23 * oneHour,
                hour: 23,
                appState: "active",
                brightness: 0.85,
                volume: 0.2,
                location: "home",
            });

            // 2. Late-night high brightness pattern 2: active at midnight (00:00) with high brightness
            mockData.push({
                timestamp: dayStart - (now % oneDay) + 0 * oneHour,
                hour: 0,
                appState: "active",
                brightness: 0.9,
                volume: 0.1,
                location: "home",
            });

            // 3. Regular daily work hours muting/silent pattern: volume at 0 around 9 AM to 11 AM
            mockData.push({
                timestamp: dayStart - (now % oneDay) + 9 * oneHour,
                hour: 9,
                appState: "background",
                brightness: 0.5,
                volume: 0.0,
                location: "office",
            });
            mockData.push({
                timestamp: dayStart - (now % oneDay) + 10 * oneHour,
                hour: 10,
                appState: "active",
                brightness: 0.6,
                volume: 0.0,
                location: "office",
            });

            // 4. Repeated daily gym routine pattern: entering gym location around 6 PM
            mockData.push({
                timestamp: dayStart - (now % oneDay) + 18 * oneHour,
                hour: 18,
                appState: "active",
                brightness: 0.7,
                volume: 0.3,
                location: "gym",
            });
        }

        return mockData.sort((a, b) => a.timestamp - b.timestamp);
    }
}
