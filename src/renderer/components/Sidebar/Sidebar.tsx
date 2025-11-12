/**
 * Sidebar Component
 *
 * Left navigation sidebar with menu items (Postman-style)
 */

import React from 'react';
import { useTheme } from '../../hooks/useTheme';

type SidebarItem = 'collections' | 'history' | 'environments' | 'mock-servers';

interface SidebarProps {
  activeItem: SidebarItem;
  onItemChange: (item: SidebarItem) => void;
}

export function Sidebar({ activeItem, onItemChange }: SidebarProps): React.ReactElement {
  const { theme } = useTheme();

  const items: { id: SidebarItem; label: string; icon: string }[] = [
    { id: 'collections', label: 'Collections', icon: '📁' },
    { id: 'history', label: 'History', icon: '🕒' },
    { id: 'environments', label: 'Environments', icon: '⚙️' },
    { id: 'mock-servers', label: 'Mock Servers', icon: '🔌' },
  ];

  return (
    <div
      style={{
        width: '60px',
        height: '100vh',
        backgroundColor: theme.colors.background.secondary,
        borderRight: `1px solid ${theme.colors.border.primary}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: theme.spacing.md,
        gap: theme.spacing.sm,
      }}
    >
      {items.map((item) => {
        const isActive = activeItem === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onItemChange(item.id)}
            title={item.label}
            style={{
              width: '48px',
              height: '48px',
              border: 'none',
              borderRadius: theme.borderRadius.md,
              backgroundColor: isActive
                ? theme.colors.interactive.primary + '20'
                : 'transparent',
              color: isActive ? theme.colors.interactive.primary : theme.colors.text.secondary,
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: theme.transitions.normal,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {item.icon}
          </button>
        );
      })}
    </div>
  );
}
