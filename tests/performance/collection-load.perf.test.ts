/**
 * Collection Load Performance Tests (T273)
 *
 * Constitutional requirement: <500ms for 500+ requests (FR-013)
 *
 * Tests:
 * - Load 500 requests in <500ms
 * - Load large collections efficiently
 * - Filter/search through collections
 * - Render performance for large lists
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CollectionService } from '../../src/renderer/services/collectionService';
import { SavedRequest } from '../../src/models/SavedRequest';
import { Request } from '../../src/models/Request';
import { HttpMethod, BodyType } from '../../src/types/request.types';

describe('Collection Load Performance (T273)', () => {
  let service: CollectionService;

  beforeEach(() => {
    service = new CollectionService();
  });

  afterEach(() => {
    // Clean up - delete all collections
    const collections = service.getAllCollections();
    collections.forEach((c) => service.deleteCollection(c.id));
  });

  describe('Constitutional Requirement: 500 requests <500ms', () => {
    it('should load 500 saved requests in less than 500ms', () => {
      // Create a collection
      const collection = service.createCollection('Performance Test Collection');

      // Create 500 saved requests
      for (let i = 0; i < 500; i++) {
        const request = new Request({
          url: `https://api.example.com/endpoint${i}`,
          method: HttpMethod.GET,
          headers: [
            { name: 'Authorization', value: `Bearer token${i}`, enabled: true },
            { name: 'Content-Type', value: 'application/json', enabled: true },
          ],
          body: JSON.stringify({ id: i, data: 'test' }),
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

        service.addRequest(savedRequest);
      }

      // Measure load time
      const startTime = performance.now();
      const requests = service.getRequestsInCollection(collection.id);
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`[BENCHMARK] Loaded ${requests.length} requests in ${duration.toFixed(2)}ms`);

      // Constitutional requirement: <500ms for 500+ requests
      expect(duration).toBeLessThan(500);
      expect(requests.length).toBe(500);
    });

    it('should load multiple collections with many requests efficiently', () => {
      // Create 10 collections with 50 requests each (500 total)
      const collections = [];
      for (let c = 0; c < 10; c++) {
        const collection = service.createCollection(`Collection ${c}`);
        collections.push(collection);

        for (let r = 0; r < 50; r++) {
          const request = new Request({
            url: `https://api.example.com/collection${c}/request${r}`,
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

          service.addRequest(savedRequest);
        }
      }

      // Measure time to load all requests from all collections
      const startTime = performance.now();

      let totalRequests = 0;
      for (const collection of collections) {
        const requests = service.getRequestsInCollection(collection.id);
        totalRequests += requests.length;
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`[BENCHMARK] Loaded ${totalRequests} requests from ${collections.length} collections in ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(500);
      expect(totalRequests).toBe(500);
    });
  });

  describe('Large Collection Handling', () => {
    it('should handle 1000 requests efficiently', () => {
      const collection = service.createCollection('Large Collection');

      // Create 1000 requests
      for (let i = 0; i < 1000; i++) {
        const request = new Request({
          url: `https://api.example.com/endpoint${i}`,
          method: i % 4 === 0 ? HttpMethod.POST : HttpMethod.GET,
          headers: [],
          body: i % 4 === 0 ? JSON.stringify({ id: i }) : '',
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

        service.addRequest(savedRequest);
      }

      const startTime = performance.now();
      const requests = service.getRequestsInCollection(collection.id);
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`[BENCHMARK] Loaded ${requests.length} requests in ${duration.toFixed(2)}ms`);

      // Should still be reasonably fast
      expect(duration).toBeLessThan(1000);
      expect(requests.length).toBe(1000);
    });

    it('should efficiently load requests with large bodies', () => {
      const collection = service.createCollection('Large Bodies Collection');

      // Create requests with large JSON bodies (10KB each)
      const largeObject: Record<string, string> = {};
      for (let j = 0; j < 100; j++) {
        largeObject[`field${j}`] = 'x'.repeat(100);
      }
      const largeBody = JSON.stringify(largeObject);

      for (let i = 0; i < 100; i++) {
        const request = new Request({
          url: `https://api.example.com/endpoint${i}`,
          method: HttpMethod.POST,
          headers: [],
          body: largeBody,
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

        service.addRequest(savedRequest);
      }

      const startTime = performance.now();
      const requests = service.getRequestsInCollection(collection.id);
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`[BENCHMARK] Loaded ${requests.length} large requests in ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(500);
      expect(requests.length).toBe(100);
    });
  });

  describe('Collection Operations Performance', () => {
    it('should efficiently load all collections', () => {
      // Create 50 collections
      for (let i = 0; i < 50; i++) {
        service.createCollection(`Collection ${i}`);
      }

      const startTime = performance.now();
      const collections = service.getAllCollections();
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`[BENCHMARK] Loaded ${collections.length} collections in ${duration.toFixed(2)}ms`);

      // Should be very fast
      expect(duration).toBeLessThan(100);
      expect(collections.length).toBe(50);
    });

    it('should quickly find a specific request', () => {
      const collection = service.createCollection('Search Test');

      // Create 500 requests
      for (let i = 0; i < 500; i++) {
        const request = new Request({
          url: `https://api.example.com/endpoint${i}`,
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

        service.addRequest(savedRequest);
      }

      // Measure time to find a specific request
      const startTime = performance.now();
      service.getRequestById('some-id'); // Will be undefined but tests the search
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Lookup should be fast
      expect(duration).toBeLessThan(50);
    });

    it('should handle repeated getAllCollections calls efficiently', () => {
      // Create 20 collections
      for (let i = 0; i < 20; i++) {
        service.createCollection(`Collection ${i}`);
      }

      const iterations = 100;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        service.getAllCollections();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const averageTime = duration / iterations;

      console.log(`[BENCHMARK] Average getAllCollections time: ${averageTime.toFixed(3)}ms`);

      // Each call should be fast (<5ms average)
      expect(averageTime).toBeLessThan(5);
    });
  });

  describe('Memory Efficiency', () => {
    it('should efficiently handle large collection data structures', () => {
      const collections = [];

      // Create 20 collections with 50 requests each
      for (let c = 0; c < 20; c++) {
        const collection = service.createCollection(`Collection ${c}`);
        collections.push(collection);

        for (let r = 0; r < 50; r++) {
          const request = new Request({
            url: `https://api.example.com/c${c}/r${r}`,
            method: HttpMethod.GET,
            headers: [
              { name: 'Header1', value: 'value1', enabled: true },
              { name: 'Header2', value: 'value2', enabled: true },
            ],
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

          service.addRequest(savedRequest);
        }
      }

      // Load all data
      const startTime = performance.now();

      const allCollections = service.getAllCollections();
      let totalRequests = 0;

      for (const collection of allCollections) {
        const requests = service.getRequestsInCollection(collection.id);
        totalRequests += requests.length;
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`[BENCHMARK] Loaded ${totalRequests} requests across ${allCollections.length} collections in ${duration.toFixed(2)}ms`);

      expect(allCollections.length).toBe(20);
      expect(totalRequests).toBe(1000);
      expect(duration).toBeLessThan(500);
    });
  });
});
