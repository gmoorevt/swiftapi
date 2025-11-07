/**
 * UrlInput Component
 *
 * Text input for entering API endpoint URL
 */

import React from 'react';
import { useRequestStore } from '../../store/requestStore';

export function UrlInput(): React.ReactElement {
  const url = useRequestStore((state) => state.url);
  const setUrl = useRequestStore((state) => state.actions.setUrl);

  return (
    <input
      type="text"
      value={url}
      onChange={(e) => setUrl(e.target.value)}
      placeholder="Enter URL (e.g., https://api.example.com)"
      className="url-input"
      style={{
        width: '100%',
        padding: '8px 12px',
        fontSize: '14px',
        border: '1px solid #ddd',
        borderRadius: '4px',
      }}
    />
  );
}
