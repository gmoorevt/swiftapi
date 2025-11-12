/**
 * EnvironmentDialog Component Tests
 *
 * Tests for environment management dialog with create/edit form and variable table
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnvironmentDialog } from './EnvironmentDialog';
import { useEnvironmentStore } from '../../store/environmentStore';

describe('EnvironmentDialog', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useEnvironmentStore.getState();
    store.actions.reset();
  });

  describe('Dialog rendering', () => {
    it('should render dialog when open prop is true', () => {
      render(<EnvironmentDialog open={true} onClose={() => {}} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render dialog when open prop is false', () => {
      render(<EnvironmentDialog open={false} onClose={() => {}} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render dialog title', () => {
      render(<EnvironmentDialog open={true} onClose={() => {}} />);
      expect(screen.getByText('Manage Environments')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<EnvironmentDialog open={true} onClose={() => {}} />);
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('should call onClose when close button clicked', () => {
      const onClose = vi.fn();
      render(<EnvironmentDialog open={true} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key pressed', () => {
      const onClose = vi.fn();
      render(<EnvironmentDialog open={true} onClose={onClose} />);

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Environment list display', () => {
    it('should display "No environments" message when no environments exist', () => {
      render(<EnvironmentDialog open={true} onClose={() => {}} />);
      expect(screen.getByText(/no environments/i)).toBeInTheDocument();
    });

    it('should display list of existing environments', () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', { base_url: 'http://dev.example.com' });
      store.actions.createEnvironment('Staging', { base_url: 'http://staging.example.com' });

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Staging')).toBeInTheDocument();
    });

    it('should display variable count for each environment', () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', {
        base_url: 'http://dev.example.com',
        api_key: 'dev-key',
      });

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      expect(screen.getByText(/2 variables/i)).toBeInTheDocument();
    });

    it('should sort environments alphabetically by name', () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Production', {});
      store.actions.createEnvironment('Development', {});
      store.actions.createEnvironment('Staging', {});

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElements = screen.getAllByText(/Development|Production|Staging/);
      const envNames = envElements.map((el) => el.textContent);

      expect(envNames[0]).toContain('Development');
      expect(envNames[1]).toContain('Production');
      expect(envNames[2]).toContain('Staging');
    });
  });

  describe('Create new environment', () => {
    it('should render "Create New Environment" button', () => {
      render(<EnvironmentDialog open={true} onClose={() => {}} />);
      expect(screen.getByRole('button', { name: /create new environment/i })).toBeInTheDocument();
    });

    it('should show create form when "Create New Environment" clicked', () => {
      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const createButton = screen.getByRole('button', { name: /create new environment/i });
      fireEvent.click(createButton);

      expect(screen.getByLabelText(/environment name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^create$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should create environment when form submitted with valid name', async () => {
      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const createButton = screen.getByRole('button', { name: /create new environment/i });
      fireEvent.click(createButton);

      const nameInput = screen.getByLabelText(/environment name/i);
      await userEvent.type(nameInput, 'Development');

      const submitButton = screen.getByRole('button', { name: /^create$/i });
      fireEvent.click(submitButton);

      // Environment should be created in store
      const store = useEnvironmentStore.getState();
      const envs = Object.values(store.environments);
      expect(envs).toHaveLength(1);
      expect(envs[0]!.name).toBe('Development');
    });

    it('should show error for empty environment name', async () => {
      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const createButton = screen.getByRole('button', { name: /create new environment/i });
      fireEvent.click(createButton);

      const submitButton = screen.getByRole('button', { name: /^create$/i });
      fireEvent.click(submitButton);

      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    it('should show error for duplicate environment name', async () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', {});

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const createButton = screen.getByRole('button', { name: /create new environment/i });
      fireEvent.click(createButton);

      const nameInput = screen.getByLabelText(/environment name/i);
      await userEvent.type(nameInput, 'Development');

      const submitButton = screen.getByRole('button', { name: /^create$/i });
      fireEvent.click(submitButton);

      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });

    it('should cancel create form when cancel button clicked', async () => {
      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const createButton = screen.getByRole('button', { name: /create new environment/i });
      fireEvent.click(createButton);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      // Form should be hidden
      expect(screen.queryByLabelText(/environment name/i)).not.toBeInTheDocument();
    });
  });

  describe('Edit environment', () => {
    it('should show edit form when environment clicked', () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', { base_url: 'http://dev.example.com' });

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      expect(screen.getByDisplayValue('Development')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should display variables table in edit mode', () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', {
        base_url: 'http://dev.example.com',
        api_key: 'dev-key',
      });

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      expect(screen.getByText('base_url')).toBeInTheDocument();
      expect(screen.getByText('http://dev.example.com')).toBeInTheDocument();
      expect(screen.getByText('api_key')).toBeInTheDocument();
      expect(screen.getByText('dev-key')).toBeInTheDocument();
    });

    it('should update environment name when saved', async () => {
      const store = useEnvironmentStore.getState();
      const envId = store.actions.createEnvironment('Development', {});

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      // Click rename button to enable editing
      const renameButton = screen.getByRole('button', { name: /rename/i });
      fireEvent.click(renameButton);

      const nameInput = screen.getByDisplayValue('Development');
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Dev Environment');

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      const updatedStore = useEnvironmentStore.getState();
      expect(updatedStore.environments[envId]!.name).toBe('Dev Environment');
    });

    it('should cancel edit when cancel button clicked', async () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', {});

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      // Click rename button to enable editing
      const renameButton = screen.getByRole('button', { name: /rename/i });
      fireEvent.click(renameButton);

      const nameInput = screen.getByDisplayValue('Development');
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Modified Name');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      // Name should not be changed
      const updatedStore = useEnvironmentStore.getState();
      const envs = Object.values(updatedStore.environments);
      expect(envs[0]!.name).toBe('Development');
    });
  });

  describe('Variable management', () => {
    it('should render "Add Variable" button in edit mode', () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', {});

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      expect(screen.getByRole('button', { name: /add variable/i })).toBeInTheDocument();
    });

    it('should show empty state when no variables exist', () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', {});

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      expect(screen.getByText(/no variables defined/i)).toBeInTheDocument();
    });

    it('should add new variable when "Add Variable" clicked and filled', async () => {
      const store = useEnvironmentStore.getState();
      const envId = store.actions.createEnvironment('Development', {});

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      const addButton = screen.getByRole('button', { name: /add variable/i });
      fireEvent.click(addButton);

      const keyInput = screen.getByPlaceholderText(/variable name/i);
      const valueInput = screen.getByPlaceholderText(/variable value/i);

      await userEvent.type(keyInput, 'base_url');
      await userEvent.type(valueInput, 'http://dev.example.com');

      const saveVarButton = screen.getByRole('button', { name: /save variable/i });
      fireEvent.click(saveVarButton);

      const updatedStore = useEnvironmentStore.getState();
      expect(updatedStore.environments[envId]!.variables['base_url']).toBe(
        'http://dev.example.com'
      );
    });

    it('should show error for invalid variable name', async () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', {});

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      const addButton = screen.getByRole('button', { name: /add variable/i });
      fireEvent.click(addButton);

      const keyInput = screen.getByPlaceholderText(/variable name/i);
      const valueInput = screen.getByPlaceholderText(/variable value/i);

      await userEvent.type(keyInput, '123invalid');
      await userEvent.type(valueInput, 'value');

      const saveVarButton = screen.getByRole('button', { name: /save variable/i });
      fireEvent.click(saveVarButton);

      expect(screen.getByText(/invalid variable name/i)).toBeInTheDocument();
    });

    it('should edit existing variable when clicked', async () => {
      const store = useEnvironmentStore.getState();
      const envId = store.actions.createEnvironment('Development', {
        base_url: 'http://dev.example.com',
      });

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      const editButton = screen.getByRole('button', { name: /edit base_url/i });
      fireEvent.click(editButton);

      const valueInput = screen.getByDisplayValue('http://dev.example.com');
      await userEvent.clear(valueInput);
      await userEvent.type(valueInput, 'http://localhost:3000');

      const saveButton = screen.getByRole('button', { name: /save variable/i });
      fireEvent.click(saveButton);

      const updatedStore = useEnvironmentStore.getState();
      expect(updatedStore.environments[envId]!.variables['base_url']).toBe('http://localhost:3000');
    });

    it('should delete variable when delete button clicked', async () => {
      const store = useEnvironmentStore.getState();
      const envId = store.actions.createEnvironment('Development', {
        base_url: 'http://dev.example.com',
        api_key: 'dev-key',
      });

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      const deleteButton = screen.getByRole('button', { name: /delete base_url/i });
      fireEvent.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /confirm deletion/i });
      fireEvent.click(confirmButton);

      const updatedStore = useEnvironmentStore.getState();
      expect(updatedStore.environments[envId]!.variables['base_url']).toBeUndefined();
      expect(updatedStore.environments[envId]!.variables['api_key']).toBe('dev-key');
    });

    it('should show confirmation dialog before deleting variable', async () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', {
        base_url: 'http://dev.example.com',
      });

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      const deleteButton = screen.getByRole('button', { name: /delete base_url/i });
      fireEvent.click(deleteButton);

      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm deletion/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel deletion/i })).toBeInTheDocument();
    });
  });

  describe('Delete environment', () => {
    it('should render delete button in edit mode', () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', {});

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      expect(screen.getByRole('button', { name: /delete environment/i })).toBeInTheDocument();
    });

    it('should show confirmation dialog before deleting environment', async () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', {});

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      const deleteButton = screen.getByRole('button', { name: /delete environment/i });
      fireEvent.click(deleteButton);

      expect(screen.getByText(/are you sure.*delete.*development/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm deletion/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel deletion/i })).toBeInTheDocument();
    });

    it('should delete environment when confirmed', async () => {
      const store = useEnvironmentStore.getState();
      const envId = store.actions.createEnvironment('Development', {});

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      const deleteButton = screen.getByRole('button', { name: /delete environment/i });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: /confirm deletion/i });
      fireEvent.click(confirmButton);

      const updatedStore = useEnvironmentStore.getState();
      expect(updatedStore.environments[envId]).toBeUndefined();
    });

    it('should not delete environment when cancelled', async () => {
      const store = useEnvironmentStore.getState();
      const envId = store.actions.createEnvironment('Development', {});

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      const deleteButton = screen.getByRole('button', { name: /delete environment/i });
      fireEvent.click(deleteButton);

      const cancelButton = screen.getByRole('button', { name: /cancel deletion/i });
      fireEvent.click(cancelButton);

      const updatedStore = useEnvironmentStore.getState();
      expect(updatedStore.environments[envId]).toBeDefined();
    });
  });

  describe('Active environment indicator', () => {
    it('should highlight active environment in list', () => {
      const store = useEnvironmentStore.getState();
      const devId = store.actions.createEnvironment('Development', {});
      store.actions.createEnvironment('Staging', {});
      store.actions.setActiveEnvironment(devId);

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      // Find the environment container div (which has the className and data-active attribute)
      const devElement = screen.getByText('Development').closest('[data-active="true"]');
      expect(devElement).toHaveClass('active');
    });

    it('should show "Active" badge next to active environment', () => {
      const store = useEnvironmentStore.getState();
      const devId = store.actions.createEnvironment('Development', {});
      store.actions.setActiveEnvironment(devId);

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      expect(screen.getByText(/active/i)).toBeInTheDocument();
    });
  });

  describe('Rename environment', () => {
    it('should show rename button in edit mode', () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', {});

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      expect(screen.getByRole('button', { name: /rename/i })).toBeInTheDocument();
    });

    it('should enable name input when rename clicked', () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', {});

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      // Name input should initially be disabled
      const nameInput = screen.getByDisplayValue('Development') as HTMLInputElement;
      expect(nameInput.disabled).toBe(true);

      const renameButton = screen.getByRole('button', { name: /rename/i });
      fireEvent.click(renameButton);

      // Name input should now be enabled
      expect(nameInput.disabled).toBe(false);
    });

    it('should rename environment when save clicked', async () => {
      const store = useEnvironmentStore.getState();
      const envId = store.actions.createEnvironment('Development', {});

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      const renameButton = screen.getByRole('button', { name: /rename/i });
      fireEvent.click(renameButton);

      const nameInput = screen.getByDisplayValue('Development');
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Dev');

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      const updatedStore = useEnvironmentStore.getState();
      expect(updatedStore.environments[envId]!.name).toBe('Dev');
    });

    it('should show error when renaming to duplicate name', async () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', {});
      store.actions.createEnvironment('Production', {});

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      const renameButton = screen.getByRole('button', { name: /rename/i });
      fireEvent.click(renameButton);

      const nameInput = screen.getByDisplayValue('Development');
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Production');

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });

    it('should cancel rename when cancel clicked', async () => {
      const store = useEnvironmentStore.getState();
      const envId = store.actions.createEnvironment('Development', {});

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      const renameButton = screen.getByRole('button', { name: /rename/i });
      fireEvent.click(renameButton);

      const nameInput = screen.getByDisplayValue('Development');
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Modified');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      const updatedStore = useEnvironmentStore.getState();
      expect(updatedStore.environments[envId]!.name).toBe('Development');
    });
  });

  describe('Enhanced delete confirmation for active environment', () => {
    it('should show warning message when deleting active environment', () => {
      const store = useEnvironmentStore.getState();
      const envId = store.actions.createEnvironment('Development', {});
      store.actions.setActiveEnvironment(envId);

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      const deleteButton = screen.getByRole('button', { name: /delete environment/i });
      fireEvent.click(deleteButton);

      // Should show active environment warning
      expect(screen.getByText(/currently active/i)).toBeInTheDocument();
      expect(screen.getByText(/no environment will be selected/i)).toBeInTheDocument();
    });

    it('should show standard message when deleting non-active environment', () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', {});
      const env2Id = store.actions.createEnvironment('Staging', {});
      store.actions.setActiveEnvironment(env2Id);

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      const deleteButton = screen.getByRole('button', { name: /delete environment/i });
      fireEvent.click(deleteButton);

      // Should show standard confirmation message
      expect(screen.getByText(/are you sure.*delete.*development/i)).toBeInTheDocument();
      expect(screen.queryByText(/currently active/i)).not.toBeInTheDocument();
    });

    it('should clear active environment when deleting active environment', () => {
      const store = useEnvironmentStore.getState();
      const envId = store.actions.createEnvironment('Development', {});
      store.actions.setActiveEnvironment(envId);

      render(<EnvironmentDialog open={true} onClose={() => {}} />);

      const envElement = screen.getByText('Development');
      fireEvent.click(envElement);

      const deleteButton = screen.getByRole('button', { name: /delete environment/i });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: /confirm deletion/i });
      fireEvent.click(confirmButton);

      const updatedStore = useEnvironmentStore.getState();
      expect(updatedStore.activeEnvironmentId).toBeNull();
    });
  });
});
