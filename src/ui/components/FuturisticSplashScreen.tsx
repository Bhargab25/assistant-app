// src/ui/components/FuturisticSplashScreen.tsx

import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import Svg, { Circle, Line, Path, G, RadialGradient, Defs, Stop } from "react-native-svg";
import { AppBootstrap } from "../../core/app/bootstrap";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/
type Props = {
  onFinish: (error?: string) => void;
};

/*
|--------------------------------------------------------------------------
| Boot Simulation Log Sequence
|--------------------------------------------------------------------------
*/
const BOOT_LOGS_TEMPLATE = [
  { text: "CORE SYSTEM INITIATION...", delay: 200, pct: 5 },
  { text: "PERSISTENT DATABASE: SQLite RUNTIME BOOTED", delay: 350, pct: 15 },
  { text: "SECURE ORCHESTRATION PIPELINES: ESTABLISHED", delay: 250, pct: 25 },
  { text: "COGNITIVE ASSISTANT CORE ENGINE: ACTIVE", delay: 300, pct: 40 },
  { text: "LOCAL NOTIFICATION CHANNEL: ATTACHED [PORT 802]", delay: 200, pct: 50 },
  { text: "AUDIO PROCESSOR: HARDWARE INTERFACE CONNECTED", delay: 350, pct: 65 },
  { text: "SPEECH SYNTHESIS DRIVER: SYNCHRONIZED", delay: 200, pct: 75 },
  { text: "REMINDER SCHEDULER DAEMON: COMPILING MATRIX", delay: 300, pct: 85 },
  { text: "RECOVERY CRON & FAILURE WATCHDOG: STARTED", delay: 250, pct: 95 },
  { text: "INTELLIGENT AGENT RUNTIMES: ONLINE", delay: 300, pct: 100 },
];

export default function FuturisticSplashScreen({ onFinish }: Props) {
  /*
  |--------------------------------------------------------------------------
  | Animation Refs
  |--------------------------------------------------------------------------
  */
  const spinValue1 = useRef(new Animated.Value(0)).current;
  const spinValue2 = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0.95)).current;
  const fadeValue = useRef(new Animated.Value(0)).current; // Main container opacity
  const termFadeValue = useRef(new Animated.Value(0)).current; // Terminal opacity
  const progressAnim = useRef(new Animated.Value(0)).current; // Progress bar width

  /*
  |--------------------------------------------------------------------------
  | Component State
  |--------------------------------------------------------------------------
  */
  const [logs, setLogs] = useState<string[]>([]);
  const [percent, setPercent] = useState(0);

  /*
  |--------------------------------------------------------------------------
  | Run Animations
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    // 1. Fade in the main screen HUD
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // 2. Loop rotations (Clockwise for Ring 1, Counter-Clockwise for Ring 2)
    Animated.loop(
      Animated.timing(spinValue1, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(spinValue2, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 3. Pulse the core AI Logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0.95,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 4. Fade in Terminal Console shortly after start
    Animated.timing(termFadeValue, {
      toValue: 1,
      duration: 600,
      delay: 400,
      useNativeDriver: true,
    }).start();

    /*
    |--------------------------------------------------------------------------
    | Boot Coordination & Simulation
    |--------------------------------------------------------------------------
    */
    let isMounted = true;
    let bootstrapDone = false;
    let simulationDone = false;
    let bootstrapError: string | undefined;

    // Trigger Actual Bootstrap
    const runBootstrap = async () => {
      try {
        // Load persisted theme preference before bootstrap completes
        const { useThemeStore } = require("../../shared/store/theme.store");
        await useThemeStore.getState().initTheme();

        await AppBootstrap.initialize();
        bootstrapDone = true;
        checkAndFinish();
      } catch (err) {
        console.error("Critical Bootstrap Error in Futuristic Screen:", err);
        bootstrapError = err instanceof Error ? err.message : "Failed to initialize application";
        bootstrapDone = true;
        checkAndFinish();
      }
    };

    // Trigger Boot Simulation Logs
    const runSimulation = async () => {
      for (const log of BOOT_LOGS_TEMPLATE) {
        if (!isMounted) return;
        
        await new Promise((resolve) => setTimeout(resolve, log.delay));
        
        if (!isMounted) return;
        setLogs((prev) => [...prev, `[ OK ] ${log.text}`]);
        setPercent(log.pct);

        // Animate the progress bar fill
        Animated.timing(progressAnim, {
          toValue: log.pct / 100,
          duration: log.delay,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false, // width/flex animations don't support native driver
        }).start();
      }

      // Final short delay for a satisfying "Systems Ready" flash
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!isMounted) return;
      
      setLogs((prev) => [...prev, "[ SYSTEM ] REDIRECTING TO RUNTIME CONSOLE..."]);
      await new Promise((resolve) => setTimeout(resolve, 600));

      simulationDone = true;
      checkAndFinish();
    };

    // Check if both the simulation and the actual backend bootstrap have finished
    const checkAndFinish = () => {
      if (bootstrapDone && simulationDone && isMounted) {
        // Smoothly fade out the entire splash HUD before calling onFinish
        Animated.timing(fadeValue, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          if (isMounted) {
            onFinish(bootstrapError);
          }
        });
      }
    };

    void runBootstrap();
    void runSimulation();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Interpolations
  |--------------------------------------------------------------------------
  */
  const spin1 = spinValue1.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const spin2 = spinValue2.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"], // opposite direction
  });

  // Limit terminal logs to the last 4 items to keep the scroll box clean
  const visibleLogs = logs.slice(-4);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      <Animated.View style={[styles.content, { opacity: fadeValue }]}>
        {/* Glow & Grid Background via absolute SVG layer */}
        <View style={StyleSheet.absoluteFill}>
          <Svg height="100%" width="100%">
            <Defs>
              <RadialGradient
                id="bgGlow"
                cx="50%"
                cy="50%"
                rx="60%"
                ry="40%"
                fx="50%"
                fy="50%"
              >
                <Stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.12" />
                <Stop offset="50%" stopColor="#a855f7" stopOpacity="0.04" />
                <Stop offset="100%" stopColor="#020617" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            
            {/* Background Glow */}
            <Circle cx="50%" cy="40%" r="400" fill="url(#bgGlow)" />

            {/* Futuristic Tech Grid / HUD Crosshair Accents */}
            <Line x1="10%" y1="40%" x2="90%" y2="40%" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.15" />
            <Line x1="50%" y1="15%" x2="50%" y2="65%" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.15" />
            
            {/* Tech Corner brackets */}
            <Path d="M 20,40 L 20,20 L 40,20" stroke="#06b6d4" strokeWidth="1.5" fill="none" opacity="0.4" />
            <Path d="M 20,80 L 20,100 L 40,100" stroke="#06b6d4" strokeWidth="1.5" fill="none" opacity="0.4" />
          </Svg>
        </View>

        {/* Central HUD / Animation Core */}
        <View style={styles.hudContainer}>
          {/* Concentric Ring 1 (Outer - Cyan Tech Ring) */}
          <Animated.View style={[styles.ringWrapper, { transform: [{ rotate: spin1 }] }]}>
            <Svg height="260" width="260" viewBox="0 0 260 260">
              <Circle
                cx="130"
                cy="130"
                r="115"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="40 25 15 25"
                fill="none"
                opacity="0.6"
              />
              <Circle
                cx="130"
                cy="130"
                r="125"
                stroke="#0ea5e9"
                strokeWidth="1.0"
                strokeDasharray="5 15"
                fill="none"
                opacity="0.3"
              />
            </Svg>
          </Animated.View>

          {/* Concentric Ring 2 (Inner - Purple Core Ring) */}
          <Animated.View style={[styles.ringWrapper, { transform: [{ rotate: spin2 }] }]}>
            <Svg height="260" width="260" viewBox="0 0 260 260">
              <Circle
                cx="130"
                cy="130"
                r="95"
                stroke="#a855f7"
                strokeWidth="2"
                strokeDasharray="120 15 30 15"
                fill="none"
                opacity="0.75"
              />
              <Circle
                cx="130"
                cy="130"
                r="85"
                stroke="#d946ef"
                strokeWidth="1"
                strokeDasharray="2 6"
                fill="none"
                opacity="0.4"
              />
            </Svg>
          </Animated.View>

          {/* Central Logo Core (Pulsing) */}
          <Animated.View style={[styles.coreWrapper, { transform: [{ scale: pulseValue }] }]}>
            <Image
              source={require("../../../assets/splash-icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Telemetry Branding Text */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>A.E.G.I.S. SYSTEM</Text>
          <Text style={styles.brandSubtitle}>INTELLIGENT COGNITIVE ASSISTANT</Text>
        </View>

        {/* Futuristic Scrolling Console and Progress */}
        <Animated.View style={[styles.terminalContainer, { opacity: termFadeValue }]}>
          {/* Terminal Title Bar */}
          <View style={styles.terminalHeader}>
            <View style={styles.terminalDotContainer}>
              <View style={[styles.terminalDot, { backgroundColor: "#ef4444" }]} />
              <View style={[styles.terminalDot, { backgroundColor: "#eab308" }]} />
              <View style={[styles.terminalDot, { backgroundColor: "#22c55e" }]} />
            </View>
            <Text style={styles.terminalHeaderText}>COGNITIVE DIAGNOSTIC RUNTIME</Text>
            <Text style={styles.terminalPercentText}>{percent}%</Text>
          </View>

          {/* Terminal Output */}
          <View style={styles.terminalLogsContainer}>
            {visibleLogs.map((log, index) => {
              const isLast = index === visibleLogs.length - 1;
              return (
                <Text
                  key={index}
                  style={[
                    styles.logText,
                    isLast ? styles.logTextActive : null,
                  ]}
                  numberOfLines={1}
                >
                  {log}
                </Text>
              );
            })}
            {visibleLogs.length === 0 && (
              <Text style={styles.logText}>[ WAIT ] AWAITING TELEMETRY LINK...</Text>
            )}
          </View>

          {/* Glowing Cyber Progress Bar */}
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </Animated.View>

        {/* Footer Meta */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SECURE PLATFORM ENVELOPE v1.0.0</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

/*
|--------------------------------------------------------------------------
| Styling System
|--------------------------------------------------------------------------
*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  hudContainer: {
    height: 300,
    width: 300,
    marginTop: 60,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  ringWrapper: {
    position: "absolute",
    width: 260,
    height: 260,
    justifyContent: "center",
    alignItems: "center",
  },
  coreWrapper: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(6, 182, 212, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  logo: {
    width: 90,
    height: 90,
  },
  brandContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  brandTitle: {
    fontFamily: "System",
    fontSize: 22,
    fontWeight: "800",
    color: "#F8FAFC",
    letterSpacing: 6,
    textAlign: "center",
  },
  brandSubtitle: {
    fontFamily: "System",
    fontSize: 10,
    fontWeight: "600",
    color: "#06b6d4",
    letterSpacing: 3,
    marginTop: 8,
    textAlign: "center",
  },
  terminalContainer: {
    width: "100%",
    backgroundColor: "rgba(17, 24, 39, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.25)",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 24,
  },
  terminalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(17, 24, 39, 0.95)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(6, 182, 212, 0.15)",
  },
  terminalDotContainer: {
    flexDirection: "row",
  },
  terminalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  terminalHeaderText: {
    fontFamily: "System",
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1.5,
  },
  terminalPercentText: {
    fontFamily: "System",
    fontSize: 10,
    fontWeight: "700",
    color: "#06b6d4",
  },
  terminalLogsContainer: {
    height: 100,
    padding: 16,
    justifyContent: "flex-end",
  },
  logText: {
    fontFamily: "System",
    fontSize: 11,
    color: "#64748b",
    marginBottom: 6,
    fontWeight: "500",
  },
  logTextActive: {
    color: "#38bdf8",
    fontWeight: "700",
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#06b6d4",
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  footer: {
    marginTop: 20,
  },
  footerText: {
    fontFamily: "System",
    fontSize: 9,
    color: "#475569",
    letterSpacing: 2,
  },
});
