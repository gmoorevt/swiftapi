/**
 * Mock Server Types
 *
 * Type definitions for mock server functionality
 */

import { Header } from './request.types';

export interface MockEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  statusCode: number;
  responseBody: string;
  responseHeaders: Header[];
  delay?: number; // Delay in milliseconds before responding
  enabled: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockServer {
  id: string;
  name: string;
  port: number;
  enabled: boolean;
  endpoints: MockEndpoint[];
  requestLog: MockRequestLog[];
  createdAt: string;
  updatedAt: string;
}

export interface MockRequestLog {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: string;
  matchedEndpoint?: string; // ID of matched endpoint
  responseStatus: number;
  responseTime: number;
}

export interface MockServerState {
  servers: Record<string, MockServer>;
  activeServerId: string | null;
  actions: {
    createServer: (name: string, port: number) => string;
    deleteServer: (serverId: string) => void;
    updateServer: (serverId: string, updates: Partial<MockServer>) => void;
    setActiveServer: (serverId: string | null) => void;

    addEndpoint: (serverId: string, endpoint: Omit<MockEndpoint, 'id' | 'createdAt' | 'updatedAt'>) => string;
    updateEndpoint: (serverId: string, endpointId: string, updates: Partial<MockEndpoint>) => void;
    deleteEndpoint: (serverId: string, endpointId: string) => void;
    toggleEndpoint: (serverId: string, endpointId: string) => void;

    logRequest: (serverId: string, log: Omit<MockRequestLog, 'id' | 'timestamp'>) => void;
    clearLogs: (serverId: string) => void;

    startServer: (serverId: string) => Promise<void>;
    stopServer: (serverId: string) => Promise<void>;
  };
}
