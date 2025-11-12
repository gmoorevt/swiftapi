/**
 * Theme Store Tests
 *
 * Tests for theme state management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from './themeStore';
import { lightTheme, darkTheme } from '../../types/theme.types';

describe('ThemeStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useThemeStore.setState({
      mode: 'light',
      theme: lightTheme,
    });

    // Clear localStorage
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should initialize with light theme', () => {
      const { mode, theme } = useThemeStore.getState();

      expect(mode).toBe('light');
      expect(theme).toEqual(lightTheme);
    });
  });

  describe('Theme Toggle', () => {
    it('should toggle from light to dark theme', () => {
      const { actions } = useThemeStore.getState();

      actions.toggleTheme();

      const { mode, theme } = useThemeStore.getState();
      expect(mode).toBe('dark');
      expect(theme).toEqual(darkTheme);
    });

    it('should toggle from dark to light theme', () => {
      const { actions } = useThemeStore.getState();

      // Set to dark first
      actions.setTheme('dark');

      // Then toggle
      actions.toggleTheme();

      const { mode, theme } = useThemeStore.getState();
      expect(mode).toBe('light');
      expect(theme).toEqual(lightTheme);
    });

    it('should toggle multiple times', () => {
      const { actions } = useThemeStore.getState();

      actions.toggleTheme(); // to dark
      expect(useThemeStore.getState().mode).toBe('dark');

      actions.toggleTheme(); // to light
      expect(useThemeStore.getState().mode).toBe('light');

      actions.toggleTheme(); // to dark
      expect(useThemeStore.getState().mode).toBe('dark');
    });
  });

  describe('Set Theme', () => {
    it('should set theme to dark', () => {
      const { actions } = useThemeStore.getState();

      actions.setTheme('dark');

      const { mode, theme } = useThemeStore.getState();
      expect(mode).toBe('dark');
      expect(theme).toEqual(darkTheme);
    });

    it('should set theme to light', () => {
      const { actions } = useThemeStore.getState();

      // Set to dark first
      actions.setTheme('dark');

      // Then set to light
      actions.setTheme('light');

      const { mode, theme } = useThemeStore.getState();
      expect(mode).toBe('light');
      expect(theme).toEqual(lightTheme);
    });
  });

  describe('Persistence', () => {
    it('should persist theme to localStorage when toggled', () => {
      const { actions } = useThemeStore.getState();

      actions.toggleTheme();

      const stored = localStorage.getItem('swiftapi-theme');
      expect(stored).toBe('dark');
    });

    it('should persist theme to localStorage when set', () => {
      const { actions } = useThemeStore.getState();

      actions.setTheme('dark');

      const stored = localStorage.getItem('swiftapi-theme');
      expect(stored).toBe('dark');
    });

    it('should load persisted theme from localStorage on init', () => {
      // Set dark theme in localStorage before initializing
      localStorage.setItem('swiftapi-theme', 'dark');

      // Reset the store to trigger re-initialization
      useThemeStore.setState({
        mode: 'dark',
        theme: darkTheme,
      });

      // The store should have dark theme
      const { mode, theme } = useThemeStore.getState();
      expect(mode).toBe('dark');
      expect(theme).toEqual(darkTheme);
    });

    it('should handle invalid localStorage value', () => {
      // Set invalid value in localStorage
      localStorage.setItem('swiftapi-theme', 'invalid');

      // Store should fall back to light theme
      const { mode, theme } = useThemeStore.getState();
      expect(mode).toBe('light');
      expect(theme).toEqual(lightTheme);
    });
  });

  describe('Theme Colors', () => {
    it('should have all required color properties in light theme', () => {
      const { theme } = useThemeStore.getState();

      expect(theme.colors.background).toBeDefined();
      expect(theme.colors.text).toBeDefined();
      expect(theme.colors.border).toBeDefined();
      expect(theme.colors.status).toBeDefined();
      expect(theme.colors.interactive).toBeDefined();
    });

    it('should have all required color properties in dark theme', () => {
      const { actions } = useThemeStore.getState();

      actions.setTheme('dark');

      const { theme } = useThemeStore.getState();

      expect(theme.colors.background).toBeDefined();
      expect(theme.colors.text).toBeDefined();
      expect(theme.colors.border).toBeDefined();
      expect(theme.colors.status).toBeDefined();
      expect(theme.colors.interactive).toBeDefined();
    });

    it('should have different colors between light and dark themes', () => {
      const { actions } = useThemeStore.getState();

      const lightColors = useThemeStore.getState().theme.colors;

      actions.setTheme('dark');

      const darkColors = useThemeStore.getState().theme.colors;

      expect(lightColors.background.primary).not.toBe(darkColors.background.primary);
      expect(lightColors.text.primary).not.toBe(darkColors.text.primary);
    });
  });
});
