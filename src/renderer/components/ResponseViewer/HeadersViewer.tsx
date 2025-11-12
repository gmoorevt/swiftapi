/**
 * HeadersViewer Component
 *
 * Displays response headers in a table format
 */

import React from 'react';
import { useRequestStore } from '../../store/requestStore';

export function HeadersViewer(): React.ReactElement {
  const response = useRequestStore((state) => state.response);

  if (!response || !response.headers || response.headers.length === 0) {
    return (
      <div
        style={{
          padding: '32px',
          color: '#999',
          textAlign: 'center',
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        No headers to display
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          fontSize: '14px',
          fontWeight: 600,
          color: '#333',
        }}
      >
        {response.headers.length} {response.headers.length === 1 ? 'header' : 'headers'}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#fafafa',
                borderBottom: '2px solid #e0e0e0',
              }}
            >
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#555',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  width: '30%',
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#555',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {response.headers.map((header, index) => (
              <tr
                key={`${header.name}-${index}`}
                style={{
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <td
                  style={{
                    padding: '12px 16px',
                    fontWeight: 600,
                    color: '#0066cc',
                    verticalAlign: 'top',
                  }}
                >
                  {header.name}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    color: '#333',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    wordBreak: 'break-word',
                  }}
                >
                  {header.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
