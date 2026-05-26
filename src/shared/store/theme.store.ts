import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { lightColors, darkColors } from "../theme/colors";

export type ThemeMode = "light" | "dark" | "system";

type ThemeStore = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  initTheme: () => Promise<void>;
};

const THEME_STORAGE_KEY = "@app_theme_mode";

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: "system",
  setMode: async (mode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      set({ mode });
    } catch (error) {
      console.error("Failed to persist theme mode preference:", error);
    }
  },
  initTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        set({ mode: saved as ThemeMode });
      }
    } catch (error) {
      console.error("Failed to load theme mode preference:", error);
    }
  },
}));

export function useTheme() {
  const mode = useThemeStore((state) => state.mode);
  const systemScheme = useColorScheme();

  const isDark = mode === "system" ? systemScheme === "dark" : mode === "dark";
  const colors = isDark ? darkColors : lightColors;

  return {
    mode,
    isDark,
    colors,
  };
}
