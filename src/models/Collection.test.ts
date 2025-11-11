/**
 * Collection Model Tests
 *
 * Tests for the Collection entity used to organize saved API requests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Collection } from './Collection';

describe('Collection Model', () => {
  describe('creation', () => {
    it('should create a Collection with auto-generated id and timestamps', () => {
      const collection = Collection.create('My Collection');

      expect(collection.id).toBeDefined();
      expect(collection.id).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/); // UUID format
      expect(collection.name).toBe('My Collection');
      expect(collection.order).toBe(0);
      expect(collection.createdAt).toBeInstanceOf(Date);
      expect(collection.updatedAt).toBeInstanceOf(Date);
      expect(collection.createdAt.getTime()).toBe(collection.updatedAt.getTime());
    });

    it('should create a Collection with specified order', () => {
      const collection = Collection.create('My Collection', 5);

      expect(collection.order).toBe(5);
    });

    it('should generate unique ids for different collections', () => {
      const collection1 = Collection.create('Collection 1');
      const collection2 = Collection.create('Collection 2');

      expect(collection1.id).not.toBe(collection2.id);
    });
  });

  describe('validation', () => {
    it('should throw error for empty name', () => {
      expect(() => Collection.create('')).toThrow('Collection name cannot be empty');
    });

    it('should throw error for whitespace-only name', () => {
      expect(() => Collection.create('   ')).toThrow('Collection name cannot be empty');
    });

    it('should throw error for name longer than 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(() => Collection.create(longName)).toThrow(
        'Collection name must be 100 characters or less'
      );
    });

    it('should throw error for name with invalid characters', () => {
      expect(() => Collection.create('Invalid@Name')).toThrow(
        'Collection name can only contain letters, numbers, spaces, hyphens, and underscores'
      );
    });

    it('should allow name with valid characters', () => {
      const validNames = [
        'My Collection',
        'API-Tests',
        'test_collection',
        'Collection123',
        'Test-Collection_2023',
      ];

      validNames.forEach((name) => {
        expect(() => Collection.create(name)).not.toThrow();
      });
    });

    it('should accept name with exactly 100 characters', () => {
      const name = 'a'.repeat(100);
      expect(() => Collection.create(name)).not.toThrow();
    });
  });

  describe('update', () => {
    let collection: Collection;

    beforeEach(() => {
      collection = Collection.create('Original Name');
    });

    it('should update name and return new instance', () => {
      const updated = collection.update({ name: 'New Name' });

      expect(updated.name).toBe('New Name');
      expect(updated.id).toBe(collection.id);
      expect(updated.createdAt.getTime()).toBe(collection.createdAt.getTime());
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(collection.updatedAt.getTime());
      expect(updated).not.toBe(collection); // Different instance
    });

    it('should update order and return new instance', () => {
      const updated = collection.update({ order: 10 });

      expect(updated.order).toBe(10);
      expect(updated.name).toBe(collection.name);
    });

    it('should update multiple properties at once', () => {
      const updated = collection.update({ name: 'Updated', order: 5 });

      expect(updated.name).toBe('Updated');
      expect(updated.order).toBe(5);
    });

    it('should validate updated name', () => {
      expect(() => collection.update({ name: '' })).toThrow('Collection name cannot be empty');
      expect(() => collection.update({ name: 'Invalid@Name' })).toThrow(
        'Collection name can only contain letters, numbers, spaces, hyphens, and underscores'
      );
    });

    it('should return same data if no changes provided', () => {
      const updated = collection.update({});

      expect(updated.name).toBe(collection.name);
      expect(updated.order).toBe(collection.order);
    });
  });

  describe('immutability', () => {
    it('should not modify original collection when updating', () => {
      const original = Collection.create('Original');
      const originalName = original.name;
      const originalOrder = original.order;

      original.update({ name: 'Modified', order: 99 });

      expect(original.name).toBe(originalName);
      expect(original.order).toBe(originalOrder);
    });
  });

  describe('serialization', () => {
    it('should convert to JSON for storage', () => {
      const collection = Collection.create('Test Collection', 3);
      const json = collection.toJSON();

      expect(json).toEqual({
        id: collection.id,
        name: 'Test Collection',
        order: 3,
        createdAt: collection.createdAt.toISOString(),
        updatedAt: collection.updatedAt.toISOString(),
      });
    });

    it('should restore from JSON', () => {
      const original = Collection.create('Test Collection', 5);
      const json = original.toJSON();
      const restored = Collection.fromJSON(json);

      expect(restored.id).toBe(original.id);
      expect(restored.name).toBe(original.name);
      expect(restored.order).toBe(original.order);
      expect(restored.createdAt.getTime()).toBe(original.createdAt.getTime());
      expect(restored.updatedAt.getTime()).toBe(original.updatedAt.getTime());
    });
  });
});
