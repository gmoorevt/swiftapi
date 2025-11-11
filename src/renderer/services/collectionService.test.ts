/**
 * CollectionService Tests
 *
 * Tests for the service layer managing collections and saved requests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CollectionService } from './collectionService';
import { SavedRequest } from '../../models/SavedRequest';
import { Request } from '../../models/Request';
import { HttpMethod } from '../../types/request.types';

describe('CollectionService', () => {
  let service: CollectionService;

  beforeEach(() => {
    service = new CollectionService();
    // Clear storage before each test
    service.clear();
  });

  afterEach(() => {
    // Clean up after tests
    service.clear();
  });

  describe('Collection CRUD', () => {
    it('should create a new collection', () => {
      const collection = service.createCollection('API Tests');

      expect(collection.id).toBeDefined();
      expect(collection.name).toBe('API Tests');
      expect(collection.order).toBe(0);
    });

    it('should auto-assign order when creating collections', () => {
      const coll1 = service.createCollection('First');
      const coll2 = service.createCollection('Second');
      const coll3 = service.createCollection('Third');

      expect(coll1.order).toBe(0);
      expect(coll2.order).toBe(1);
      expect(coll3.order).toBe(2);
    });

    it('should get all collections sorted by order', () => {
      service.createCollection('First');
      service.createCollection('Second');
      service.createCollection('Third');

      const collections = service.getAllCollections();

      expect(collections).toHaveLength(3);
      expect(collections[0]?.name).toBe('First');
      expect(collections[1]?.name).toBe('Second');
      expect(collections[2]?.name).toBe('Third');
    });

    it('should get collection by ID', () => {
      const created = service.createCollection('Test Collection');
      const retrieved = service.getCollectionById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Test Collection');
    });

    it('should return undefined for non-existent collection ID', () => {
      const result = service.getCollectionById('non-existent-id');

      expect(result).toBeUndefined();
    });

    it('should update collection name', () => {
      const collection = service.createCollection('Original Name');
      const updated = service.updateCollection(collection.id, { name: 'New Name' });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('New Name');
      expect(updated?.id).toBe(collection.id);
    });

    it('should update collection order', () => {
      const collection = service.createCollection('Test');
      const updated = service.updateCollection(collection.id, { order: 10 });

      expect(updated?.order).toBe(10);
    });

    it('should return undefined when updating non-existent collection', () => {
      const result = service.updateCollection('non-existent-id', { name: 'Test' });

      expect(result).toBeUndefined();
    });

    it('should delete collection', () => {
      const collection = service.createCollection('To Delete');
      service.deleteCollection(collection.id);

      const retrieved = service.getCollectionById(collection.id);
      expect(retrieved).toBeUndefined();
    });

    it('should do nothing when deleting non-existent collection', () => {
      expect(() => service.deleteCollection('non-existent-id')).not.toThrow();
    });
  });

  describe('Collection name uniqueness', () => {
    it('should throw error when creating collection with duplicate name', () => {
      service.createCollection('Unique Name');

      expect(() => service.createCollection('Unique Name')).toThrow(
        'Collection with name "Unique Name" already exists'
      );
    });

    it('should be case-insensitive for uniqueness check', () => {
      service.createCollection('API Tests');

      expect(() => service.createCollection('api tests')).toThrow(
        'Collection with name "api tests" already exists'
      );
      expect(() => service.createCollection('API TESTS')).toThrow(
        'Collection with name "API TESTS" already exists'
      );
    });

    it('should throw error when updating collection to duplicate name', () => {
      service.createCollection('Collection A');
      const collectionB = service.createCollection('Collection B');

      expect(() => service.updateCollection(collectionB.id, { name: 'Collection A' })).toThrow(
        'Collection with name "Collection A" already exists'
      );
    });

    it('should allow updating collection to same name (case change only)', () => {
      const collection = service.createCollection('Test Collection');
      const updated = service.updateCollection(collection.id, { name: 'TEST COLLECTION' });

      expect(updated?.name).toBe('TEST COLLECTION');
    });
  });

  describe('Request management', () => {
    let collectionId: string;
    let sampleRequest: Request;

    beforeEach(() => {
      const collection = service.createCollection('Test Collection');
      collectionId = collection.id;
      sampleRequest = new Request({
        url: 'https://api.example.com/users',
        method: HttpMethod.POST,
      });
    });

    it('should add request to collection', () => {
      const savedRequest = SavedRequest.fromRequest(
        sampleRequest,
        collectionId,
        'Create User',
        'https://api.example.com/users'
      );
      const added = service.addRequest(savedRequest);

      expect(added.id).toBe(savedRequest.id);
      expect(added.collectionId).toBe(collectionId);
    });

    it('should auto-assign order when adding requests', () => {
      const req1 = SavedRequest.fromRequest(sampleRequest, collectionId, 'Request 1', sampleRequest.url);
      const req2 = SavedRequest.fromRequest(sampleRequest, collectionId, 'Request 2', sampleRequest.url);
      const req3 = SavedRequest.fromRequest(sampleRequest, collectionId, 'Request 3', sampleRequest.url);

      const added1 = service.addRequest(req1);
      const added2 = service.addRequest(req2);
      const added3 = service.addRequest(req3);

      expect(added1.order).toBe(0);
      expect(added2.order).toBe(1);
      expect(added3.order).toBe(2);
    });

    it('should get all requests in collection sorted by order', () => {
      const req1 = SavedRequest.fromRequest(sampleRequest, collectionId, 'First', sampleRequest.url);
      const req2 = SavedRequest.fromRequest(sampleRequest, collectionId, 'Second', sampleRequest.url);
      const req3 = SavedRequest.fromRequest(sampleRequest, collectionId, 'Third', sampleRequest.url);

      service.addRequest(req1);
      service.addRequest(req2);
      service.addRequest(req3);

      const requests = service.getRequestsInCollection(collectionId);

      expect(requests).toHaveLength(3);
      expect(requests[0]?.name).toBe('First');
      expect(requests[1]?.name).toBe('Second');
      expect(requests[2]?.name).toBe('Third');
    });

    it('should return empty array for collection with no requests', () => {
      const requests = service.getRequestsInCollection(collectionId);

      expect(requests).toEqual([]);
    });

    it('should get request by ID', () => {
      const savedRequest = SavedRequest.fromRequest(sampleRequest, collectionId, 'Test', sampleRequest.url);
      service.addRequest(savedRequest);

      const retrieved = service.getRequestById(savedRequest.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(savedRequest.id);
      expect(retrieved?.name).toBe('Test');
    });

    it('should return undefined for non-existent request ID', () => {
      const result = service.getRequestById('non-existent-id');

      expect(result).toBeUndefined();
    });

    it('should update request', () => {
      const savedRequest = SavedRequest.fromRequest(sampleRequest, collectionId, 'Original', sampleRequest.url);
      service.addRequest(savedRequest);

      const updated = service.updateRequest(savedRequest.id, { name: 'Updated' });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated');
      expect(updated?.id).toBe(savedRequest.id);
    });

    it('should return undefined when updating non-existent request', () => {
      const result = service.updateRequest('non-existent-id', { name: 'Test' });

      expect(result).toBeUndefined();
    });

    it('should delete request', () => {
      const savedRequest = SavedRequest.fromRequest(sampleRequest, collectionId, 'To Delete', sampleRequest.url);
      service.addRequest(savedRequest);

      service.deleteRequest(savedRequest.id);

      const retrieved = service.getRequestById(savedRequest.id);
      expect(retrieved).toBeUndefined();
    });

    it('should do nothing when deleting non-existent request', () => {
      expect(() => service.deleteRequest('non-existent-id')).not.toThrow();
    });
  });

  describe('Cascade delete', () => {
    it('should delete all requests when deleting collection', () => {
      const collection = service.createCollection('To Delete');
      const sampleRequest = new Request({ url: 'https://api.example.com' });

      const req1 = SavedRequest.fromRequest(sampleRequest, collection.id, 'Request 1', sampleRequest.url);
      const req2 = SavedRequest.fromRequest(sampleRequest, collection.id, 'Request 2', sampleRequest.url);
      const req3 = SavedRequest.fromRequest(sampleRequest, collection.id, 'Request 3', sampleRequest.url);

      service.addRequest(req1);
      service.addRequest(req2);
      service.addRequest(req3);

      // Delete collection
      service.deleteCollection(collection.id);

      // Verify requests are deleted
      expect(service.getRequestById(req1.id)).toBeUndefined();
      expect(service.getRequestById(req2.id)).toBeUndefined();
      expect(service.getRequestById(req3.id)).toBeUndefined();
      expect(service.getRequestsInCollection(collection.id)).toEqual([]);
    });
  });

  describe('Reordering', () => {
    it('should reorder collections', () => {
      const coll1 = service.createCollection('First');
      const coll2 = service.createCollection('Second');
      const coll3 = service.createCollection('Third');

      // Reorder: 3, 1, 2
      service.reorderCollections([coll3.id, coll1.id, coll2.id]);

      const collections = service.getAllCollections();

      expect(collections[0]?.id).toBe(coll3.id);
      expect(collections[0]?.order).toBe(0);
      expect(collections[1]?.id).toBe(coll1.id);
      expect(collections[1]?.order).toBe(1);
      expect(collections[2]?.id).toBe(coll2.id);
      expect(collections[2]?.order).toBe(2);
    });

    it('should reorder requests within collection', () => {
      const collection = service.createCollection('Test');
      const sampleRequest = new Request({ url: 'https://api.example.com' });

      const req1 = SavedRequest.fromRequest(sampleRequest, collection.id, 'First', sampleRequest.url);
      const req2 = SavedRequest.fromRequest(sampleRequest, collection.id, 'Second', sampleRequest.url);
      const req3 = SavedRequest.fromRequest(sampleRequest, collection.id, 'Third', sampleRequest.url);

      service.addRequest(req1);
      service.addRequest(req2);
      service.addRequest(req3);

      // Reorder: 3, 1, 2
      service.reorderRequests(collection.id, [req3.id, req1.id, req2.id]);

      const requests = service.getRequestsInCollection(collection.id);

      expect(requests[0]?.id).toBe(req3.id);
      expect(requests[0]?.order).toBe(0);
      expect(requests[1]?.id).toBe(req1.id);
      expect(requests[1]?.order).toBe(1);
      expect(requests[2]?.id).toBe(req2.id);
      expect(requests[2]?.order).toBe(2);
    });
  });

  describe('Persistence', () => {
    it('should persist collections across service instances', () => {
      const service1 = new CollectionService();
      service1.clear();
      const collection = service1.createCollection('Persistent Collection');

      const service2 = new CollectionService();
      const retrieved = service2.getCollectionById(collection.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Persistent Collection');

      service2.clear();
    });

    it('should persist requests across service instances', () => {
      const service1 = new CollectionService();
      service1.clear();
      const collection = service1.createCollection('Test');
      const sampleRequest = new Request({ url: 'https://api.example.com' });
      const savedRequest = SavedRequest.fromRequest(sampleRequest, collection.id, 'Persistent', sampleRequest.url);
      service1.addRequest(savedRequest);

      const service2 = new CollectionService();
      const retrieved = service2.getRequestById(savedRequest.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Persistent');

      service2.clear();
    });
  });
});
