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

export interface ThemeSpacing {
  xs: string; // 4px
  sm: string; // 8px
  md: string; // 16px
  lg: string; // 24px
  xl: string; // 32px
  xxl: string; // 48px
}

export interface ThemeShadows {
  none: string;
  sm: string; // Subtle elevation
  md: string; // Card elevation
  lg: string; // Modal elevation
  xl: string; // Dropdown elevation
}

export interface ThemeTransitions {
  fast: string; // 100ms
  normal: string; // 150ms
  slow: string; // 300ms
}

export interface ThemeBorderRadius {
  sm: string; // 3px
  md: string; // 4px
  lg: string; // 6px
  xl: string; // 8px
  full: string; // 9999px
}

export interface ThemeTypography {
  fontSizes: {
    xs: string; // 11px
    sm: string; // 12px
    base: string; // 14px
    lg: string; // 16px
    xl: string; // 18px
    xxl: string; // 20px
  };
  fontWeights: {
    normal: number; // 400
    medium: number; // 500
    semibold: number; // 600
    bold: number; // 700
  };
  lineHeights: {
    tight: number; // 1.2
    normal: number; // 1.5
    relaxed: number; // 1.75
  };
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  shadows: ThemeShadows;
  transitions: ThemeTransitions;
  borderRadius: ThemeBorderRadius;
  typography: ThemeTypography;
}

// Shared design tokens (same for both themes)
const sharedTokens = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  transitions: {
    fast: '100ms ease-in-out',
    normal: '150ms ease-in-out',
    slow: '300ms ease-in-out',
  },
  borderRadius: {
    sm: '3px',
    md: '4px',
    lg: '6px',
    xl: '8px',
    full: '9999px',
  },
  typography: {
    fontSizes: {
      xs: '11px',
      sm: '12px',
      base: '14px',
      lg: '16px',
      xl: '18px',
      xxl: '20px',
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
};

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
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 1px 3px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 6px rgba(0, 0, 0, 0.1)',
    xl: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
  ...sharedTokens,
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
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 1px 3px rgba(0, 0, 0, 0.4)',
    lg: '0 4px 6px rgba(0, 0, 0, 0.4)',
    xl: '0 10px 15px rgba(0, 0, 0, 0.5)',
  },
  ...sharedTokens,
};

export const themes: Record<ThemeMode, Theme> = {
  light: lightTheme,
  dark: darkTheme,
};
