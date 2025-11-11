/**
 * Integration Test: Environment Switching Workflow (Feature 002 - Phase 4)
 *
 * Tests User Story 2: Switch Between Environments
 * Tests T101-T104: Simple environment switching workflows
 *
 * @see specs/002-collections-variables/spec.md
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useEnvironmentStore } from '../../src/renderer/store/environmentStore';
import { useRequestStore } from '../../src/renderer/store/requestStore';

describe('Integration: Environment Switching Workflow', () => {
  beforeEach(() => {
    // Reset stores before each test
    const requestStore = useRequestStore.getState();
    requestStore.actions.resetRequest();

    const envStore = useEnvironmentStore.getState();
    envStore.actions.reset();
  });

  describe('T101-T102: Basic environment switching', () => {
    it('should switch between two environments and resolve variables correctly', () => {
      // Create two environments
      const devId = useEnvironmentStore.getState().actions.createEnvironment('Development', {
        base_url: 'https://api.dev.example.com',
        api_key: 'dev-key-123'
      });

      const prodId = useEnvironmentStore.getState().actions.createEnvironment('Production', {
        base_url: 'https://api.example.com',
        api_key: 'prod-key-456'
      });

      // Verify environments were created
      let state = useEnvironmentStore.getState();
      expect(state.environments[devId]).toBeDefined();
      expect(state.environments[prodId]).toBeDefined();

      // Activate Development environment
      state.actions.setActiveEnvironment(devId);
      state = useEnvironmentStore.getState();
      expect(state.activeEnvironmentId).toBe(devId);

      // Resolve variables with Development environment
      const devResolved = state.actions.resolveVariables('{{base_url}}/users?key={{api_key}}');
      expect(devResolved).toBe('https://api.dev.example.com/users?key=dev-key-123');

      // Switch to Production environment
      state.actions.setActiveEnvironment(prodId);
      state = useEnvironmentStore.getState();
      expect(state.activeEnvironmentId).toBe(prodId);

      // Resolve same text with Production environment
      const prodResolved = state.actions.resolveVariables('{{base_url}}/users?key={{api_key}}');
      expect(prodResolved).toBe('https://api.example.com/users?key=prod-key-456');

      // Switch back to Development
      state.actions.setActiveEnvironment(devId);
      state = useEnvironmentStore.getState();
      expect(state.activeEnvironmentId).toBe(devId);

      const devResolved2 = state.actions.resolveVariables('{{base_url}}/users?key={{api_key}}');
      expect(devResolved2).toBe('https://api.dev.example.com/users?key=dev-key-123');
    });
  });

  describe('T103: Variable validation for missing variables', () => {
    it('should detect undefined variables when switching to environment with missing vars', () => {
      let envStore = useEnvironmentStore.getState();

      // Create two environments with different variables
      const devId = envStore.actions.createEnvironment('Development', {
        base_url: 'https://api.dev.example.com',
        api_key: 'dev-key-123',
        user_id: '999'
      });

      const stagingId = envStore.actions.createEnvironment('Staging', {
        base_url: 'https://api.staging.example.com',
        // Missing: api_key and user_id
      });

      // Activate Development environment
      envStore.actions.setActiveEnvironment(devId);

      // Validate URL with all variables present
      const missingInDev = envStore.actions.validateVariablesForRequest(
        '{{base_url}}/users/{{user_id}}?key={{api_key}}'
      );
      expect(missingInDev).toEqual([]);

      // Switch to Staging environment (missing variables)
      envStore.actions.setActiveEnvironment(stagingId);

      // Validate same URL - should find missing variables
      const missingInStaging = envStore.actions.validateVariablesForRequest(
        '{{base_url}}/users/{{user_id}}?key={{api_key}}'
      );
      expect(missingInStaging).toEqual(['user_id', 'api_key']);
    });
  });

  describe('T104: Compare variables between environments', () => {
    it('should identify variable differences between two environments', () => {
      const envStore = useEnvironmentStore.getState();

      // Create two environments with overlapping variables
      const env1Id = envStore.actions.createEnvironment('Environment 1', {
        shared_var: 'value1',
        only_in_env1: 'unique1',
        another_shared: 'shared'
      });

      const env2Id = envStore.actions.createEnvironment('Environment 2', {
        shared_var: 'value2',
        only_in_env2: 'unique2',
        another_shared: 'shared'
      });

      // Compare environments
      const diff = envStore.actions.getVariableDifferences(env1Id, env2Id);

      // Verify differences
      expect(diff.both).toContain('shared_var');
      expect(diff.both).toContain('another_shared');
      expect(diff.both).toHaveLength(2);

      expect(diff.only1).toContain('only_in_env1');
      expect(diff.only1).toHaveLength(1);

      expect(diff.only2).toContain('only_in_env2');
      expect(diff.only2).toHaveLength(1);
    });

    it('should handle comparing environments with no overlap', () => {
      const envStore = useEnvironmentStore.getState();

      const env1Id = envStore.actions.createEnvironment('Environment 1', {
        var_a: 'a',
        var_b: 'b'
      });

      const env2Id = envStore.actions.createEnvironment('Environment 2', {
        var_x: 'x',
        var_y: 'y'
      });

      const diff = envStore.actions.getVariableDifferences(env1Id, env2Id);

      expect(diff.both).toEqual([]);
      expect(diff.only1).toEqual(['var_a', 'var_b']);
      expect(diff.only2).toEqual(['var_x', 'var_y']);
    });

    it('should handle comparing environments with complete overlap', () => {
      const envStore = useEnvironmentStore.getState();

      const env1Id = envStore.actions.createEnvironment('Environment 1', {
        base_url: 'https://api.dev.example.com',
        api_key: 'key1'
      });

      const env2Id = envStore.actions.createEnvironment('Environment 2', {
        base_url: 'https://api.prod.example.com',
        api_key: 'key2'
      });

      const diff = envStore.actions.getVariableDifferences(env1Id, env2Id);

      expect(diff.both).toEqual(['base_url', 'api_key']);
      expect(diff.only1).toEqual([]);
      expect(diff.only2).toEqual([]);
    });
  });
});
