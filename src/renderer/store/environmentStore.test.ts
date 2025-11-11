import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEnvironmentStore } from './environmentStore';

describe('environmentStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useEnvironmentStore());
    act(() => {
      result.current.actions.reset();
    });
  });

  describe('state management', () => {
    it('should create environment', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      let envId: string;
      act(() => {
        envId = result.current.actions.createEnvironment('Dev', { baseUrl: 'http://localhost' });
      });

      const environments = result.current.environments;
      expect(Object.values(environments)).toHaveLength(1);
      expect(environments[envId!].name).toBe('Dev');
      expect(environments[envId!].variables).toEqual({ baseUrl: 'http://localhost' });
    });

    it('should return created environment ID', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      let envId: string;
      act(() => {
        envId = result.current.actions.createEnvironment('Dev', {});
      });

      expect(envId!).toBeDefined();
      expect(result.current.environments[envId!]).toBeDefined();
    });

    it('should update environment', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      let envId: string;
      act(() => {
        envId = result.current.actions.createEnvironment('Dev', { old: 'value' });
        result.current.actions.updateEnvironment(envId, { name: 'Development' });
      });

      expect(result.current.environments[envId!].name).toBe('Development');
    });

    it('should delete environment', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      let envId: string;
      act(() => {
        envId = result.current.actions.createEnvironment('Dev', {});
        result.current.actions.deleteEnvironment(envId);
      });

      expect(result.current.environments[envId!]).toBeUndefined();
    });

    it('should load all environments on initialization', () => {
      // Create environments
      const { result: result1 } = renderHook(() => useEnvironmentStore());
      act(() => {
        result1.current.actions.createEnvironment('Dev', {});
        result1.current.actions.createEnvironment('Prod', {});
      });

      // Create new hook instance (simulates app reload)
      const { result: result2 } = renderHook(() => useEnvironmentStore());

      expect(Object.values(result2.current.environments)).toHaveLength(2);
    });
  });

  describe('active environment', () => {
    it('should set active environment', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      let envId: string;
      act(() => {
        envId = result.current.actions.createEnvironment('Dev', {});
        result.current.actions.setActiveEnvironment(envId);
      });

      expect(result.current.activeEnvironmentId).toBe(envId!);
    });

    it('should get active environment', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      let envId: string;
      act(() => {
        envId = result.current.actions.createEnvironment('Dev', { key: 'value' });
        result.current.actions.setActiveEnvironment(envId);
      });

      const active = result.current.actions.getActiveEnvironment();
      expect(active).toBeDefined();
      expect(active?.id).toBe(envId!);
      expect(active?.name).toBe('Dev');
      expect(active?.variables).toEqual({ key: 'value' });
    });

    it('should return null when no active environment', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      expect(result.current.actions.getActiveEnvironment()).toBeNull();
    });

    it('should clear active environment', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      let envId: string;
      act(() => {
        envId = result.current.actions.createEnvironment('Dev', {});
        result.current.actions.setActiveEnvironment(envId);
        result.current.actions.setActiveEnvironment(null);
      });

      expect(result.current.activeEnvironmentId).toBeNull();
      expect(result.current.actions.getActiveEnvironment()).toBeNull();
    });

    it('should clear active environment when deleting active environment', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      let envId: string;
      act(() => {
        envId = result.current.actions.createEnvironment('Dev', {});
        result.current.actions.setActiveEnvironment(envId);
        result.current.actions.deleteEnvironment(envId);
      });

      expect(result.current.activeEnvironmentId).toBeNull();
    });
  });

  describe('variable resolution', () => {
    it('should resolve variables from active environment', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      act(() => {
        const envId = result.current.actions.createEnvironment('Dev', {
          baseUrl: 'http://localhost',
          port: '3000'
        });
        result.current.actions.setActiveEnvironment(envId);
      });

      const resolved = result.current.actions.resolveVariables('{{baseUrl}}:{{port}}/api');
      expect(resolved).toBe('http://localhost:3000/api');
    });

    it('should resolve nested variables', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      act(() => {
        const envId = result.current.actions.createEnvironment('Dev', {
          protocol: 'https',
          domain: 'api.example.com',
          baseUrl: '{{protocol}}://{{domain}}'
        });
        result.current.actions.setActiveEnvironment(envId);
      });

      const resolved = result.current.actions.resolveVariables('{{baseUrl}}/users');
      expect(resolved).toBe('https://api.example.com/users');
    });

    it('should return original text when no active environment', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      const resolved = result.current.actions.resolveVariables('{{baseUrl}}/users');
      expect(resolved).toBe('{{baseUrl}}/users');
    });

    it('should throw error for undefined variable', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      act(() => {
        const envId = result.current.actions.createEnvironment('Dev', { key: 'value' });
        result.current.actions.setActiveEnvironment(envId);
      });

      expect(() => result.current.actions.resolveVariables('{{missing}}')).toThrow(
        'Variable {{missing}} is not defined'
      );
    });

    it('should handle text with no variables', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      act(() => {
        const envId = result.current.actions.createEnvironment('Dev', {});
        result.current.actions.setActiveEnvironment(envId);
      });

      const resolved = result.current.actions.resolveVariables('https://api.example.com');
      expect(resolved).toBe('https://api.example.com');
    });
  });

  describe('error handling', () => {
    it('should throw error when creating duplicate environment name', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      act(() => {
        result.current.actions.createEnvironment('Development', {});
      });

      expect(() => {
        act(() => {
          result.current.actions.createEnvironment('Development', {});
        });
      }).toThrow('Environment with name "Development" already exists');
    });

    it('should handle updating non-existent environment gracefully', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      expect(() => {
        act(() => {
          result.current.actions.updateEnvironment('non-existent-id', { name: 'New' });
        });
      }).not.toThrow();
    });

    it('should handle deleting non-existent environment gracefully', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      expect(() => {
        act(() => {
          result.current.actions.deleteEnvironment('non-existent-id');
        });
      }).not.toThrow();
    });
  });

  describe('selectors', () => {
    it('should provide list of all environments as array', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      act(() => {
        result.current.actions.createEnvironment('Dev', {});
        result.current.actions.createEnvironment('Prod', {});
      });

      const envList = Object.values(result.current.environments);
      expect(envList).toHaveLength(2);
      expect(envList.map(e => e.name)).toContain('Dev');
      expect(envList.map(e => e.name)).toContain('Prod');
    });

    it('should provide active environment or null', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      expect(result.current.actions.getActiveEnvironment()).toBeNull();

      act(() => {
        const envId = result.current.actions.createEnvironment('Dev', {});
        result.current.actions.setActiveEnvironment(envId);
      });

      const active = result.current.actions.getActiveEnvironment();
      expect(active).toBeDefined();
      expect(active?.name).toBe('Dev');
    });
  });

  describe('reset', () => {
    it('should clear all environments and active state', () => {
      const { result } = renderHook(() => useEnvironmentStore());

      act(() => {
        const envId = result.current.actions.createEnvironment('Dev', {});
        result.current.actions.setActiveEnvironment(envId);
        result.current.actions.reset();
      });

      expect(Object.values(result.current.environments)).toHaveLength(0);
      expect(result.current.activeEnvironmentId).toBeNull();
    });
  });
});
