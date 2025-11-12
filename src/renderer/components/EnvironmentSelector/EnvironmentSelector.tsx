/**
 * EnvironmentSelector Component
 *
 * Simple dropdown selector for quickly switching active environments
 * To manage environments (create/edit/delete), use the Environments section in the left sidebar
 */

import React from 'react';
import { useEnvironmentStore } from '../../store/environmentStore';
import { useTheme } from '../../hooks/useTheme';

export function EnvironmentSelector(): React.ReactElement {
  const { theme } = useTheme();

  const environments = useEnvironmentStore((state) => state.environments);
  const activeEnvironmentId = useEnvironmentStore((state) => state.activeEnvironmentId);
  const setActiveEnvironment = useEnvironmentStore((state) => state.actions.setActiveEnvironment);

  // Sort environments alphabetically by name
  const sortedEnvironments = Object.values(environments).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const handleEnvironmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setActiveEnvironment(value === '' ? null : value);
  };

  return (
    <select
      value={activeEnvironmentId ?? ''}
      onChange={handleEnvironmentChange}
      aria-label="Environment selector"
      style={{
        padding: '6px 10px',
        fontSize: '13px',
        border: activeEnvironmentId
          ? `1px solid ${theme.colors.interactive.secondary}`
          : `1px solid ${theme.colors.border.secondary}`,
        borderRadius: '4px',
        backgroundColor: activeEnvironmentId
          ? theme.colors.background.tertiary
          : theme.colors.background.primary,
        color: theme.colors.text.primary,
        cursor: 'pointer',
        minWidth: '150px',
        fontWeight: activeEnvironmentId ? 600 : 'normal',
      }}
    >
      <option value="">No Environment</option>
      {sortedEnvironments.map((env) => (
        <option key={env.id} value={env.id}>
          {env.name}
        </option>
      ))}
    </select>
  );
}
