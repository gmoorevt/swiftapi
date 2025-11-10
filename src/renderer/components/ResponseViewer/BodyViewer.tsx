/**
 * BodyViewer Component
 *
 * Displays response body content in a scrollable area
 * with automatic formatting for JSON, XML, HTML
 */

import React, { useMemo } from 'react';
import { useRequestStore } from '../../store/requestStore';
import { FormatService } from '../../services/formatService';

// Create singleton instance
const formatService = new FormatService();

export function BodyViewer(): React.ReactElement {
  const response = useRequestStore((state) => state.response);

  // Format the response body using FormatService
  const formattedContent = useMemo(() => {
    if (!response) return null;

    // Get content-type from response headers
    const contentTypeHeader = response.headers.find(
      (h) => h.name.toLowerCase() === 'content-type'
    )?.value;

    // Format the response
    return formatService.formatResponse(response.body, contentTypeHeader);
  }, [response]);

  // Show empty state
  if (!response || !formattedContent) {
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
        {formattedContent.content}
      </pre>
    </div>
  );
}
