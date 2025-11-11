/**
 * EnvironmentDialog Component
 *
 * Modal dialog for managing environments with create/edit forms and variable tables
 */

import React, { useState, useEffect } from 'react';
import { useEnvironmentStore } from '../../store/environmentStore';

interface EnvironmentDialogProps {
  open: boolean;
  onClose: () => void;
}

type DialogMode = 'list' | 'create' | 'edit';

interface VariableEdit {
  key: string;
  value: string;
  isNew: boolean;
  originalKey?: string;
}

export function EnvironmentDialog({ open, onClose }: EnvironmentDialogProps): React.ReactElement | null {
  const [mode, setMode] = useState<DialogMode>('list');
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null);
  const [environmentName, setEnvironmentName] = useState('');
  const [error, setError] = useState('');
  const [variableEdit, setVariableEdit] = useState<VariableEdit | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: 'env' | 'var'; target: string } | null>(null);
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

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setMode('list');
      setSelectedEnvironmentId(null);
      setEnvironmentName('');
      setError('');
      setVariableEdit(null);
      setDeleteConfirmation(null);
      setIsRenaming(false);
    }
  }, [open]);

  // Handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (deleteConfirmation) {
        setDeleteConfirmation(null);
      } else if (variableEdit) {
        setVariableEdit(null);
      } else if (mode === 'create' || mode === 'edit') {
        setMode('list');
        setSelectedEnvironmentId(null);
        setError('');
      } else {
        onClose();
      }
    }
  };

  if (!open) {
    return null;
  }

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

    // Otherwise, just update (for other changes if any in future)
    try {
      updateEnvironment(selectedEnvironmentId, { name: environmentName.trim() });
      setMode('list');
      setSelectedEnvironmentId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update environment');
    }
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
    if (!variableEdit.isNew && variableEdit.originalKey && variableEdit.originalKey !== variableEdit.key) {
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
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#856404', backgroundColor: '#fff3cd', padding: '8px', borderRadius: '4px', border: '1px solid #ffeeba' }}>
              <strong>Warning:</strong> This environment is currently active. After deletion, no environment will be selected.
            </p>
          </>
        );
      } else {
        message = <p style={{ margin: '0 0 16px', fontSize: '14px' }}>Are you sure you want to delete the environment &quot;{envName}&quot;?</p>;
      }
    } else {
      message = <p style={{ margin: '0 0 16px', fontSize: '14px' }}>Are you sure you want to delete the variable &quot;{deleteConfirmation.target}&quot;?</p>;
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
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          {message}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={handleCancelDelete}
              aria-label="Cancel deletion"
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={deleteConfirmation.type === 'env' ? handleConfirmDeleteEnvironment : handleConfirmDeleteVariable}
              aria-label="Confirm deletion"
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#dc3545',
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
      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', color: '#666' }}>
            Variables
          </h3>
          <button
            onClick={handleAddVariable}
            aria-label="Add Variable"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              border: '1px solid #007bff',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: '#007bff',
              cursor: 'pointer',
            }}
          >
            Add Variable
          </button>
        </div>

        {variables.length === 0 && !variableEdit ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
            No variables defined. Click &quot;Add Variable&quot; to create one.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600, color: '#333' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600, color: '#333' }}>Value</th>
                <th style={{ textAlign: 'right', padding: '8px', fontWeight: 600, color: '#333' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
            {variables.map(([key, value]) => (
              <tr key={key} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '8px', fontFamily: 'monospace' }}>{key}</td>
                <td style={{ padding: '8px', fontFamily: 'monospace', color: '#666' }}>{value}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleEditVariable(key, value)}
                    aria-label={`Edit ${key}`}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      border: '1px solid #ddd',
                      borderRadius: '3px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      marginRight: '4px',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteVariable(key)}
                    aria-label={`Delete ${key}`}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      border: '1px solid #dc3545',
                      borderRadius: '3px',
                      backgroundColor: 'white',
                      color: '#dc3545',
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
              <tr style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: '#f8f9fa' }}>
                <td style={{ padding: '8px' }}>
                  <input
                    type="text"
                    value={variableEdit.key}
                    onChange={(e) => setVariableEdit({ ...variableEdit, key: e.target.value })}
                    placeholder="Variable name"
                    disabled={!variableEdit.isNew}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: '13px',
                      border: '1px solid #ddd',
                      borderRadius: '3px',
                      fontFamily: 'monospace',
                    }}
                  />
                </td>
                <td style={{ padding: '8px' }}>
                  <input
                    type="text"
                    value={variableEdit.value}
                    onChange={(e) => setVariableEdit({ ...variableEdit, value: e.target.value })}
                    placeholder="Variable value"
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: '13px',
                      border: '1px solid #ddd',
                      borderRadius: '3px',
                      fontFamily: 'monospace',
                    }}
                  />
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  <button
                    onClick={handleSaveVariable}
                    aria-label="Save Variable"
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      border: 'none',
                      borderRadius: '3px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      cursor: 'pointer',
                      marginRight: '4px',
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setVariableEdit(null)}
                    aria-label="Cancel"
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      border: '1px solid #ddd',
                      borderRadius: '3px',
                      backgroundColor: 'white',
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
        )}
      </div>
    );
  };

  // Render list mode
  const renderList = () => {
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Manage Environments</h2>
          <button
            onClick={handleCreateNew}
            aria-label="Create New Environment"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#007bff',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Create New Environment
          </button>
        </div>

        {sortedEnvironments.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
            No environments yet. Create one to get started.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sortedEnvironments.map((env) => {
              const isActive = env.id === activeEnvironmentId;
              const variableCount = Object.keys(env.variables).length;

              return (
                <div
                  key={env.id}
                  onClick={() => handleSelectEnvironment(env.id)}
                  className={isActive ? 'active' : ''}
                  data-active={isActive ? 'true' : 'false'}
                  style={{
                    padding: '12px 16px',
                    border: `1px solid ${isActive ? '#007bff' : '#e0e0e0'}`,
                    borderRadius: '4px',
                    backgroundColor: isActive ? '#f0f8ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{env.name}</span>
                        {isActive && (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              fontSize: '11px',
                              fontWeight: 600,
                              borderRadius: '10px',
                              backgroundColor: '#007bff',
                              color: 'white',
                            }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
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
        <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600 }}>Create New Environment</h2>

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="env-name"
            style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}
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
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: '8px 12px',
              marginBottom: '16px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleCancel}
            aria-label="Cancel"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateSubmit}
            aria-label="Create"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#007bff',
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
        <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600 }}>Edit Environment</h2>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label
              htmlFor="env-name"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              Environment Name
            </label>
            {!isRenaming && (
              <button
                onClick={handleRename}
                aria-label="Rename"
                style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  border: '1px solid #007bff',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  color: '#007bff',
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
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: isRenaming ? 'white' : '#f5f5f5',
              cursor: isRenaming ? 'text' : 'not-allowed',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: '8px 12px',
              marginBottom: '16px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        {renderVariableTable()}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', marginTop: '24px' }}>
          <button
            onClick={handleDeleteEnvironment}
            aria-label="Delete Environment"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#dc3545',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Delete Environment
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCancel}
              aria-label="Cancel"
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              aria-label="Save"
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#007bff',
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
    <>
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
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          onKeyDown={handleKeyDown}
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            minWidth: '600px',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              {mode === 'list' && renderList()}
              {mode === 'create' && renderCreate()}
              {mode === 'edit' && renderEdit()}
            </div>
            {mode === 'list' && (
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  padding: '4px 8px',
                  fontSize: '16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  marginLeft: '16px',
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {renderDeleteConfirmation()}
    </>
  );
}
