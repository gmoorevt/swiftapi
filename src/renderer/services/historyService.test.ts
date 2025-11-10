/**
 * HistoryService Tests
 *
 * Tests for request history persistence and management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HistoryService } from './historyService';
import { HistoryEntry } from '../../models/HistoryEntry';
import { HttpMethod } from '../../types/request.types';

// Mock storageAdapter
vi.mock('./storageAdapter', () => {
  const mockStore = new Map();

  return {
    createStorageAdapter: () => ({
      get(key: string, defaultValue: unknown) {
        return mockStore.has(key) ? mockStore.get(key) : defaultValue;
      },
      set(key: string, value: unknown) {
        mockStore.set(key, value);
      },
      clear() {
        mockStore.clear();
      },
      has(key: string) {
        return mockStore.has(key);
      },
    }),
  };
});

describe('HistoryService', () => {
  let historyService: HistoryService;

  beforeEach(() => {
    historyService = new HistoryService();
    historyService.clear();
  });

  describe('add', () => {
    it('should add entry to history', () => {
      const entry = new HistoryEntry({
        id: HistoryEntry.generateId(),
        timestamp: new Date().toISOString(),
        method: HttpMethod.GET,
        url: 'https://api.example.com/users',
        statusCode: 200,
        responseTime: 100,
      });

      historyService.add(entry);

      const history = historyService.getAll();
      expect(history).toHaveLength(1);
      expect(history[0]!.url).toBe('https://api.example.com/users');
    });

    it('should add multiple entries', () => {
      const entry1 = new HistoryEntry({
        id: HistoryEntry.generateId(),
        timestamp: new Date().toISOString(),
        method: HttpMethod.GET,
        url: 'https://api.example.com/users',
      });

      const entry2 = new HistoryEntry({
        id: HistoryEntry.generateId(),
        timestamp: new Date().toISOString(),
        method: HttpMethod.POST,
        url: 'https://api.example.com/posts',
      });

      historyService.add(entry1);
      historyService.add(entry2);

      const history = historyService.getAll();
      expect(history).toHaveLength(2);
    });

    it('should limit history to max entries (50)', () => {
      // Add 60 entries
      for (let i = 0; i < 60; i++) {
        const entry = new HistoryEntry({
          id: HistoryEntry.generateId(),
          timestamp: new Date().toISOString(),
          method: HttpMethod.GET,
          url: `https://api.example.com/users/${i}`,
        });
        historyService.add(entry);
      }

      const history = historyService.getAll();
      expect(history).toHaveLength(50);

      // Should keep most recent 50 (FIFO - oldest removed)
      // getAll() returns newest first (reversed)
      expect(history[0]!.url).toBe('https://api.example.com/users/59'); // Newest
      expect(history[history.length - 1]!.url).toBe('https://api.example.com/users/10'); // Oldest kept
    });

    it('should persist entries to storage', () => {
      const entry = new HistoryEntry({
        id: HistoryEntry.generateId(),
        timestamp: new Date().toISOString(),
        method: HttpMethod.GET,
        url: 'https://api.example.com/test',
      });

      historyService.add(entry);

      // Create new service instance to simulate app restart
      const newService = new HistoryService();
      const history = newService.getAll();

      expect(history).toHaveLength(1);
      expect(history[0]!.url).toBe('https://api.example.com/test');
    });
  });

  describe('getAll', () => {
    it('should return empty array when no history', () => {
      const history = historyService.getAll();
      expect(history).toEqual([]);
    });

    it('should return all entries in reverse chronological order (newest first)', () => {
      const entry1 = new HistoryEntry({
        id: HistoryEntry.generateId(),
        timestamp: '2025-11-10T10:00:00Z',
        method: HttpMethod.GET,
        url: 'https://api.example.com/first',
      });

      const entry2 = new HistoryEntry({
        id: HistoryEntry.generateId(),
        timestamp: '2025-11-10T11:00:00Z',
        method: HttpMethod.POST,
        url: 'https://api.example.com/second',
      });

      historyService.add(entry1);
      historyService.add(entry2);

      const history = historyService.getAll();

      // Newest first
      expect(history[0]!.url).toBe('https://api.example.com/second');
      expect(history[1]!.url).toBe('https://api.example.com/first');
    });
  });

  describe('getById', () => {
    it('should return entry by ID', () => {
      const entry = new HistoryEntry({
        id: '123-abc',
        timestamp: new Date().toISOString(),
        method: HttpMethod.GET,
        url: 'https://api.example.com/users',
      });

      historyService.add(entry);

      const found = historyService.getById('123-abc');
      expect(found).toBeDefined();
      expect(found?.url).toBe('https://api.example.com/users');
    });

    it('should return undefined for non-existent ID', () => {
      const found = historyService.getById('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should remove all history entries', () => {
      const entry1 = new HistoryEntry({
        id: HistoryEntry.generateId(),
        timestamp: new Date().toISOString(),
        method: HttpMethod.GET,
        url: 'https://api.example.com/users',
      });

      const entry2 = new HistoryEntry({
        id: HistoryEntry.generateId(),
        timestamp: new Date().toISOString(),
        method: HttpMethod.POST,
        url: 'https://api.example.com/posts',
      });

      historyService.add(entry1);
      historyService.add(entry2);

      expect(historyService.getAll()).toHaveLength(2);

      historyService.clear();

      expect(historyService.getAll()).toHaveLength(0);
    });
  });

  describe('remove', () => {
    it('should remove specific entry by ID', () => {
      const entry1 = new HistoryEntry({
        id: '123',
        timestamp: new Date().toISOString(),
        method: HttpMethod.GET,
        url: 'https://api.example.com/users',
      });

      const entry2 = new HistoryEntry({
        id: '456',
        timestamp: new Date().toISOString(),
        method: HttpMethod.POST,
        url: 'https://api.example.com/posts',
      });

      historyService.add(entry1);
      historyService.add(entry2);

      historyService.remove('123');

      const history = historyService.getAll();
      expect(history).toHaveLength(1);
      expect(history[0]!.id).toBe('456');
    });

    it('should do nothing for non-existent ID', () => {
      const entry = new HistoryEntry({
        id: '123',
        timestamp: new Date().toISOString(),
        method: HttpMethod.GET,
        url: 'https://api.example.com/users',
      });

      historyService.add(entry);

      historyService.remove('non-existent');

      expect(historyService.getAll()).toHaveLength(1);
    });
  });
});
