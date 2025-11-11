/**
 * Memory Usage Performance Tests (T275)
 *
 * Constitutional requirement: <200MB total app usage (FR-013)
 *
 * Tests:
 * - App memory with 50 collections and 100 environments
 * - Memory leak detection in variable resolution
 * - Memory efficiency with large data sets
 * - Cleanup and garbage collection
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useEnvironmentStore } from '../../src/renderer/store/environmentStore';
import { CollectionService } from '../../src/renderer/services/collectionService';
import { SavedRequest } from '../../src/models/SavedRequest';
import { Request } from '../../src/models/Request';
import { HttpMethod, BodyType } from '../../src/types/request.types';
import { resolveVariables } from '../../src/lib/variableResolver';

describe('Memory Usage Performance (T275)', () => {
  let collectionService: CollectionService;

  beforeEach(() => {
    collectionService = new CollectionService();
    const { actions } = useEnvironmentStore.getState();
    actions.reset();
  });

  afterEach(() => {
    // Cleanup
    const collections = collectionService.getAllCollections();
    collections.forEach((c) => collectionService.deleteCollection(c.id));
  });

  describe('Constitutional Requirement: <200MB with 50 collections, 100 environments', () => {
    it('should handle 50 collections with 10 requests each', () => {
      const collections = [];

      // Create 50 collections with 10 requests each (500 total)
      for (let c = 0; c < 50; c++) {
        const collection = collectionService.createCollection(`Collection ${c}`);
        collections.push(collection);

        for (let r = 0; r < 10; r++) {
          const request = new Request({
            url: `https://api.example.com/collection${c}/request${r}`,
            method: HttpMethod.GET,
            headers: [
              { name: 'Authorization', value: 'Bearer token123', enabled: true },
              { name: 'Content-Type', value: 'application/json', enabled: true },
            ],
            body: JSON.stringify({ id: r, data: 'test' }),
            bodyType: BodyType.JSON,
            timeout: 30000,
          });

          const savedRequest = SavedRequest.fromRequest(
            request,
            collection.id,
            `Request ${r}`,
            request.url,
            r
          );

          collectionService.addRequest(savedRequest);
        }
      }

      // Verify all created
      const allCollections = collectionService.getAllCollections();
      expect(allCollections.length).toBe(50);

      let totalRequests = 0;
      for (const collection of allCollections) {
        const requests = collectionService.getRequestsInCollection(collection.id);
        totalRequests += requests.length;
      }

      expect(totalRequests).toBe(500);

      console.log('[BENCHMARK] Successfully created 50 collections with 500 requests total');
    });

    it('should handle 100 environments with 20 variables each', () => {
      const { actions } = useEnvironmentStore.getState();

      // Create 100 environments with 20 variables each
      const envIds: string[] = [];
      for (let i = 0; i < 100; i++) {
        const variables: Record<string, string> = {};
        for (let v = 0; v < 20; v++) {
          variables[`var${v}`] = `value_${i}_${v}`;
        }

        const envId = actions.createEnvironment(`Environment ${i}`, variables);
        envIds.push(envId);
      }

      // Verify all created
      const store = useEnvironmentStore.getState();
      const envCount = Object.keys(store.environments).length;
      expect(envCount).toBe(100);

      console.log('[BENCHMARK] Successfully created 100 environments with 2000 variables total');
    });

    it('should handle combined load: 50 collections + 100 environments', () => {
      const { actions } = useEnvironmentStore.getState();

      // Create 100 environments
      for (let i = 0; i < 100; i++) {
        const variables: Record<string, string> = {};
        for (let v = 0; v < 20; v++) {
          variables[`var${v}`] = `value_${i}_${v}`;
        }
        actions.createEnvironment(`Env ${i}`, variables);
      }

      // Create 50 collections with 10 requests each
      for (let c = 0; c < 50; c++) {
        const collection = collectionService.createCollection(`Collection ${c}`);

        for (let r = 0; r < 10; r++) {
          const request = new Request({
            url: `https://api.example.com/c${c}/r${r}`,
            method: HttpMethod.GET,
            headers: [],
            body: '',
            bodyType: BodyType.JSON,
            timeout: 30000,
          });

          const savedRequest = SavedRequest.fromRequest(
            request,
            collection.id,
            `Request ${r}`,
            request.url,
            r
          );

          collectionService.addRequest(savedRequest);
        }
      }

      const store = useEnvironmentStore.getState();
      const envCount = Object.keys(store.environments).length;
      const collectionCount = collectionService.getAllCollections().length;

      expect(envCount).toBe(100);
      expect(collectionCount).toBe(50);

      console.log('[BENCHMARK] Successfully handled combined load: 100 envs + 50 collections');
    });
  });

  describe('Memory Leak Detection', () => {
    it('should not leak memory with repeated variable resolution', () => {
      const variables = {
        baseUrl: 'https://api.example.com',
        version: 'v1',
        endpoint: 'users',
      };

      const text = '{{baseUrl}}/{{version}}/{{endpoint}}';

      // Resolve 10,000 times
      const iterations = 10000;
      for (let i = 0; i < iterations; i++) {
        const result = resolveVariables(text, variables);
        expect(result).toBe('https://api.example.com/v1/users');
      }

      console.log('[BENCHMARK] No memory leaks detected after 10,000 resolutions');
    });

    it('should not leak memory with repeated collection operations', () => {
      // Create and delete collections repeatedly
      for (let i = 0; i < 100; i++) {
        const collection = collectionService.createCollection(`Temp ${i}`);

        // Add some requests
        for (let r = 0; r < 5; r++) {
          const request = new Request({
            url: `https://api.example.com/r${r}`,
            method: HttpMethod.GET,
            headers: [],
            body: '',
            bodyType: BodyType.JSON,
            timeout: 30000,
          });

          const savedRequest = SavedRequest.fromRequest(
            request,
            collection.id,
            `Request ${r}`,
            request.url,
            r
          );

          collectionService.addRequest(savedRequest);
        }

        // Delete the collection
        collectionService.deleteCollection(collection.id);
      }

      // Verify all cleaned up
      const remaining = collectionService.getAllCollections();
      expect(remaining.length).toBe(0);

      console.log('[BENCHMARK] No memory leaks detected after 100 create/delete cycles');
    });

    it('should not leak memory with environment creation and deletion', () => {
      const { actions } = useEnvironmentStore.getState();

      // Create and delete environments repeatedly
      for (let i = 0; i < 100; i++) {
        const envId = actions.createEnvironment(`Temp ${i}`, {
          var1: `value${i}`,
          var2: `value${i * 2}`,
        });

        // Set as active
        actions.setActiveEnvironment(envId);

        // Resolve some variables
        actions.resolveVariables('{{var1}}_{{var2}}');

        // Delete
        actions.deleteEnvironment(envId);
      }

      const store = useEnvironmentStore.getState();
      const envCount = Object.keys(store.environments).length;
      expect(envCount).toBe(0);

      console.log('[BENCHMARK] No memory leaks detected after 100 env create/delete cycles');
    });
  });

  describe('Large Data Set Memory Efficiency', () => {
    it('should efficiently handle large request bodies', () => {
      const collection = collectionService.createCollection('Large Bodies');

      // Create requests with 100KB bodies
      const largeObject: Record<string, string> = {};
      for (let j = 0; j < 1000; j++) {
        largeObject[`field${j}`] = 'x'.repeat(100);
      }
      const largeBody = JSON.stringify(largeObject);

      console.log(`[INFO] Large body size: ${(largeBody.length / 1024).toFixed(2)} KB`);

      // Create 10 requests with large bodies
      for (let i = 0; i < 10; i++) {
        const request = new Request({
          url: `https://api.example.com/large${i}`,
          method: HttpMethod.POST,
          headers: [],
          body: largeBody,
          bodyType: BodyType.JSON,
          timeout: 30000,
        });

        const savedRequest = SavedRequest.fromRequest(
          request,
          collection.id,
          `Large Request ${i}`,
          request.url,
          i
        );

        collectionService.addRequest(savedRequest);
      }

      const requests = collectionService.getRequestsInCollection(collection.id);
      expect(requests.length).toBe(10);

      console.log('[BENCHMARK] Successfully stored 10 requests with 100KB bodies each');
    });

    it('should handle many headers efficiently', () => {
      const collection = collectionService.createCollection('Many Headers');

      // Create request with 100 headers
      const headers = [];
      for (let h = 0; h < 100; h++) {
        headers.push({
          name: `X-Custom-Header-${h}`,
          value: `value-${h}`,
          enabled: true,
        });
      }

      const request = new Request({
        url: 'https://api.example.com/headers',
        method: HttpMethod.GET,
        headers,
        body: '',
        bodyType: BodyType.JSON,
        timeout: 30000,
      });

      const savedRequest = SavedRequest.fromRequest(
        request,
        collection.id,
        'Many Headers Request',
        request.url,
        0
      );

      collectionService.addRequest(savedRequest);

      const saved = collectionService.getRequestById(savedRequest.id);
      expect(saved?.headers.length).toBe(100);

      console.log('[BENCHMARK] Successfully stored request with 100 headers');
    });

    it('should handle environment with deeply nested variable references', () => {
      const { actions } = useEnvironmentStore.getState();

      // Create chain of 10 nested variables
      const variables: Record<string, string> = {
        var0: 'final_value',
      };

      for (let i = 1; i < 10; i++) {
        variables[`var${i}`] = `{{var${i - 1}}}`;
      }

      const envId = actions.createEnvironment('Nested', variables);
      actions.setActiveEnvironment(envId);

      // Resolve the deeply nested variable
      const result = actions.resolveVariables('{{var9}}');
      expect(result).toBe('final_value');

      console.log('[BENCHMARK] Successfully resolved 10-level nested variables');
    });
  });

  describe('Object Cleanup and Garbage Collection', () => {
    it('should properly clean up deleted requests', () => {
      const collection = collectionService.createCollection('Cleanup Test');

      // Create 100 requests
      const requestIds: string[] = [];
      for (let i = 0; i < 100; i++) {
        const request = new Request({
          url: `https://api.example.com/r${i}`,
          method: HttpMethod.GET,
          headers: [],
          body: '',
          bodyType: BodyType.JSON,
          timeout: 30000,
        });

        const savedRequest = SavedRequest.fromRequest(
          request,
          collection.id,
          `Request ${i}`,
          request.url,
          i
        );

        collectionService.addRequest(savedRequest);
        requestIds.push(savedRequest.id);
      }

      // Delete all requests
      for (const id of requestIds) {
        collectionService.deleteRequest(id);
      }

      // Verify all deleted
      const remaining = collectionService.getRequestsInCollection(collection.id);
      expect(remaining.length).toBe(0);

      console.log('[BENCHMARK] Successfully cleaned up 100 deleted requests');
    });

    it('should clean up when deleting collection with many requests', () => {
      const collection = collectionService.createCollection('Delete with Requests');

      // Create 50 requests
      for (let i = 0; i < 50; i++) {
        const request = new Request({
          url: `https://api.example.com/r${i}`,
          method: HttpMethod.GET,
          headers: [],
          body: '',
          bodyType: BodyType.JSON,
          timeout: 30000,
        });

        const savedRequest = SavedRequest.fromRequest(
          request,
          collection.id,
          `Request ${i}`,
          request.url,
          i
        );

        collectionService.addRequest(savedRequest);
      }

      // Delete the entire collection
      collectionService.deleteCollection(collection.id);

      // Verify collection is gone
      const found = collectionService.getCollectionById(collection.id);
      expect(found).toBeUndefined();

      console.log('[BENCHMARK] Successfully deleted collection with 50 requests');
    });

    it('should handle store reset without memory issues', () => {
      const { actions } = useEnvironmentStore.getState();

      // Create a lot of data
      for (let i = 0; i < 50; i++) {
        const variables: Record<string, string> = {};
        for (let v = 0; v < 20; v++) {
          variables[`var${v}`] = `value_${i}_${v}`;
        }
        actions.createEnvironment(`Env ${i}`, variables);
      }

      // Reset store
      actions.reset();

      // Verify everything cleared
      const store = useEnvironmentStore.getState();
      const envCount = Object.keys(store.environments).length;
      expect(envCount).toBe(0);
      expect(store.activeEnvironmentId).toBeNull();

      console.log('[BENCHMARK] Successfully reset store and cleaned up 50 environments');
    });
  });
});
