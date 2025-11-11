/**
 * Environment Management Workflow Integration Tests
 *
 * Tests the complete CRUD workflow for environment management:
 * - Create environment
 * - Add variables
 * - Rename environment
 * - Edit variables
 * - Delete environment
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnvironmentDialog } from '../../src/renderer/components/EnvironmentDialog/EnvironmentDialog';
import { useEnvironmentStore } from '../../src/renderer/store/environmentStore';

describe('Environment Management Workflow (Integration)', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useEnvironmentStore.getState();
    store.actions.reset();
  });

  it('should complete full CRUD workflow: create → add variables → rename → edit variables → delete', async () => {
    const onClose = vi.fn();
    render(<EnvironmentDialog open={true} onClose={onClose} />);

    // Step 1: Create environment
    const createButton = screen.getByRole('button', { name: /create new environment/i });
    fireEvent.click(createButton);

    const nameInput = screen.getByLabelText(/environment name/i);
    await userEvent.type(nameInput, 'Development');

    const createSubmitButton = screen.getByRole('button', { name: /^create$/i });
    fireEvent.click(createSubmitButton);

    // Verify environment was created
    await waitFor(() => {
      expect(screen.getByText('Development')).toBeInTheDocument();
    });

    const store = useEnvironmentStore.getState();
    const envId = Object.keys(store.environments)[0]!;
    expect(store.environments[envId]!.name).toBe('Development');

    // Step 2: Add variables
    const envElement = screen.getByText('Development');
    fireEvent.click(envElement);

    // Add first variable
    const addVarButton = screen.getByRole('button', { name: /add variable/i });
    fireEvent.click(addVarButton);

    const keyInput = screen.getByPlaceholderText(/variable name/i);
    const valueInput = screen.getByPlaceholderText(/variable value/i);

    await userEvent.type(keyInput, 'baseUrl');
    await userEvent.type(valueInput, 'http://localhost:3000');

    const saveVarButton = screen.getByRole('button', { name: /save variable/i });
    fireEvent.click(saveVarButton);

    // Verify first variable was added
    await waitFor(() => {
      expect(screen.getByText('baseUrl')).toBeInTheDocument();
      expect(screen.getByText('http://localhost:3000')).toBeInTheDocument();
    });

    // Add second variable
    fireEvent.click(screen.getByRole('button', { name: /add variable/i }));

    const keyInput2 = screen.getByPlaceholderText(/variable name/i);
    const valueInput2 = screen.getByPlaceholderText(/variable value/i);

    await userEvent.type(keyInput2, 'apiKey');
    await userEvent.type(valueInput2, 'dev-secret-key');

    fireEvent.click(screen.getByRole('button', { name: /save variable/i }));

    // Verify second variable was added
    await waitFor(() => {
      expect(screen.getByText('apiKey')).toBeInTheDocument();
      expect(screen.getByText('dev-secret-key')).toBeInTheDocument();
    });

    const storeAfterAddVars = useEnvironmentStore.getState();
    expect(storeAfterAddVars.environments[envId]!.variables).toEqual({
      baseUrl: 'http://localhost:3000',
      apiKey: 'dev-secret-key'
    });

    // Step 3: Rename environment
    const renameButton = screen.getByRole('button', { name: /rename/i });
    fireEvent.click(renameButton);

    const envNameInput = screen.getByDisplayValue('Development');
    await userEvent.clear(envNameInput);
    await userEvent.type(envNameInput, 'Dev Environment');

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    // Verify environment was renamed
    await waitFor(() => {
      expect(screen.getByText('Dev Environment')).toBeInTheDocument();
    });

    const storeAfterRename = useEnvironmentStore.getState();
    expect(storeAfterRename.environments[envId]!.name).toBe('Dev Environment');
    expect(storeAfterRename.environments[envId]!.variables).toEqual({
      baseUrl: 'http://localhost:3000',
      apiKey: 'dev-secret-key'
    });

    // Step 4: Edit variables
    fireEvent.click(screen.getByText('Dev Environment'));

    // Edit baseUrl variable
    const editBaseUrlButton = screen.getByRole('button', { name: /edit baseUrl/i });
    fireEvent.click(editBaseUrlButton);

    const baseUrlValueInput = screen.getByDisplayValue('http://localhost:3000');
    await userEvent.clear(baseUrlValueInput);
    await userEvent.type(baseUrlValueInput, 'https://dev.example.com');

    fireEvent.click(screen.getByRole('button', { name: /save variable/i }));

    // Verify variable was updated
    await waitFor(() => {
      expect(screen.getByText('https://dev.example.com')).toBeInTheDocument();
    });

    const storeAfterEditVar = useEnvironmentStore.getState();
    expect(storeAfterEditVar.environments[envId]!.variables['baseUrl']).toBe('https://dev.example.com');

    // Step 5: Delete one variable
    const deleteApiKeyButton = screen.getByRole('button', { name: /delete apiKey/i });
    fireEvent.click(deleteApiKeyButton);

    // Confirm deletion
    const confirmVarDeleteButton = screen.getByRole('button', { name: /confirm deletion/i });
    fireEvent.click(confirmVarDeleteButton);

    // Verify variable was deleted
    await waitFor(() => {
      expect(screen.queryByText('apiKey')).not.toBeInTheDocument();
    });

    const storeAfterDeleteVar = useEnvironmentStore.getState();
    expect(storeAfterDeleteVar.environments[envId]!.variables).toEqual({
      baseUrl: 'https://dev.example.com'
    });

    // Step 6: Delete environment
    const deleteEnvButton = screen.getByRole('button', { name: /delete environment/i });
    fireEvent.click(deleteEnvButton);

    // Confirm deletion
    const confirmEnvDeleteButton = screen.getByRole('button', { name: /confirm deletion/i });
    fireEvent.click(confirmEnvDeleteButton);

    // Verify environment was deleted
    await waitFor(() => {
      expect(screen.queryByText('Dev Environment')).not.toBeInTheDocument();
      expect(screen.getByText(/no environments/i)).toBeInTheDocument();
    });

    const finalStore = useEnvironmentStore.getState();
    expect(Object.keys(finalStore.environments)).toHaveLength(0);
  });

  it('should handle active environment deletion with warning', async () => {
    const onClose = vi.fn();
    render(<EnvironmentDialog open={true} onClose={onClose} />);

    // Create and activate environment
    const createButton = screen.getByRole('button', { name: /create new environment/i });
    fireEvent.click(createButton);

    await userEvent.type(screen.getByLabelText(/environment name/i), 'Production');
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

    await waitFor(() => {
      expect(screen.getByText('Production')).toBeInTheDocument();
    });

    // Set as active
    const store = useEnvironmentStore.getState();
    const envId = Object.keys(store.environments)[0]!;
    store.actions.setActiveEnvironment(envId);

    // Re-render to show active badge
    render(<EnvironmentDialog open={true} onClose={onClose} />);

    // Click environment to edit
    const productionElement = screen.getAllByText('Production')[0];
    if (productionElement) {
      fireEvent.click(productionElement);
    }

    // Click delete
    const deleteButton = screen.getByRole('button', { name: /delete environment/i });
    fireEvent.click(deleteButton);

    // Verify warning appears
    expect(screen.getByText(/currently active/i)).toBeInTheDocument();
    expect(screen.getByText(/no environment will be selected/i)).toBeInTheDocument();

    // Confirm deletion
    fireEvent.click(screen.getByRole('button', { name: /confirm deletion/i }));

    // Verify active environment was cleared
    await waitFor(() => {
      const updatedStore = useEnvironmentStore.getState();
      expect(updatedStore.activeEnvironmentId).toBeNull();
    });
  });

  it('should support multiple environments with independent variable sets', async () => {
    const onClose = vi.fn();
    render(<EnvironmentDialog open={true} onClose={onClose} />);

    // Create first environment with variables
    fireEvent.click(screen.getByRole('button', { name: /create new environment/i }));
    await userEvent.type(screen.getByLabelText(/environment name/i), 'Development');
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

    await waitFor(() => {
      expect(screen.getByText('Development')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Development'));
    fireEvent.click(screen.getByRole('button', { name: /add variable/i }));
    await userEvent.type(screen.getByPlaceholderText(/variable name/i), 'baseUrl');
    await userEvent.type(screen.getByPlaceholderText(/variable value/i), 'http://localhost');
    fireEvent.click(screen.getByRole('button', { name: /save variable/i }));

    await waitFor(() => {
      expect(screen.getByText('http://localhost')).toBeInTheDocument();
    });

    // Go back to list
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Create second environment with different variables
    fireEvent.click(screen.getByRole('button', { name: /create new environment/i }));
    await userEvent.type(screen.getByLabelText(/environment name/i), 'Production');
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

    await waitFor(() => {
      expect(screen.getByText('Production')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Production'));
    fireEvent.click(screen.getByRole('button', { name: /add variable/i }));
    await userEvent.type(screen.getByPlaceholderText(/variable name/i), 'baseUrl');
    await userEvent.type(screen.getByPlaceholderText(/variable value/i), 'https://api.example.com');
    fireEvent.click(screen.getByRole('button', { name: /save variable/i }));

    await waitFor(() => {
      expect(screen.getByText('https://api.example.com')).toBeInTheDocument();
    });

    // Verify both environments exist with correct variables
    const store = useEnvironmentStore.getState();
    const envs = Object.values(store.environments);
    expect(envs).toHaveLength(2);

    const devEnv = envs.find(e => e.name === 'Development');
    const prodEnv = envs.find(e => e.name === 'Production');

    expect(devEnv?.variables['baseUrl']).toBe('http://localhost');
    expect(prodEnv?.variables['baseUrl']).toBe('https://api.example.com');
  });

  it('should prevent duplicate environment names during rename', async () => {
    const onClose = vi.fn();
    render(<EnvironmentDialog open={true} onClose={onClose} />);

    // Create two environments
    fireEvent.click(screen.getByRole('button', { name: /create new environment/i }));
    await userEvent.type(screen.getByLabelText(/environment name/i), 'Development');
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

    await waitFor(() => {
      expect(screen.getByText('Development')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /create new environment/i }));
    await userEvent.type(screen.getByLabelText(/environment name/i), 'Production');
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

    await waitFor(() => {
      expect(screen.getByText('Production')).toBeInTheDocument();
    });

    // Try to rename Development to Production
    fireEvent.click(screen.getByText('Development'));
    fireEvent.click(screen.getByRole('button', { name: /rename/i }));

    const nameInput = screen.getByDisplayValue('Development');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Production');

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    // Should show error
    expect(screen.getByText(/already exists/i)).toBeInTheDocument();

    // Verify name wasn't changed
    const store = useEnvironmentStore.getState();
    const devEnv = Object.values(store.environments).find(e => e.name === 'Development');
    expect(devEnv).toBeDefined();
  });
});
