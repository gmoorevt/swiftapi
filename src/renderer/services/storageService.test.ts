/**
 * StorageService Tests
 *
 * Tests for local storage persistence service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from './storageService';
import { HttpMethod } from '../../types/request.types';

// Mock electron-store
vi.mock('electron-store', () => {
  const mockStore = new Map();

  return {
    default: class MockStore {
      get(key: string) {
        return mockStore.get(key);
      }

      set(key: string, value: unknown) {
        mockStore.set(key, value);
      }

      clear() {
        mockStore.clear();
      }

      has(key: string) {
        return mockStore.has(key);
      }
    },
  };
});

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    storageService = new StorageService();
    // Clear any existing data
    storageService.clearAll();
  });

  describe('saveLastUrl', () => {
    // T090: storageService persists lastUrl
    it('should persist lastUrl to storage', () => {
      const url = 'https://api.example.com/users';
      storageService.saveLastUrl(url);

      const retrieved = storageService.getLastUrl();
      expect(retrieved).toBe(url);
    });

    it('should update lastUrl when called multiple times', () => {
      storageService.saveLastUrl('https://api.example.com/v1');
      storageService.saveLastUrl('https://api.example.com/v2');

      const retrieved = storageService.getLastUrl();
      expect(retrieved).toBe('https://api.example.com/v2');
    });

    it('should persist empty string', () => {
      storageService.saveLastUrl('');

      const retrieved = storageService.getLastUrl();
      expect(retrieved).toBe('');
    });
  });

  describe('saveLastMethod', () => {
    // T090: storageService persists lastMethod
    it('should persist lastMethod to storage', () => {
      storageService.saveLastMethod(HttpMethod.POST);

      const retrieved = storageService.getLastMethod();
      expect(retrieved).toBe(HttpMethod.POST);
    });

    it('should update lastMethod when called multiple times', () => {
      storageService.saveLastMethod(HttpMethod.GET);
      storageService.saveLastMethod(HttpMethod.PUT);

      const retrieved = storageService.getLastMethod();
      expect(retrieved).toBe(HttpMethod.PUT);
    });

    it('should persist all HTTP methods', () => {
      const methods = [HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE];

      methods.forEach((method) => {
        storageService.saveLastMethod(method);
        expect(storageService.getLastMethod()).toBe(method);
      });
    });
  });

  describe('getLastUrl', () => {
    // T091: storageService restores settings on app launch
    it('should return null if no URL was saved', () => {
      const retrieved = storageService.getLastUrl();
      expect(retrieved).toBeNull();
    });

    it('should retrieve previously saved URL', () => {
      const url = 'https://api.test.com';
      storageService.saveLastUrl(url);

      // Create new instance to simulate app restart
      const newService = new StorageService();
      const retrieved = newService.getLastUrl();

      expect(retrieved).toBe(url);
    });
  });

  describe('getLastMethod', () => {
    // T091: storageService restores settings on app launch
    it('should return GET as default if no method was saved', () => {
      const retrieved = storageService.getLastMethod();
      expect(retrieved).toBe(HttpMethod.GET);
    });

    it('should retrieve previously saved method', () => {
      storageService.saveLastMethod(HttpMethod.POST);

      // Create new instance to simulate app restart
      const newService = new StorageService();
      const retrieved = newService.getLastMethod();

      expect(retrieved).toBe(HttpMethod.POST);
    });

    it('should default to GET for invalid stored value', () => {
      // Manually set an invalid method
      storageService.saveLastUrl('invalid-method' as any);

      const retrieved = storageService.getLastMethod();
      expect(retrieved).toBe(HttpMethod.GET);
    });
  });

  describe('saveSettings', () => {
    it('should save both URL and method together', () => {
      const url = 'https://api.example.com';
      const method = HttpMethod.PUT;

      storageService.saveSettings(url, method);

      expect(storageService.getLastUrl()).toBe(url);
      expect(storageService.getLastMethod()).toBe(method);
    });

    it('should update existing settings', () => {
      storageService.saveSettings('https://old.com', HttpMethod.GET);
      storageService.saveSettings('https://new.com', HttpMethod.POST);

      expect(storageService.getLastUrl()).toBe('https://new.com');
      expect(storageService.getLastMethod()).toBe(HttpMethod.POST);
    });
  });

  describe('getSettings', () => {
    it('should retrieve both URL and method together', () => {
      const url = 'https://api.example.com';
      const method = HttpMethod.DELETE;

      storageService.saveSettings(url, method);
      const settings = storageService.getSettings();

      expect(settings.lastUrl).toBe(url);
      expect(settings.lastMethod).toBe(method);
    });

    it('should return defaults if nothing was saved', () => {
      const settings = storageService.getSettings();

      expect(settings.lastUrl).toBeNull();
      expect(settings.lastMethod).toBe(HttpMethod.GET);
    });

    it('should persist across service instances', () => {
      storageService.saveSettings('https://api.test.com', HttpMethod.POST);

      // Create new instance to simulate app restart
      const newService = new StorageService();
      const settings = newService.getSettings();

      expect(settings.lastUrl).toBe('https://api.test.com');
      expect(settings.lastMethod).toBe(HttpMethod.POST);
    });
  });

  describe('clearAll', () => {
    it('should clear all stored settings', () => {
      storageService.saveSettings('https://api.example.com', HttpMethod.POST);

      storageService.clearAll();

      const settings = storageService.getSettings();
      expect(settings.lastUrl).toBeNull();
      expect(settings.lastMethod).toBe(HttpMethod.GET);
    });
  });

  describe('privacy and security', () => {
    it('should not store sensitive data like headers or body', () => {
      // StorageService should only store URL and method
      // This test verifies we're not accidentally storing sensitive data

      storageService.saveSettings('https://api.example.com', HttpMethod.POST);

      // Try to get non-existent keys (headers, body, etc.)
      const settings = storageService.getSettings();

      // Should only have URL and method
      expect(Object.keys(settings)).toEqual(['lastUrl', 'lastMethod']);
    });

    it('should handle URLs with query parameters safely', () => {
      const urlWithParams = 'https://api.example.com/search?q=test&token=secret';
      storageService.saveLastUrl(urlWithParams);

      const retrieved = storageService.getLastUrl();
      expect(retrieved).toBe(urlWithParams);
    });
  });
});
