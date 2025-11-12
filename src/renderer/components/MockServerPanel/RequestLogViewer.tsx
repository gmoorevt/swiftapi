/**
 * Request Log Viewer Component
 *
 * Displays incoming requests and responses for a mock server
 */

import { MockRequestLog } from '../../../types/mockServer.types';
import { useTheme } from '../../hooks/useTheme';

interface RequestLogViewerProps {
  logs: MockRequestLog[];
  onClear: () => void;
}

export function RequestLogViewer({ logs, onClear }: RequestLogViewerProps) {
  const { theme } = useTheme();

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getMethodColor = (method: string): string => {
    switch (method) {
      case 'GET':
        return theme.mode === 'dark' ? '#4ade80' : '#16a34a';
      case 'POST':
        return theme.mode === 'dark' ? '#60a5fa' : '#2563eb';
      case 'PUT':
        return theme.mode === 'dark' ? '#fbbf24' : '#d97706';
      case 'DELETE':
        return theme.mode === 'dark' ? '#f87171' : '#dc2626';
      case 'PATCH':
        return theme.mode === 'dark' ? '#a78bfa' : '#7c3aed';
      default:
        return theme.mode === 'dark' ? '#9ca3af' : '#6b7280';
    }
  };

  const getStatusColor = (status: number): string => {
    if (status >= 200 && status < 300) {
      return theme.mode === 'dark' ? '#4ade80' : '#16a34a';
    } else if (status >= 300 && status < 400) {
      return theme.mode === 'dark' ? '#60a5fa' : '#2563eb';
    } else if (status >= 400 && status < 500) {
      return theme.mode === 'dark' ? '#fbbf24' : '#d97706';
    } else if (status >= 500) {
      return theme.mode === 'dark' ? '#f87171' : '#dc2626';
    }
    return theme.mode === 'dark' ? '#9ca3af' : '#6b7280';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.mode === 'dark' ? '#1f2937' : '#ffffff',
        border: `1px solid ${theme.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${theme.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 600,
            color: theme.mode === 'dark' ? '#f3f4f6' : '#111827',
          }}
        >
          Request Log ({logs.length})
        </h3>
        {logs.length > 0 && (
          <button
            onClick={onClear}
            style={{
              padding: '4px 12px',
              fontSize: '13px',
              fontWeight: 500,
              color: theme.mode === 'dark' ? '#f87171' : '#dc2626',
              backgroundColor: 'transparent',
              border: `1px solid ${theme.mode === 'dark' ? '#f87171' : '#dc2626'}`,
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Log Entries */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {logs.length === 0 ? (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              color: theme.mode === 'dark' ? '#9ca3af' : '#6b7280',
              fontSize: '14px',
            }}
          >
            No requests logged yet
          </div>
        ) : (
          <div style={{ padding: '8px' }}>
            {logs
              .slice()
              .reverse()
              .map((log) => (
                <div
                  key={log.id}
                  style={{
                    marginBottom: '8px',
                    padding: '12px',
                    backgroundColor: theme.mode === 'dark' ? '#111827' : '#f9fafb',
                    border: `1px solid ${theme.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '6px',
                    fontSize: '13px',
                  }}
                >
                  {/* Request Line */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        padding: '2px 6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#ffffff',
                        backgroundColor: getMethodColor(log.method),
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                      }}
                    >
                      {log.method}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontFamily: 'monospace',
                        color: theme.mode === 'dark' ? '#f3f4f6' : '#111827',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {log.path}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: getStatusColor(log.responseStatus),
                      }}
                    >
                      {log.responseStatus}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        color: theme.mode === 'dark' ? '#9ca3af' : '#6b7280',
                      }}
                    >
                      {log.responseTime}ms
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div
                    style={{
                      fontSize: '11px',
                      color: theme.mode === 'dark' ? '#9ca3af' : '#6b7280',
                      marginBottom: '8px',
                    }}
                  >
                    {formatTime(log.timestamp)}
                  </div>

                  {/* Headers (if any) */}
                  {Object.keys(log.headers).length > 0 && (
                    <details style={{ marginTop: '8px' }}>
                      <summary
                        style={{
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: theme.mode === 'dark' ? '#d1d5db' : '#374151',
                          marginBottom: '4px',
                        }}
                      >
                        Headers ({Object.keys(log.headers).length})
                      </summary>
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '8px',
                          backgroundColor: theme.mode === 'dark' ? '#1f2937' : '#ffffff',
                          border: `1px solid ${theme.mode === 'dark' ? '#4b5563' : '#d1d5db'}`,
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                        }}
                      >
                        {Object.entries(log.headers).map(([key, value]) => (
                          <div
                            key={key}
                            style={{
                              marginBottom: '4px',
                              color: theme.mode === 'dark' ? '#e5e7eb' : '#1f2937',
                            }}
                          >
                            <span
                              style={{
                                color: theme.mode === 'dark' ? '#60a5fa' : '#2563eb',
                                fontWeight: 500,
                              }}
                            >
                              {key}:
                            </span>{' '}
                            {value}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  {/* Body (if any) */}
                  {log.body && (
                    <details style={{ marginTop: '8px' }}>
                      <summary
                        style={{
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: theme.mode === 'dark' ? '#d1d5db' : '#374151',
                          marginBottom: '4px',
                        }}
                      >
                        Request Body
                      </summary>
                      <pre
                        style={{
                          marginTop: '8px',
                          padding: '8px',
                          backgroundColor: theme.mode === 'dark' ? '#1f2937' : '#ffffff',
                          border: `1px solid ${theme.mode === 'dark' ? '#4b5563' : '#d1d5db'}`,
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          color: theme.mode === 'dark' ? '#e5e7eb' : '#1f2937',
                          overflow: 'auto',
                          maxHeight: '200px',
                        }}
                      >
                        {log.body}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
