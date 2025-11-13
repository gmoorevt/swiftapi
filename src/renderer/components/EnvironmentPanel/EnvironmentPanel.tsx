/**
 * EnvironmentPanel Component
 *
 * Main panel for managing environments (non-modal version of EnvironmentDialog)
 */

import React, { useState } from 'react';
import { useEnvironmentStore } from '../../store/environmentStore';
import { useTheme } from '../../hooks/useTheme';

type PanelMode = 'list' | 'create' | 'edit';

interface VariableEdit {
  key: string;
  value: string;
  isNew: boolean;
  originalKey?: string;
}

export function EnvironmentPanel(): React.ReactElement {
  const { theme } = useTheme();
  const [mode, setMode] = useState<PanelMode>('list');
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null);
  const [environmentName, setEnvironmentName] = useState('');
  const [error, setError] = useState('');
  const [variableEdit, setVariableEdit] = useState<VariableEdit | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'env' | 'var';
    target: string;
  } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  const environments = useEnvironmentStore((state) => state.environments);
  const activeEnvironmentId = useEnvironmentStore((state) => state.activeEnvironmentId);
  const createEnvironment = useEnvironmentStore((state) => state.actions.createEnvironment);
  const updateEnvironment = useEnvironmentStore((state) => state.actions.updateEnvironment);
  const deleteEnvironment = useEnvironmentStore((state) => state.actions.deleteEnvironment);
  const renameEnvironment = useEnvironmentStore((state) => state.actions.renameEnvironment);

  const selectedEnvironment = selectedEnvironmentId ? environments[selectedEnvironmentId] : null;

  // Sort environments alphabetically
  const sortedEnvironments = Object.values(environments).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Handlers
  const handleCreateNew = () => {
    setMode('create');
    setEnvironmentName('');
    setError('');
  };

  const handleSelectEnvironment = (envId: string) => {
    setMode('edit');
    setSelectedEnvironmentId(envId);
    const env = environments[envId];
    if (!env) {
      return;
    }
    setEnvironmentName(env.name);
    setError('');
  };

  const handleCreateSubmit = () => {
    setError('');

    if (!environmentName.trim()) {
      setError('Environment name is required');
      return;
    }

    // Check for duplicate names
    const duplicate = Object.values(environments).find(
      (env) => env.name.toLowerCase() === environmentName.trim().toLowerCase()
    );
    if (duplicate) {
      setError('An environment with this name already exists');
      return;
    }

    try {
      createEnvironment(environmentName.trim());
      setMode('list');
      setEnvironmentName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create environment');
    }
  };

  const handleEditSave = (): void => {
    if (!selectedEnvironmentId) {
      return;
    }

    setError('');

    if (!environmentName.trim()) {
      setError('Environment name is required');
      return;
    }

    // If renaming, use renameEnvironment method
    if (isRenaming) {
      try {
        renameEnvironment(selectedEnvironmentId, environmentName.trim());
        setMode('list');
        setSelectedEnvironmentId(null);
        setIsRenaming(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to rename environment');
      }
      return;
    }

    setMode('list');
    setSelectedEnvironmentId(null);
  };

  const handleCancel = () => {
    setMode('list');
    setSelectedEnvironmentId(null);
    setEnvironmentName('');
    setError('');
    setIsRenaming(false);
  };

  const handleRename = () => {
    setIsRenaming(true);
    setError('');
  };

  const handleAddVariable = () => {
    setVariableEdit({
      key: '',
      value: '',
      isNew: true,
    });
    setError('');
  };

  const handleEditVariable = (key: string, value: string) => {
    setVariableEdit({
      key,
      value,
      isNew: false,
      originalKey: key,
    });
    setError('');
  };

  const validateVariableKey = (key: string): string | null => {
    if (!key.trim()) {
      return 'Variable name is required';
    }

    const varPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!varPattern.test(key)) {
      return 'Invalid variable name. Must start with letter or underscore, followed by letters, numbers, or underscores.';
    }

    return null;
  };

  const handleSaveVariable = (): void => {
    if (!selectedEnvironmentId || !variableEdit) {
      return;
    }

    setError('');

    const validationError = validateVariableKey(variableEdit.key);
    if (validationError) {
      setError(validationError);
      return;
    }

    const env = environments[selectedEnvironmentId];
    if (!env) {
      return;
    }
    const newVariables = { ...env.variables };

    // If editing and key changed, delete old key
    if (
      !variableEdit.isNew &&
      variableEdit.originalKey &&
      variableEdit.originalKey !== variableEdit.key
    ) {
      delete newVariables[variableEdit.originalKey];
    }

    newVariables[variableEdit.key] = variableEdit.value;

    try {
      updateEnvironment(selectedEnvironmentId, { variables: newVariables });
      setVariableEdit(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save variable');
    }
  };

  const handleDeleteVariable = (key: string) => {
    setDeleteConfirmation({ type: 'var', target: key });
  };

  const handleConfirmDeleteVariable = (): void => {
    if (!selectedEnvironmentId || !deleteConfirmation || deleteConfirmation.type !== 'var') {
      return;
    }

    const env = environments[selectedEnvironmentId];
    if (!env) {
      return;
    }
    const newVariables = { ...env.variables };
    delete newVariables[deleteConfirmation.target];

    updateEnvironment(selectedEnvironmentId, { variables: newVariables });
    setDeleteConfirmation(null);
  };

  const handleDeleteEnvironment = (): void => {
    if (!selectedEnvironmentId) {
      return;
    }
    setDeleteConfirmation({ type: 'env', target: selectedEnvironmentId });
  };

  const handleConfirmDeleteEnvironment = (): void => {
    if (!deleteConfirmation || deleteConfirmation.type !== 'env') {
      return;
    }

    deleteEnvironment(deleteConfirmation.target);
    setDeleteConfirmation(null);
    setMode('list');
    setSelectedEnvironmentId(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
  };

  // Render confirmation dialog
  const renderDeleteConfirmation = (): React.ReactElement | null => {
    if (!deleteConfirmation) {
      return null;
    }

    let message: React.ReactNode;

    if (deleteConfirmation.type === 'env') {
      const envName = environments[deleteConfirmation.target]?.name;
      const isActive = deleteConfirmation.target === activeEnvironmentId;

      if (isActive) {
        message = (
          <>
            <p style={{ margin: '0 0 8px', fontSize: '14px' }}>
              Are you sure you want to delete the environment &quot;{envName}&quot;?
            </p>
            <p
              style={{
                margin: '0 0 16px',
                fontSize: '13px',
                color: '#856404',
                backgroundColor: '#fff3cd',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ffeeba',
              }}
            >
              <strong>Warning:</strong> This environment is currently active. After deletion, no
              environment will be selected.
            </p>
          </>
        );
      } else {
        message = (
          <p style={{ margin: '0 0 16px', fontSize: '14px' }}>
            Are you sure you want to delete the environment &quot;{envName}&quot;?
          </p>
        );
      }
    } else {
      message = (
        <p style={{ margin: '0 0 16px', fontSize: '14px' }}>
          Are you sure you want to delete the variable &quot;{deleteConfirmation.target}&quot;?
        </p>
      );
    }

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
          zIndex: 2000,
        }}
      >
        <div
          style={{
            backgroundColor: theme.colors.background.primary,
            padding: '24px',
            borderRadius: theme.borderRadius.lg,
            maxWidth: '400px',
            boxShadow: theme.shadows.lg,
          }}
        >
          {message}
          <div style={{ display: 'flex', gap: theme.spacing.sm, justifyContent: 'flex-end' }}>
            <button
              onClick={handleCancelDelete}
              aria-label="Cancel deletion"
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                fontSize: theme.typography.fontSizes.sm,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.colors.background.primary,
                color: theme.colors.text.primary,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={
                deleteConfirmation.type === 'env'
                  ? handleConfirmDeleteEnvironment
                  : handleConfirmDeleteVariable
              }
              aria-label="Confirm deletion"
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                fontSize: theme.typography.fontSizes.sm,
                border: 'none',
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.colors.status.error,
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render variable table
  const renderVariableTable = (): React.ReactElement | null => {
    if (!selectedEnvironment) {
      return null;
    }

    const variables = Object.entries(selectedEnvironment.variables);

    return (
      <div style={{ marginTop: theme.spacing.lg }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: theme.typography.fontSizes.sm,
              fontWeight: theme.typography.fontWeights.semibold,
              textTransform: 'uppercase',
              color: theme.colors.text.secondary,
            }}
          >
            Variables
          </h3>
          <button
            onClick={handleAddVariable}
            aria-label="Add Variable"
            style={{
              padding: `${theme.spacing.xs} ${theme.spacing.md}`,
              fontSize: theme.typography.fontSizes.sm,
              border: `1px solid ${theme.colors.interactive.primary}`,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.colors.background.primary,
              color: theme.colors.interactive.primary,
              cursor: 'pointer',
            }}
          >
            Add Variable
          </button>
        </div>

        {variables.length === 0 && !variableEdit ? (
          <div
            style={{
              padding: `${theme.spacing.xl} ${theme.spacing.lg}`,
              textAlign: 'center',
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSizes.sm,
            }}
          >
            No variables defined. Click &quot;Add Variable&quot; to create one.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: theme.typography.fontSizes.sm,
              }}
            >
              <thead>
                <tr style={{ borderBottom: `2px solid ${theme.colors.border.primary}` }}>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: theme.spacing.sm,
                      fontWeight: theme.typography.fontWeights.semibold,
                      color: theme.colors.text.primary,
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: theme.spacing.sm,
                      fontWeight: theme.typography.fontWeights.semibold,
                      color: theme.colors.text.primary,
                    }}
                  >
                    Value
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: theme.spacing.sm,
                      fontWeight: theme.typography.fontWeights.semibold,
                      color: theme.colors.text.primary,
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {variables.map(([key, value]) => (
                  <tr
                    key={key}
                    style={{ borderBottom: `1px solid ${theme.colors.border.primary}` }}
                  >
                    <td style={{ padding: theme.spacing.sm, fontFamily: 'monospace' }}>{key}</td>
                    <td
                      style={{
                        padding: theme.spacing.sm,
                        fontFamily: 'monospace',
                        color: theme.colors.text.secondary,
                      }}
                    >
                      {value}
                    </td>
                    <td style={{ padding: theme.spacing.sm, textAlign: 'right' }}>
                      <button
                        onClick={() => handleEditVariable(key, value)}
                        aria-label={`Edit ${key}`}
                        style={{
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          fontSize: theme.typography.fontSizes.xs,
                          border: `1px solid ${theme.colors.border.primary}`,
                          borderRadius: theme.borderRadius.sm,
                          backgroundColor: theme.colors.background.primary,
                          color: theme.colors.text.primary,
                          cursor: 'pointer',
                          marginRight: theme.spacing.xs,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteVariable(key)}
                        aria-label={`Delete ${key}`}
                        style={{
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          fontSize: theme.typography.fontSizes.xs,
                          border: `1px solid ${theme.colors.status.error}`,
                          borderRadius: theme.borderRadius.sm,
                          backgroundColor: theme.colors.background.primary,
                          color: theme.colors.status.error,
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Variable edit row */}
                {variableEdit && (
                  <tr
                    style={{
                      borderBottom: `1px solid ${theme.colors.border.primary}`,
                      backgroundColor: theme.colors.background.secondary,
                    }}
                  >
                    <td style={{ padding: theme.spacing.sm }}>
                      <input
                        type="text"
                        value={variableEdit.key}
                        onChange={(e) => setVariableEdit({ ...variableEdit, key: e.target.value })}
                        placeholder="Variable name"
                        disabled={!variableEdit.isNew}
                        style={{
                          width: '100%',
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          fontSize: theme.typography.fontSizes.sm,
                          border: `1px solid ${theme.colors.border.primary}`,
                          borderRadius: theme.borderRadius.sm,
                          fontFamily: 'monospace',
                          backgroundColor: theme.colors.background.primary,
                          color: theme.colors.text.primary,
                        }}
                      />
                    </td>
                    <td style={{ padding: theme.spacing.sm }}>
                      <input
                        type="text"
                        value={variableEdit.value}
                        onChange={(e) =>
                          setVariableEdit({ ...variableEdit, value: e.target.value })
                        }
                        placeholder="Variable value"
                        style={{
                          width: '100%',
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          fontSize: theme.typography.fontSizes.sm,
                          border: `1px solid ${theme.colors.border.primary}`,
                          borderRadius: theme.borderRadius.sm,
                          fontFamily: 'monospace',
                          backgroundColor: theme.colors.background.primary,
                          color: theme.colors.text.primary,
                        }}
                      />
                    </td>
                    <td style={{ padding: theme.spacing.sm, textAlign: 'right' }}>
                      <button
                        onClick={handleSaveVariable}
                        aria-label="Save Variable"
                        style={{
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          fontSize: theme.typography.fontSizes.xs,
                          border: 'none',
                          borderRadius: theme.borderRadius.sm,
                          backgroundColor: theme.colors.status.success,
                          color: 'white',
                          cursor: 'pointer',
                          marginRight: theme.spacing.xs,
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setVariableEdit(null)}
                        aria-label="Cancel"
                        style={{
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          fontSize: theme.typography.fontSizes.xs,
                          border: `1px solid ${theme.colors.border.primary}`,
                          borderRadius: theme.borderRadius.sm,
                          backgroundColor: theme.colors.background.primary,
                          color: theme.colors.text.primary,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Render list mode
  const renderList = () => {
    return (
      <>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: theme.typography.fontSizes.lg,
              fontWeight: theme.typography.fontWeights.semibold,
            }}
          >
            Manage Environments
          </h2>
          <button
            onClick={handleCreateNew}
            aria-label="Create New Environment"
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              fontSize: theme.typography.fontSizes.sm,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.colors.interactive.primary,
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Create New Environment
          </button>
        </div>

        {sortedEnvironments.length === 0 ? (
          <div
            style={{
              padding: `${theme.spacing.xxl} ${theme.spacing.xl}`,
              textAlign: 'center',
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSizes.sm,
            }}
          >
            No environments yet. Create one to get started.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
            {sortedEnvironments.map((env) => {
              const isActive = env.id === activeEnvironmentId;
              const variableCount = Object.keys(env.variables).length;

              return (
                <div
                  key={env.id}
                  onClick={() => handleSelectEnvironment(env.id)}
                  style={{
                    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                    border: `1px solid ${isActive ? theme.colors.interactive.primary : theme.colors.border.primary}`,
                    borderRadius: theme.borderRadius.md,
                    backgroundColor: isActive
                      ? theme.colors.interactive.primary + '10'
                      : theme.colors.background.primary,
                    cursor: 'pointer',
                    transition: theme.transitions.normal,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                        <span
                          style={{
                            fontSize: theme.typography.fontSizes.base,
                            fontWeight: theme.typography.fontWeights.semibold,
                          }}
                        >
                          {env.name}
                        </span>
                        {isActive && (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                              fontSize: theme.typography.fontSizes.xs,
                              fontWeight: theme.typography.fontWeights.semibold,
                              borderRadius: theme.borderRadius.full,
                              backgroundColor: theme.colors.interactive.primary,
                              color: 'white',
                            }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: theme.typography.fontSizes.sm,
                          color: theme.colors.text.secondary,
                          marginTop: theme.spacing.xs,
                        }}
                      >
                        {variableCount} {variableCount === 1 ? 'variable' : 'variables'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  // Render create mode
  const renderCreate = () => {
    return (
      <>
        <h2
          style={{
            margin: `0 0 ${theme.spacing.lg}`,
            fontSize: theme.typography.fontSizes.lg,
            fontWeight: theme.typography.fontWeights.semibold,
          }}
        >
          Create New Environment
        </h2>

        <div style={{ marginBottom: theme.spacing.lg }}>
          <label
            htmlFor="env-name"
            style={{
              display: 'block',
              marginBottom: theme.spacing.sm,
              fontSize: theme.typography.fontSizes.sm,
              fontWeight: theme.typography.fontWeights.semibold,
            }}
          >
            Environment Name
          </label>
          <input
            id="env-name"
            type="text"
            value={environmentName}
            onChange={(e) => setEnvironmentName(e.target.value)}
            placeholder="e.g., Development, Staging, Production"
            style={{
              width: '100%',
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              fontSize: theme.typography.fontSizes.base,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.colors.background.primary,
              color: theme.colors.text.primary,
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              marginBottom: theme.spacing.lg,
              backgroundColor: theme.colors.status.error + '20',
              color: theme.colors.status.error,
              border: `1px solid ${theme.colors.status.error}`,
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSizes.sm,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: theme.spacing.sm, justifyContent: 'flex-end' }}>
          <button
            onClick={handleCancel}
            aria-label="Cancel"
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              fontSize: theme.typography.fontSizes.sm,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.colors.background.primary,
              color: theme.colors.text.primary,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateSubmit}
            aria-label="Create"
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              fontSize: theme.typography.fontSizes.sm,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.colors.interactive.primary,
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Create
          </button>
        </div>
      </>
    );
  };

  // Render edit mode
  const renderEdit = () => {
    return (
      <>
        <h2
          style={{
            margin: `0 0 ${theme.spacing.lg}`,
            fontSize: theme.typography.fontSizes.lg,
            fontWeight: theme.typography.fontWeights.semibold,
          }}
        >
          Edit Environment
        </h2>

        <div style={{ marginBottom: theme.spacing.lg }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.sm,
            }}
          >
            <label
              htmlFor="env-name"
              style={{
                fontSize: theme.typography.fontSizes.sm,
                fontWeight: theme.typography.fontWeights.semibold,
              }}
            >
              Environment Name
            </label>
            {!isRenaming && (
              <button
                onClick={handleRename}
                aria-label="Rename"
                style={{
                  padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                  fontSize: theme.typography.fontSizes.sm,
                  border: `1px solid ${theme.colors.interactive.primary}`,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: theme.colors.background.primary,
                  color: theme.colors.interactive.primary,
                  cursor: 'pointer',
                }}
              >
                Rename
              </button>
            )}
          </div>
          <input
            id="env-name"
            type="text"
            value={environmentName}
            onChange={(e) => setEnvironmentName(e.target.value)}
            disabled={!isRenaming}
            style={{
              width: '100%',
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              fontSize: theme.typography.fontSizes.base,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borderRadius.md,
              backgroundColor: isRenaming
                ? theme.colors.background.primary
                : theme.colors.background.secondary,
              color: theme.colors.text.primary,
              cursor: isRenaming ? 'text' : 'not-allowed',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              marginBottom: theme.spacing.lg,
              backgroundColor: theme.colors.status.error + '20',
              color: theme.colors.status.error,
              border: `1px solid ${theme.colors.status.error}`,
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSizes.sm,
            }}
          >
            {error}
          </div>
        )}

        {renderVariableTable()}

        <div
          style={{
            display: 'flex',
            gap: theme.spacing.sm,
            justifyContent: 'space-between',
            marginTop: theme.spacing.xl,
          }}
        >
          <button
            onClick={handleDeleteEnvironment}
            aria-label="Delete Environment"
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              fontSize: theme.typography.fontSizes.sm,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.colors.status.error,
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Delete Environment
          </button>

          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <button
              onClick={handleCancel}
              aria-label="Cancel"
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                fontSize: theme.typography.fontSizes.sm,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.colors.background.primary,
                color: theme.colors.text.primary,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              aria-label="Save"
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                fontSize: theme.typography.fontSizes.sm,
                border: 'none',
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.colors.interactive.primary,
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Save
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
      }}
    >
      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: theme.spacing.xl }}>
        {mode === 'list' && renderList()}
        {mode === 'create' && renderCreate()}
        {mode === 'edit' && renderEdit()}
      </div>

      {/* Delete Confirmation Modal */}
      {renderDeleteConfirmation()}
    </div>
  );
}
