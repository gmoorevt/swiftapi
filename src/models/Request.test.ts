/**
 * Request Model Tests
 *
 * Tests for the Request entity
 *
 * @see specs/001-basic-request-builder/data-model.md
 */

import { describe, it, expect } from 'vitest';
import { Request } from './Request';
import { HttpMethod, BodyType } from '../types/request.types';

describe('Request Model', () => {
  describe('creation', () => {
    it('should create a Request with all properties', () => {
      const request = new Request({
        url: 'https://api.example.com',
        method: HttpMethod.POST,
        headers: [
          { name: 'Authorization', value: 'Bearer token', enabled: true },
        ],
        body: '{"test": "data"}',
        bodyType: BodyType.JSON,
        timeout: 30000,
      });

      expect(request.url).toBe('https://api.example.com/');
      expect(request.method).toBe(HttpMethod.POST);
      expect(request.headers).toHaveLength(1);
      expect(request.headers[0]?.name).toBe('Authorization');
      expect(request.body).toBe('{"test": "data"}');
      expect(request.bodyType).toBe(BodyType.JSON);
      expect(request.timeout).toBe(30000);
    });

    it('should default to GET method when not specified', () => {
      const request = new Request({
        url: 'https://api.example.com',
      });

      expect(request.method).toBe(HttpMethod.GET);
    });

    it('should default to empty headers array when not specified', () => {
      const request = new Request({
        url: 'https://api.example.com',
      });

      expect(request.headers).toEqual([]);
    });

    it('should default to empty body when not specified', () => {
      const request = new Request({
        url: 'https://api.example.com',
      });

      expect(request.body).toBe('');
    });

    it('should default to JSON body type when not specified', () => {
      const request = new Request({
        url: 'https://api.example.com',
      });

      expect(request.bodyType).toBe(BodyType.JSON);
    });

    it('should default to 30000ms timeout when not specified', () => {
      const request = new Request({
        url: 'https://api.example.com',
      });

      expect(request.timeout).toBe(30000);
    });
  });

  describe('URL validation', () => {
    it('should accept valid URL with https://', () => {
      const request = new Request({
        url: 'https://api.example.com',
      });

      expect(request.url).toBe('https://api.example.com/');
    });

    it('should auto-prepend https:// to URL without protocol', () => {
      const request = new Request({
        url: 'api.example.com',
      });

      expect(request.url).toContain('https://');
    });

    it('should throw error for empty URL', () => {
      expect(() => {
        new Request({ url: '' });
      }).toThrow('URL cannot be empty');
    });

    it('should throw error for invalid URL', () => {
      expect(() => {
        new Request({ url: 'not a valid url' });
      }).toThrow('Invalid URL format');
    });
  });

  describe('getEnabledHeaders', () => {
    it('should return only enabled headers', () => {
      const request = new Request({
        url: 'https://api.example.com',
        headers: [
          { name: 'Header1', value: 'value1', enabled: true },
          { name: 'Header2', value: 'value2', enabled: false },
          { name: 'Header3', value: 'value3', enabled: true },
        ],
      });

      const enabledHeaders = request.getEnabledHeaders();

      expect(enabledHeaders).toHaveLength(2);
      expect(enabledHeaders[0]?.name).toBe('Header1');
      expect(enabledHeaders[1]?.name).toBe('Header3');
    });

    it('should return empty array when no headers are enabled', () => {
      const request = new Request({
        url: 'https://api.example.com',
        headers: [
          { name: 'Header1', value: 'value1', enabled: false },
        ],
      });

      const enabledHeaders = request.getEnabledHeaders();

      expect(enabledHeaders).toEqual([]);
    });
  });

  describe('hasBody', () => {
    it('should return true for POST method', () => {
      const request = new Request({
        url: 'https://api.example.com',
        method: HttpMethod.POST,
      });

      expect(request.hasBody()).toBe(true);
    });

    it('should return true for PUT method', () => {
      const request = new Request({
        url: 'https://api.example.com',
        method: HttpMethod.PUT,
      });

      expect(request.hasBody()).toBe(true);
    });

    it('should return true for DELETE method', () => {
      const request = new Request({
        url: 'https://api.example.com',
        method: HttpMethod.DELETE,
      });

      expect(request.hasBody()).toBe(true);
    });

    it('should return false for GET method', () => {
      const request = new Request({
        url: 'https://api.example.com',
        method: HttpMethod.GET,
      });

      expect(request.hasBody()).toBe(false);
    });
  });
});
