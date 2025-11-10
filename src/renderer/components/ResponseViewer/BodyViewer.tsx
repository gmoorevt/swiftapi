/**
 * BodyViewer Component
 *
 * Displays response body content with Monaco Editor
 * for professional syntax highlighting (JSON, XML, HTML, text)
 *
 * Constitutional requirements:
 * - Performance: Monaco Editor lazy loaded via MonacoWrapper
 * - Simplicity: Automatic content-type detection
 */

import React, { useMemo } from 'react';
import { useRequestStore } from '../../store/requestStore';
import { FormatService } from '../../services/formatService';
import { MonacoWrapper } from './MonacoWrapper';

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

  // Map content type to Monaco language
  const monacoLanguage =
    formattedContent.contentType === 'text'
      ? 'plaintext'
      : formattedContent.contentType;

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      <MonacoWrapper
        content={formattedContent.content}
        language={monacoLanguage}
        height="400px"
      />
    </div>
  );
}
