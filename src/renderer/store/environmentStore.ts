/**
 * Environment Store
 *
 * Zustand store for managing environments and variable resolution
 *
 * @see specs/002-collections-variables/contracts/storage-schema.ts
 */

import { create } from 'zustand';
import { Environment } from '../../models/Environment';
import { EnvironmentService } from '../services/environmentService';
import { resolveVariables, VariableResolutionError, extractVariables } from '../../lib/variableResolver';

interface EnvironmentState {
  // State
  environments: Record<string, Environment>;
  activeEnvironmentId: string | null;

  // Actions
  actions: {
    // Environment management
    createEnvironment: (name: string, variables?: Record<string, string>) => string;
    updateEnvironment: (id: string, changes: Partial<Pick<Environment, 'name' | 'variables'>>) => void;
    deleteEnvironment: (id: string) => void;

    // Active environment
    setActiveEnvironment: (id: string | null) => void;
    getActiveEnvironment: () => Environment | null;

    // Variable resolution
    resolveVariables: (text: string) => string;
    validateVariablesForRequest: (text: string) => string[];
    getVariableDifferences: (env1Id: string, env2Id: string) => { only1: string[]; only2: string[]; both: string[] };

    // Utility
    reset: () => void;
  };
}

// Selector for active environment (can be used with hooks)
export const selectActiveEnvironment = (state: EnvironmentState): Environment | null => {
  if (!state.activeEnvironmentId) {
    return null;
  }
  return state.environments[state.activeEnvironmentId] ?? null;
};

// Create service instance (singleton)
const environmentService = new EnvironmentService();

/**
 * Environment Store
 *
 * Central state management for environments and variables
 */
export const useEnvironmentStore = create<EnvironmentState>((set, get) => {
  // Load initial state from service
  const loadEnvironments = (): Record<string, Environment> => {
    const envs = environmentService.getAll();
    const map: Record<string, Environment> = {};
    envs.forEach(env => {
      map[env.id] = env;
    });
    return map;
  };

  const loadActiveEnvironmentId = (): string | null => {
    const active = environmentService.getActive();
    return active?.id ?? null;
  };

  return {
    // Initial state
    environments: loadEnvironments(),
    activeEnvironmentId: loadActiveEnvironmentId(),

    // Actions
    actions: {
      /**
       * Create a new environment
       * @returns ID of created environment
       * @throws Error if name already exists
       */
      createEnvironment: (name: string, variables: Record<string, string> = {}): string => {
        const env = environmentService.create(name, variables);

        set(state => ({
          environments: {
            ...state.environments,
            [env.id]: env
          }
        }));

        return env.id;
      },

      /**
       * Update an existing environment
       */
      updateEnvironment: (id: string, changes: Partial<Pick<Environment, 'name' | 'variables'>>) => {
        const updated = environmentService.update(id, changes);

        if (updated) {
          set(state => ({
            environments: {
              ...state.environments,
              [id]: updated
            }
          }));
        }
      },

      /**
       * Delete an environment
       * If deleting active environment, clears active state
       */
      deleteEnvironment: (id: string) => {
        environmentService.delete(id);

        set(state => {
          const { [id]: _, ...rest } = state.environments;
          return {
            environments: rest,
            activeEnvironmentId: state.activeEnvironmentId === id ? null : state.activeEnvironmentId
          };
        });
      },

      /**
       * Set the active environment
       * @param id - Environment ID to activate, or null to clear
       */
      setActiveEnvironment: (id: string | null) => {
        environmentService.setActive(id);
        set({ activeEnvironmentId: id });
      },

      /**
       * Get the active environment
       * @returns Active environment or null
       */
      getActiveEnvironment: (): Environment | null => {
        const state = get();
        return selectActiveEnvironment(state);
      },

      /**
       * Resolve variables in text using active environment
       * @param text - Text containing {{variables}} to resolve
       * @returns Resolved text with variables substituted
       * @throws VariableResolutionError if variable is undefined or circular reference
       */
      resolveVariables: (text: string): string => {
        const state = get();
        const activeEnv = selectActiveEnvironment(state);

        // If no active environment, return text as-is
        if (!activeEnv) {
          return text;
        }

        try {
          return resolveVariables(text, activeEnv.variables);
        } catch (error) {
          if (error instanceof VariableResolutionError) {
            throw error;
          }
          throw new Error(`Failed to resolve variables: ${error}`);
        }
      },

      /**
       * Validate that all variables in text are defined in active environment
       * @param text - Text to validate (e.g., URL with {{variables}})
       * @returns Array of undefined variable names (empty if all valid)
       */
      validateVariablesForRequest: (text: string): string[] => {
        const state = get();
        const activeEnv = selectActiveEnvironment(state);

        // Extract all variables from text
        const variableNames = extractVariables(text);
        const uniqueVars = Array.from(new Set(variableNames));

        // If no active environment, all variables are undefined
        if (!activeEnv) {
          return uniqueVars;
        }

        // Check which variables are not defined
        return uniqueVars.filter(varName => !(varName in activeEnv.variables));
      },

      /**
       * Compare variables between two environments
       * @param env1Id - First environment ID
       * @param env2Id - Second environment ID
       * @returns Object with arrays: only1, only2, both
       */
      getVariableDifferences: (env1Id: string, env2Id: string) => {
        const state = get();
        const env1 = state.environments[env1Id];
        const env2 = state.environments[env2Id];

        if (!env1 || !env2) {
          return { only1: [], only2: [], both: [] };
        }

        const keys1 = Object.keys(env1.variables);
        const keys2 = Object.keys(env2.variables);
        const set2 = new Set(keys2);
        const set1 = new Set(keys1);

        const only1 = keys1.filter(k => !set2.has(k));
        const only2 = keys2.filter(k => !set1.has(k));
        const both = keys1.filter(k => set2.has(k));

        return { only1, only2, both };
      },

      /**
       * Reset store to empty state (for testing)
       */
      reset: () => {
        environmentService.clearAll();
        set({
          environments: {},
          activeEnvironmentId: null
        });
      }
    }
  };
});
