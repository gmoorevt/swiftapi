/**
 * ErrorDisplay Component
 *
 * Displays user-friendly error messages with expandable technical details
 * and retry functionality for recoverable errors.
 */

import React, { useState } from 'react';
import type { ClassifiedError } from '../../../lib/errorClassifier';
import { ErrorCategory } from '../../../lib/errorClassifier';
import { useTheme } from '../../hooks/useTheme';

interface ErrorDisplayProps {
  error: ClassifiedError;
  onRetry?: () => void;
}

// Lookup maps for error styling
const ERROR_COLORS: Record<ErrorCategory, string> = {
  [ErrorCategory.NETWORK]: '#e74c3c',
  [ErrorCategory.DNS]: '#e74c3c',
  [ErrorCategory.CONNECTION_REFUSED]: '#e74c3c',
  [ErrorCategory.TIMEOUT]: '#f39c12',
  [ErrorCategory.SSL_ERROR]: '#e67e22',
  [ErrorCategory.CLIENT_ERROR]: '#f39c12',
  [ErrorCategory.SERVER_ERROR]: '#e74c3c',
  [ErrorCategory.CANCELLED]: '#95a5a6',
  [ErrorCategory.INVALID_URL]: '#e74c3c',
  [ErrorCategory.VARIABLE_ERROR]: '#f39c12',
  [ErrorCategory.UNKNOWN]: '#e74c3c',
};

const BACKGROUND_COLORS: Record<ErrorCategory, { light: string; dark: string }> = {
  [ErrorCategory.NETWORK]: { light: '#fadbd8', dark: '#3a1f1f' },
  [ErrorCategory.DNS]: { light: '#fadbd8', dark: '#3a1f1f' },
  [ErrorCategory.CONNECTION_REFUSED]: { light: '#fadbd8', dark: '#3a1f1f' },
  [ErrorCategory.TIMEOUT]: { light: '#fdebd0', dark: '#3a311f' },
  [ErrorCategory.SSL_ERROR]: { light: '#fce5d3', dark: '#3a2b1f' },
  [ErrorCategory.CLIENT_ERROR]: { light: '#fdebd0', dark: '#3a311f' },
  [ErrorCategory.SERVER_ERROR]: { light: '#fadbd8', dark: '#3a1f1f' },
  [ErrorCategory.CANCELLED]: { light: '#ecf0f1', dark: '#2a2a2a' },
  [ErrorCategory.INVALID_URL]: { light: '#fadbd8', dark: '#3a1f1f' },
  [ErrorCategory.VARIABLE_ERROR]: { light: '#fdebd0', dark: '#3a311f' },
  [ErrorCategory.UNKNOWN]: { light: '#fadbd8', dark: '#3a1f1f' },
};

const ERROR_ICONS: Record<ErrorCategory, string> = {
  [ErrorCategory.NETWORK]: '🔌',
  [ErrorCategory.DNS]: '🔌',
  [ErrorCategory.CONNECTION_REFUSED]: '🔌',
  [ErrorCategory.TIMEOUT]: '⏱️',
  [ErrorCategory.SSL_ERROR]: '🔒',
  [ErrorCategory.CLIENT_ERROR]: '⚠️',
  [ErrorCategory.SERVER_ERROR]: '💥',
  [ErrorCategory.CANCELLED]: '🛑',
  [ErrorCategory.INVALID_URL]: '🔗',
  [ErrorCategory.VARIABLE_ERROR]: '⚠️',
  [ErrorCategory.UNKNOWN]: '❌',
};

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps): React.ReactElement {
  const [showDetails, setShowDetails] = useState(false);
  const { theme } = useTheme();

  const getErrorColor = (): string => {
    return ERROR_COLORS[error.category] || ERROR_COLORS[ErrorCategory.UNKNOWN];
  };

  const getBackgroundColor = (): string => {
    const colors = BACKGROUND_COLORS[error.category] || BACKGROUND_COLORS[ErrorCategory.UNKNOWN];
    return theme.mode === 'dark' ? colors.dark : colors.light;
  };

  const getErrorIcon = (): string => {
    return ERROR_ICONS[error.category] || ERROR_ICONS[ErrorCategory.UNKNOWN];
  };

  return (
    <div
      role="alert"
      data-error-category={error.category}
      style={{
        padding: '16px',
        backgroundColor: getBackgroundColor(),
        borderLeft: `4px solid ${getErrorColor()}`,
        borderRadius: '4px',
        marginBottom: '16px',
      }}
    >
      {/* Error Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <span style={{ fontSize: '24px' }}>{getErrorIcon()}</span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: getErrorColor(),
              marginBottom: '4px',
            }}
          >
            {error.userMessage}
          </div>
          {error.suggestion && (
            <div
              style={{
                fontSize: '14px',
                color: theme.colors.text.secondary,
                lineHeight: '1.5',
              }}
            >
              {error.suggestion}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginTop: '12px',
        }}
      >
        {/* Retry Button (only for retryable errors) */}
        {error.retryable && onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2980b9';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3498db';
            }}
          >
            Retry Request
          </button>
        )}

        {/* Technical Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            padding: '8px 16px',
            backgroundColor: theme.colors.background.primary,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.secondary}`,
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = theme.colors.background.secondary;
          }}
          onMouseOut={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = theme.colors.background.primary;
          }}
        >
          {showDetails ? 'Hide' : 'Show'} Technical Details
        </button>
      </div>

      {/* Technical Details (Expandable) */}
      {showDetails && (
        <div
          data-testid="technical-details"
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '13px',
            color: theme.colors.text.secondary,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {error.technicalDetails}
        </div>
      )}
    </div>
  );
}
