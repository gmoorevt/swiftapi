import { describe, it, expect } from 'vitest';
import { Environment } from './Environment';

describe('Environment', () => {
  describe('creation', () => {
    it('should create environment with valid data', () => {
      const env = Environment.create('Development', { baseUrl: 'http://localhost' });

      expect(env.id).toBeDefined();
      expect(env.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(env.name).toBe('Development');
      expect(env.variables).toEqual({ baseUrl: 'http://localhost' });
      expect(env.createdAt).toBeDefined();
      expect(env.updatedAt).toBe(env.createdAt);
    });

    it('should create environment with empty variables', () => {
      const env = Environment.create('Empty');
      expect(env.variables).toEqual({});
    });

    it('should create unique IDs for different environments', () => {
      const env1 = Environment.create('Dev1');
      const env2 = Environment.create('Dev2');
      expect(env1.id).not.toBe(env2.id);
    });
  });

  describe('validation', () => {
    it('should reject empty name', () => {
      expect(() => Environment.create('')).toThrow('Environment name must be 1-100 characters');
    });

    it('should reject name over 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(() => Environment.create(longName)).toThrow(
        'Environment name must be 1-100 characters'
      );
    });

    it('should reject name with invalid characters', () => {
      expect(() => Environment.create('Dev@2025')).toThrow(
        'Environment name contains invalid characters'
      );

      expect(() => Environment.create('Dev#Test')).toThrow(
        'Environment name contains invalid characters'
      );

      expect(() => Environment.create('Dev$Prod')).toThrow(
        'Environment name contains invalid characters'
      );
    });

    it('should accept valid characters in name', () => {
      expect(() => Environment.create('Dev_Env-2025')).not.toThrow();
      expect(() => Environment.create('Development 2025')).not.toThrow();
      expect(() => Environment.create('Production')).not.toThrow();
      expect(() => Environment.create('QA123')).not.toThrow();
    });

    it('should reject invalid variable names', () => {
      expect(() => Environment.create('Dev', { '123invalid': 'value' })).toThrow(
        'Invalid variable name: 123invalid'
      );

      expect(() => Environment.create('Dev', { 'invalid-name': 'value' })).toThrow(
        'Invalid variable name: invalid-name'
      );

      expect(() => Environment.create('Dev', { 'invalid.name': 'value' })).toThrow(
        'Invalid variable name: invalid.name'
      );

      expect(() => Environment.create('Dev', { 'invalid name': 'value' })).toThrow(
        'Invalid variable name: invalid name'
      );
    });

    it('should accept valid variable names', () => {
      expect(() =>
        Environment.create('Dev', {
          baseUrl: 'http://localhost',
          _privateVar: 'value',
          API_KEY: 'key123',
          camelCase: 'value',
          snake_case: 'value',
        })
      ).not.toThrow();
    });

    it('should accept variables starting with underscore', () => {
      const env = Environment.create('Dev', { _internal: 'value' });
      expect(env.variables['_internal']).toBe('value');
    });
  });

  describe('updates', () => {
    it('should update name', async () => {
      const env = Environment.create('Dev');
      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));
      const updated = env.update({ name: 'Development' });

      expect(updated.name).toBe('Development');
      expect(updated.id).toBe(env.id);
      expect(updated.createdAt).toBe(env.createdAt);
      expect(updated.updatedAt).not.toBe(env.createdAt);
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(
        new Date(env.createdAt).getTime()
      );
    });

    it('should update variables', () => {
      const env = Environment.create('Dev', { old: 'value' });
      const updated = env.update({ variables: { new: 'value' } });

      expect(updated.variables).toEqual({ new: 'value' });
      expect(updated.variables).not.toEqual({ old: 'value' });
    });

    it('should validate on update', () => {
      const env = Environment.create('Dev');
      expect(() => env.update({ name: '' })).toThrow('Environment name must be 1-100 characters');

      expect(() => env.update({ name: 'Invalid@Name' })).toThrow(
        'Environment name contains invalid characters'
      );

      expect(() => env.update({ variables: { '123bad': 'value' } })).toThrow(
        'Invalid variable name: 123bad'
      );
    });

    it('should preserve unchanged fields on update', () => {
      const env = Environment.create('Dev', { key: 'value' });
      const updated = env.update({ name: 'Development' });

      expect(updated.variables).toEqual(env.variables);
      expect(updated.id).toBe(env.id);
      expect(updated.createdAt).toBe(env.createdAt);
    });

    it('should return new instance on update', () => {
      const env = Environment.create('Dev');
      const updated = env.update({ name: 'Development' });

      expect(updated).not.toBe(env);
    });
  });

  describe('utility methods', () => {
    it('should get variable value by key', () => {
      const env = Environment.create('Dev', {
        baseUrl: 'http://localhost',
        port: '3000',
      });

      expect(env.getVariable('baseUrl')).toBe('http://localhost');
      expect(env.getVariable('port')).toBe('3000');
      expect(env.getVariable('missing')).toBeUndefined();
    });

    it('should set variable value and return new Environment', () => {
      const env = Environment.create('Dev', { old: 'value' });
      const updated = env.setVariable('new', 'newValue');

      expect(updated.variables).toEqual({ old: 'value', new: 'newValue' });
      expect(env.variables).toEqual({ old: 'value' }); // Original unchanged
      expect(updated).not.toBe(env);
    });

    it('should overwrite existing variable with setVariable', () => {
      const env = Environment.create('Dev', { key: 'oldValue' });
      const updated = env.setVariable('key', 'newValue');

      expect(updated.variables['key']).toBe('newValue');
    });

    it('should delete variable and return new Environment', () => {
      const env = Environment.create('Dev', {
        keep: 'value',
        remove: 'toBeRemoved',
      });
      const updated = env.deleteVariable('remove');

      expect(updated.variables).toEqual({ keep: 'value' });
      expect(env.variables).toEqual({ keep: 'value', remove: 'toBeRemoved' }); // Original unchanged
      expect(updated).not.toBe(env);
    });

    it('should handle deleting non-existent variable', () => {
      const env = Environment.create('Dev', { key: 'value' });
      const updated = env.deleteVariable('nonExistent');

      expect(updated.variables).toEqual({ key: 'value' });
    });
  });

  describe('immutability', () => {
    it('should not modify original environment on update', () => {
      const original = Environment.create('Dev', { key: 'value' });
      const originalName = original.name;
      const originalVars = { ...original.variables };

      original.update({ name: 'NewName', variables: { newKey: 'newValue' } });

      expect(original.name).toBe(originalName);
      expect(original.variables).toEqual(originalVars);
    });

    it('should have readonly properties', () => {
      const env = Environment.create('Dev', { key: 'value' });

      // TypeScript enforces readonly at compile time
      // Runtime test: verify properties exist and are of correct type
      expect(env.id).toBeTypeOf('string');
      expect(env.name).toBeTypeOf('string');
      expect(env.variables).toBeTypeOf('object');
      expect(env.createdAt).toBeTypeOf('string');
      expect(env.updatedAt).toBeTypeOf('string');
    });
  });
});
