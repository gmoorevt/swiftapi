/**
 * HistoryEntry Model
 *
 * Represents a saved request in the history
 * Lightweight snapshot for quick restoration
 */

import { HttpMethod } from '../types/request.types';

export interface HistoryEntryData {
  id: string;
  timestamp: string;
  method: HttpMethod;
  url: string;
  statusCode?: number;
  responseTime?: number;
}

export class HistoryEntry {
  id: string;
  timestamp: string;
  method: HttpMethod;
  url: string;
  statusCode?: number;
  responseTime?: number;

  constructor(data: HistoryEntryData) {
    this.id = data.id;
    this.timestamp = data.timestamp;
    this.method = data.method;
    this.url = data.url;
    this.statusCode = data.statusCode;
    this.responseTime = data.responseTime;
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
