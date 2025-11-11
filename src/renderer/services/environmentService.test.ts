import { describe, it, expect, beforeEach } from 'vitest';
import { EnvironmentService } from './environmentService';

describe('EnvironmentService', () => {
  let service: EnvironmentService;

  beforeEach(() => {
    service = new EnvironmentService();
    service.clearAll(); // Reset storage for each test
  });

  describe('CRUD operations', () => {
    it('should create environment', () => {
      const env = service.create('Development', { baseUrl: 'http://localhost' });

      expect(env.name).toBe('Development');
      expect(env.variables).toEqual({ baseUrl: 'http://localhost' });
      expect(env.id).toBeDefined();
    });

    it('should retrieve created environment by ID', () => {
      const created = service.create('Development', { baseUrl: 'http://localhost' });
      const retrieved = service.getById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe(created.name);
      expect(retrieved?.variables).toEqual(created.variables);
    });

    it('should get all environments', () => {
      service.create('Dev');
      service.create('Prod');
      service.create('Staging');

      const all = service.getAll();
      expect(all).toHaveLength(3);
      expect(all.map(e => e.name)).toContain('Dev');
      expect(all.map(e => e.name)).toContain('Prod');
      expect(all.map(e => e.name)).toContain('Staging');
    });

    it('should return empty array when no environments exist', () => {
      const all = service.getAll();
      expect(all).toEqual([]);
    });

    it('should update environment', () => {
      const env = service.create('Dev', { old: 'value' });
      const updated = service.update(env.id, { name: 'Development' });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Development');
      expect(updated?.id).toBe(env.id);

      // Verify persistence
      const retrieved = service.getById(env.id);
      expect(retrieved?.name).toBe('Development');
    });

    it('should update environment variables', () => {
      const env = service.create('Dev', { old: 'value' });
      const updated = service.update(env.id, { variables: { new: 'value' } });

      expect(updated?.variables).toEqual({ new: 'value' });

      // Verify persistence
      const retrieved = service.getById(env.id);
      expect(retrieved?.variables).toEqual({ new: 'value' });
    });

    it('should return undefined when updating non-existent environment', () => {
      const updated = service.update('non-existent-id', { name: 'New' });
      expect(updated).toBeUndefined();
    });

    it('should delete environment', () => {
      const env = service.create('Dev');
      service.delete(env.id);

      expect(service.getById(env.id)).toBeUndefined();
      expect(service.getAll()).toHaveLength(0);
    });

    it('should handle deleting non-existent environment', () => {
      expect(() => service.delete('non-existent-id')).not.toThrow();
    });

    it('should return undefined for non-existent ID', () => {
      const result = service.getById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('active environment', () => {
    it('should set active environment', () => {
      const env = service.create('Dev');
      service.setActive(env.id);

      const active = service.getActive();
      expect(active).toBeDefined();
      expect(active?.id).toBe(env.id);
    });

    it('should return null when no active environment is set', () => {
      const active = service.getActive();
      expect(active).toBeNull();
    });

    it('should clear active environment', () => {
      const env = service.create('Dev');
      service.setActive(env.id);
      service.setActive(null);

      expect(service.getActive()).toBeNull();
    });

    it('should update active environment when switching', () => {
      const dev = service.create('Dev');
      const prod = service.create('Prod');

      service.setActive(dev.id);
      expect(service.getActive()?.id).toBe(dev.id);

      service.setActive(prod.id);
      expect(service.getActive()?.id).toBe(prod.id);
    });

    it('should persist active environment ID', () => {
      const env = service.create('Dev');
      service.setActive(env.id);

      // Create new service instance to test persistence
      const newService = new EnvironmentService();
      const active = newService.getActive();

      expect(active).toBeDefined();
      expect(active?.id).toBe(env.id);
    });

    it('should return null when active environment is deleted', () => {
      const env = service.create('Dev');
      service.setActive(env.id);
      service.delete(env.id);

      // Active ID might still be set, but getActive should return null since env doesn't exist
      const active = service.getActive();
      expect(active).toBeNull();
    });
  });

  describe('uniqueness validation', () => {
    it('should prevent duplicate names (case-sensitive match)', () => {
      service.create('Development');

      expect(() => service.create('Development'))
        .toThrow('Environment with name "Development" already exists');
    });

    it('should prevent duplicate names (case-insensitive)', () => {
      service.create('Development');

      expect(() => service.create('development'))
        .toThrow('Environment with name "development" already exists');

      expect(() => service.create('DEVELOPMENT'))
        .toThrow('Environment with name "DEVELOPMENT" already exists');
    });

    it('should allow similar names that differ', () => {
      service.create('Development');

      expect(() => service.create('Development 2')).not.toThrow();
      expect(() => service.create('Development_Test')).not.toThrow();
    });

    it('should prevent duplicate names when updating', () => {
      const env1 = service.create('Development');
      service.create('Production');

      expect(() => service.update(env1.id, { name: 'Production' }))
        .toThrow('Environment with name "Production" already exists');

      expect(() => service.update(env1.id, { name: 'production' }))
        .toThrow('Environment with name "production" already exists');
    });

    it('should allow updating environment to same name (no change)', () => {
      const env = service.create('Development');

      expect(() => service.update(env.id, { name: 'Development' })).not.toThrow();
    });

    it('should allow updating environment to same name with different case', () => {
      const env = service.create('Development');

      // Since it's the same environment, case-insensitive match should still work
      const updated = service.update(env.id, { name: 'development' });
      expect(updated?.name).toBe('development');
    });
  });

  describe('persistence', () => {
    it('should persist environments across service instances', () => {
      const env = service.create('Dev', { key: 'value' });

      // Create new service instance
      const newService = new EnvironmentService();
      const retrieved = newService.getById(env.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Dev');
      expect(retrieved?.variables).toEqual({ key: 'value' });
    });

    it('should persist updates', () => {
      const env = service.create('Dev');
      service.update(env.id, { name: 'Development' });

      // Create new service instance
      const newService = new EnvironmentService();
      const retrieved = newService.getById(env.id);

      expect(retrieved?.name).toBe('Development');
    });

    it('should persist deletions', () => {
      const env = service.create('Dev');
      service.delete(env.id);

      // Create new service instance
      const newService = new EnvironmentService();
      const retrieved = newService.getById(env.id);

      expect(retrieved).toBeUndefined();
    });

    it('should maintain data integrity with multiple operations', () => {
      const env1 = service.create('Dev', { url: 'localhost' });
      const env2 = service.create('Prod', { url: 'api.com' });

      service.update(env1.id, { variables: { url: 'dev.api.com' } });
      service.delete(env2.id);

      // Create new service instance
      const newService = new EnvironmentService();

      expect(newService.getAll()).toHaveLength(1);
      expect(newService.getById(env1.id)?.variables['url']).toBe('dev.api.com');
      expect(newService.getById(env2.id)).toBeUndefined();
    });
  });

  describe('clearAll', () => {
    it('should clear all environments', () => {
      service.create('Dev');
      service.create('Prod');
      service.clearAll();

      expect(service.getAll()).toHaveLength(0);
    });

    it('should clear active environment ID', () => {
      const env = service.create('Dev');
      service.setActive(env.id);
      service.clearAll();

      expect(service.getActive()).toBeNull();
    });
  });

  describe('rename', () => {
    it('should rename environment', () => {
      const env = service.create('Development', { baseUrl: 'http://localhost' });
      const renamed = service.rename(env.id, 'Dev');

      expect(renamed).toBeDefined();
      expect(renamed?.name).toBe('Dev');
      expect(renamed?.id).toBe(env.id);
      expect(renamed?.variables).toEqual({ baseUrl: 'http://localhost' });
    });

    it('should persist renamed environment', () => {
      const env = service.create('Development', {});
      service.rename(env.id, 'Dev');

      const retrieved = service.getById(env.id);
      expect(retrieved?.name).toBe('Dev');
    });

    it('should throw error for duplicate name (case-insensitive)', () => {
      const env1 = service.create('Development');
      service.create('Production');

      expect(() => service.rename(env1.id, 'production'))
        .toThrow('Environment with name "production" already exists');

      expect(() => service.rename(env1.id, 'PRODUCTION'))
        .toThrow('Environment with name "PRODUCTION" already exists');
    });

    it('should allow renaming to same name with different case', () => {
      const env = service.create('Development');
      const renamed = service.rename(env.id, 'development');

      expect(renamed?.name).toBe('development');
    });

    it('should return undefined for non-existent environment', () => {
      const renamed = service.rename('non-existent-id', 'NewName');
      expect(renamed).toBeUndefined();
    });

    it('should preserve variables when renaming', () => {
      const env = service.create('Dev', {
        baseUrl: 'http://localhost',
        apiKey: 'test-key',
        timeout: '5000'
      });

      const renamed = service.rename(env.id, 'Development');

      expect(renamed?.variables).toEqual({
        baseUrl: 'http://localhost',
        apiKey: 'test-key',
        timeout: '5000'
      });
    });

    it('should preserve active status when renaming active environment', () => {
      const env = service.create('Dev');
      service.setActive(env.id);

      service.rename(env.id, 'Development');

      const active = service.getActive();
      expect(active?.id).toBe(env.id);
      expect(active?.name).toBe('Development');
    });

    it('should update timestamps when renaming', async () => {
      const env = service.create('Dev');
      const originalUpdatedAt = env.updatedAt;

      // Small delay to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));
      const renamed = service.rename(env.id, 'Development');

      expect(renamed?.createdAt).toBe(env.createdAt);
      expect(renamed?.updatedAt).not.toBe(originalUpdatedAt);
    });
  });
});
