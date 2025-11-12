/**
 * Collection Store Tests
 *
 * Tests for Zustand collection state management store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useCollectionStore } from './collectionStore';
import { Request } from '../../models/Request';
import { SavedRequest } from '../../models/SavedRequest';
import { HttpMethod } from '../../types/request.types';
import { CollectionService } from '../services/collectionService';

describe('Collection Store', () => {
  let collectionService: CollectionService;

  beforeEach(() => {
    // Clear service and store before each test
    collectionService = new CollectionService();
    collectionService.clear();

    const store = useCollectionStore.getState();
    store.actions.loadCollections();
  });

  describe('initial state', () => {
    it('should initialize with empty collections', () => {
      const state = useCollectionStore.getState();
      expect(state.collections).toEqual({});
    });

    it('should initialize with empty savedRequests', () => {
      const state = useCollectionStore.getState();
      expect(state.savedRequests).toEqual({});
    });

    it('should mark as loaded after loadCollections', () => {
      const state = useCollectionStore.getState();
      expect(state.isLoaded).toBe(true);
    });
  });

  describe('collection management', () => {
    it('should create a collection', () => {
      const store = useCollectionStore.getState();
      const id = store.actions.createCollection('API Tests');

      expect(id).toBeDefined();
      expect(store.actions.getCollections()).toHaveLength(1);
      expect(store.actions.getCollections()[0]?.name).toBe('API Tests');
    });

    it('should rename a collection', () => {
      const store = useCollectionStore.getState();
      const id = store.actions.createCollection('Original Name');

      store.actions.renameCollection(id, 'New Name');

      const collections = store.actions.getCollections();
      expect(collections[0]?.name).toBe('New Name');
    });

    it('should delete a collection', () => {
      const store = useCollectionStore.getState();
      const id = store.actions.createCollection('To Delete');

      expect(store.actions.getCollections()).toHaveLength(1);

      store.actions.deleteCollection(id);

      expect(store.actions.getCollections()).toHaveLength(0);
    });

    it('should reorder collections', () => {
      const store = useCollectionStore.getState();
      const id1 = store.actions.createCollection('First');
      const id2 = store.actions.createCollection('Second');
      const id3 = store.actions.createCollection('Third');

      // Reorder: 3, 1, 2
      store.actions.reorderCollections([id3, id1, id2]);

      const collections = store.actions.getCollections();
      expect(collections[0]?.id).toBe(id3);
      expect(collections[1]?.id).toBe(id1);
      expect(collections[2]?.id).toBe(id2);
    });

    it('should get collections sorted by order', () => {
      const store = useCollectionStore.getState();
      store.actions.createCollection('First');
      store.actions.createCollection('Second');
      store.actions.createCollection('Third');

      const collections = store.actions.getCollections();

      expect(collections).toHaveLength(3);
      expect(collections[0]?.name).toBe('First');
      expect(collections[1]?.name).toBe('Second');
      expect(collections[2]?.name).toBe('Third');
    });
  });

  describe('request management', () => {
    let collectionId: string;
    let sampleRequest: Request;

    beforeEach(() => {
      const store = useCollectionStore.getState();
      collectionId = store.actions.createCollection('Test Collection');
      sampleRequest = new Request({
        url: 'https://api.example.com/users',
        method: HttpMethod.POST,
      });
    });

    it('should save a request', () => {
      const store = useCollectionStore.getState();
      const requestId = store.actions.saveRequest(
        'Create User',
        collectionId,
        sampleRequest,
        'https://api.example.com/users'
      );

      expect(requestId).toBeDefined();

      const requests = store.actions.getRequestsInCollection(collectionId);
      expect(requests).toHaveLength(1);
      expect(requests[0]?.name).toBe('Create User');
    });

    it('should load a saved request', () => {
      const store = useCollectionStore.getState();
      const requestId = store.actions.saveRequest(
        'Test Request',
        collectionId,
        sampleRequest,
        sampleRequest.url
      );

      const loaded = store.actions.loadRequest(requestId);

      expect(loaded).toBeDefined();
      expect(loaded?.name).toBe('Test Request');
      expect(loaded?.url).toBe(sampleRequest.url);
    });

    it('should update a request', () => {
      const store = useCollectionStore.getState();
      const requestId = store.actions.saveRequest(
        'Original Name',
        collectionId,
        sampleRequest,
        sampleRequest.url
      );

      store.actions.updateRequest(requestId, { name: 'Updated Name' });

      const updated = store.actions.getRequestById(requestId);
      expect(updated?.name).toBe('Updated Name');
    });

    it('should delete a request', () => {
      const store = useCollectionStore.getState();
      const requestId = store.actions.saveRequest(
        'To Delete',
        collectionId,
        sampleRequest,
        sampleRequest.url
      );

      expect(store.actions.getRequestsInCollection(collectionId)).toHaveLength(1);

      store.actions.deleteRequest(requestId);

      expect(store.actions.getRequestsInCollection(collectionId)).toHaveLength(0);
    });

    it('should reorder requests within collection', () => {
      const store = useCollectionStore.getState();
      const req1Id = store.actions.saveRequest(
        'First',
        collectionId,
        sampleRequest,
        sampleRequest.url
      );
      const req2Id = store.actions.saveRequest(
        'Second',
        collectionId,
        sampleRequest,
        sampleRequest.url
      );
      const req3Id = store.actions.saveRequest(
        'Third',
        collectionId,
        sampleRequest,
        sampleRequest.url
      );

      // Reorder: 3, 1, 2
      store.actions.reorderRequests(collectionId, [req3Id, req1Id, req2Id]);

      const requests = store.actions.getRequestsInCollection(collectionId);
      expect(requests[0]?.id).toBe(req3Id);
      expect(requests[1]?.id).toBe(req1Id);
      expect(requests[2]?.id).toBe(req2Id);
    });

    it('should get requests in collection sorted by order', () => {
      const store = useCollectionStore.getState();
      store.actions.saveRequest('First', collectionId, sampleRequest, sampleRequest.url);
      store.actions.saveRequest('Second', collectionId, sampleRequest, sampleRequest.url);
      store.actions.saveRequest('Third', collectionId, sampleRequest, sampleRequest.url);

      const requests = store.actions.getRequestsInCollection(collectionId);

      expect(requests).toHaveLength(3);
      expect(requests[0]?.name).toBe('First');
      expect(requests[1]?.name).toBe('Second');
      expect(requests[2]?.name).toBe('Third');
    });

    it('should get request by ID', () => {
      const store = useCollectionStore.getState();
      const requestId = store.actions.saveRequest(
        'Find Me',
        collectionId,
        sampleRequest,
        sampleRequest.url
      );

      const found = store.actions.getRequestById(requestId);

      expect(found).toBeDefined();
      expect(found?.name).toBe('Find Me');
    });

    it('should return empty array for collection with no requests', () => {
      const store = useCollectionStore.getState();
      const requests = store.actions.getRequestsInCollection(collectionId);

      expect(requests).toEqual([]);
    });
  });

  describe('cascade delete', () => {
    it('should delete all requests when deleting collection', () => {
      const store = useCollectionStore.getState();
      const collectionId = store.actions.createCollection('To Delete');
      const sampleRequest = new Request({ url: 'https://api.example.com' });

      const req1Id = store.actions.saveRequest(
        'Request 1',
        collectionId,
        sampleRequest,
        sampleRequest.url
      );
      const req2Id = store.actions.saveRequest(
        'Request 2',
        collectionId,
        sampleRequest,
        sampleRequest.url
      );
      const req3Id = store.actions.saveRequest(
        'Request 3',
        collectionId,
        sampleRequest,
        sampleRequest.url
      );

      expect(store.actions.getRequestsInCollection(collectionId)).toHaveLength(3);

      // Delete collection
      store.actions.deleteCollection(collectionId);

      // Verify collection is deleted
      expect(store.actions.getCollections().find((c) => c.id === collectionId)).toBeUndefined();

      // Verify requests are deleted
      expect(store.actions.getRequestById(req1Id)).toBeUndefined();
      expect(store.actions.getRequestById(req2Id)).toBeUndefined();
      expect(store.actions.getRequestById(req3Id)).toBeUndefined();
      expect(store.actions.getRequestsInCollection(collectionId)).toEqual([]);
    });
  });

  describe('variable preservation', () => {
    it('should preserve {{variables}} in saved requests', () => {
      const store = useCollectionStore.getState();
      const collectionId = store.actions.createCollection('Test');

      const request = new Request({
        url: 'https://example.com/api',
        method: HttpMethod.GET,
        headers: [{ name: 'Authorization', value: 'Bearer {{token}}', enabled: true }],
        body: '{"userId": "{{userId}}"}',
      });

      const requestId = store.actions.saveRequest(
        'Test Request',
        collectionId,
        request,
        'https://{{baseUrl}}/api/{{endpoint}}'
      );

      const saved = store.actions.getRequestById(requestId);

      expect(saved?.url).toContain('{{baseUrl}}');
      expect(saved?.url).toContain('{{endpoint}}');
      expect(saved?.headers[0]?.value).toContain('{{token}}');
      expect(saved?.body).toContain('{{userId}}');
    });
  });

  describe('persistence', () => {
    it('should load collections from service on initialization', () => {
      // Create collection directly in service
      const service = new CollectionService();
      service.createCollection('Persisted Collection');

      // Create new store instance and load
      const store = useCollectionStore.getState();
      store.actions.loadCollections();

      const collections = store.actions.getCollections();
      expect(collections).toHaveLength(1);
      expect(collections[0]?.name).toBe('Persisted Collection');

      service.clear();
    });

    it('should load requests from service on initialization', () => {
      // Create collection and request directly in service
      const service = new CollectionService();
      const collection = service.createCollection('Test');
      const request = new Request({ url: 'https://api.example.com' });
      const saved = service.addRequest(
        SavedRequest.fromRequest(request, collection.id, 'Persisted Request', request.url)
      );

      // Create new store instance and load
      const store = useCollectionStore.getState();
      store.actions.loadCollections();

      const loaded = store.actions.getRequestById(saved.id);
      expect(loaded).toBeDefined();
      expect(loaded?.name).toBe('Persisted Request');

      service.clear();
    });
  });

  describe('save/load workflow', () => {
    it('should complete full save and load cycle', () => {
      const store = useCollectionStore.getState();

      // Create collection
      const collectionId = store.actions.createCollection('My API Tests');

      // Create and save request
      const request = new Request({
        url: 'https://api.example.com/users',
        method: HttpMethod.POST,
        headers: [
          { name: 'Content-Type', value: 'application/json', enabled: true },
          { name: 'Authorization', value: 'Bearer {{token}}', enabled: true },
        ],
        body: '{"name": "John", "email": "john@example.com"}',
      });

      const requestId = store.actions.saveRequest(
        'Create User',
        collectionId,
        request,
        'https://{{baseUrl}}/users'
      );

      // Load the request back
      const loaded = store.actions.loadRequest(requestId);

      // Verify all fields are preserved
      expect(loaded).toBeDefined();
      expect(loaded?.name).toBe('Create User');
      expect(loaded?.url).toContain('{{baseUrl}}');
      expect(loaded?.method).toBe(HttpMethod.POST);
      expect(loaded?.headers).toHaveLength(2);
      expect(loaded?.headers[1]?.value).toContain('{{token}}');
      expect(loaded?.body).toBe('{"name": "John", "email": "john@example.com"}');
    });
  });
});
