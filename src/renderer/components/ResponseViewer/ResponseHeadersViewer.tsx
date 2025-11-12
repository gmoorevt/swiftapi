/**
 * ResponseHeadersViewer Component
 *
 * Displays response headers in a table format with search/filter functionality
 *
 * Constitutional requirements:
 * - Simplicity: Clean table layout with search
 * - Performance: Efficient filtering with useMemo
 */

import React, { useState, useMemo } from 'react';
import { useRequestStore } from '../../store/requestStore';

export function ResponseHeadersViewer(): React.ReactElement {
  const response = useRequestStore((state) => state.response);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter headers based on search term
  const filteredHeaders = useMemo(() => {
    if (!response) {
      return [];
    }

    if (!searchTerm.trim()) {
      return response.headers;
    }

    const lowerSearch = searchTerm.toLowerCase();
    return response.headers.filter(
      (header) =>
        header.name.toLowerCase().includes(lowerSearch) ||
        header.value.toLowerCase().includes(lowerSearch)
    );
  }, [response, searchTerm]);

  // Show empty state
  if (!response) {
    return (
      <div
        style={{
          padding: '16px',
          color: '#999',
          textAlign: 'center',
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        No response headers to display
      </div>
    );
  }

  const headerCount = response.headers.length;

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      {/* Search and header count */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Search headers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
        />
        <span
          style={{
            marginLeft: '16px',
            fontSize: '14px',
            color: '#666',
            whiteSpace: 'nowrap',
          }}
        >
          {headerCount} {headerCount === 1 ? 'header' : 'headers'}
        </span>
      </div>

      {/* Headers table */}
      {filteredHeaders.length === 0 ? (
        <div
          style={{
            padding: '24px',
            color: '#999',
            textAlign: 'center',
          }}
        >
          {searchTerm ? 'No matching headers found' : 'No headers to display'}
        </div>
      ) : (
        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#f8f9fa',
                  borderBottom: '1px solid #ddd',
                }}
              >
                <th
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#333',
                    width: '30%',
                  }}
                >
                  Header Name
                </th>
                <th
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#333',
                  }}
                >
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredHeaders.map((header, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: '1px solid #eee',
                  }}
                >
                  <td
                    style={{
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      color: '#0066cc',
                      verticalAlign: 'top',
                    }}
                  >
                    {header.name}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      color: '#333',
                      wordBreak: 'break-all',
                    }}
                  >
                    {header.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
