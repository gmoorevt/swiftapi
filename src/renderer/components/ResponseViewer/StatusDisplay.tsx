/**
 * StatusDisplay Component
 *
 * Displays response status code, timing, and size information
 */

import React from 'react';
import { useRequestStore } from '../../store/requestStore';

export function StatusDisplay(): React.ReactElement {
  const response = useRequestStore((state) => state.response);
  const error = useRequestStore((state) => state.error);
  const isLoading = useRequestStore((state) => state.isLoading);

  // Show loading state
  if (isLoading) {
    return <div style={{ padding: '16px', color: '#666' }}>Sending request...</div>;
  }

  // Show error state
  if (error) {
    return (
      <div
        style={{
          padding: '16px',
          color: '#dc3545',
          backgroundColor: '#f8d7da',
          borderRadius: '4px',
        }}
      >
        Error: {error}
      </div>
    );
  }

  // Show empty state
  if (!response) {
    return (
      <div style={{ padding: '16px', color: '#999' }}>
        No response yet. Enter a URL and click Send.
      </div>
    );
  }

  // Determine status color based on category
  const getStatusColor = (): string => {
    if (response.statusCategory === 'success') {
      return '#28a745'; // green
    }
    if (response.statusCategory === 'error') {
      return '#dc3545'; // red
    }
    if (response.statusCategory === 'redirect') {
      return '#17a2b8'; // blue
    }
    return '#ffc107'; // yellow/orange for client errors
  };

  return (
    <div
      style={{
        padding: '16px',
        display: 'flex',
        gap: '24px',
        alignItems: 'center',
        borderBottom: '1px solid #ddd',
      }}
    >
      {/* Status Code */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: getStatusColor(),
          }}
        >
          {response.statusCode} {response.statusText}
        </div>
      </div>

      {/* Response Time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#666', fontSize: '14px' }}>Time:</span>
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{response.responseTime} ms</span>
      </div>

      {/* Size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#666', fontSize: '14px' }}>Size:</span>
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{response.formattedSize}</span>
      </div>
    </div>
  );
}
