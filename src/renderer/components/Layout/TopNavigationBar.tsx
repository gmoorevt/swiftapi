/**
 * Top Navigation Bar Component
 *
 * Top bar with request name, environment selector, and actions
 */

import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { topNavBarStyles } from '../../styles/layouts';
import { EnvironmentSelector } from '../EnvironmentSelector/EnvironmentSelector';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

type AppView = 'api-client' | 'mock-servers';

interface TopNavigationBarProps {
  onToggleCollections: () => void;
  isCollectionsOpen: boolean;
  activeView: AppView;
  onViewChange: (view: AppView) => void;
}

export function TopNavigationBar({
  onToggleCollections,
  isCollectionsOpen,
  activeView,
  onViewChange,
}: TopNavigationBarProps): React.ReactElement {
  const { theme } = useTheme();

  return (
    <nav style={topNavBarStyles.container(theme)}>
      {/* Left Section */}
      <div style={topNavBarStyles.left(theme)}>
        {/* Logo/Brand */}
        <div
          style={{
            fontSize: '18px',
            fontWeight: theme.typography.fontWeights.bold,
            color: theme.colors.interactive.primary,
          }}
        >
          SwiftAPI
        </div>

        {/* Divider */}
        <div
          style={{
            height: '24px',
            width: '1px',
            backgroundColor: theme.colors.border.primary,
          }}
        />

        {/* View Switcher */}
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.xs,
            padding: '4px',
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.md,
          }}
        >
          <button
            onClick={() => onViewChange('api-client')}
            style={{
              padding: `${theme.spacing.xs} ${theme.spacing.md}`,
              fontSize: theme.typography.fontSizes.sm,
              fontWeight: theme.typography.fontWeights.medium,
              border: 'none',
              borderRadius: theme.borderRadius.sm,
              backgroundColor:
                activeView === 'api-client' ? theme.colors.background.primary : 'transparent',
              color:
                activeView === 'api-client'
                  ? theme.colors.interactive.primary
                  : theme.colors.text.secondary,
              cursor: 'pointer',
              transition: theme.transitions.normal,
              boxShadow: activeView === 'api-client' ? theme.shadows.sm : 'none',
            }}
          >
            API Client
          </button>
          <button
            onClick={() => onViewChange('mock-servers')}
            style={{
              padding: `${theme.spacing.xs} ${theme.spacing.md}`,
              fontSize: theme.typography.fontSizes.sm,
              fontWeight: theme.typography.fontWeights.medium,
              border: 'none',
              borderRadius: theme.borderRadius.sm,
              backgroundColor:
                activeView === 'mock-servers' ? theme.colors.background.primary : 'transparent',
              color:
                activeView === 'mock-servers'
                  ? theme.colors.interactive.primary
                  : theme.colors.text.secondary,
              cursor: 'pointer',
              transition: theme.transitions.normal,
              boxShadow: activeView === 'mock-servers' ? theme.shadows.sm : 'none',
            }}
          >
            Mock Servers
          </button>
        </div>

        {/* Request Name - Only show in API Client view */}
        {activeView === 'api-client' && (
          <>
            <div
              style={{
                height: '24px',
                width: '1px',
                backgroundColor: theme.colors.border.primary,
              }}
            />
            <div
              style={{
                fontSize: theme.typography.fontSizes.base,
                fontWeight: theme.typography.fontWeights.medium,
                color: theme.colors.text.primary,
              }}
            >
              Untitled Request
            </div>
          </>
        )}
      </div>

      {/* Right Section */}
      <div style={topNavBarStyles.right(theme)}>
        {/* Collections Toggle Button */}
        <button
          onClick={onToggleCollections}
          style={{
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            fontSize: theme.typography.fontSizes.sm,
            fontWeight: theme.typography.fontWeights.medium,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius.md,
            backgroundColor: isCollectionsOpen ? theme.colors.background.secondary : 'transparent',
            color: theme.colors.text.primary,
            cursor: 'pointer',
            transition: theme.transitions.normal,
          }}
        >
          Collections
        </button>

        {/* Environment Selector */}
        <EnvironmentSelector />

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </nav>
  );
}
