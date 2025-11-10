/**
 * HeadersEditor Component
 *
 * Editor for custom HTTP request headers
 * Allows adding, editing, removing, and toggling headers
 */

import React from 'react';
import { useRequestStore } from '../../store/requestStore';

export function HeadersEditor(): React.ReactElement {
  const headers = useRequestStore((state) => state.headers);
  const addHeader = useRequestStore((state) => state.actions.addHeader);
  const updateHeader = useRequestStore((state) => state.actions.updateHeader);
  const removeHeader = useRequestStore((state) => state.actions.removeHeader);
  const toggleHeader = useRequestStore((state) => state.actions.toggleHeader);

  return (
    <div style={{ marginTop: '16px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <label
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#333',
          }}
        >
          Headers
        </label>
        <button
          onClick={addHeader}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#007bff',
            backgroundColor: 'white',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Add Header
        </button>
      </div>

      {headers.length === 0 ? (
        <div
          style={{
            padding: '16px',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
          }}
        >
          No headers added yet. Click "Add Header" to add a custom header.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {headers.map((header, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: header.enabled ? 1 : 0.5,
              }}
            >
              {/* Enabled Checkbox */}
              <input
                type="checkbox"
                checked={header.enabled}
                onChange={() => toggleHeader(index)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                }}
                aria-label={`Toggle header ${index + 1}`}
              />

              {/* Header Name Input */}
              <input
                type="text"
                value={header.name}
                onChange={(e) => updateHeader(index, 'name', e.target.value)}
                placeholder="Header name"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />

              {/* Header Value Input */}
              <input
                type="text"
                value={header.value}
                onChange={(e) => updateHeader(index, 'value', e.target.value)}
                placeholder="Header value"
                style={{
                  flex: 2,
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />

              {/* Delete Button */}
              <button
                onClick={() => removeHeader(index)}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  color: '#dc3545',
                  backgroundColor: 'white',
                  border: '1px solid #dc3545',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                aria-label="Delete header"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
