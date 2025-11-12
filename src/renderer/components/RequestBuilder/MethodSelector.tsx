/**
 * MethodSelector Component
 *
 * Dropdown for selecting HTTP method (GET, POST, PUT, DELETE)
 */

import React from 'react';
import { useRequestStore } from '../../store/requestStore';
import { HttpMethod } from '../../../types/request.types';
import { useTheme } from '../../hooks/useTheme';

export function MethodSelector(): React.ReactElement {
  const method = useRequestStore((state) => state.method);
  const setMethod = useRequestStore((state) => state.actions.setMethod);
  const { theme } = useTheme();

  return (
    <select
      value={method}
      onChange={(e) => setMethod(e.target.value as HttpMethod)}
      className="method-selector"
      style={{
        padding: '8px 12px',
        fontSize: '14px',
        border: `1px solid ${theme.colors.border.secondary}`,
        borderRadius: '4px',
        backgroundColor: theme.colors.background.primary,
        color: theme.colors.text.primary,
        cursor: 'pointer',
      }}
    >
      <option value={HttpMethod.GET}>GET</option>
      <option value={HttpMethod.POST}>POST</option>
      <option value={HttpMethod.PUT}>PUT</option>
      <option value={HttpMethod.DELETE}>DELETE</option>
    </select>
  );
}
