/**
 * Response Status Bar Component
 *
 * Integrates response tabs with status information on the same line
 */

import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useRequestStore } from '../../store/requestStore';
import { responseStatusBarStyles } from '../../styles/layouts';
import { tabStyles } from '../../styles/common';

type ResponseTab = 'body' | 'cookies' | 'headers';

interface ResponseStatusBarProps {
  activeTab: ResponseTab;
  onTabChange: (tab: ResponseTab) => void;
}

export function ResponseStatusBar({
  activeTab,
  onTabChange,
}: ResponseStatusBarProps): React.ReactElement {
  const { theme } = useTheme();
  const response = useRequestStore((state) => state.response);

  // Get status color based on status code
  const getStatusColor = (): string => {
    if (!response) {
      return theme.colors.text.secondary;
    }

    const status = response.statusCode;
    if (status >= 200 && status < 300) {
      return theme.colors.status.success;
    }
    if (status >= 300 && status < 400) {
      return theme.colors.status.info;
    }
    if (status >= 400 && status < 500) {
      return theme.colors.status.warning;
    }
    if (status >= 500) {
      return theme.colors.status.error;
    }
    return theme.colors.text.secondary;
  };

  // Count cookies and headers
  const cookieCount =
    response?.headers.filter((h) => h.name.toLowerCase() === 'set-cookie').length || 0;
  const headerCount = response?.headers.length || 0;

  const tabs: { id: ResponseTab; label: string; count?: number }[] = [
    { id: 'body', label: 'Body' },
    { id: 'cookies', label: 'Cookies', count: cookieCount },
    { id: 'headers', label: 'Headers', count: headerCount },
  ];

  return (
    <div style={responseStatusBarStyles.container(theme)}>
      {/* Tabs on the left */}
      <div style={responseStatusBarStyles.tabs()}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={isActive ? tabStyles.active(theme) : tabStyles.base(theme)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  Object.assign(e.currentTarget.style, tabStyles.hover(theme));
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  Object.assign(e.currentTarget.style, tabStyles.base(theme));
                }
              }}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  style={{
                    marginLeft: theme.spacing.xs,
                    padding: '2px 6px',
                    fontSize: theme.typography.fontSizes.xs,
                    fontWeight: theme.typography.fontWeights.semibold,
                    backgroundColor: isActive
                      ? theme.colors.interactive.primary + '20'
                      : theme.colors.background.secondary,
                    borderRadius: theme.borderRadius.full,
                    color: isActive
                      ? theme.colors.interactive.primary
                      : theme.colors.text.secondary,
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Status info on the right */}
      {response && (
        <div style={responseStatusBarStyles.statusInfo(theme)}>
          {/* Status Badge */}
          <span
            style={{
              padding: '4px 10px',
              fontSize: theme.typography.fontSizes.sm,
              fontWeight: theme.typography.fontWeights.semibold,
              color: getStatusColor(),
              backgroundColor: getStatusColor() + '20',
              borderRadius: theme.borderRadius.md,
            }}
          >
            {response.statusCode} {response.statusText}
          </span>

          {/* Time */}
          <span
            style={{
              fontWeight: theme.typography.fontWeights.medium,
            }}
          >
            {response.responseTime}ms
          </span>

          {/* Size */}
          <span
            style={{
              fontWeight: theme.typography.fontWeights.medium,
            }}
          >
            {response.formattedSize}
          </span>
        </div>
      )}
    </div>
  );
}
