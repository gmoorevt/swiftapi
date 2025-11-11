/**
 * BodyEditor Component
 *
 * Editor for request body content with validation
 * Visible only for methods that support body (POST, PUT, DELETE)
 */

import React from 'react';
import { useRequestStore } from '../../store/requestStore';
import { HttpMethod, BodyType } from '../../../types/request.types';
import { validateJson } from '../../../lib/validation';

export function BodyEditor(): React.ReactElement | null {
  const method = useRequestStore((state) => state.method);
  const body = useRequestStore((state) => state.body);
  const bodyType = useRequestStore((state) => state.bodyType);
  const setBody = useRequestStore((state) => state.actions.setBody);
  const setBodyType = useRequestStore((state) => state.actions.setBodyType);

  // Only show body editor for methods that support request body
  const hasBody =
    method === HttpMethod.POST || method === HttpMethod.PUT || method === HttpMethod.DELETE;

  if (!hasBody) {
    return null;
  }

  // Validate JSON if body type is JSON
  const validationResult =
    bodyType === BodyType.JSON && body.trim() ? validateJson(body) : { valid: true };

  const showError = !validationResult.valid;

  return (
    <div style={{ marginTop: '12px' }}>
      {/* Body Type Selector */}
      <div style={{ marginBottom: '8px' }}>
        <label
          htmlFor="body-type-select"
          style={{
            display: 'block',
            marginBottom: '4px',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          Body Type:
        </label>
        <select
          id="body-type-select"
          value={bodyType}
          onChange={(e) => setBodyType(e.target.value as BodyType)}
          style={{
            padding: '6px 8px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: 'white',
          }}
        >
          <option value={BodyType.JSON}>JSON</option>
          <option value={BodyType.FORM_DATA}>Form Data</option>
          <option value={BodyType.RAW}>Raw Text</option>
        </select>
      </div>

      {/* Body Content Textarea */}
      <div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Enter request body"
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '8px 12px',
            fontSize: '14px',
            fontFamily: 'monospace',
            border: showError ? '1px solid #ff4444' : '1px solid #ddd',
            borderRadius: '4px',
            resize: 'vertical',
            backgroundColor: showError ? '#fff5f5' : 'white',
          }}
        />
      </div>

      {/* Validation Error Message */}
      {showError && (
        <div
          style={{
            marginTop: '6px',
            padding: '6px 8px',
            fontSize: '13px',
            color: '#ff4444',
            backgroundColor: '#fff5f5',
            border: '1px solid #ffcccc',
            borderRadius: '4px',
          }}
        >
          {validationResult.error}
        </div>
      )}
    </div>
  );
}
