/**
 * Mock Server Service (Main Process)
 *
 * HTTP server implementation for mock API endpoints
 * Runs in the Electron main process
 */

import * as http from 'http';
import { BrowserWindow } from 'electron';
import { MockServer, MockEndpoint, MockRequestLog } from '../types/mockServer.types';

interface RunningServer {
  server: http.Server;
  config: MockServer;
}

export class MockServerService {
  private runningServers: Map<string, RunningServer> = new Map();
  private mainWindow: BrowserWindow | null = null;

  /**
   * Set the main window for sending log events
   */
  public setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  /**
   * Start a mock server
   */
  public async startServer(config: MockServer): Promise<void> {
    if (this.runningServers.has(config.id)) {
      throw new Error(`Server ${config.id} is already running`);
    }

    return new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => {
        this.handleRequest(config, req, res);
      });

      server.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          reject(new Error(`Port ${config.port} is already in use`));
        } else {
          reject(error);
        }
      });

      server.listen(config.port, () => {
        console.log(`Mock server "${config.name}" started on port ${config.port}`);
        this.runningServers.set(config.id, { server, config });
        resolve();
      });
    });
  }

  /**
   * Stop a mock server
   */
  public async stopServer(serverId: string): Promise<void> {
    const runningServer = this.runningServers.get(serverId);
    if (!runningServer) {
      throw new Error(`Server ${serverId} is not running`);
    }

    return new Promise((resolve, reject) => {
      runningServer.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`Mock server "${runningServer.config.name}" stopped`);
          this.runningServers.delete(serverId);
          resolve();
        }
      });
    });
  }

  /**
   * Stop all running servers
   */
  public async stopAllServers(): Promise<void> {
    const stopPromises = Array.from(this.runningServers.keys()).map((serverId) =>
      this.stopServer(serverId).catch((err) => {
        console.error(`Error stopping server ${serverId}:`, err);
      })
    );

    await Promise.all(stopPromises);
  }

  /**
   * Check if a server is running
   */
  public isRunning(serverId: string): boolean {
    return this.runningServers.has(serverId);
  }

  /**
   * Handle incoming HTTP request
   */
  private handleRequest(
    config: MockServer,
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): void {
    const startTime = Date.now();
    const method = req.method || 'GET';
    const path = req.url || '/';

    // Parse request body
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      // Find matching endpoint
      const endpoint = this.findMatchingEndpoint(config.endpoints, method, path);

      const logData = {
        method,
        path,
        headers: req.headers as Record<string, string>,
        ...(body.length > 0 ? { body } : {}),
        responseTime: Date.now() - startTime,
      };

      if (endpoint) {
        this.respondWithEndpoint(endpoint, req, res, logData, config.id);
      } else {
        this.respondNotFound(res, logData, config.id);
      }
    });
  }

  /**
   * Emit request log to renderer
   */
  private emitRequestLog(
    serverId: string,
    log: Omit<MockRequestLog, 'id' | 'timestamp'>
  ): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('mock-server:request-log', serverId, log);
    }
  }

  /**
   * Find matching endpoint for request
   */
  private findMatchingEndpoint(
    endpoints: MockEndpoint[],
    method: string,
    path: string
  ): MockEndpoint | null {
    // Find exact match first
    const exactMatch = endpoints.find(
      (e) => e.enabled && e.method === method && this.pathMatches(e.path, path)
    );

    if (exactMatch) {
      return exactMatch;
    }

    return null;
  }

  /**
   * Check if request path matches endpoint path
   * Supports basic path parameters like /users/:id
   */
  private pathMatches(endpointPath: string, requestPath: string): boolean {
    // Remove query string from request path
    const cleanRequestPath = requestPath.split('?')[0] || '/';

    // Exact match
    if (endpointPath === cleanRequestPath) {
      return true;
    }

    // Path parameter matching
    const endpointParts = endpointPath.split('/');
    const requestParts = cleanRequestPath.split('/');

    if (endpointParts.length !== requestParts.length) {
      return false;
    }

    return endpointParts.every((part, index) => {
      if (part.startsWith(':')) {
        return true; // Path parameter matches anything
      }
      return part === requestParts[index];
    });
  }

  /**
   * Respond with endpoint configuration
   */
  private respondWithEndpoint(
    endpoint: MockEndpoint,
    req: http.IncomingMessage,
    res: http.ServerResponse,
    logData: {
      method: string;
      path: string;
      headers: Record<string, string>;
      body?: string;
      responseTime: number;
    },
    serverId: string
  ): void {
    // Apply delay if configured
    const delay = endpoint.delay || 0;

    setTimeout(() => {
      // Set response headers
      res.statusCode = endpoint.statusCode;

      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');

      // Set custom headers
      endpoint.responseHeaders.forEach((header) => {
        if (header.enabled && header.name && header.value) {
          res.setHeader(header.name, header.value);
        }
      });

      // Handle OPTIONS preflight
      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }

      // Send response
      res.end(endpoint.responseBody);

      // Emit log to renderer
      this.emitRequestLog(serverId, {
        ...logData,
        responseStatus: endpoint.statusCode,
      });

      console.log(
        `[Mock Server] ${logData.method} ${logData.path} -> ${endpoint.statusCode} (${Date.now() - (Date.now() - logData.responseTime)}ms)`
      );
    }, delay);
  }

  /**
   * Respond with 404 Not Found
   */
  private respondNotFound(
    res: http.ServerResponse,
    logData: {
      method: string;
      path: string;
      headers: Record<string, string>;
      body?: string;
      responseTime: number;
    },
    serverId: string
  ): void {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const response = {
      error: 'Not Found',
      message: `No mock endpoint configured for ${logData.method} ${logData.path}`,
    };

    res.end(JSON.stringify(response, null, 2));

    // Emit log to renderer
    this.emitRequestLog(serverId, {
      ...logData,
      responseStatus: 404,
    });

    console.log(
      `[Mock Server] ${logData.method} ${logData.path} -> 404 (${Date.now() - (Date.now() - logData.responseTime)}ms)`
    );
  }
}

// Singleton instance
export const mockServerService = new MockServerService();
