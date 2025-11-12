/**
 * MockServer Model
 *
 * Domain model for mock API servers
 */

import { MockServer, MockEndpoint, MockRequestLog } from '../types/mockServer.types';

interface MockServerData {
  name: string;
  port: number;
  endpoints?: MockEndpoint[];
}

export class MockServerModel {
  public readonly id: string;
  public name: string;
  public port: number;
  public enabled: boolean;
  public endpoints: MockEndpoint[];
  public requestLog: MockRequestLog[];
  public readonly createdAt: string;
  public updatedAt: string;

  constructor(data: MockServerData) {
    this.id = this.generateId();
    this.name = data.name;
    this.port = data.port;
    this.enabled = false;
    this.endpoints = data.endpoints || [];
    this.requestLog = [];
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();

    this.validate();
  }

  private generateId(): string {
    return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Mock server name is required');
    }

    if (!this.port || this.port < 1 || this.port > 65535) {
      throw new Error('Mock server port must be between 1 and 65535');
    }

    // Check for common reserved ports
    const reservedPorts = [22, 25, 80, 443, 3306, 5432, 27017];
    if (reservedPorts.includes(this.port)) {
      console.warn(`Warning: Port ${this.port} is commonly reserved. Consider using a different port.`);
    }
  }

  public toJSON(): MockServer {
    return {
      id: this.id,
      name: this.name,
      port: this.port,
      enabled: this.enabled,
      endpoints: this.endpoints,
      requestLog: this.requestLog,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromJSON(json: MockServer): MockServerModel {
    const server = new MockServerModel({
      name: json.name,
      port: json.port,
      endpoints: json.endpoints,
    });

    // Restore original properties
    (server as { id: string }).id = json.id;
    (server as { createdAt: string }).createdAt = json.createdAt;
    server.updatedAt = json.updatedAt;
    server.enabled = json.enabled;
    server.requestLog = json.requestLog;

    return server;
  }

  public addEndpoint(endpoint: Omit<MockEndpoint, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `endpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const newEndpoint: MockEndpoint = {
      ...endpoint,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.endpoints.push(newEndpoint);
    this.updatedAt = now;

    return id;
  }

  public updateEndpoint(endpointId: string, updates: Partial<MockEndpoint>): void {
    const index = this.endpoints.findIndex((e) => e.id === endpointId);
    if (index === -1) {
      throw new Error(`Endpoint ${endpointId} not found`);
    }

    this.endpoints[index] = {
      ...this.endpoints[index]!,
      ...updates,
      id: endpointId, // Don't allow ID changes
      updatedAt: new Date().toISOString(),
    };

    this.updatedAt = new Date().toISOString();
  }

  public deleteEndpoint(endpointId: string): void {
    const index = this.endpoints.findIndex((e) => e.id === endpointId);
    if (index === -1) {
      throw new Error(`Endpoint ${endpointId} not found`);
    }

    this.endpoints.splice(index, 1);
    this.updatedAt = new Date().toISOString();
  }

  public toggleEndpoint(endpointId: string): void {
    const endpoint = this.endpoints.find((e) => e.id === endpointId);
    if (!endpoint) {
      throw new Error(`Endpoint ${endpointId} not found`);
    }

    endpoint.enabled = !endpoint.enabled;
    endpoint.updatedAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  public logRequest(log: Omit<MockRequestLog, 'id' | 'timestamp'>): void {
    const requestLog: MockRequestLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.requestLog.unshift(requestLog); // Add to beginning

    // Keep only last 1000 requests
    if (this.requestLog.length > 1000) {
      this.requestLog = this.requestLog.slice(0, 1000);
    }
  }

  public clearLogs(): void {
    this.requestLog = [];
    this.updatedAt = new Date().toISOString();
  }
}
