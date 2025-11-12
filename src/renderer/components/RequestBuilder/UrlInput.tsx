/**
 * UrlInput Component
 *
 * Text input for entering API endpoint URL with variable resolution hints
 */

import React, { useMemo } from 'react';
import { useRequestStore } from '../../store/requestStore';
import { useEnvironmentStore, selectActiveEnvironment } from '../../store/environmentStore';
import { VariableResolutionError } from '../../../lib/variableResolver';

// Helper function to resolve variables with error handling
function resolveUrlVariables(
  url: string,
  hasVariables: boolean,
  activeEnvironment: ReturnType<typeof selectActiveEnvironment>,
  resolveVariables: (text: string) => string
): { resolvedUrl: string | null; error: string | null } {
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
}

// Warning message component
function WarningMessage({
  needsEnvironment,
  missingVariables,
}: {
  needsEnvironment: boolean;
  missingVariables: string[];
}): React.ReactElement {
  return (
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
          <strong>Warning:</strong> Undefined variables:{' '}
          {missingVariables.map((v) => `{{${v}}}`).join(', ')}
        </div>
      )}
    </div>
  );
}

// Resolution hint component
function ResolutionHint({
  error,
  environmentName,
  resolvedUrl,
}: {
  error: string | null;
  environmentName: string;
  resolvedUrl: string | null;
}): React.ReactElement {
  return (
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
          <span style={{ fontWeight: 600 }}>{environmentName}</span> • Resolved: {resolvedUrl}
        </div>
      )}
    </div>
  );
}

export function UrlInput(): React.ReactElement {
  const url = useRequestStore((state) => state.url);
  const setUrl = useRequestStore((state) => state.actions.setUrl);

  const activeEnvironment = useEnvironmentStore(selectActiveEnvironment);
  const resolveVariables = useEnvironmentStore((state) => state.actions.resolveVariables);
  const validateVariables = useEnvironmentStore(
    (state) => state.actions.validateVariablesForRequest
  );

  // Check if URL contains variables
  const hasVariables = useMemo(() => /\{\{[^}]+\}\}/.test(url), [url]);

  // Validate variables and check for missing ones
  const missingVariables = useMemo(() => {
    return hasVariables ? validateVariables(url) : [];
  }, [url, hasVariables, validateVariables]);

  // Resolve variables and handle errors
  const { resolvedUrl, error } = useMemo(
    () => resolveUrlVariables(url, hasVariables, activeEnvironment, resolveVariables),
    [url, hasVariables, activeEnvironment, resolveVariables]
  );

  const needsEnvironment = hasVariables && !activeEnvironment;
  const hasMissingVars = activeEnvironment && missingVariables.length > 0;
  const shouldShowWarning = needsEnvironment || hasMissingVars;
  const shouldShowHint = hasVariables && activeEnvironment && !shouldShowWarning;

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

      {shouldShowWarning && (
        <WarningMessage needsEnvironment={needsEnvironment} missingVariables={missingVariables} />
      )}

      {shouldShowHint && activeEnvironment && (
        <ResolutionHint
          error={error}
          environmentName={activeEnvironment.name}
          resolvedUrl={resolvedUrl}
        />
      )}
    </div>
  );
}
