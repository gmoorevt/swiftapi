/**
 * ThemeToggle Component Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';
import { useThemeStore } from '../../store/themeStore';

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Reset to light theme before each test
    useThemeStore.setState({
      mode: 'light',
      theme: useThemeStore.getState().theme,
    });
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render toggle button', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
    });

    it('should show moon icon when in light mode', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button.textContent).toContain('🌙');
    });

    it('should show sun icon when in dark mode', () => {
      // Set to dark mode
      useThemeStore.getState().actions.setTheme('dark');

      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button.textContent).toContain('☀️');
    });
  });

  describe('Interaction', () => {
    it('should toggle theme when clicked', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });

      // Initially light mode
      expect(useThemeStore.getState().mode).toBe('light');

      // Click to toggle
      await user.click(button);

      // Should now be dark mode
      expect(useThemeStore.getState().mode).toBe('dark');
    });

    it('should toggle theme back to light when clicked twice', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });

      // Click once to go to dark
      await user.click(button);
      expect(useThemeStore.getState().mode).toBe('dark');

      // Click again to go back to light
      await user.click(button);
      expect(useThemeStore.getState().mode).toBe('light');
    });

    it('should update icon when theme changes', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });

      // Initially shows moon
      expect(button.textContent).toContain('🌙');

      // Click to toggle
      await user.click(button);

      // Should now show sun
      expect(button.textContent).toContain('☀️');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toHaveAttribute('aria-label');
    });

    it('should have title attribute for tooltip', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toHaveAttribute('title');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });

      // Focus the button
      button.focus();
      expect(button).toHaveFocus();

      // Press Enter
      await user.keyboard('{Enter}');

      // Should toggle theme
      expect(useThemeStore.getState().mode).toBe('dark');
    });
  });

  describe('Theme Persistence', () => {
    it('should persist theme when toggled', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });

      await user.click(button);

      // Check localStorage
      expect(localStorage.getItem('swiftapi-theme')).toBe('dark');
    });
  });
});
