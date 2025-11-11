/**
 * EnvironmentSelector Component
 *
 * Dropdown selector for switching active environments with "Manage Environments" button
 */

import React, { useState } from 'react';
import { useEnvironmentStore } from '../../store/environmentStore';
import { EnvironmentDialog } from '../EnvironmentDialog/EnvironmentDialog';

export function EnvironmentSelector(): React.ReactElement {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const environments = useEnvironmentStore((state) => state.environments);
  const activeEnvironmentId = useEnvironmentStore((state) => state.activeEnvironmentId);
  const setActiveEnvironment = useEnvironmentStore((state) => state.actions.setActiveEnvironment);

  // Sort environments alphabetically by name
  const sortedEnvironments = Object.values(environments).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const environmentCount = sortedEnvironments.length;

  const handleEnvironmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setActiveEnvironment(value === '' ? null : value);
  };

  const handleManageClick = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <select
        value={activeEnvironmentId ?? ''}
        onChange={handleEnvironmentChange}
        aria-label="Environment selector"
        style={{
          padding: '6px 10px',
          fontSize: '13px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: 'white',
          cursor: 'pointer',
          minWidth: '150px',
        }}
      >
        <option value="">No Environment</option>
        {sortedEnvironments.map((env) => (
          <option key={env.id} value={env.id}>
            {env.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleManageClick}
        aria-label="Manage Environments"
        style={{
          padding: '6px 12px',
          fontSize: '13px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        Manage
        {environmentCount > 0 && (
          <span
            style={{
              display: 'inline-block',
              padding: '2px 6px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '10px',
              backgroundColor: '#e0e0e0',
              color: '#333',
            }}
          >
            {environmentCount}
          </span>
        )}
      </button>

      <EnvironmentDialog open={isDialogOpen} onClose={handleDialogClose} />
    </div>
  );
}
