/**
 * HistoryEntry Model Tests
 */

import { describe, it, expect } from 'vitest';
import { HistoryEntry } from './HistoryEntry';
import { HttpMethod } from '../types/request.types';

describe('HistoryEntry', () => {
  describe('constructor', () => {
    it('should create history entry with all properties', () => {
      const data = {
        id: '123',
        timestamp: '2025-11-10T10:00:00Z',
        method: HttpMethod.GET,
        url: 'https://api.example.com/users',
        statusCode: 200,
        responseTime: 150,
      };

      const entry = new HistoryEntry(data);

      expect(entry.id).toBe('123');
      expect(entry.timestamp).toBe('2025-11-10T10:00:00Z');
      expect(entry.method).toBe(HttpMethod.GET);
      expect(entry.url).toBe('https://api.example.com/users');
      expect(entry.statusCode).toBe(200);
      expect(entry.responseTime).toBe(150);
    });

    it('should create history entry without optional properties', () => {
      const data = {
        id: '456',
        timestamp: '2025-11-10T10:00:00Z',
        method: HttpMethod.POST,
        url: 'https://api.example.com/posts',
      };

      const entry = new HistoryEntry(data);

      expect(entry.id).toBe('456');
      expect(entry.statusCode).toBeUndefined();
      expect(entry.responseTime).toBeUndefined();
    });
  });

  describe('toJSON', () => {
    it('should convert to JSON with all properties', () => {
      const entry = new HistoryEntry({
        id: '123',
        timestamp: '2025-11-10T10:00:00Z',
        method: HttpMethod.PUT,
        url: 'https://api.example.com/users/1',
        statusCode: 204,
        responseTime: 50,
      });

      const json = entry.toJSON();

      expect(json).toEqual({
        id: '123',
        timestamp: '2025-11-10T10:00:00Z',
        method: HttpMethod.PUT,
        url: 'https://api.example.com/users/1',
        statusCode: 204,
        responseTime: 50,
      });
    });
  });

  describe('fromJSON', () => {
    it('should create history entry from JSON', () => {
      const json = {
        id: '789',
        timestamp: '2025-11-10T11:00:00Z',
        method: HttpMethod.DELETE,
        url: 'https://api.example.com/posts/1',
        statusCode: 200,
        responseTime: 75,
      };

      const entry = HistoryEntry.fromJSON(json);

      expect(entry).toBeInstanceOf(HistoryEntry);
      expect(entry.id).toBe('789');
      expect(entry.method).toBe(HttpMethod.DELETE);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = HistoryEntry.generateId();
      const id2 = HistoryEntry.generateId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^\d+-[a-z0-9]+$/);
    });

    it('should generate IDs with timestamp prefix', () => {
      const before = Date.now();
      const id = HistoryEntry.generateId();
      const after = Date.now();

      const timestamp = parseInt(id.split('-')[0]);
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });
});
