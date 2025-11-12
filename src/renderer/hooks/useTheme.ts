/**
 * useTheme Hook
 *
 * Convenience hook for accessing theme in components
 */

import { useThemeStore } from '../store/themeStore';
import type { Theme, ThemeMode } from '../../types/theme.types';

interface UseTheme {
  mode: ThemeMode;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

/**
 * Hook to access theme state and actions
 */
export function useTheme(): UseTheme {
  const mode = useThemeStore((state) => state.mode);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.actions.toggleTheme);
  const setTheme = useThemeStore((state) => state.actions.setTheme);

  return {
    mode,
    theme,
    toggleTheme,
    setTheme,
  };
}
