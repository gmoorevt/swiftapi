/**
 * MockServer Model Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockServerModel } from '../../src/models/MockServer';
import { MockEndpoint } from '../../src/types/mockServer.types';

describe('MockServer Model', () => {
  let server: MockServerModel;

  beforeEach(() => {
    server = new MockServerModel({
      name: 'Test Server',
      port: 3001,
    });
  });

  describe('constructor', () => {
    it('should create a server with default values', () => {
      expect(server.id).toBeDefined();
      expect(server.name).toBe('Test Server');
      expect(server.port).toBe(3001);
      expect(server.enabled).toBe(false);
      expect(server.endpoints).toEqual([]);
      expect(server.requestLog).toEqual([]);
      expect(server.createdAt).toBeDefined();
      expect(server.updatedAt).toBeDefined();
    });

    it('should validate port range', () => {
      expect(() => new MockServerModel({ name: 'Test', port: 0 })).toThrow(
        'Port must be between 1 and 65535'
      );
      expect(() => new MockServerModel({ name: 'Test', port: 65536 })).toThrow(
        'Port must be between 1 and 65535'
      );
    });

    it('should reject reserved ports', () => {
      expect(() => new MockServerModel({ name: 'Test', port: 80 })).toThrow(
        'Port 80 is reserved'
      );
      expect(() => new MockServerModel({ name: 'Test', port: 443 })).toThrow(
        'Port 443 is reserved'
      );
      expect(() => new MockServerModel({ name: 'Test', port: 3000 })).toThrow(
        'Port 3000 is reserved'
      );
    });
  });

  describe('addEndpoint', () => {
    it('should add a new endpoint', () => {
      const endpointId = server.addEndpoint({
        path: '/users',
        method: 'GET',
        statusCode: 200,
        responseBody: '{"users": []}',
        responseHeaders: [],
      });

      expect(endpointId).toBeDefined();
      expect(server.endpoints).toHaveLength(1);
      expect(server.endpoints[0]?.path).toBe('/users');
      expect(server.endpoints[0]?.method).toBe('GET');
      expect(server.endpoints[0]?.enabled).toBe(true);
    });

    it('should add endpoint with custom headers', () => {
      const endpointId = server.addEndpoint({
        path: '/api/data',
        method: 'POST',
        statusCode: 201,
        responseBody: '{"success": true}',
        responseHeaders: [
          { name: 'Content-Type', value: 'application/json', enabled: true },
          { name: 'X-Custom', value: 'test', enabled: true },
        ],
      });

      const endpoint = server.endpoints.find((e) => e.id === endpointId);
      expect(endpoint?.responseHeaders).toHaveLength(2);
      expect(endpoint?.responseHeaders[0]?.name).toBe('Content-Type');
    });

    it('should add endpoint with delay and description', () => {
      const endpointId = server.addEndpoint({
        path: '/slow',
        method: 'GET',
        statusCode: 200,
        responseBody: 'OK',
        responseHeaders: [],
        delay: 1000,
        description: 'Slow endpoint for testing',
      });

      const endpoint = server.endpoints.find((e) => e.id === endpointId);
      expect(endpoint?.delay).toBe(1000);
      expect(endpoint?.description).toBe('Slow endpoint for testing');
    });
  });

  describe('updateEndpoint', () => {
    it('should update an existing endpoint', () => {
      const endpointId = server.addEndpoint({
        path: '/users',
        method: 'GET',
        statusCode: 200,
        responseBody: '[]',
        responseHeaders: [],
      });

      server.updateEndpoint(endpointId, {
        statusCode: 404,
        responseBody: '{"error": "Not found"}',
      });

      const endpoint = server.endpoints.find((e) => e.id === endpointId);
      expect(endpoint?.statusCode).toBe(404);
      expect(endpoint?.responseBody).toBe('{"error": "Not found"}');
      expect(endpoint?.path).toBe('/users'); // Unchanged
    });

    it('should throw error for non-existent endpoint', () => {
      expect(() => server.updateEndpoint('invalid-id', { statusCode: 500 })).toThrow(
        'Endpoint invalid-id not found'
      );
    });

    it('should not allow changing endpoint ID', () => {
      const endpointId = server.addEndpoint({
        path: '/test',
        method: 'GET',
        statusCode: 200,
        responseBody: 'OK',
        responseHeaders: [],
      });

      server.updateEndpoint(endpointId, { id: 'new-id' } as Partial<MockEndpoint>);

      const endpoint = server.endpoints.find((e) => e.id === endpointId);
      expect(endpoint?.id).toBe(endpointId);
    });
  });

  describe('deleteEndpoint', () => {
    it('should delete an endpoint', () => {
      const endpointId = server.addEndpoint({
        path: '/users',
        method: 'GET',
        statusCode: 200,
        responseBody: '[]',
        responseHeaders: [],
      });

      expect(server.endpoints).toHaveLength(1);
      server.deleteEndpoint(endpointId);
      expect(server.endpoints).toHaveLength(0);
    });

    it('should throw error for non-existent endpoint', () => {
      expect(() => server.deleteEndpoint('invalid-id')).toThrow('Endpoint invalid-id not found');
    });
  });

  describe('toggleEndpoint', () => {
    it('should toggle endpoint enabled state', () => {
      const endpointId = server.addEndpoint({
        path: '/test',
        method: 'GET',
        statusCode: 200,
        responseBody: 'OK',
        responseHeaders: [],
      });

      const endpoint = server.endpoints.find((e) => e.id === endpointId);
      expect(endpoint?.enabled).toBe(true);

      server.toggleEndpoint(endpointId);
      expect(endpoint?.enabled).toBe(false);

      server.toggleEndpoint(endpointId);
      expect(endpoint?.enabled).toBe(true);
    });

    it('should throw error for non-existent endpoint', () => {
      expect(() => server.toggleEndpoint('invalid-id')).toThrow('Endpoint invalid-id not found');
    });
  });

  describe('logRequest', () => {
    it('should add a request log entry', () => {
      server.logRequest({
        method: 'GET',
        path: '/users',
        headers: { 'user-agent': 'test' },
        responseStatus: 200,
        responseTime: 45,
      });

      expect(server.requestLog).toHaveLength(1);
      expect(server.requestLog[0]?.method).toBe('GET');
      expect(server.requestLog[0]?.path).toBe('/users');
      expect(server.requestLog[0]?.responseStatus).toBe(200);
      expect(server.requestLog[0]?.id).toBeDefined();
      expect(server.requestLog[0]?.timestamp).toBeDefined();
    });

    it('should add log entry with body', () => {
      server.logRequest({
        method: 'POST',
        path: '/users',
        headers: { 'content-type': 'application/json' },
        body: '{"name": "John"}',
        responseStatus: 201,
        responseTime: 67,
      });

      expect(server.requestLog[0]?.body).toBe('{"name": "John"}');
    });

    it('should limit log entries to 100', () => {
      // Add 150 log entries
      for (let i = 0; i < 150; i++) {
        server.logRequest({
          method: 'GET',
          path: `/test/${i}`,
          headers: {},
          responseStatus: 200,
          responseTime: 10,
        });
      }

      expect(server.requestLog).toHaveLength(100);
      // Most recent should be kept
      expect(server.requestLog[99]?.path).toBe('/test/149');
    });
  });

  describe('clearLogs', () => {
    it('should clear all request logs', () => {
      server.logRequest({
        method: 'GET',
        path: '/test',
        headers: {},
        responseStatus: 200,
        responseTime: 10,
      });

      expect(server.requestLog).toHaveLength(1);
      server.clearLogs();
      expect(server.requestLog).toHaveLength(0);
    });
  });

  describe('toJSON and fromJSON', () => {
    it('should serialize to JSON', () => {
      server.addEndpoint({
        path: '/users',
        method: 'GET',
        statusCode: 200,
        responseBody: '[]',
        responseHeaders: [],
      });

      const json = server.toJSON();
      expect(json.id).toBe(server.id);
      expect(json.name).toBe('Test Server');
      expect(json.endpoints).toHaveLength(1);
    });

    it('should deserialize from JSON', () => {
      server.addEndpoint({
        path: '/users',
        method: 'GET',
        statusCode: 200,
        responseBody: '[]',
        responseHeaders: [],
      });

      const json = server.toJSON();
      const restored = MockServerModel.fromJSON(json);

      expect(restored.id).toBe(server.id);
      expect(restored.name).toBe(server.name);
      expect(restored.port).toBe(server.port);
      expect(restored.endpoints).toHaveLength(1);
      expect(restored.endpoints[0]?.path).toBe('/users');
    });
  });
});
