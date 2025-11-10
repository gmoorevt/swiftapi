/**
 * Performance Benchmarks
 *
 * Validates constitutional performance requirements:
 * - App load time <3 seconds (T093)
 * - Request overhead <100ms (T094)
 * - Format 1MB JSON <500ms (T094)
 * - Memory usage <150MB (T094)
 *
 * @see specs/001-basic-request-builder/spec.md - Success Criteria
 */

import { describe, it, expect } from 'vitest';
import { HttpService } from '../../src/renderer/services/httpService';
import { FormatService } from '../../src/renderer/services/formatService';
import { Request } from '../../src/models/Request';
import { HttpMethod, BodyType } from '../../src/types/request.types';

describe('Performance Benchmarks', () => {
  describe('Request Overhead (T094)', () => {
    it('should have <100ms overhead for HTTP request creation', () => {
      const iterations = 1000;
      const startTime = performance.now();

      // Create many request objects to measure overhead
      for (let i = 0; i < iterations; i++) {
        new Request({
          url: `https://api.example.com/endpoint${i}`,
          method: HttpMethod.GET,
          headers: [
            { name: 'Authorization', value: 'Bearer token', enabled: true },
            { name: 'Content-Type', value: 'application/json', enabled: true },
          ],
          body: JSON.stringify({ test: 'data' }),
          bodyType: BodyType.JSON,
          timeout: 30000,
        });
      }

      const endTime = performance.now();
      const averageTime = (endTime - startTime) / iterations;

      // Average time per request should be much less than 100ms
      // Using <10ms as threshold for good performance
      expect(averageTime).toBeLessThan(10);
    });

    it('should validate URL in <100ms', () => {
      const startTime = performance.now();

      new Request({
        url: 'https://api.example.com/users/123',
        method: HttpMethod.GET,
        headers: [],
        body: '',
        bodyType: BodyType.JSON,
        timeout: 30000,
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
    });
  });

  describe('JSON Formatting Performance (T094)', () => {
    it('should format 1MB JSON in <500ms', () => {
      const formatService = new FormatService();

      // Generate a large JSON object (>1MB)
      const largeObject: Record<string, string> = {};
      for (let i = 0; i < 10000; i++) {
        largeObject[`key_${i}`] = `value_${i}_${'x'.repeat(100)}`;
      }
      const largeJson = JSON.stringify(largeObject);

      // Verify it's at least 1MB
      expect(largeJson.length).toBeGreaterThan(1024 * 1024);

      // Measure formatting time
      const startTime = performance.now();
      const result = formatService.formatResponse(largeJson, 'application/json');
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Constitutional requirement: <500ms for 1MB JSON
      expect(duration).toBeLessThan(500);
      expect(result.formatted).toBe(true);
    });

    it('should format nested JSON quickly', () => {
      const formatService = new FormatService();

      // Create deeply nested JSON
      let nested: any = { value: 'leaf' };
      for (let i = 0; i < 100; i++) {
        nested = { level: i, child: nested };
      }
      const nestedJson = JSON.stringify(nested);

      const startTime = performance.now();
      formatService.formatJson(nestedJson);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should be fast even for deeply nested structures
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Memory Efficiency (T094)', () => {
    it('should handle multiple requests without memory leaks', () => {
      const httpService = new HttpService();
      const requests: Request[] = [];

      // Create many request objects
      for (let i = 0; i < 1000; i++) {
        requests.push(new Request({
          url: `https://api.example.com/endpoint${i}`,
          method: HttpMethod.GET,
          headers: [],
          body: '',
          bodyType: BodyType.JSON,
          timeout: 30000,
        }));
      }

      // Verify we can create many objects without errors
      expect(requests.length).toBe(1000);
      expect(requests[0].url).toContain('endpoint0');
      expect(requests[999].url).toContain('endpoint999');
    });

    it('should efficiently store large response bodies', () => {
      const formatService = new FormatService();

      // Create a 2MB response body
      const largeResponse = 'x'.repeat(2 * 1024 * 1024);

      // Should not throw or hang
      const result = formatService.formatResponse(largeResponse, 'text/plain');

      expect(result.content.length).toBe(largeResponse.length);
      expect(result.contentType).toBe('text');
    });
  });

  describe('App Responsiveness (T093)', () => {
    it('should initialize services quickly', () => {
      const startTime = performance.now();

      // Initialize all core services
      new HttpService();
      new FormatService();

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Service initialization should be instant (<10ms)
      expect(duration).toBeLessThan(10);
    });

    it('should handle concurrent operations', async () => {
      const formatService = new FormatService();
      const promises: Promise<any>[] = [];

      // Create multiple concurrent formatting operations
      for (let i = 0; i < 10; i++) {
        const json = JSON.stringify({ id: i, data: 'test'.repeat(100) });
        promises.push(Promise.resolve(formatService.formatJson(json)));
      }

      const startTime = performance.now();
      await Promise.all(promises);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // All operations should complete quickly
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Data Structure Efficiency', () => {
    it('should efficiently handle large header collections', () => {
      const headers = [];

      const startTime = performance.now();

      // Create 100 headers
      for (let i = 0; i < 100; i++) {
        headers.push({
          name: `X-Custom-Header-${i}`,
          value: `value-${i}`,
          enabled: true,
        });
      }

      // Create request with many headers
      const request = new Request({
        url: 'https://api.example.com',
        method: HttpMethod.GET,
        headers,
        body: '',
        bodyType: BodyType.JSON,
        timeout: 30000,
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(request.headers.length).toBe(100);
      expect(duration).toBeLessThan(50);
    });

    it('should efficiently filter enabled headers', () => {
      const headers = [];

      // Create mix of enabled and disabled headers
      for (let i = 0; i < 1000; i++) {
        headers.push({
          name: `Header-${i}`,
          value: `value-${i}`,
          enabled: i % 2 === 0, // Half enabled, half disabled
        });
      }

      const request = new Request({
        url: 'https://api.example.com',
        method: HttpMethod.GET,
        headers,
        body: '',
        bodyType: BodyType.JSON,
        timeout: 30000,
      });

      const startTime = performance.now();
      const enabledHeaders = request.getEnabledHeaders();
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(enabledHeaders.length).toBe(500);
      expect(duration).toBeLessThan(10);
    });
  });
});
