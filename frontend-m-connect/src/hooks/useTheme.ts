// src/hooks/useTheme.ts

import { useSettings } from '../contexts/SettingsContext';
import { getThemedStyles, Theme } from '../utils/theme';

export const useTheme = (): { theme: Theme; isDark: boolean } => {
  const { darkMode } = useSettings();
  
  return {
    theme: getThemedStyles(darkMode),
    isDark: darkMode,
  };
};