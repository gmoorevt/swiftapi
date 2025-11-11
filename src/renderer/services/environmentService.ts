/**
 * EnvironmentService
 *
 * Service for managing environments and their variables
 * Handles CRUD operations, active environment tracking, and uniqueness validation
 *
 * Constitutional requirement: Local-First Architecture
 */

import { Environment } from '../../models/Environment';
import { createStorageAdapter } from './storageAdapter';

interface EnvironmentData {
  id: string;
  name: string;
  variables: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface EnvironmentsStorage {
  activeEnvironmentId: string | null;
  environments: Record<string, EnvironmentData>;
}

export class EnvironmentService {
  private store: ReturnType<typeof createStorageAdapter>;
  private readonly STORAGE_KEY = 'environments';

  constructor() {
    this.store = createStorageAdapter('swiftapi-environments');
  }

  /**
   * Create a new environment
   * @throws Error if environment with same name already exists (case-insensitive)
   */
  create(name: string, variables: Record<string, string> = {}): Environment {
    const storage = this.getStorage();

    // Check for duplicate name (case-insensitive)
    if (this.isDuplicateName(name)) {
      throw new Error(`Environment with name "${name}" already exists`);
    }

    const env = Environment.create(name, variables);
    const data = this.environmentToData(env);

    storage.environments[env.id] = data;
    this.saveStorage(storage);

    return env;
  }

  /**
   * Get all environments
   */
  getAll(): Environment[] {
    const storage = this.getStorage();
    return Object.values(storage.environments).map(data => this.dataToEnvironment(data));
  }

  /**
   * Get environment by ID
   */
  getById(id: string): Environment | undefined {
    const storage = this.getStorage();
    const data = storage.environments[id];
    return data ? this.dataToEnvironment(data) : undefined;
  }

  /**
   * Update environment
   * @throws Error if new name duplicates existing environment (case-insensitive)
   * @returns Updated environment or undefined if not found
   */
  update(
    id: string,
    changes: Partial<Pick<Environment, 'name' | 'variables'>>
  ): Environment | undefined {
    const storage = this.getStorage();
    const existing = storage.environments[id];

    if (!existing) {
      return undefined;
    }

    // If name is changing, check for duplicates
    if (changes.name && changes.name !== existing.name) {
      if (this.isDuplicateName(changes.name, id)) {
        throw new Error(`Environment with name "${changes.name}" already exists`);
      }
    }

    const env = this.dataToEnvironment(existing);
    const updated = env.update(changes);
    const data = this.environmentToData(updated);

    storage.environments[id] = data;
    this.saveStorage(storage);

    return updated;
  }

  /**
   * Delete environment
   */
  delete(id: string): void {
    const storage = this.getStorage();
    delete storage.environments[id];

    // Clear active if deleting active environment
    if (storage.activeEnvironmentId === id) {
      storage.activeEnvironmentId = null;
    }

    this.saveStorage(storage);
  }

  /**
   * Set active environment
   * @param id - Environment ID to activate, or null to clear
   */
  setActive(id: string | null): void {
    const storage = this.getStorage();
    storage.activeEnvironmentId = id;
    this.saveStorage(storage);
  }

  /**
   * Get active environment
   * @returns Active environment or null if none set or environment doesn't exist
   */
  getActive(): Environment | null {
    const storage = this.getStorage();
    if (!storage.activeEnvironmentId) {
      return null;
    }

    const data = storage.environments[storage.activeEnvironmentId];
    return data ? this.dataToEnvironment(data) : null;
  }

  /**
   * Clear all environments and active state (for testing)
   */
  clearAll(): void {
    this.saveStorage({
      activeEnvironmentId: null,
      environments: {}
    });
  }

  /**
   * Check if environment name already exists (case-insensitive)
   * @param name - Name to check
   * @param excludeId - Optional ID to exclude from check (for updates)
   */
  private isDuplicateName(name: string, excludeId?: string): boolean {
    const storage = this.getStorage();
    const nameLower = name.toLowerCase();

    return Object.entries(storage.environments).some(([id, env]) => {
      if (excludeId && id === excludeId) {
        return false;
      }
      return env.name.toLowerCase() === nameLower;
    });
  }

  /**
   * Get storage data
   */
  private getStorage(): EnvironmentsStorage {
    return this.store.get<EnvironmentsStorage>(this.STORAGE_KEY, {
      activeEnvironmentId: null,
      environments: {}
    });
  }

  /**
   * Save storage data
   */
  private saveStorage(storage: EnvironmentsStorage): void {
    this.store.set(this.STORAGE_KEY, storage);
  }

  /**
   * Convert Environment model to storage data
   */
  private environmentToData(env: Environment): EnvironmentData {
    return {
      id: env.id,
      name: env.name,
      variables: env.variables,
      createdAt: env.createdAt,
      updatedAt: env.updatedAt
    };
  }

  /**
   * Convert storage data to Environment model
   */
  private dataToEnvironment(data: EnvironmentData): Environment {
    return new Environment(
      data.id,
      data.name,
      data.variables,
      data.createdAt,
      data.updatedAt
    );
  }
}
