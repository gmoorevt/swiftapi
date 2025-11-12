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

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps): React.ReactElement {
  const [showDetails, setShowDetails] = useState(false);
  const { theme } = useTheme();

  const getErrorColor = (): string => {
    switch (error.category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.DNS:
      case ErrorCategory.CONNECTION_REFUSED:
        return '#e74c3c'; // Red
      case ErrorCategory.TIMEOUT:
        return '#f39c12'; // Orange
      case ErrorCategory.SSL_ERROR:
        return '#e67e22'; // Dark orange
      case ErrorCategory.CLIENT_ERROR:
        return '#f39c12'; // Orange
      case ErrorCategory.SERVER_ERROR:
        return '#e74c3c'; // Red
      case ErrorCategory.CANCELLED:
        return '#95a5a6'; // Gray
      case ErrorCategory.VARIABLE_ERROR:
        return '#f39c12'; // Orange
      default:
        return '#e74c3c'; // Red
    }
  };

  const getBackgroundColor = (): string => {
    const isDark = theme.mode === 'dark';
    switch (error.category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.DNS:
      case ErrorCategory.CONNECTION_REFUSED:
        return isDark ? '#3a1f1f' : '#fadbd8'; // Light/dark red
      case ErrorCategory.TIMEOUT:
        return isDark ? '#3a311f' : '#fdebd0'; // Light/dark orange
      case ErrorCategory.SSL_ERROR:
        return isDark ? '#3a2b1f' : '#fce5d3'; // Light/dark orange
      case ErrorCategory.CLIENT_ERROR:
        return isDark ? '#3a311f' : '#fdebd0'; // Light/dark orange
      case ErrorCategory.SERVER_ERROR:
        return isDark ? '#3a1f1f' : '#fadbd8'; // Light/dark red
      case ErrorCategory.CANCELLED:
        return isDark ? '#2a2a2a' : '#ecf0f1'; // Light/dark gray
      case ErrorCategory.VARIABLE_ERROR:
        return isDark ? '#3a311f' : '#fdebd0'; // Light/dark orange
      default:
        return isDark ? '#3a1f1f' : '#fadbd8'; // Light/dark red
    }
  };

  const getErrorIcon = (): string => {
    switch (error.category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.DNS:
      case ErrorCategory.CONNECTION_REFUSED:
        return '🔌';
      case ErrorCategory.TIMEOUT:
        return '⏱️';
      case ErrorCategory.SSL_ERROR:
        return '🔒';
      case ErrorCategory.CLIENT_ERROR:
        return '⚠️';
      case ErrorCategory.SERVER_ERROR:
        return '💥';
      case ErrorCategory.CANCELLED:
        return '🛑';
      case ErrorCategory.INVALID_URL:
        return '🔗';
      case ErrorCategory.VARIABLE_ERROR:
        return '⚠️';
      default:
        return '❌';
    }
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
