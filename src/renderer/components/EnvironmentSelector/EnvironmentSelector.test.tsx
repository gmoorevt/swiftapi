/**
 * EnvironmentSelector Component Tests
 *
 * Tests for environment selector dropdown with "Manage Environments" button
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EnvironmentSelector } from './EnvironmentSelector';
import { useEnvironmentStore } from '../../store/environmentStore';

describe('EnvironmentSelector', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useEnvironmentStore.getState();
    store.actions.reset();
  });

  describe('Dropdown rendering', () => {
    it('should render select dropdown', () => {
      render(<EnvironmentSelector />);
      const select = screen.getByRole('combobox', { name: /environment/i });
      expect(select).toBeInTheDocument();
    });

    it('should render "Create Environment" button when no environments exist', () => {
      render(<EnvironmentSelector />);
      const button = screen.getByRole('button', { name: /create environment/i });
      expect(button).toBeInTheDocument();
    });

    it('should show "No Environment" as default option when no active environment', () => {
      render(<EnvironmentSelector />);
      const select = screen.getByRole('combobox', { name: /environment/i }) as HTMLSelectElement;
      expect(select.value).toBe('');
      expect(screen.getByText('No Environment')).toBeInTheDocument();
    });

    it('should list all available environments in dropdown', () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', { base_url: 'http://dev.example.com' });
      store.actions.createEnvironment('Staging', { base_url: 'http://staging.example.com' });
      store.actions.createEnvironment('Production', { base_url: 'http://prod.example.com' });

      render(<EnvironmentSelector />);

      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Staging')).toBeInTheDocument();
      expect(screen.getByText('Production')).toBeInTheDocument();
    });

    it('should sort environments alphabetically by name', () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Production', {});
      store.actions.createEnvironment('Development', {});
      store.actions.createEnvironment('Staging', {});

      render(<EnvironmentSelector />);

      const options = screen.getAllByRole('option');
      const envNames = options.slice(1).map(opt => opt.textContent); // Skip "No Environment"

      expect(envNames).toEqual(['Development', 'Production', 'Staging']);
    });
  });

  describe('Environment selection', () => {
    it('should update active environment when selection changes', () => {
      const store = useEnvironmentStore.getState();
      const devId = store.actions.createEnvironment('Development', {});

      render(<EnvironmentSelector />);
      const select = screen.getByRole('combobox', { name: /environment/i });

      fireEvent.change(select, { target: { value: devId } });

      const updatedStore = useEnvironmentStore.getState();
      expect(updatedStore.activeEnvironmentId).toBe(devId);
    });

    it('should clear active environment when "No Environment" selected', () => {
      const store = useEnvironmentStore.getState();
      const devId = store.actions.createEnvironment('Development', {});
      store.actions.setActiveEnvironment(devId);

      render(<EnvironmentSelector />);
      const select = screen.getByRole('combobox', { name: /environment/i });

      fireEvent.change(select, { target: { value: '' } });

      const updatedStore = useEnvironmentStore.getState();
      expect(updatedStore.activeEnvironmentId).toBeNull();
    });

    it('should display currently active environment in dropdown', () => {
      const store = useEnvironmentStore.getState();
      const devId = store.actions.createEnvironment('Development', {});
      store.actions.setActiveEnvironment(devId);

      render(<EnvironmentSelector />);
      const select = screen.getByRole('combobox', { name: /environment/i }) as HTMLSelectElement;

      expect(select.value).toBe(devId);
    });

    it('should allow switching between multiple environments', () => {
      const store = useEnvironmentStore.getState();
      const devId = store.actions.createEnvironment('Development', {});
      const stagingId = store.actions.createEnvironment('Staging', {});

      render(<EnvironmentSelector />);
      const select = screen.getByRole('combobox', { name: /environment/i });

      // Switch to Development
      fireEvent.change(select, { target: { value: devId } });
      expect(useEnvironmentStore.getState().activeEnvironmentId).toBe(devId);

      // Switch to Staging
      fireEvent.change(select, { target: { value: stagingId } });
      expect(useEnvironmentStore.getState().activeEnvironmentId).toBe(stagingId);

      // Switch back to No Environment
      fireEvent.change(select, { target: { value: '' } });
      expect(useEnvironmentStore.getState().activeEnvironmentId).toBeNull();
    });
  });

  describe('Manage Environments button', () => {
    it('should open EnvironmentDialog when "Manage" clicked', () => {
      // Create an environment so "Manage" button appears instead of "Create Environment"
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', {});

      render(<EnvironmentSelector />);
      const button = screen.getByRole('button', { name: /manage/i });

      fireEvent.click(button);

      // Dialog should be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/manage environments/i)).toBeInTheDocument();
    });

    it('should close EnvironmentDialog when close button clicked', () => {
      // Create an environment so "Manage" button appears
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', {});

      render(<EnvironmentSelector />);
      const manageButton = screen.getByRole('button', { name: /manage/i });

      // Open dialog
      fireEvent.click(manageButton);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Close dialog
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Visual styling', () => {
    it('should highlight active environment option', () => {
      const store = useEnvironmentStore.getState();
      const devId = store.actions.createEnvironment('Development', {});
      store.actions.setActiveEnvironment(devId);

      render(<EnvironmentSelector />);
      const select = screen.getByRole('combobox', { name: /environment/i }) as HTMLSelectElement;

      expect(select.value).toBe(devId);
      // The selected option should be the active one
      const selectedOption = Array.from(select.options).find(opt => opt.selected);
      expect(selectedOption?.textContent).toBe('Development');
    });

    it('should show count of environments in manage button when environments exist', () => {
      const store = useEnvironmentStore.getState();
      store.actions.createEnvironment('Development', {});
      store.actions.createEnvironment('Staging', {});

      render(<EnvironmentSelector />);

      // Button text should indicate count
      const button = screen.getByRole('button', { name: /manage/i });
      expect(button.textContent).toContain('2');
    });
  });

  describe('Empty state', () => {
    it('should show "No Environment" as only option when no environments exist', () => {
      render(<EnvironmentSelector />);

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(1);
      expect(options[0]!.textContent).toBe('No Environment');
    });

    it('should show "Create Environment" button and allow opening dialog when no environments exist', () => {
      render(<EnvironmentSelector />);
      const button = screen.getByRole('button', { name: /create environment/i });

      fireEvent.click(button);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
