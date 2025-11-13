/**
 * Preload Script
 *
 * Runs in isolated context before the renderer process loads.
 * Can expose safe APIs to the renderer via contextBridge.
 */

import { contextBridge, ipcRenderer } from 'electron';
import { MockServer, MockRequestLog } from '../types/mockServer.types';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  mockServer: {
    start: (server: MockServer) => ipcRenderer.invoke('mock-server:start', server),
    stop: (serverId: string) => ipcRenderer.invoke('mock-server:stop', serverId),
    isRunning: (serverId: string) => ipcRenderer.invoke('mock-server:is-running', serverId),
    stopAll: () => ipcRenderer.invoke('mock-server:stop-all'),
    onRequestLog: (
      callback: (serverId: string, log: Omit<MockRequestLog, 'id' | 'timestamp'>) => void
    ): (() => void) => {
      const listener = (_: unknown, serverId: string, log: Omit<MockRequestLog, 'id' | 'timestamp'>) => {
        callback(serverId, log);
      };
      ipcRenderer.on('mock-server:request-log', listener);
      return () => {
        ipcRenderer.removeListener('mock-server:request-log', listener);
      };
    },
  },
});

export {};
