/**
 * Theme Store
 *
 * Zustand store for managing application theme
 */

import { create } from 'zustand';
import { ThemeMode, Theme, themes } from '../../types/theme.types';

const THEME_STORAGE_KEY = 'swiftapi-theme';

interface ThemeState {
  mode: ThemeMode;
  theme: Theme;
  actions: {
    setTheme: (mode: ThemeMode) => void;
    toggleTheme: () => void;
  };
}

/**
 * Get initial theme from localStorage or default to light
 */
function getInitialTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to load theme from localStorage:', error);
  }
  return 'light';
}

/**
 * Persist theme to localStorage
 */
function persistTheme(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (error) {
    console.warn('Failed to persist theme to localStorage:', error);
  }
}

/**
 * Theme Store
 *
 * Central state management for application theme
 */
export const useThemeStore = create<ThemeState>((set) => {
  const initialMode = getInitialTheme();

  return {
    mode: initialMode,
    theme: themes[initialMode],

    actions: {
      setTheme: (mode: ThemeMode) => {
        set({
          mode,
          theme: themes[mode],
        });
        persistTheme(mode);
      },

      toggleTheme: () => {
        set((state) => {
          const newMode: ThemeMode = state.mode === 'light' ? 'dark' : 'light';
          persistTheme(newMode);
          return {
            mode: newMode,
            theme: themes[newMode],
          };
        });
      },
    },
  };
});
