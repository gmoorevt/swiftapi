/**
 * HistoryEntry Model
 *
 * Represents a saved request in the history
 * Complete snapshot for request restoration
 */

import { HttpMethod, BodyType, type Header, type QueryParam } from '../types/request.types';

export interface HistoryEntryData {
  id: string;
  timestamp: string;
  method: HttpMethod;
  url: string;
  statusCode?: number;
  responseTime?: number;
  headers?: Header[];
  queryParams?: QueryParam[];
  body?: string;
  bodyType?: BodyType;
}

export class HistoryEntry {
  id: string;
  timestamp: string;
  method: HttpMethod;
  url: string;
  statusCode: number | undefined;
  responseTime: number | undefined;
  headers: Header[];
  queryParams: QueryParam[];
  body: string;
  bodyType: BodyType;

  constructor(data: HistoryEntryData) {
    this.id = data.id;
    this.timestamp = data.timestamp;
    this.method = data.method;
    this.url = data.url;
    this.statusCode = data.statusCode;
    this.responseTime = data.responseTime;
    this.headers = data.headers || [];
    this.queryParams = data.queryParams || [];
    this.body = data.body || '';
    this.bodyType = data.bodyType || BodyType.RAW;
  }

  /**
   * Convert to JSON for storage
   */
  toJSON(): HistoryEntryData {
    const result: HistoryEntryData = {
      id: this.id,
      timestamp: this.timestamp,
      method: this.method,
      url: this.url,
      headers: this.headers,
      queryParams: this.queryParams,
      body: this.body,
      bodyType: this.bodyType,
    };

    // Only include optional fields if they're defined
    if (this.statusCode !== undefined) {
      result.statusCode = this.statusCode;
    }
    if (this.responseTime !== undefined) {
      result.responseTime = this.responseTime;
    }

    return result;
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: HistoryEntryData): HistoryEntry {
    return new HistoryEntry(json);
  }

  /**
   * Generate a unique ID
   */
  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
