/**
 * Electron API Type Definitions
 *
 * Type definitions for window.electronAPI exposed via contextBridge
 */

import { MockServer, MockRequestLog } from './mockServer.types';

export interface ElectronAPI {
  mockServer: {
    start: (server: MockServer) => Promise<{ success: boolean; error?: string }>;
    stop: (serverId: string) => Promise<{ success: boolean; error?: string }>;
    isRunning: (serverId: string) => Promise<boolean>;
    stopAll: () => Promise<{ success: boolean; error?: string }>;
    onRequestLog: (
      callback: (serverId: string, log: Omit<MockRequestLog, 'id' | 'timestamp'>) => void
    ) => () => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
