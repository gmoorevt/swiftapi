/**
 * Main Application Component
 * SwiftAPI - A fast, lightweight, and privacy-focused API testing client
 */

import React, { useState, useEffect } from 'react';
import { UrlInput } from './components/RequestBuilder/UrlInput';
import { MethodSelector } from './components/RequestBuilder/MethodSelector';
import { SendButton } from './components/RequestBuilder/SendButton';
import { RequestTabs } from './components/RequestBuilder/RequestTabs';
import { StatusDisplay } from './components/ResponseViewer/StatusDisplay';
import { BodyViewer } from './components/ResponseViewer/BodyViewer';
import { HistoryPanel } from './components/HistoryPanel/HistoryPanel';
import { EnvironmentSelector } from './components/EnvironmentSelector/EnvironmentSelector';
import { CollectionSidebar } from './components/CollectionSidebar/CollectionSidebar';
import { SaveRequestDialog } from './components/SaveRequestDialog/SaveRequestDialog';
import { useRequestStore } from './store/requestStore';

function App(): React.ReactElement {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const sendRequest = useRequestStore((state) => state.actions.sendRequest);
  const isLoading = useRequestStore((state) => state.isLoading);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      // Check for Cmd on Mac, Ctrl on Windows/Linux
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isModifierPressed = isMac ? event.metaKey : event.ctrlKey;

      // Ctrl/Cmd + Enter: Send request
      if (isModifierPressed && event.key === 'Enter' && !isLoading) {
        event.preventDefault();
        void sendRequest();
      }

      // Ctrl/Cmd + S: Save request
      if (isModifierPressed && event.key === 's') {
        event.preventDefault();
        setIsSaveDialogOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sendRequest, isLoading]);
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Collections Sidebar */}
      <CollectionSidebar />

      {/* Main Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: '16px 24px',
            borderBottom: '2px solid #e0e0e0',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>SwiftAPI</h1>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '12px',
                color: '#666',
              }}
            >
              Fast, lightweight, privacy-focused API testing
            </p>
          </div>
          <EnvironmentSelector />
        </header>

        {/* Request Builder Section */}
        <section
          style={{
            padding: '24px',
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: 'white',
          }}
        >
          <h2
            style={{
              margin: '0 0 16px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#333',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Request
          </h2>

          {/* URL and Method Row */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <div style={{ width: '140px' }}>
              <MethodSelector />
            </div>
            <div style={{ flex: 1 }}>
              <UrlInput />
            </div>
            <button
              onClick={() => setIsSaveDialogOpen(true)}
              aria-label="Save Request"
              title={`Save Request (${navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? 'Cmd' : 'Ctrl'}+S)`}
              style={{
                width: '100px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: 600,
                border: '1px solid #28a745',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#28a745',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#28a745';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#28a745';
              }}
            >
              Save
            </button>
            <div style={{ width: '120px' }}>
              <SendButton />
            </div>
          </div>

          {/* Tabbed interface for Query Params, Headers, Body, Auth */}
          <RequestTabs />
        </section>

        {/* Response Viewer Section */}
        <section
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: 'white',
          }}
        >
          <div
            style={{
              padding: '16px 24px 0',
            }}
          >
            <h2
              style={{
                margin: '0 0 16px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Response
            </h2>
          </div>

          <StatusDisplay />

          <div
            style={{
              flex: 1,
              padding: '24px',
              overflow: 'auto',
            }}
          >
            <BodyViewer />
          </div>
        </section>

        {/* History Panel (overlay) */}
        <HistoryPanel />

        {/* Save Request Dialog */}
        <SaveRequestDialog open={isSaveDialogOpen} onClose={() => setIsSaveDialogOpen(false)} />
      </div>
    </div>
  );
}

export default App;
