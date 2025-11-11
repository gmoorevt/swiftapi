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

type TabName = 'params' | 'headers' | 'body' | 'auth';

interface TabDefinition {
  id: TabName;
  label: string;
  component: React.ReactElement;
}

export function RequestTabs(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabName>('params');

  const tabs: TabDefinition[] = [
    { id: 'params', label: 'Query Params', component: <QueryParamsEditor /> },
    { id: 'headers', label: 'Headers', component: <HeadersEditor /> },
    { id: 'body', label: 'Body', component: <BodyEditor /> },
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
          borderBottom: '2px solid #e0e0e0',
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
              color: activeTab === tab.id ? '#007bff' : '#666',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #007bff' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = '#333';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = '#666';
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
