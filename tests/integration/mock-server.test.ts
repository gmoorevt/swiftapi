/**
 * Mock Server Integration Tests
 *
 * Tests the HTTP server functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MockServerService } from '../../src/main/mockServerService';
import { MockServer } from '../../src/types/mockServer.types';

describe('Mock Server HTTP Integration', () => {
  let mockServerService: MockServerService;
  let testServer: MockServer;

  beforeEach(() => {
    mockServerService = new MockServerService();
    testServer = {
      id: 'test-server-1',
      name: 'Test Server',
      port: 3555, // Use unusual port to avoid conflicts
      enabled: false,
      endpoints: [],
      requestLog: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  afterEach(async () => {
    await mockServerService.stopAllServers();
  });

  describe('Server Lifecycle', () => {
    it('should start a mock server', async () => {
      await mockServerService.startServer(testServer);
      expect(mockServerService.isRunning(testServer.id)).toBe(true);
    });

    it('should stop a running server', async () => {
      await mockServerService.startServer(testServer);
      expect(mockServerService.isRunning(testServer.id)).toBe(true);

      await mockServerService.stopServer(testServer.id);
      expect(mockServerService.isRunning(testServer.id)).toBe(false);
    });

    it('should throw error when starting already running server', async () => {
      await mockServerService.startServer(testServer);

      await expect(mockServerService.startServer(testServer)).rejects.toThrow(
        'Server test-server-1 is already running'
      );
    });

    it('should throw error when stopping non-running server', async () => {
      await expect(mockServerService.stopServer(testServer.id)).rejects.toThrow(
        'Server test-server-1 is not running'
      );
    });

    it('should throw error when port is in use', async () => {
      await mockServerService.startServer(testServer);

      const duplicateServer = { ...testServer, id: 'test-server-2' };
      await expect(mockServerService.startServer(duplicateServer)).rejects.toThrow(
        'Port 3555 is already in use'
      );
    });
  });

  describe('HTTP Endpoints', () => {
    beforeEach(() => {
      testServer.endpoints = [
        {
          id: 'endpoint-1',
          path: '/users',
          method: 'GET',
          statusCode: 200,
          responseBody: JSON.stringify({ users: ['Alice', 'Bob'] }),
          responseHeaders: [{ name: 'Content-Type', value: 'application/json', enabled: true }],
          enabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'endpoint-2',
          path: '/users/:id',
          method: 'GET',
          statusCode: 200,
          responseBody: JSON.stringify({ id: 1, name: 'Alice' }),
          responseHeaders: [],
          enabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'endpoint-3',
          path: '/users',
          method: 'POST',
          statusCode: 201,
          responseBody: JSON.stringify({ success: true }),
          responseHeaders: [],
          enabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    });

    it('should respond to GET request', async () => {
      await mockServerService.startServer(testServer);

      const response = await fetch(`http://localhost:${testServer.port}/users`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({ users: ['Alice', 'Bob'] });
    });

    it('should handle path parameters', async () => {
      await mockServerService.startServer(testServer);

      const response = await fetch(`http://localhost:${testServer.port}/users/123`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({ id: 1, name: 'Alice' });
    });

    it('should match correct HTTP method', async () => {
      await mockServerService.startServer(testServer);

      const response = await fetch(`http://localhost:${testServer.port}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Charlie' }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual({ success: true });
    });

    it('should return 404 for non-existent endpoint', async () => {
      await mockServerService.startServer(testServer);

      const response = await fetch(`http://localhost:${testServer.port}/not-found`);
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('Not Found');
    });

    it('should set custom response headers', async () => {
      await mockServerService.startServer(testServer);

      const response = await fetch(`http://localhost:${testServer.port}/users`);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should set CORS headers', async () => {
      await mockServerService.startServer(testServer);

      const response = await fetch(`http://localhost:${testServer.port}/users`);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });

    it('should handle OPTIONS preflight request', async () => {
      await mockServerService.startServer(testServer);

      const response = await fetch(`http://localhost:${testServer.port}/users`, {
        method: 'OPTIONS',
      });

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    });

    it('should ignore disabled endpoints', async () => {
      testServer.endpoints[0]!.enabled = false;
      await mockServerService.startServer(testServer);

      const response = await fetch(`http://localhost:${testServer.port}/users`);
      // Should not match disabled GET endpoint, but should match POST
      expect(response.status).toBe(404);
    });
  });

  describe('Response Delays', () => {
    it('should apply configured delay', async () => {
      testServer.endpoints = [
        {
          id: 'delayed-endpoint',
          path: '/slow',
          method: 'GET',
          statusCode: 200,
          responseBody: 'OK',
          responseHeaders: [],
          delay: 100, // 100ms delay
          enabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      await mockServerService.startServer(testServer);

      const startTime = Date.now();
      const response = await fetch(`http://localhost:${testServer.port}/slow`);
      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Query Parameters', () => {
    it('should handle query parameters', async () => {
      testServer.endpoints = [
        {
          id: 'query-endpoint',
          path: '/search',
          method: 'GET',
          statusCode: 200,
          responseBody: JSON.stringify({ results: [] }),
          responseHeaders: [],
          enabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      await mockServerService.startServer(testServer);

      const response = await fetch(`http://localhost:${testServer.port}/search?q=test&limit=10`);
      expect(response.status).toBe(200);
    });
  });

  describe('Multiple Servers', () => {
    it('should run multiple servers on different ports', async () => {
      const server2: MockServer = {
        ...testServer,
        id: 'test-server-2',
        port: 3556,
        endpoints: [
          {
            id: 'endpoint-1',
            path: '/api',
            method: 'GET',
            statusCode: 200,
            responseBody: 'Server 2',
            responseHeaders: [],
            enabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      };

      testServer.endpoints = [
        {
          id: 'endpoint-1',
          path: '/api',
          method: 'GET',
          statusCode: 200,
          responseBody: 'Server 1',
          responseHeaders: [],
          enabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      await mockServerService.startServer(testServer);
      await mockServerService.startServer(server2);

      const response1 = await fetch(`http://localhost:${testServer.port}/api`);
      const data1 = await response1.text();
      expect(data1).toBe('Server 1');

      const response2 = await fetch(`http://localhost:${server2.port}/api`);
      const data2 = await response2.text();
      expect(data2).toBe('Server 2');
    });

    it('should stop all servers', async () => {
      const server2: MockServer = { ...testServer, id: 'test-server-2', port: 3556 };

      await mockServerService.startServer(testServer);
      await mockServerService.startServer(server2);

      expect(mockServerService.isRunning(testServer.id)).toBe(true);
      expect(mockServerService.isRunning(server2.id)).toBe(true);

      await mockServerService.stopAllServers();

      expect(mockServerService.isRunning(testServer.id)).toBe(false);
      expect(mockServerService.isRunning(server2.id)).toBe(false);
    });
  });
});
