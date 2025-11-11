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

  const handleCreateClick = () => {
    setIsDialogOpen(true);
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
          border: activeEnvironmentId ? '1px solid #4CAF50' : '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: activeEnvironmentId ? '#f1f8f4' : 'white',
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

      {environmentCount === 0 ? (
        <button
          onClick={handleCreateClick}
          aria-label="Create Environment"
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            border: '1px solid #4CAF50',
            borderRadius: '4px',
            backgroundColor: '#4CAF50',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          + Create Environment
        </button>
      ) : (
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
      )}

      <EnvironmentDialog open={isDialogOpen} onClose={handleDialogClose} />
    </div>
  );
}
