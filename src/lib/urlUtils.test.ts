/**
 * URL Utilities Tests
 *
 * Tests for URL parsing and building functions
 */

import { describe, it, expect } from 'vitest';
import { parseQueryParams, buildUrlWithParams, getBaseUrl } from './urlUtils';
import type { QueryParam } from '../types/request.types';

describe('urlUtils', () => {
  describe('parseQueryParams', () => {
    it('should parse simple query parameters', () => {
      const url = 'https://api.example.com/users?page=1&limit=10';
      const params = parseQueryParams(url);

      expect(params).toHaveLength(2);
      expect(params[0]).toEqual({
        key: 'page',
        value: '1',
        description: '',
        enabled: true,
      });
      expect(params[1]).toEqual({
        key: 'limit',
        value: '10',
        description: '',
        enabled: true,
      });
    });

    it('should parse URL with no query parameters', () => {
      const url = 'https://api.example.com/users';
      const params = parseQueryParams(url);

      expect(params).toEqual([]);
    });

    it('should handle URL with empty values', () => {
      const url = 'https://api.example.com/search?q=&filter=active';
      const params = parseQueryParams(url);

      expect(params).toHaveLength(2);
      expect(params[0]).toEqual({
        key: 'q',
        value: '',
        description: '',
        enabled: true,
      });
      expect(params[1]).toEqual({
        key: 'filter',
        value: 'active',
        description: '',
        enabled: true,
      });
    });

    it('should handle URL-encoded values', () => {
      const url = 'https://api.example.com/search?q=hello%20world&tag=foo%26bar';
      const params = parseQueryParams(url);

      expect(params).toHaveLength(2);
      expect(params[0]?.value).toBe('hello world');
      expect(params[1]?.value).toBe('foo&bar');
    });

    it('should return empty array for invalid URL', () => {
      const url = 'not-a-valid-url';
      const params = parseQueryParams(url);

      expect(params).toEqual([]);
    });

    it('should handle duplicate parameter names', () => {
      const url = 'https://api.example.com/items?id=1&id=2&id=3';
      const params = parseQueryParams(url);

      // URL API combines duplicates, taking the last value
      expect(params.length).toBeGreaterThan(0);
    });
  });

  describe('buildUrlWithParams', () => {
    it('should build URL with query parameters', () => {
      const baseUrl = 'https://api.example.com/users';
      const params: QueryParam[] = [
        { key: 'page', value: '1', enabled: true },
        { key: 'limit', value: '10', enabled: true },
      ];

      const result = buildUrlWithParams(baseUrl, params);
      expect(result).toBe('https://api.example.com/users?page=1&limit=10');
    });

    it('should only include enabled parameters', () => {
      const baseUrl = 'https://api.example.com/users';
      const params: QueryParam[] = [
        { key: 'page', value: '1', enabled: true },
        { key: 'limit', value: '10', enabled: false },
        { key: 'sort', value: 'name', enabled: true },
      ];

      const result = buildUrlWithParams(baseUrl, params);
      expect(result).toBe('https://api.example.com/users?page=1&sort=name');
    });

    it('should skip parameters with empty keys', () => {
      const baseUrl = 'https://api.example.com/users';
      const params: QueryParam[] = [
        { key: 'page', value: '1', enabled: true },
        { key: '', value: 'ignored', enabled: true },
        { key: '  ', value: 'also-ignored', enabled: true },
      ];

      const result = buildUrlWithParams(baseUrl, params);
      expect(result).toBe('https://api.example.com/users?page=1');
    });

    it('should return base URL when no enabled params', () => {
      const baseUrl = 'https://api.example.com/users';
      const params: QueryParam[] = [{ key: 'page', value: '1', enabled: false }];

      const result = buildUrlWithParams(baseUrl, params);
      expect(result).toBe('https://api.example.com/users');
    });

    it('should return base URL when empty params array', () => {
      const baseUrl = 'https://api.example.com/users';
      const params: QueryParam[] = [];

      const result = buildUrlWithParams(baseUrl, params);
      expect(result).toBe('https://api.example.com/users');
    });

    it('should URL-encode special characters', () => {
      const baseUrl = 'https://api.example.com/search';
      const params: QueryParam[] = [
        { key: 'q', value: 'hello world', enabled: true },
        { key: 'tag', value: 'foo&bar', enabled: true },
      ];

      const result = buildUrlWithParams(baseUrl, params);
      expect(result).toBe('https://api.example.com/search?q=hello+world&tag=foo%26bar');
    });

    it('should replace existing query parameters', () => {
      const baseUrl = 'https://api.example.com/users?old=param';
      const params: QueryParam[] = [{ key: 'page', value: '1', enabled: true }];

      const result = buildUrlWithParams(baseUrl, params);
      expect(result).toBe('https://api.example.com/users?page=1');
    });

    it('should handle invalid base URL gracefully', () => {
      const baseUrl = 'not-a-valid-url';
      const params: QueryParam[] = [{ key: 'page', value: '1', enabled: true }];

      const result = buildUrlWithParams(baseUrl, params);
      expect(result).toBe('not-a-valid-url?page=1');
    });
  });

  describe('getBaseUrl', () => {
    it('should extract base URL without query params', () => {
      const url = 'https://api.example.com/users?page=1&limit=10';
      const base = getBaseUrl(url);

      expect(base).toBe('https://api.example.com/users');
    });

    it('should return URL unchanged if no query params', () => {
      const url = 'https://api.example.com/users';
      const base = getBaseUrl(url);

      expect(base).toBe('https://api.example.com/users');
    });

    it('should handle invalid URLs', () => {
      const url = 'not-a-valid-url?param=value';
      const base = getBaseUrl(url);

      expect(base).toBe('not-a-valid-url');
    });

    it('should preserve path and protocol', () => {
      const url = 'https://api.example.com:8080/v1/users?page=1';
      const base = getBaseUrl(url);

      expect(base).toBe('https://api.example.com:8080/v1/users');
    });
  });
});
