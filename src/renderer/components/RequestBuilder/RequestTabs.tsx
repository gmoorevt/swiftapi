/**
 * RequestTabs Component
 *
 * Tabbed interface for organizing request configuration:
 * - Query Parameters
 * - Headers
 * - Body
 * - Authentication
 */

import React, { useState } from 'react';
import { QueryParamsEditor } from './QueryParamsEditor';
import { HeadersEditor } from './HeadersEditor';
import { BodyEditor } from './BodyEditor';
import { AuthSection } from './AuthSection';
import { useTheme } from '../../hooks/useTheme';

type TabName = 'params' | 'headers' | 'body' | 'auth';

interface TabDefinition {
  id: TabName;
  label: string;
  component: React.ReactElement;
}

export function RequestTabs(): React.ReactElement {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabName>('body');

  const tabs: TabDefinition[] = [
    { id: 'body', label: 'Body', component: <BodyEditor /> },
    { id: 'params', label: 'Query Params', component: <QueryParamsEditor /> },
    { id: 'headers', label: 'Headers', component: <HeadersEditor /> },
    { id: 'auth', label: 'Authentication', component: <AuthSection /> },
  ];

  return (
    <div style={{ marginTop: '16px' }}>
      {/* Tab Navigation */}
      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: '4px',
          borderBottom: `2px solid ${theme.colors.border.secondary}`,
          marginBottom: '16px',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            id={`${tab.id}-tab`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 600 : 500,
              color: activeTab === tab.id ? theme.colors.interactive.primary : theme.colors.text.secondary,
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid ${theme.colors.interactive.primary}` : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = theme.colors.text.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = theme.colors.text.secondary;
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`${tab.id}-panel`}
          role="tabpanel"
          aria-labelledby={`${tab.id}-tab`}
          hidden={activeTab !== tab.id}
          style={{
            display: activeTab === tab.id ? 'block' : 'none',
          }}
        >
          {tab.component}
        </div>
      ))}
    </div>
  );
}
