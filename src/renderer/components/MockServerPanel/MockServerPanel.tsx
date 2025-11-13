/**
 * Mock Server Panel Component
 *
 * Main panel for managing mock API servers
 */

/* eslint-disable no-alert */
// TODO: Replace alert() and confirm() with proper toast notifications in the future

import React, { useState, useEffect } from 'react';
import { useMockServerStore } from '../../store/mockServerStore';
import { useTheme } from '../../hooks/useTheme';
import { AddEndpointDialog } from './AddEndpointDialog';
import { RequestLogViewer } from './RequestLogViewer';

export function MockServerPanel(): React.ReactElement {
  const { theme } = useTheme();
  const servers = useMockServerStore((state) => state.servers);
  const activeServerId = useMockServerStore((state) => state.activeServerId);
  const actions = useMockServerStore((state) => state.actions);

  // Listen for request logs from main process
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const unsubscribe = window.electronAPI.mockServer.onRequestLog((serverId, log) => {
        actions.logRequest(serverId, log);
      });
      return unsubscribe;
    }
  }, [actions]);

  const [isCreating, setIsCreating] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newServerPort, setNewServerPort] = useState('3001');
  const [isAddingEndpoint, setIsAddingEndpoint] = useState(false);

  const serverList = Object.values(servers);
  const activeServer = activeServerId ? servers[activeServerId] : null;

  const handleCreateServer = (): void => {
    if (!newServerName.trim()) {
      alert('Please enter a server name');
      return;
    }

    const port = parseInt(newServerPort, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      alert('Please enter a valid port (1-65535)');
      return;
    }

    try {
      const serverId = actions.createServer(newServerName, port);
      actions.setActiveServer(serverId);
      setIsCreating(false);
      setNewServerName('');
      setNewServerPort('3001');
    } catch (error) {
      alert(`Error creating server: ${(error as Error).message}`);
    }
  };

  const handleDeleteServer = (serverId: string): void => {
    const server = servers[serverId];
    if (server?.enabled) {
      alert('Please stop the server before deleting it');
      return;
    }

    if (confirm(`Delete server "${server?.name}"?`)) {
      actions.deleteServer(serverId);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        backgroundColor: theme.colors.background.primary,
      }}
    >
      {/* Server List Sidebar */}
      <div
        style={{
          width: '280px',
          borderRight: `1px solid ${theme.colors.border.primary}`,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.colors.background.secondary,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: `1px solid ${theme.colors.border.primary}`,
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '14px',
              fontWeight: 600,
              color: theme.colors.text.primary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Mock Servers
          </h3>
          <button
            onClick={() => setIsCreating(true)}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 600,
              border: `1px solid ${theme.colors.interactive.primary}`,
              borderRadius: '6px',
              backgroundColor: theme.colors.interactive.primary,
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.interactive.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.interactive.primary;
            }}
          >
            + New Server
          </button>
        </div>

        {/* Server List */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          {serverList.length === 0 ? (
            <div
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                color: theme.colors.text.secondary,
                fontSize: '13px',
              }}
            >
              No mock servers yet.
              <br />
              Create one to get started!
            </div>
          ) : (
            serverList.map((server) => (
              <div
                key={server.id}
                onClick={() => actions.setActiveServer(server.id)}
                style={{
                  padding: '12px',
                  marginBottom: '4px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor:
                    activeServerId === server.id
                      ? theme.colors.interactive.primary + '20'
                      : 'transparent',
                  border: `1px solid ${
                    activeServerId === server.id ? theme.colors.interactive.primary : 'transparent'
                  }`,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (activeServerId !== server.id) {
                    e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeServerId !== server.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: theme.colors.text.primary,
                    }}
                  >
                    {server.name}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: server.enabled
                        ? theme.colors.status.success
                        : theme.colors.text.tertiary,
                      color: 'white',
                      fontWeight: 600,
                    }}
                  >
                    {server.enabled ? 'RUNNING' : 'STOPPED'}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: theme.colors.text.secondary,
                  }}
                >
                  Port: {server.port} • {server.endpoints.length} endpoints
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {isCreating ? (
          <div>
            <h2
              style={{
                margin: '0 0 24px 0',
                fontSize: '20px',
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              Create Mock Server
            </h2>

            <div style={{ maxWidth: '500px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                  }}
                >
                  Server Name
                </label>
                <input
                  type="text"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  placeholder="My API Server"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: `1px solid ${theme.colors.border.secondary}`,
                    borderRadius: '6px',
                    backgroundColor: theme.colors.background.primary,
                    color: theme.colors.text.primary,
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                  }}
                >
                  Port
                </label>
                <input
                  type="number"
                  value={newServerPort}
                  onChange={(e) => setNewServerPort(e.target.value)}
                  min="1"
                  max="65535"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: `1px solid ${theme.colors.border.secondary}`,
                    borderRadius: '6px',
                    backgroundColor: theme.colors.background.primary,
                    color: theme.colors.text.primary,
                  }}
                />
                <p
                  style={{
                    margin: '6px 0 0',
                    fontSize: '12px',
                    color: theme.colors.text.secondary,
                  }}
                >
                  Choose a port between 1 and 65535 (avoid common ports like 80, 443, 3000)
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleCreateServer}
                  style={{
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: theme.colors.interactive.primary,
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Create Server
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewServerName('');
                    setNewServerPort('3001');
                  }}
                  style={{
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: `1px solid ${theme.colors.border.secondary}`,
                    borderRadius: '6px',
                    backgroundColor: theme.colors.background.primary,
                    color: theme.colors.text.primary,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : activeServer ? (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: '0 0 4px 0',
                    fontSize: '24px',
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                  }}
                >
                  {activeServer.name}
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    color: theme.colors.text.secondary,
                  }}
                >
                  Port {activeServer.port} • {activeServer.endpoints.length} endpoints
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    void (async () => {
                      try {
                        if (activeServer.enabled) {
                          await actions.stopServer(activeServer.id);
                        } else {
                          await actions.startServer(activeServer.id);
                        }
                      } catch (error) {
                        alert(`Error: ${(error as Error).message}`);
                      }
                    })();
                  }}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: activeServer.enabled
                      ? theme.colors.status.error
                      : theme.colors.status.success,
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  {activeServer.enabled ? 'Stop' : 'Start'}
                </button>
                <button
                  onClick={() => handleDeleteServer(activeServer.id)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: `1px solid ${theme.colors.status.error}`,
                    borderRadius: '6px',
                    backgroundColor: 'transparent',
                    color: theme.colors.status.error,
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            <div>
              <h3
                style={{
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: theme.colors.text.primary,
                }}
              >
                Endpoints
              </h3>

              <button
                onClick={() => setIsAddingEndpoint(true)}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: `1px solid ${theme.colors.interactive.primary}`,
                  borderRadius: '6px',
                  backgroundColor: theme.colors.interactive.primary,
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                + Add Endpoint
              </button>

              {activeServer.endpoints.length === 0 ? (
                <div
                  style={{
                    marginTop: '24px',
                    padding: '32px',
                    textAlign: 'center',
                    border: `2px dashed ${theme.colors.border.secondary}`,
                    borderRadius: '8px',
                    color: theme.colors.text.secondary,
                  }}
                >
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    No endpoints configured yet.
                    <br />
                    Add an endpoint to start mocking API responses!
                  </p>
                </div>
              ) : (
                <div style={{ marginBottom: '16px' }}>
                  {activeServer.endpoints.map((endpoint) => (
                    <div
                      key={endpoint.id}
                      style={{
                        padding: '16px',
                        marginBottom: '12px',
                        border: `1px solid ${endpoint.enabled ? theme.colors.border.secondary : theme.colors.border.primary}`,
                        borderRadius: '8px',
                        backgroundColor: endpoint.enabled
                          ? theme.colors.background.secondary
                          : theme.colors.background.tertiary,
                        opacity: endpoint.enabled ? 1 : 0.6,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flex: 1,
                          }}
                        >
                          <span
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              fontWeight: 600,
                              borderRadius: '4px',
                              backgroundColor: theme.colors.interactive.primary,
                              color: 'white',
                            }}
                          >
                            {endpoint.method}
                          </span>
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: 500,
                              color: theme.colors.text.primary,
                            }}
                          >
                            {endpoint.path}
                          </span>
                          <span
                            style={{
                              fontSize: '12px',
                              color: theme.colors.text.secondary,
                            }}
                          >
                            → {endpoint.statusCode}
                          </span>
                          {endpoint.delay && (
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: theme.colors.status.warning + '30',
                                color: theme.colors.status.warning,
                              }}
                            >
                              {endpoint.delay}ms delay
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => actions.toggleEndpoint(activeServer.id, endpoint.id)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              border: 'none',
                              borderRadius: '4px',
                              backgroundColor: endpoint.enabled
                                ? theme.colors.status.warning
                                : theme.colors.status.success,
                              color: 'white',
                              cursor: 'pointer',
                            }}
                          >
                            {endpoint.enabled ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete endpoint ${endpoint.method} ${endpoint.path}?`)) {
                                actions.deleteEndpoint(activeServer.id, endpoint.id);
                              }
                            }}
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              border: 'none',
                              borderRadius: '4px',
                              backgroundColor: theme.colors.status.error,
                              color: 'white',
                              cursor: 'pointer',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {endpoint.description && (
                        <div
                          style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            color: theme.colors.text.secondary,
                          }}
                        >
                          {endpoint.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Request Log */}
            <div style={{ marginTop: '32px' }}>
              <RequestLogViewer
                logs={activeServer.requestLog}
                onClear={() => actions.clearLogs(activeServer.id)}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: theme.colors.text.secondary,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
                Select a server or create a new one
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Endpoint Dialog */}
      <AddEndpointDialog
        open={isAddingEndpoint}
        onClose={() => setIsAddingEndpoint(false)}
        onSave={(endpoint) => {
          if (activeServerId) {
            actions.addEndpoint(activeServerId, { ...endpoint, enabled: true });
            setIsAddingEndpoint(false);
          }
        }}
      />
    </div>
  );
}
