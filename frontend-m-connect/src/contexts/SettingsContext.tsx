
// src/contexts/SettingsContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";

type Settings = {
  darkMode: boolean;
  notifications: boolean;
  locationAccess: boolean;
};

type SettingsContextType = Settings & {
  setSettings: (s: Settings) => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemTheme = Appearance.getColorScheme() === "dark";

  const [settings, setSettingsState] = useState<Settings>({
    darkMode: systemTheme,
    notifications: true,
    locationAccess: true,
  });

  useEffect(() => {
    AsyncStorage.getItem("APP_SETTINGS").then((stored) => {
      if (stored) setSettingsState(JSON.parse(stored));
    });
  }, []);

  const setSettings = (newSettings: Settings) => {
    setSettingsState(newSettings);
    AsyncStorage.setItem("APP_SETTINGS", JSON.stringify(newSettings));
  };

  return (
    <SettingsContext.Provider value={{ ...settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("SettingsContext missing");
  return ctx;
};
