/**
 * Add Endpoint Dialog Component
 *
 * Dialog for creating/editing mock endpoints
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Header } from '../../../types/request.types';

interface AddEndpointDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (endpoint: {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
    statusCode: number;
    responseBody: string;
    responseHeaders: Header[];
    delay?: number;
    description?: string;
  }) => void;
  initialData?: {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
    statusCode: number;
    responseBody: string;
    responseHeaders: Header[];
    delay?: number;
    description?: string;
  };
}

export function AddEndpointDialog({
  open,
  onClose,
  onSave,
  initialData,
}: AddEndpointDialogProps): React.ReactElement | null {
  const { theme } = useTheme();
  const [path, setPath] = useState('');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'>('GET');
  const [statusCode, setStatusCode] = useState('200');
  const [responseBody, setResponseBody] = useState('');
  const [delay, setDelay] = useState('');
  const [description, setDescription] = useState('');
  const [headers, setHeaders] = useState<Header[]>([]);

  useEffect(() => {
    if (open && initialData) {
      setPath(initialData.path);
      setMethod(initialData.method);
      setStatusCode(String(initialData.statusCode));
      setResponseBody(initialData.responseBody);
      setDelay(initialData.delay ? String(initialData.delay) : '');
      setDescription(initialData.description || '');
      setHeaders(initialData.responseHeaders);
    } else if (open) {
      // Reset form
      setPath('/');
      setMethod('GET');
      setStatusCode('200');
      setResponseBody('{"message": "Hello from mock server"}');
      setDelay('');
      setDescription('');
      setHeaders([{ name: 'Content-Type', value: 'application/json', enabled: true }]);
    }
  }, [open, initialData]);

  if (!open) {
return null;
}

  const validatePath = (): boolean => {
    if (!path.trim()) {
      // eslint-disable-next-line no-alert
      alert('Path is required');
      return false;
    }
    return true;
  };

  const validateStatusCode = (): number | null => {
    const code = parseInt(statusCode, 10);
    if (isNaN(code) || code < 100 || code > 599) {
      // eslint-disable-next-line no-alert
      alert('Status code must be between 100 and 599');
      return null;
    }
    return code;
  };

  const validateDelay = (): number | undefined | null => {
    if (!delay) {
      return undefined;
    }
    const delayMs = parseInt(delay, 10);
    if (isNaN(delayMs) || delayMs < 0) {
      // eslint-disable-next-line no-alert
      alert('Delay must be a positive number');
      return null;
    }
    return delayMs;
  };

  const handleSave = (): void => {
    if (!validatePath()) {
      return;
    }

    const code = validateStatusCode();
    if (code === null) {
      return;
    }

    const delayMs = validateDelay();
    if (delayMs === null) {
      return;
    }

    onSave({
      path: path.trim(),
      method,
      statusCode: code,
      responseBody,
      responseHeaders: headers.filter((h) => h.name.trim() !== ''),
      ...(delayMs !== undefined && { delay: delayMs }),
      ...(description.trim() && { description: description.trim() }),
    });
  };

  const addHeader = (): void => {
    setHeaders([...headers, { name: '', value: '', enabled: true }]);
  };

  const updateHeader = (index: number, field: keyof Header, value: string | boolean): void => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index]!, [field]: value };
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number): void => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: theme.colors.background.primary,
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            margin: '0 0 24px 0',
            fontSize: '20px',
            fontWeight: 600,
            color: theme.colors.text.primary,
          }}
        >
          {initialData ? 'Edit Endpoint' : 'Add Endpoint'}
        </h2>

        {/* Path */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          >
            Path *
          </label>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/api/users"
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '14px',
              border: `1px solid ${theme.colors.border.secondary}`,
              borderRadius: '6px',
              backgroundColor: theme.colors.background.secondary,
              color: theme.colors.text.primary,
            }}
          />
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: theme.colors.text.secondary }}>
            Supports path parameters like /users/:id
          </p>
        </div>

        {/* Method and Status Code Row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              Method *
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as typeof method)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: `1px solid ${theme.colors.border.secondary}`,
                borderRadius: '6px',
                backgroundColor: theme.colors.background.secondary,
                color: theme.colors.text.primary,
              }}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
              <option value="OPTIONS">OPTIONS</option>
              <option value="HEAD">HEAD</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              Status Code *
            </label>
            <input
              type="number"
              value={statusCode}
              onChange={(e) => setStatusCode(e.target.value)}
              min="100"
              max="599"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: `1px solid ${theme.colors.border.secondary}`,
                borderRadius: '6px',
                backgroundColor: theme.colors.background.secondary,
                color: theme.colors.text.primary,
              }}
            />
          </div>
        </div>

        {/* Response Body */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          >
            Response Body
          </label>
          <textarea
            value={responseBody}
            onChange={(e) => setResponseBody(e.target.value)}
            placeholder='{"key": "value"}'
            rows={6}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '13px',
              fontFamily: 'monospace',
              border: `1px solid ${theme.colors.border.secondary}`,
              borderRadius: '6px',
              backgroundColor: theme.colors.background.secondary,
              color: theme.colors.text.primary,
              resize: 'vertical',
            }}
          />
        </div>

        {/* Response Headers */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              Response Headers
            </label>
            <button
              onClick={addHeader}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 600,
                border: `1px solid ${theme.colors.interactive.primary}`,
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: theme.colors.interactive.primary,
                cursor: 'pointer',
              }}
            >
              + Add Header
            </button>
          </div>

          {headers.map((header, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={header.name}
                onChange={(e) => updateHeader(index, 'name', e.target.value)}
                placeholder="Header name"
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  fontSize: '13px',
                  border: `1px solid ${theme.colors.border.secondary}`,
                  borderRadius: '4px',
                  backgroundColor: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                }}
              />
              <input
                type="text"
                value={header.value}
                onChange={(e) => updateHeader(index, 'value', e.target.value)}
                placeholder="Header value"
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  fontSize: '13px',
                  border: `1px solid ${theme.colors.border.secondary}`,
                  borderRadius: '4px',
                  backgroundColor: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                }}
              />
              <button
                onClick={() => removeHeader(index)}
                style={{
                  padding: '8px',
                  fontSize: '16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: theme.colors.status.error,
                  color: 'white',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Delay and Description */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              Delay (ms)
            </label>
            <input
              type="number"
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
              placeholder="0"
              min="0"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: `1px solid ${theme.colors.border.secondary}`,
                borderRadius: '6px',
                backgroundColor: theme.colors.background.secondary,
                color: theme.colors.text.primary,
              }}
            />
          </div>

          <div style={{ flex: 2 }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: `1px solid ${theme.colors.border.secondary}`,
                borderRadius: '6px',
                backgroundColor: theme.colors.background.secondary,
                color: theme.colors.text.primary,
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 600,
              border: `1px solid ${theme.colors.border.secondary}`,
              borderRadius: '6px',
              backgroundColor: theme.colors.background.primary,
              color: theme.colors.text.primary,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              backgroundColor: theme.colors.interactive.primary,
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {initialData ? 'Update' : 'Add'} Endpoint
          </button>
        </div>
      </div>
    </div>
  );
}
