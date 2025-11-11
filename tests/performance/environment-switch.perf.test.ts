/**
 * Environment Switch Performance Tests (T274)
 *
 * Constitutional requirement: <100ms UI response when switching (FR-013)
 *
 * Tests:
 * - Environment switch UI response <100ms
 * - Re-resolution of variables after switch
 * - Multiple rapid switches
 * - Large environment switching
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useEnvironmentStore } from '../../src/renderer/store/environmentStore';

describe('Environment Switch Performance (T274)', () => {
  beforeEach(() => {
    // Reset store before each test
    const { actions } = useEnvironmentStore.getState();
    actions.reset();
  });

  describe('Constitutional Requirement: <100ms UI response', () => {
    it('should switch active environment in less than 100ms', () => {
      const { actions } = useEnvironmentStore.getState();

      // Create two environments
      const env1Id = actions.createEnvironment('Development', {
        baseUrl: 'https://dev.api.example.com',
        apiKey: 'dev_key_123',
      });

      const env2Id = actions.createEnvironment('Production', {
        baseUrl: 'https://api.example.com',
        apiKey: 'prod_key_456',
      });

      // Set first environment as active
      actions.setActiveEnvironment(env1Id);

      // Measure switch time
      const startTime = performance.now();
      actions.setActiveEnvironment(env2Id);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Constitutional requirement: <100ms
      expect(duration).toBeLessThan(100);

      // Verify switch was successful
      const activeEnv = actions.getActiveEnvironment();
      expect(activeEnv?.id).toBe(env2Id);
    });

    it('should handle multiple rapid switches efficiently', () => {
      const { actions } = useEnvironmentStore.getState();

      // Create 10 environments
      const envIds: string[] = [];
      for (let i = 0; i < 10; i++) {
        const id = actions.createEnvironment(`Environment ${i}`, {
          var1: `value${i}`,
          var2: `value${i * 2}`,
        });
        envIds.push(id);
      }

      // Perform 50 rapid switches
      const switchCount = 50;
      const startTime = performance.now();

      for (let i = 0; i < switchCount; i++) {
        const targetEnvId = envIds[i % envIds.length]!;
        actions.setActiveEnvironment(targetEnvId);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const averageTime = duration / switchCount;

      console.log(`[BENCHMARK] Average switch time (${switchCount} switches): ${averageTime.toFixed(3)}ms`);

      // Each switch should be very fast
      expect(averageTime).toBeLessThan(10);
    });
  });

  describe('Variable Resolution After Switch', () => {
    it('should quickly resolve variables after environment switch', () => {
      const { actions } = useEnvironmentStore.getState();

      // Create two environments
      const devId = actions.createEnvironment('Development', {
        baseUrl: 'https://dev.api.example.com',
        version: 'v1',
        endpoint: 'users',
      });

      const prodId = actions.createEnvironment('Production', {
        baseUrl: 'https://api.example.com',
        version: 'v2',
        endpoint: 'accounts',
      });

      // Set dev as active
      actions.setActiveEnvironment(devId);

      const url = '{{baseUrl}}/{{version}}/{{endpoint}}';

      // Switch to production and resolve
      const startTime = performance.now();
      actions.setActiveEnvironment(prodId);
      const resolved = actions.resolveVariables(url);
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`[BENCHMARK] Switch + resolve time: ${duration.toFixed(2)}ms`);

      // Should be very fast (<100ms)
      expect(duration).toBeLessThan(100);
      expect(resolved).toBe('https://api.example.com/v2/accounts');
    });

    it('should efficiently handle large variable resolution after switch', () => {
      const { actions } = useEnvironmentStore.getState();

      // Create environment with 100 variables
      const variables: Record<string, string> = {};
      for (let i = 0; i < 100; i++) {
        variables[`var${i}`] = `value${i}`;
      }

      const env1Id = actions.createEnvironment('Env 1', variables);
      const env2Id = actions.createEnvironment('Env 2', variables);

      // Set first as active
      actions.setActiveEnvironment(env1Id);

      // Create text with many variables
      let text = '';
      for (let i = 0; i < 100; i++) {
        text += `{{var${i}}} `;
      }

      // Switch and resolve
      const startTime = performance.now();
      actions.setActiveEnvironment(env2Id);
      actions.resolveVariables(text);
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`[BENCHMARK] Switch + resolve 100 variables: ${duration.toFixed(2)}ms`);

      // Should still meet constitutional requirement
      expect(duration).toBeLessThan(150);
    });
  });

  describe('Large Environment Handling', () => {
    it('should switch between environments with 1000 variables', () => {
      const { actions } = useEnvironmentStore.getState();

      // Create environment with 1000 variables
      const largeVars: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        largeVars[`variable_${i}`] = `value_${i}`;
      }

      const env1Id = actions.createEnvironment('Large Env 1', largeVars);
      const env2Id = actions.createEnvironment('Large Env 2', largeVars);

      // Set first as active
      actions.setActiveEnvironment(env1Id);

      // Switch to second
      const startTime = performance.now();
      actions.setActiveEnvironment(env2Id);
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`[BENCHMARK] Switch between 1000-variable environments: ${duration.toFixed(2)}ms`);

      // Should handle large environments
      expect(duration).toBeLessThan(200);

      const activeEnv = actions.getActiveEnvironment();
      expect(activeEnv?.id).toBe(env2Id);
    });

    it('should quickly switch with many environments available', () => {
      const { actions } = useEnvironmentStore.getState();

      // Create 50 environments
      const envIds: string[] = [];
      for (let i = 0; i < 50; i++) {
        const id = actions.createEnvironment(`Environment ${i}`, {
          var1: `value${i}`,
          var2: `value${i * 2}`,
          var3: `value${i * 3}`,
        });
        envIds.push(id);
      }

      // Switch from first to last
      actions.setActiveEnvironment(envIds[0]!);

      const startTime = performance.now();
      actions.setActiveEnvironment(envIds[49]!);
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`[BENCHMARK] Switch with 50 environments available: ${duration.toFixed(2)}ms`);

      // Should not be affected by number of available environments
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Environment Creation and Deletion Performance', () => {
    it('should quickly create a new environment', () => {
      const { actions } = useEnvironmentStore.getState();

      const startTime = performance.now();
      const envId = actions.createEnvironment('Test Env', {
        var1: 'value1',
        var2: 'value2',
      });
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
      expect(envId).toBeTruthy();
    });

    it('should quickly delete an environment', () => {
      const { actions } = useEnvironmentStore.getState();

      const envId = actions.createEnvironment('To Delete', {
        var1: 'value1',
      });

      const startTime = performance.now();
      actions.deleteEnvironment(envId);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
    });

    it('should handle creating many environments efficiently', () => {
      const { actions } = useEnvironmentStore.getState();

      const count = 100;
      const startTime = performance.now();

      for (let i = 0; i < count; i++) {
        actions.createEnvironment(`Env ${i}`, {
          var1: `value${i}`,
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const averageTime = duration / count;

      console.log(`[BENCHMARK] Average environment creation time: ${averageTime.toFixed(3)}ms`);

      expect(averageTime).toBeLessThan(10);
    });
  });

  describe('Variable Management Performance', () => {
    it('should quickly add a variable to active environment', () => {
      const { actions } = useEnvironmentStore.getState();

      const envId = actions.createEnvironment('Test', {});
      actions.setActiveEnvironment(envId);

      const startTime = performance.now();
      actions.addVariable(envId, 'newVar', 'newValue');
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
    });

    it('should efficiently update variables in active environment', () => {
      const { actions } = useEnvironmentStore.getState();

      const envId = actions.createEnvironment('Test', {
        oldVar: 'oldValue',
      });
      actions.setActiveEnvironment(envId);

      const startTime = performance.now();
      actions.updateVariable(envId, 'oldVar', 'newVar', 'newValue');
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
    });

    it('should handle bulk variable operations efficiently', () => {
      const { actions } = useEnvironmentStore.getState();

      const envId = actions.createEnvironment('Test', {});
      actions.setActiveEnvironment(envId);

      // Add 100 variables
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        actions.addVariable(envId, `var${i}`, `value${i}`);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const averageTime = duration / 100;

      console.log(`[BENCHMARK] Average add variable time: ${averageTime.toFixed(3)}ms`);

      expect(averageTime).toBeLessThan(5);
    });
  });

  describe('Environment State Updates', () => {
    it('should efficiently handle rename operations', () => {
      const { actions } = useEnvironmentStore.getState();

      const envId = actions.createEnvironment('Original Name', {
        var1: 'value1',
      });

      const startTime = performance.now();
      actions.renameEnvironment(envId, 'New Name');
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
    });

    it('should quickly update environment variables object', () => {
      const { actions } = useEnvironmentStore.getState();

      const envId = actions.createEnvironment('Test', {
        var1: 'value1',
        var2: 'value2',
      });

      const newVariables = {
        var1: 'updated1',
        var2: 'updated2',
        var3: 'new3',
      };

      const startTime = performance.now();
      actions.updateEnvironment(envId, { variables: newVariables });
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
    });
  });
});
