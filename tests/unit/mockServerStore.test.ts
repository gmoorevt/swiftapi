/**
 * Mock Server Store Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMockServerStore } from '../../src/renderer/store/mockServerStore';
import { mockServerStorageService } from '../../src/renderer/services/mockServerStorageService';

// Mock the storage service
vi.mock('../../src/renderer/services/mockServerStorageService', () => ({
  mockServerStorageService: {
    loadServers: vi.fn(() => ({})),
    saveServers: vi.fn(),
    clearServers: vi.fn(),
  },
}));

describe('Mock Server Store', () => {
  beforeEach(() => {
    // Reset store state
    const { actions } = useMockServerStore.getState();
    const servers = Object.keys(useMockServerStore.getState().servers);
    servers.forEach((id) => actions.deleteServer(id));
    actions.setActiveServer(null);
    vi.clearAllMocks();
  });

  describe('createServer', () => {
    it('should create a new server', () => {
      const { actions, servers } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);

      expect(serverId).toBeDefined();
      expect(servers[serverId]).toBeDefined();
      expect(servers[serverId]?.name).toBe('Test Server');
      expect(servers[serverId]?.port).toBe(3001);
      expect(servers[serverId]?.enabled).toBe(false);
    });

    it('should save server to storage', () => {
      const { actions } = useMockServerStore.getState();
      actions.createServer('Test Server', 3001);

      expect(mockServerStorageService.saveServers).toHaveBeenCalled();
    });
  });

  describe('deleteServer', () => {
    it('should delete a server', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);

      expect(useMockServerStore.getState().servers[serverId]).toBeDefined();
      actions.deleteServer(serverId);
      expect(useMockServerStore.getState().servers[serverId]).toBeUndefined();
    });

    it('should clear active server if deleted', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);
      actions.setActiveServer(serverId);

      expect(useMockServerStore.getState().activeServerId).toBe(serverId);
      actions.deleteServer(serverId);
      expect(useMockServerStore.getState().activeServerId).toBeNull();
    });

    it('should save after deletion', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);
      vi.clearAllMocks();

      actions.deleteServer(serverId);
      expect(mockServerStorageService.saveServers).toHaveBeenCalled();
    });
  });

  describe('updateServer', () => {
    it('should update server properties', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);

      actions.updateServer(serverId, { name: 'Updated Server' });

      const server = useMockServerStore.getState().servers[serverId];
      expect(server?.name).toBe('Updated Server');
      expect(server?.port).toBe(3001); // Unchanged
    });

    it('should not allow ID changes', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);

      actions.updateServer(serverId, { id: 'new-id' } as any);

      const server = useMockServerStore.getState().servers[serverId];
      expect(server?.id).toBe(serverId);
    });

    it('should update timestamp', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);
      const originalTimestamp = useMockServerStore.getState().servers[serverId]?.updatedAt;

      // Wait a bit to ensure timestamp changes
      setTimeout(() => {
        actions.updateServer(serverId, { name: 'Updated' });
        const newTimestamp = useMockServerStore.getState().servers[serverId]?.updatedAt;
        expect(newTimestamp).not.toBe(originalTimestamp);
      }, 10);
    });

    it('should save after update', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);
      vi.clearAllMocks();

      actions.updateServer(serverId, { name: 'Updated' });
      expect(mockServerStorageService.saveServers).toHaveBeenCalled();
    });
  });

  describe('setActiveServer', () => {
    it('should set active server', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);

      actions.setActiveServer(serverId);
      expect(useMockServerStore.getState().activeServerId).toBe(serverId);
    });

    it('should clear active server', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);
      actions.setActiveServer(serverId);

      actions.setActiveServer(null);
      expect(useMockServerStore.getState().activeServerId).toBeNull();
    });
  });

  describe('addEndpoint', () => {
    it('should add endpoint to server', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);

      const endpointId = actions.addEndpoint(serverId, {
        path: '/users',
        method: 'GET',
        statusCode: 200,
        responseBody: '[]',
        responseHeaders: [],
      });

      const server = useMockServerStore.getState().servers[serverId];
      expect(server?.endpoints).toHaveLength(1);
      expect(server?.endpoints[0]?.id).toBe(endpointId);
      expect(server?.endpoints[0]?.path).toBe('/users');
    });

    it('should throw error for non-existent server', () => {
      const { actions } = useMockServerStore.getState();

      expect(() =>
        actions.addEndpoint('invalid-id', {
          path: '/test',
          method: 'GET',
          statusCode: 200,
          responseBody: 'OK',
          responseHeaders: [],
        })
      ).toThrow('Server invalid-id not found');
    });

    it('should save after adding endpoint', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);
      vi.clearAllMocks();

      actions.addEndpoint(serverId, {
        path: '/test',
        method: 'GET',
        statusCode: 200,
        responseBody: 'OK',
        responseHeaders: [],
      });

      expect(mockServerStorageService.saveServers).toHaveBeenCalled();
    });
  });

  describe('updateEndpoint', () => {
    it('should update endpoint', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);
      const endpointId = actions.addEndpoint(serverId, {
        path: '/users',
        method: 'GET',
        statusCode: 200,
        responseBody: '[]',
        responseHeaders: [],
      });

      actions.updateEndpoint(serverId, endpointId, { statusCode: 404 });

      const server = useMockServerStore.getState().servers[serverId];
      const endpoint = server?.endpoints.find((e) => e.id === endpointId);
      expect(endpoint?.statusCode).toBe(404);
    });

    it('should save after updating endpoint', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);
      const endpointId = actions.addEndpoint(serverId, {
        path: '/test',
        method: 'GET',
        statusCode: 200,
        responseBody: 'OK',
        responseHeaders: [],
      });
      vi.clearAllMocks();

      actions.updateEndpoint(serverId, endpointId, { statusCode: 500 });
      expect(mockServerStorageService.saveServers).toHaveBeenCalled();
    });
  });

  describe('deleteEndpoint', () => {
    it('should delete endpoint', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);
      const endpointId = actions.addEndpoint(serverId, {
        path: '/users',
        method: 'GET',
        statusCode: 200,
        responseBody: '[]',
        responseHeaders: [],
      });

      expect(useMockServerStore.getState().servers[serverId]?.endpoints).toHaveLength(1);
      actions.deleteEndpoint(serverId, endpointId);
      expect(useMockServerStore.getState().servers[serverId]?.endpoints).toHaveLength(0);
    });

    it('should save after deleting endpoint', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);
      const endpointId = actions.addEndpoint(serverId, {
        path: '/test',
        method: 'GET',
        statusCode: 200,
        responseBody: 'OK',
        responseHeaders: [],
      });
      vi.clearAllMocks();

      actions.deleteEndpoint(serverId, endpointId);
      expect(mockServerStorageService.saveServers).toHaveBeenCalled();
    });
  });

  describe('toggleEndpoint', () => {
    it('should toggle endpoint enabled state', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);
      const endpointId = actions.addEndpoint(serverId, {
        path: '/test',
        method: 'GET',
        statusCode: 200,
        responseBody: 'OK',
        responseHeaders: [],
      });

      const getEndpoint = () =>
        useMockServerStore.getState().servers[serverId]?.endpoints.find((e) => e.id === endpointId);

      expect(getEndpoint()?.enabled).toBe(true);
      actions.toggleEndpoint(serverId, endpointId);
      expect(getEndpoint()?.enabled).toBe(false);
      actions.toggleEndpoint(serverId, endpointId);
      expect(getEndpoint()?.enabled).toBe(true);
    });

    it('should save after toggling endpoint', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);
      const endpointId = actions.addEndpoint(serverId, {
        path: '/test',
        method: 'GET',
        statusCode: 200,
        responseBody: 'OK',
        responseHeaders: [],
      });
      vi.clearAllMocks();

      actions.toggleEndpoint(serverId, endpointId);
      expect(mockServerStorageService.saveServers).toHaveBeenCalled();
    });
  });

  describe('logRequest', () => {
    it('should add request log', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);

      actions.logRequest(serverId, {
        method: 'GET',
        path: '/test',
        headers: {},
        responseStatus: 200,
        responseTime: 45,
      });

      const server = useMockServerStore.getState().servers[serverId];
      expect(server?.requestLog).toHaveLength(1);
      expect(server?.requestLog[0]?.method).toBe('GET');
    });
  });

  describe('clearLogs', () => {
    it('should clear request logs', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);

      actions.logRequest(serverId, {
        method: 'GET',
        path: '/test',
        headers: {},
        responseStatus: 200,
        responseTime: 10,
      });

      expect(useMockServerStore.getState().servers[serverId]?.requestLog).toHaveLength(1);
      actions.clearLogs(serverId);
      expect(useMockServerStore.getState().servers[serverId]?.requestLog).toHaveLength(0);
    });

    it('should save after clearing logs', () => {
      const { actions } = useMockServerStore.getState();
      const serverId = actions.createServer('Test Server', 3001);
      actions.logRequest(serverId, {
        method: 'GET',
        path: '/test',
        headers: {},
        responseStatus: 200,
        responseTime: 10,
      });
      vi.clearAllMocks();

      actions.clearLogs(serverId);
      expect(mockServerStorageService.saveServers).toHaveBeenCalled();
    });
  });
});
