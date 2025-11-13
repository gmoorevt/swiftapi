/**
 * ResponseTabs Component
 *
 * Manages tabbed interface for response viewing (Body, Headers, and Cookies)
 *
 * Constitutional requirements:
 * - Simplicity: Clean tab navigation
 * - Performance: Only renders active tab content
 */

import React, { useState } from 'react';
import { BodyViewer } from './BodyViewer';
import { ResponseHeadersViewer } from './ResponseHeadersViewer';
import { ResponseCookiesViewer } from './ResponseCookiesViewer';
import { useRequestStore } from '../../store/requestStore';
import { useTheme } from '../../hooks/useTheme';

type TabType = 'body' | 'headers' | 'cookies';

// eslint-disable-next-line complexity
export function ResponseTabs(): React.ReactElement {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('body');
  const response = useRequestStore((state) => state.response);

  const headerCount = response?.headers.length ?? 0;
  const cookieCount = response?.cookies.length ?? 0;

  const getTabButtonStyle = (tab: TabType): React.CSSProperties => ({
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: activeTab === tab ? theme.colors.interactive.primary : theme.colors.text.secondary,
    borderBottom: activeTab === tab ? `2px solid ${theme.colors.interactive.primary}` : '2px solid transparent',
    transition: 'all 0.2s',
  });

  return (
    <div>
      {/* Tab buttons */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.colors.border.secondary}`,
          backgroundColor: theme.colors.background.secondary,
        }}
      >
        <button
          onClick={() => setActiveTab('body')}
          style={getTabButtonStyle('body')}
          onMouseEnter={(e) => {
            if (activeTab !== 'body') {
              e.currentTarget.style.color = theme.colors.text.primary;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'body') {
              e.currentTarget.style.color = theme.colors.text.secondary;
            }
          }}
        >
          Body
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          style={getTabButtonStyle('headers')}
          onMouseEnter={(e) => {
            if (activeTab !== 'headers') {
              e.currentTarget.style.color = theme.colors.text.primary;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'headers') {
              e.currentTarget.style.color = theme.colors.text.secondary;
            }
          }}
        >
          Headers
          {response && (
            <span
              style={{
                marginLeft: '8px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: activeTab === 'headers' ? theme.colors.interactive.primary : theme.colors.text.tertiary,
                color: 'white',
                borderRadius: '10px',
              }}
            >
              {headerCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('cookies')}
          style={getTabButtonStyle('cookies')}
          onMouseEnter={(e) => {
            if (activeTab !== 'cookies') {
              e.currentTarget.style.color = theme.colors.text.primary;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'cookies') {
              e.currentTarget.style.color = theme.colors.text.secondary;
            }
          }}
        >
          Cookies
          {response && cookieCount > 0 && (
            <span
              style={{
                marginLeft: '8px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: activeTab === 'cookies' ? theme.colors.interactive.primary : theme.colors.status.success,
                color: 'white',
                borderRadius: '10px',
              }}
            >
              {cookieCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      <div style={{ padding: '24px' }}>
        {activeTab === 'body' && <BodyViewer />}
        {activeTab === 'headers' && <ResponseHeadersViewer />}
        {activeTab === 'cookies' && <ResponseCookiesViewer />}
      </div>
    </div>
  );
}
