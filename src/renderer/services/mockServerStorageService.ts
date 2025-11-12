/**
 * Mock Server Storage Service
 *
 * Persists mock server configurations to local storage
 */

import { MockServer } from '../../types/mockServer.types';

const STORAGE_KEY = 'swiftapi_mock_servers';

export class MockServerStorageService {
  /**
   * Load all mock servers from storage
   */
  public loadServers(): Record<string, MockServer> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return {};
      }

      const servers = JSON.parse(stored) as Record<string, MockServer>;

      // Ensure all servers are marked as disabled on load
      // (they're not actually running until user starts them)
      Object.values(servers).forEach((server) => {
        server.enabled = false;
        server.requestLog = []; // Clear logs on load
      });

      return servers;
    } catch (error) {
      console.error('Failed to load mock servers:', error);
      return {};
    }
  }

  /**
   * Save all mock servers to storage
   */
  public saveServers(servers: Record<string, MockServer>): void {
    try {
      // Don't persist request logs (they can get large)
      const serversToSave = Object.entries(servers).reduce(
        (acc, [id, server]) => {
          acc[id] = {
            ...server,
            requestLog: [], // Don't save logs
          };
          return acc;
        },
        {} as Record<string, MockServer>
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(serversToSave));
    } catch (error) {
      console.error('Failed to save mock servers:', error);
    }
  }

  /**
   * Clear all stored mock servers
   */
  public clearServers(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear mock servers:', error);
    }
  }
}

// Singleton instance
export const mockServerStorageService = new MockServerStorageService();
