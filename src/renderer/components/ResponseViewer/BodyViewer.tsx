/**
 * BodyViewer Component
 *
 * Displays response body content in a scrollable area
 */

import React from 'react';
import { useRequestStore } from '../../store/requestStore';

export function BodyViewer(): React.ReactElement {
  const response = useRequestStore((state) => state.response);

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
        No response body to display
      </div>
    );
  }

  return (
    <div
      style={{
        height: '400px',
        overflowY: 'auto',
        backgroundColor: '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '4px',
      }}
    >
      <pre
        style={{
          margin: 0,
          padding: '16px',
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          fontSize: '13px',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {response.body}
      </pre>
    </div>
  );
}
