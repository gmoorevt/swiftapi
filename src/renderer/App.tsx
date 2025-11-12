/**
 * Main Application Component
 * SwiftAPI - A fast, lightweight, and privacy-focused API testing client
 */

import React, { useState, useEffect } from 'react';
import { RequestLine } from './components/RequestBuilder/RequestLine';
import { RequestTabs } from './components/RequestBuilder/RequestTabs';
import { ResponseStatusBar } from './components/ResponseViewer/ResponseStatusBar';
import { BodyViewer } from './components/ResponseViewer/BodyViewer';
import { ResponseHeadersViewer } from './components/ResponseViewer/ResponseHeadersViewer';
import { ResponseCookiesViewer } from './components/ResponseViewer/ResponseCookiesViewer';
import { HistoryPanel } from './components/HistoryPanel/HistoryPanel';
import { EnvironmentPanel } from './components/EnvironmentPanel/EnvironmentPanel';
import { SaveRequestDialog } from './components/SaveRequestDialog/SaveRequestDialog';
import { MockServerPanel } from './components/MockServerPanel/MockServerPanel';
import { Sidebar } from './components/Sidebar/Sidebar';
import { EnvironmentSelector } from './components/EnvironmentSelector/EnvironmentSelector';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import { useRequestStore } from './store/requestStore';
import { useThemeStore } from './store/themeStore';

type SidebarItem = 'collections' | 'history' | 'environments' | 'mock-servers';
type ResponseTab = 'body' | 'cookies' | 'headers';

function App(): React.ReactElement {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState<SidebarItem>('collections');
  const [activeResponseTab, setActiveResponseTab] = useState<ResponseTab>('body');
  const sendRequest = useRequestStore((state) => state.actions.sendRequest);
  const isLoading = useRequestStore((state) => state.isLoading);
  const theme = useThemeStore((state) => state.theme);

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
        width: '100vw',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: theme.colors.background.primary,
        color: theme.colors.text.primary,
      }}
    >
      {/* LEFT: Sidebar Navigation */}
      <Sidebar activeItem={activeSidebarItem} onItemChange={setActiveSidebarItem} />

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* Top Bar - Logo and Global Functions */}
        <div
          style={{
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `0 ${theme.spacing.lg}`,
            backgroundColor: theme.colors.background.primary,
            borderBottom: `1px solid ${theme.colors.border.primary}`,
          }}
        >
          {/* Logo */}
          <div
            style={{
              fontSize: '18px',
              fontWeight: theme.typography.fontWeights.bold,
              color: theme.colors.interactive.primary,
            }}
          >
            SwiftAPI
          </div>

          {/* Global Functions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            {/* Environment Selector */}
            <EnvironmentSelector />

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>

        {/* Content based on sidebar selection */}
        {activeSidebarItem === 'collections' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            {/* Request Panel - TOP */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '300px',
                maxHeight: '50%',
                overflow: 'hidden',
                borderBottom: `1px solid ${theme.colors.border.primary}`,
              }}
            >
              <RequestLine />
              <RequestTabs />
            </div>

            {/* Response Panel - BOTTOM */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                overflow: 'hidden',
              }}
            >
              <ResponseStatusBar activeTab={activeResponseTab} onTabChange={setActiveResponseTab} />
              <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                {activeResponseTab === 'body' && <BodyViewer />}
                {activeResponseTab === 'headers' && <ResponseHeadersViewer />}
                {activeResponseTab === 'cookies' && <ResponseCookiesViewer />}
              </div>
            </div>
          </div>
        )}

        {activeSidebarItem === 'history' && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <HistoryPanel />
          </div>
        )}

        {activeSidebarItem === 'environments' && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <EnvironmentPanel />
          </div>
        )}

        {activeSidebarItem === 'mock-servers' && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <MockServerPanel />
          </div>
        )}
      </div>

      {/* Overlays */}
      <SaveRequestDialog open={isSaveDialogOpen} onClose={() => setIsSaveDialogOpen(false)} />
    </div>
  );
}

export default App;
