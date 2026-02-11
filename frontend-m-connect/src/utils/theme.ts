// src/utils/theme.ts

export const colors = {
  light: {
    // Backgrounds
    background: '#F9FAFB',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    
    // Text
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    
    // Primary
    primary: '#10B981',
    primaryLight: '#D1FAE5',
    primaryDark: '#059669',
    
    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Borders
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    
    // Shadows (already light)
    shadow: '#000000',
  },
  dark: {
    // Backgrounds
    background: '#111827',
    surface: '#1F2937',
    card: '#1F2937',
    
    // Text
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    
    // Primary
    primary: '#10B981',
    primaryLight: '#064E3B',
    primaryDark: '#34D399',
    
    // Status
    success: '#10B981',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    
    // Borders
    border: '#374151',
    borderLight: '#4B5563',
    
    // Shadows
    shadow: '#000000',
  },
};

export type Theme = typeof colors.light;

export const getThemedStyles = (isDark: boolean): Theme => {
  return isDark ? colors.dark : colors.light;
};