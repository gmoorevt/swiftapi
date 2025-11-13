/**
 * Mock Server IPC Handlers
 *
 * IPC communication for mock server operations
 */

import { ipcMain } from 'electron';
import { mockServerService } from '../mockServerService';
import { MockServer } from '../../types/mockServer.types';

export function registerMockServerIpc(): void {
  // Start mock server
  ipcMain.handle('mock-server:start', async (_, server: MockServer) => {
    try {
      await mockServerService.startServer(server);
      return { success: true };
    } catch (error) {
      console.error('Failed to start mock server:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Stop mock server
  ipcMain.handle('mock-server:stop', async (_, serverId: string) => {
    try {
      await mockServerService.stopServer(serverId);
      return { success: true };
    } catch (error) {
      console.error('Failed to stop mock server:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Check if server is running
  ipcMain.handle('mock-server:is-running', (_, serverId: string) => {
    return mockServerService.isRunning(serverId);
  });

  // Stop all servers (called on app quit)
  ipcMain.handle('mock-server:stop-all', async () => {
    try {
      await mockServerService.stopAllServers();
      return { success: true };
    } catch (error) {
      console.error('Failed to stop all mock servers:', error);
      return { success: false, error: (error as Error).message };
    }
  });
}
