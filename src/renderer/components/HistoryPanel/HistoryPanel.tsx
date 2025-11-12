/**
 * HistoryPanel Component
 *
 * Displays recent request history
 * Click to restore a previous request
 */

import React, { useEffect, useState } from 'react';
import { HistoryService } from '../../services/historyService';
import { HistoryEntry } from '../../../models/HistoryEntry';
import { useRequestStore } from '../../store/requestStore';
import { HttpMethod } from '../../../types/request.types';

const historyService = new HistoryService();

export function HistoryPanel(): React.ReactElement {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const setUrl = useRequestStore((state) => state.actions.setUrl);
  const setMethod = useRequestStore((state) => state.actions.setMethod);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = (): void => {
    setHistory(historyService.getAll());
  };

  const handleRestore = (entry: HistoryEntry): void => {
    setUrl(entry.url);
    setMethod(entry.method);
  };

  const handleClear = (): void => {
    // eslint-disable-next-line no-alert
    if (confirm('Clear all history?')) {
      historyService.clear();
      loadHistory();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Request History</h3>
      </div>

      {/* History List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {history.length === 0 ? (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: '#999',
              fontSize: '14px',
            }}
          >
            No history yet. Send a request to see it here!
          </div>
        ) : (
          history.map((entry) => (
            <div
              key={entry.id}
              onClick={() => handleRestore(entry)}
              style={{
                padding: '12px',
                marginBottom: '4px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                cursor: 'pointer',
                border: '1px solid transparent',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#e9ecef';
                e.currentTarget.style.borderColor = '#007bff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    backgroundColor:
                      entry.method === HttpMethod.GET
                        ? '#28a745'
                        : entry.method === HttpMethod.POST
                          ? '#007bff'
                          : entry.method === HttpMethod.PUT
                            ? '#ffc107'
                            : entry.method === HttpMethod.DELETE
                              ? '#dc3545'
                              : '#6c757d',
                    color: 'white',
                  }}
                >
                  {entry.method}
                </span>
                {entry.statusCode && (
                  <span
                    style={{
                      fontSize: '12px',
                      color:
                        entry.statusCode >= 200 && entry.statusCode < 300
                          ? '#28a745'
                          : entry.statusCode >= 400
                            ? '#dc3545'
                            : '#666',
                      fontWeight: 500,
                    }}
                  >
                    {entry.statusCode}
                  </span>
                )}
                {entry.responseTime && (
                  <span style={{ fontSize: '11px', color: '#999' }}>{entry.responseTime}ms</span>
                )}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#333',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {entry.url}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                {new Date(entry.timestamp).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {history.length > 0 && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #ddd',
          }}
        >
          <button
            onClick={handleClear}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#dc3545',
              backgroundColor: 'white',
              border: '1px solid #dc3545',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear History
          </button>
        </div>
      )}
    </div>
  );
}
