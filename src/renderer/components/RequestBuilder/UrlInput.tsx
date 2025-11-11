/**
 * UrlInput Component
 *
 * Text input for entering API endpoint URL with variable resolution hints
 */

import React, { useMemo } from 'react';
import { useRequestStore } from '../../store/requestStore';
import { useEnvironmentStore, selectActiveEnvironment } from '../../store/environmentStore';
import { VariableResolutionError } from '../../../lib/variableResolver';

export function UrlInput(): React.ReactElement {
  const url = useRequestStore((state) => state.url);
  const setUrl = useRequestStore((state) => state.actions.setUrl);

  const activeEnvironment = useEnvironmentStore(selectActiveEnvironment);
  const resolveVariables = useEnvironmentStore((state) => state.actions.resolveVariables);
  const validateVariables = useEnvironmentStore((state) => state.actions.validateVariablesForRequest);

  // Check if URL contains variables
  const hasVariables = useMemo(() => {
    return /\{\{[^}]+\}\}/.test(url);
  }, [url]);

  // Validate variables and check for missing ones
  const missingVariables = useMemo(() => {
    if (!hasVariables) {
      return [];
    }
    return validateVariables(url);
  }, [url, hasVariables, validateVariables]);

  // Show warning if variables exist but no environment is selected
  const needsEnvironment = hasVariables && !activeEnvironment;

  // Resolve variables and handle errors
  const { resolvedUrl, error } = useMemo(() => {
    if (!hasVariables || !activeEnvironment) {
      return { resolvedUrl: null, error: null };
    }

    try {
      const resolved = resolveVariables(url);
      return { resolvedUrl: resolved, error: null };
    } catch (err) {
      if (err instanceof VariableResolutionError) {
        return { resolvedUrl: null, error: err.message };
      }
      return { resolvedUrl: null, error: 'Failed to resolve variables' };
    }
  }, [url, hasVariables, activeEnvironment, resolveVariables]);

  const shouldShowHint = hasVariables && activeEnvironment && (resolvedUrl || error);
  const shouldShowWarning = needsEnvironment || (activeEnvironment && missingVariables.length > 0);

  return (
    <div style={{ width: '100%' }}>
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

      {/* Warning banner for missing variables */}
      {shouldShowWarning && (
        <div
          style={{
            marginTop: '4px',
            padding: '6px 8px',
            fontSize: '12px',
            borderRadius: '3px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            color: '#856404',
          }}
        >
          {needsEnvironment ? (
            <div>
              <strong>Warning:</strong> URL contains variables but no environment is selected.
            </div>
          ) : (
            <div>
              <strong>Warning:</strong> Undefined variables: {missingVariables.map(v => `{{${v}}}`).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Variable resolution hint */}
      {shouldShowHint && !shouldShowWarning && (
        <div
          style={{
            marginTop: '4px',
            padding: '6px 8px',
            fontSize: '12px',
            borderRadius: '3px',
            backgroundColor: error ? '#fff3cd' : '#e7f3ff',
            border: `1px solid ${error ? '#ffc107' : '#b3d9ff'}`,
            color: error ? '#856404' : '#004085',
          }}
        >
          {error ? (
            <div>
              <strong>Error:</strong> {error}
            </div>
          ) : (
            <div>
              <span style={{ fontWeight: 600 }}>{activeEnvironment.name}</span> • Resolved: {resolvedUrl}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
