/**
 * Mock Server Store
 *
 * State management for mock API servers
 */

import { create } from 'zustand';
import {
  MockServerState,
  MockServer,
  MockEndpoint,
  MockRequestLog,
} from '../../types/mockServer.types';
import { MockServerModel } from '../../models/MockServer';
import { mockServerStorageService } from '../services/mockServerStorageService';

// Load servers from storage on init
const initialServers = mockServerStorageService.loadServers();

// Helper to save after mutations
const saveAndSet = (updater: (state: MockServerState) => Partial<MockServerState>) => {
  return (state: MockServerState): Partial<MockServerState> => {
    const updates = updater(state);
    const newServers = updates.servers || state.servers;
    mockServerStorageService.saveServers(newServers);
    return updates;
  };
};

export const useMockServerStore = create<MockServerState>((set, get) => ({
  servers: initialServers,
  activeServerId: null,

  actions: {
    createServer: (name: string, port: number): string => {
      const server = new MockServerModel({ name, port });
      const serverData = server.toJSON();

      const newServers = {
        ...get().servers,
        [server.id]: serverData,
      };

      mockServerStorageService.saveServers(newServers);

      set({
        servers: newServers,
      });

      return server.id;
    },

    deleteServer: (serverId: string): void => {
      set(
        saveAndSet((state) => {
          const { [serverId]: _deleted, ...remaining } = state.servers;
          return {
            servers: remaining,
            activeServerId: state.activeServerId === serverId ? null : state.activeServerId,
          };
        })
      );
    },

    updateServer: (serverId: string, updates: Partial<MockServer>): void => {
      set(
        saveAndSet((state) => {
          const server = state.servers[serverId];
          if (!server) {
            return state;
          }

          return {
            servers: {
              ...state.servers,
              [serverId]: {
                ...server,
                ...updates,
                id: serverId, // Don't allow ID changes
                updatedAt: new Date().toISOString(),
              },
            },
          };
        })
      );
    },

    setActiveServer: (serverId: string | null): void => {
      set({ activeServerId: serverId });
    },

    addEndpoint: (
      serverId: string,
      endpoint: Omit<MockEndpoint, 'id' | 'createdAt' | 'updatedAt'>
    ): string => {
      const server = get().servers[serverId];
      if (!server) {
        throw new Error(`Server ${serverId} not found`);
      }

      const serverModel = MockServerModel.fromJSON(server);
      const endpointId = serverModel.addEndpoint(endpoint);

      set(
        saveAndSet((state) => ({
          servers: {
            ...state.servers,
            [serverId]: serverModel.toJSON(),
          },
        }))
      );

      return endpointId;
    },

    updateEndpoint: (
      serverId: string,
      endpointId: string,
      updates: Partial<MockEndpoint>
    ): void => {
      const server = get().servers[serverId];
      if (!server) {
        throw new Error(`Server ${serverId} not found`);
      }

      const serverModel = MockServerModel.fromJSON(server);
      serverModel.updateEndpoint(endpointId, updates);

      set(
        saveAndSet((state) => ({
          servers: {
            ...state.servers,
            [serverId]: serverModel.toJSON(),
          },
        }))
      );
    },

    deleteEndpoint: (serverId: string, endpointId: string): void => {
      const server = get().servers[serverId];
      if (!server) {
        throw new Error(`Server ${serverId} not found`);
      }

      const serverModel = MockServerModel.fromJSON(server);
      serverModel.deleteEndpoint(endpointId);

      set(
        saveAndSet((state) => ({
          servers: {
            ...state.servers,
            [serverId]: serverModel.toJSON(),
          },
        }))
      );
    },

    toggleEndpoint: (serverId: string, endpointId: string): void => {
      const server = get().servers[serverId];
      if (!server) {
        throw new Error(`Server ${serverId} not found`);
      }

      const serverModel = MockServerModel.fromJSON(server);
      serverModel.toggleEndpoint(endpointId);

      set(
        saveAndSet((state) => ({
          servers: {
            ...state.servers,
            [serverId]: serverModel.toJSON(),
          },
        }))
      );
    },

    logRequest: (serverId: string, log: Omit<MockRequestLog, 'id' | 'timestamp'>): void => {
      const server = get().servers[serverId];
      if (!server) {
        throw new Error(`Server ${serverId} not found`);
      }

      const serverModel = MockServerModel.fromJSON(server);
      serverModel.logRequest(log);

      set((state) => ({
        servers: {
          ...state.servers,
          [serverId]: serverModel.toJSON(),
        },
      }));
    },

    clearLogs: (serverId: string): void => {
      const server = get().servers[serverId];
      if (!server) {
        throw new Error(`Server ${serverId} not found`);
      }

      const serverModel = MockServerModel.fromJSON(server);
      serverModel.clearLogs();

      set(
        saveAndSet((state) => ({
          servers: {
            ...state.servers,
            [serverId]: serverModel.toJSON(),
          },
        }))
      );
    },

    startServer: async (serverId: string): Promise<void> => {
      const server = get().servers[serverId];
      if (!server) {
        throw new Error(`Server ${serverId} not found`);
      }

      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.mockServer.start(server);
        if (result.success) {
          set((state) => ({
            servers: {
              ...state.servers,
              [serverId]: {
                ...server,
                enabled: true,
                updatedAt: new Date().toISOString(),
              },
            },
          }));
        } else {
          throw new Error(result.error || 'Failed to start server');
        }
      } else {
        console.warn('Electron API not available - mock server will not start');
      }
    },

    stopServer: async (serverId: string): Promise<void> => {
      const server = get().servers[serverId];
      if (!server) {
        throw new Error(`Server ${serverId} not found`);
      }

      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.mockServer.stop(serverId);
        if (result.success) {
          set((state) => ({
            servers: {
              ...state.servers,
              [serverId]: {
                ...server,
                enabled: false,
                updatedAt: new Date().toISOString(),
              },
            },
          }));
        } else {
          throw new Error(result.error || 'Failed to stop server');
        }
      } else {
        console.warn('Electron API not available - mock server cannot be stopped');
      }
    },
  },
}));
