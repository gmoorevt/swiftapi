/**
 * ThemeToggle Component
 *
 * Button to toggle between light and dark themes
 */

import React from 'react';
import { useThemeStore } from '../../store/themeStore';

export function ThemeToggle(): React.ReactElement {
  const mode = useThemeStore((state) => state.mode);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.actions.toggleTheme);

  const isDark = mode === 'dark';
  const icon = isDark ? '☀️' : '🌙';
  const label = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Toggle theme (current: ${mode})`}
      title={label}
      style={{
        width: '40px',
        height: '40px',
        padding: '8px',
        fontSize: '18px',
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: '6px',
        backgroundColor: theme.colors.background.primary,
        color: theme.colors.text.primary,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.background.primary;
      }}
    >
      {icon}
    </button>
  );
}
