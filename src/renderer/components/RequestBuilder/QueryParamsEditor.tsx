/**
 * QueryParamsEditor Component
 *
 * Editor for URL query parameters
 * Allows adding, editing, removing, and toggling query params
 * Provides key, value, and optional description fields
 */

import React from 'react';
import { useRequestStore } from '../../store/requestStore';

export function QueryParamsEditor(): React.ReactElement {
  const queryParams = useRequestStore((state) => state.queryParams);
  const addQueryParam = useRequestStore((state) => state.actions.addQueryParam);
  const updateQueryParam = useRequestStore((state) => state.actions.updateQueryParam);
  const removeQueryParam = useRequestStore((state) => state.actions.removeQueryParam);
  const toggleQueryParam = useRequestStore((state) => state.actions.toggleQueryParam);
  const syncUrlWithParams = useRequestStore((state) => state.actions.syncUrlWithParams);
  const syncParamsWithUrl = useRequestStore((state) => state.actions.syncParamsWithUrl);

  // Sync URL when params change
  React.useEffect(() => {
    syncUrlWithParams();
  }, [queryParams, syncUrlWithParams]);

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
          Query Parameters
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={syncParamsWithUrl}
            className="sync-params-button"
            title="Parse query params from URL"
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#6c757d',
              backgroundColor: 'white',
              border: '1px solid #6c757d',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ↻ Sync from URL
          </button>
          <button
            onClick={addQueryParam}
            className="add-query-param-button"
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
            Add Parameter
          </button>
        </div>
      </div>

      {queryParams.length === 0 ? (
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
          No query parameters added yet. Click &quot;Add Parameter&quot; to add a query parameter.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {queryParams.map((param, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: param.enabled ? 1 : 0.5,
              }}
            >
              {/* Enabled Checkbox */}
              <input
                type="checkbox"
                checked={param.enabled}
                onChange={() => toggleQueryParam(index)}
                className="query-param-enabled-checkbox"
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                }}
                aria-label={`Toggle param ${index + 1}`}
              />

              {/* Key Input */}
              <input
                type="text"
                value={param.key}
                onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                placeholder="Key"
                className="query-param-key-input"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />

              {/* Value Input */}
              <input
                type="text"
                value={param.value}
                onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                placeholder="Value"
                className="query-param-value-input"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />

              {/* Description Input */}
              <input
                type="text"
                value={param.description || ''}
                onChange={(e) => updateQueryParam(index, 'description', e.target.value)}
                placeholder="Description (optional)"
                className="query-param-description-input"
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
                onClick={() => removeQueryParam(index)}
                className="delete-query-param-button"
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  color: '#dc3545',
                  backgroundColor: 'white',
                  border: '1px solid #dc3545',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                aria-label="Delete parameter"
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
