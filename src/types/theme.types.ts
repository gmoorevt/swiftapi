/**
 * Theme Types
 *
 * Type definitions for theme system
 */

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Backgrounds
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };

  // Text
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };

  // Borders
  border: {
    primary: string;
    secondary: string;
    focus: string;
  };

  // Status colors
  status: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };

  // Interactive elements
  interactive: {
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
  };
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}

// Light theme colors
export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      tertiary: '#f1f8f4',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      tertiary: '#999999',
    },
    border: {
      primary: '#e0e0e0',
      secondary: '#dddddd',
      focus: '#4CAF50',
    },
    status: {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#007bff',
    },
    interactive: {
      primary: '#007bff',
      primaryHover: '#0056b3',
      secondary: '#4CAF50',
      secondaryHover: '#45a049',
    },
  },
};

// Dark theme colors
export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: {
      primary: '#1e1e1e',
      secondary: '#2d2d2d',
      tertiary: '#252525',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0',
      tertiary: '#808080',
    },
    border: {
      primary: '#404040',
      secondary: '#505050',
      focus: '#4ade80',
    },
    status: {
      success: '#4ade80',
      error: '#f87171',
      warning: '#fbbf24',
      info: '#4d9fff',
    },
    interactive: {
      primary: '#4d9fff',
      primaryHover: '#3b82f6',
      secondary: '#4ade80',
      secondaryHover: '#22c55e',
    },
  },
};

export const themes: Record<ThemeMode, Theme> = {
  light: lightTheme,
  dark: darkTheme,
};
