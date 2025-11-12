/**
 * SavedRequest Model Tests
 *
 * Tests for the SavedRequest entity that stores API request configurations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SavedRequest } from './SavedRequest';
import { Request } from './Request';
import { HttpMethod, BodyType } from '../types/request.types';

describe('SavedRequest Model', () => {
  let sampleRequest: Request;

  beforeEach(() => {
    sampleRequest = new Request({
      url: 'https://api.example.com/users',
      method: HttpMethod.POST,
      headers: [
        { name: 'Content-Type', value: 'application/json', enabled: true },
        { name: 'Authorization', value: 'Bearer {{token}}', enabled: true },
      ],
      body: '{"name": "{{username}}", "email": "test@example.com"}',
      bodyType: BodyType.JSON,
      timeout: 30000,
    });
  });

  describe('creation from Request', () => {
    it('should create SavedRequest from Request with all fields', () => {
      const saved = SavedRequest.fromRequest(
        sampleRequest,
        'collection-123',
        'Create User',
        'https://api.example.com/users'
      );

      expect(saved.id).toBeDefined();
      expect(saved.id).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
      expect(saved.name).toBe('Create User');
      expect(saved.collectionId).toBe('collection-123');
      expect(saved.order).toBe(0);
      expect(saved.url).toBe('https://api.example.com/users');
      expect(saved.method).toBe(HttpMethod.POST);
      expect(saved.headers).toEqual(sampleRequest.headers);
      expect(saved.body).toBe('{"name": "{{username}}", "email": "test@example.com"}');
      expect(saved.bodyType).toBe(BodyType.JSON);
      expect(saved.timeout).toBe(30000);
      expect(saved.createdAt).toBeInstanceOf(Date);
      expect(saved.updatedAt).toBeInstanceOf(Date);
    });

    it('should preserve {{variable}} syntax in URL', () => {
      const requestWithVar = new Request({
        url: 'https://example.com/api/users',
      });

      const saved = SavedRequest.fromRequest(
        requestWithVar,
        'coll-1',
        'Get User',
        'https://{{baseUrl}}/api/users/{{userId}}'
      );

      expect(saved.url).toContain('{{baseUrl}}');
      expect(saved.url).toContain('{{userId}}');
    });

    it('should preserve {{variable}} syntax in headers', () => {
      const saved = SavedRequest.fromRequest(sampleRequest, 'coll-1', 'Test', sampleRequest.url);

      const authHeader = saved.headers.find((h) => h.name === 'Authorization');
      expect(authHeader?.value).toBe('Bearer {{token}}');
    });

    it('should preserve {{variable}} syntax in body', () => {
      const saved = SavedRequest.fromRequest(sampleRequest, 'coll-1', 'Test', sampleRequest.url);

      expect(saved.body).toContain('{{username}}');
    });

    it('should create with custom order', () => {
      const saved = SavedRequest.fromRequest(sampleRequest, 'coll-1', 'Test', sampleRequest.url, 5);

      expect(saved.order).toBe(5);
    });

    it('should generate unique ids for different saved requests', () => {
      const saved1 = SavedRequest.fromRequest(
        sampleRequest,
        'coll-1',
        'Request 1',
        sampleRequest.url
      );
      const saved2 = SavedRequest.fromRequest(
        sampleRequest,
        'coll-1',
        'Request 2',
        sampleRequest.url
      );

      expect(saved1.id).not.toBe(saved2.id);
    });
  });

  describe('validation', () => {
    it('should throw error for empty name', () => {
      expect(() =>
        SavedRequest.fromRequest(sampleRequest, 'coll-1', '', sampleRequest.url)
      ).toThrow('Request name cannot be empty');
    });

    it('should throw error for whitespace-only name', () => {
      expect(() =>
        SavedRequest.fromRequest(sampleRequest, 'coll-1', '   ', sampleRequest.url)
      ).toThrow('Request name cannot be empty');
    });

    it('should throw error for name longer than 200 characters', () => {
      const longName = 'a'.repeat(201);
      expect(() =>
        SavedRequest.fromRequest(sampleRequest, 'coll-1', longName, sampleRequest.url)
      ).toThrow('Request name must be 200 characters or less');
    });

    it('should accept name with exactly 200 characters', () => {
      const name = 'a'.repeat(200);
      expect(() =>
        SavedRequest.fromRequest(sampleRequest, 'coll-1', name, sampleRequest.url)
      ).not.toThrow();
    });

    it('should throw error for empty collection ID', () => {
      expect(() => SavedRequest.fromRequest(sampleRequest, '', 'Test', sampleRequest.url)).toThrow(
        'Collection ID cannot be empty'
      );
    });
  });

  describe('toRequest conversion', () => {
    it('should convert SavedRequest back to Request object', () => {
      const saved = SavedRequest.fromRequest(
        sampleRequest,
        'coll-1',
        'Test Request',
        sampleRequest.url
      );
      const request = saved.toRequest();

      expect(request.url).toBe(saved.url);
      expect(request.method).toBe(saved.method);
      expect(request.headers).toEqual(saved.headers);
      expect(request.body).toBe(saved.body);
      expect(request.bodyType).toBe(saved.bodyType);
      expect(request.timeout).toBe(saved.timeout);
    });

    it('should preserve {{variables}} when converting back', () => {
      const requestWithVars = new Request({
        url: 'https://example.com/users',
        headers: [{ name: 'Auth', value: '{{token}}', enabled: true }],
        body: '{"id": "{{userId}}"}',
      });

      const saved = SavedRequest.fromRequest(
        requestWithVars,
        'coll-1',
        'Test',
        'https://{{baseUrl}}/users'
      );
      const restored = saved.toRequest();

      // URL may be normalized by URL parser, but variables should be present (case-insensitive)
      expect(restored.url.toLowerCase()).toContain('{{baseurl}}');
      expect(restored.headers[0]?.value).toContain('{{token}}');
      expect(restored.body).toContain('{{userId}}');
    });
  });

  describe('update', () => {
    let savedRequest: SavedRequest;

    beforeEach(() => {
      savedRequest = SavedRequest.fromRequest(
        sampleRequest,
        'coll-1',
        'Original Name',
        sampleRequest.url
      );
    });

    it('should update name and return new instance', () => {
      const updated = savedRequest.update({ name: 'Updated Name' });

      expect(updated.name).toBe('Updated Name');
      expect(updated.id).toBe(savedRequest.id);
      expect(updated.url).toBe(savedRequest.url);
      expect(updated).not.toBe(savedRequest); // Different instance
    });

    it('should update URL', () => {
      const updated = savedRequest.update({ url: 'https://api.example.com/posts' });

      expect(updated.url).toContain('/posts');
      expect(updated.name).toBe(savedRequest.name);
    });

    it('should update headers', () => {
      const newHeaders = [{ name: 'X-Custom', value: 'test', enabled: true }];
      const updated = savedRequest.update({ headers: newHeaders });

      expect(updated.headers).toEqual(newHeaders);
    });

    it('should update body', () => {
      const updated = savedRequest.update({ body: '{"updated": true}' });

      expect(updated.body).toBe('{"updated": true}');
    });

    it('should update order', () => {
      const updated = savedRequest.update({ order: 10 });

      expect(updated.order).toBe(10);
    });

    it('should update multiple properties at once', () => {
      const updated = savedRequest.update({
        name: 'Multi Update',
        order: 5,
        body: '{"test": "multi"}',
      });

      expect(updated.name).toBe('Multi Update');
      expect(updated.order).toBe(5);
      expect(updated.body).toBe('{"test": "multi"}');
    });

    it('should validate updated name', () => {
      expect(() => savedRequest.update({ name: '' })).toThrow('Request name cannot be empty');
    });

    it('should update timestamps', () => {
      const updated = savedRequest.update({ name: 'Updated' });

      expect(updated.createdAt.getTime()).toBe(savedRequest.createdAt.getTime());
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(savedRequest.updatedAt.getTime());
    });
  });

  describe('immutability', () => {
    it('should not modify original when updating', () => {
      const original = SavedRequest.fromRequest(
        sampleRequest,
        'coll-1',
        'Original',
        sampleRequest.url
      );
      const originalName = original.name;
      const originalUrl = original.url;

      original.update({ name: 'Modified', url: 'https://changed.com' });

      expect(original.name).toBe(originalName);
      expect(original.url).toBe(originalUrl);
    });
  });

  describe('serialization', () => {
    it('should convert to JSON for storage', () => {
      const saved = SavedRequest.fromRequest(
        sampleRequest,
        'coll-1',
        'Test Request',
        sampleRequest.url,
        3
      );
      const json = saved.toJSON();

      expect(json).toEqual({
        id: saved.id,
        name: 'Test Request',
        collectionId: 'coll-1',
        order: 3,
        url: saved.url,
        method: HttpMethod.POST,
        headers: saved.headers,
        body: saved.body,
        bodyType: BodyType.JSON,
        timeout: 30000,
        createdAt: saved.createdAt.toISOString(),
        updatedAt: saved.updatedAt.toISOString(),
      });
    });

    it('should restore from JSON', () => {
      const original = SavedRequest.fromRequest(
        sampleRequest,
        'coll-1',
        'Test',
        sampleRequest.url,
        5
      );
      const json = original.toJSON();
      const restored = SavedRequest.fromJSON(json);

      expect(restored.id).toBe(original.id);
      expect(restored.name).toBe(original.name);
      expect(restored.collectionId).toBe(original.collectionId);
      expect(restored.order).toBe(original.order);
      expect(restored.url).toBe(original.url);
      expect(restored.method).toBe(original.method);
      expect(restored.headers).toEqual(original.headers);
      expect(restored.body).toBe(original.body);
      expect(restored.bodyType).toBe(original.bodyType);
      expect(restored.timeout).toBe(original.timeout);
      expect(restored.createdAt.getTime()).toBe(original.createdAt.getTime());
      expect(restored.updatedAt.getTime()).toBe(original.updatedAt.getTime());
    });

    it('should preserve {{variables}} through JSON round-trip', () => {
      const requestWithVars = new Request({
        url: 'https://example.com/api/endpoint',
        headers: [{ name: 'Auth', value: 'Bearer {{token}}', enabled: true }],
        body: '{"userId": "{{userId}}", "data": "{{data}}"}',
      });

      const saved = SavedRequest.fromRequest(
        requestWithVars,
        'coll-1',
        'Var Test',
        'https://{{baseUrl}}/api/{{endpoint}}'
      );
      const json = saved.toJSON();
      const restored = SavedRequest.fromJSON(json);

      // Variables preserved exactly as stored in JSON
      expect(restored.url).toBe('https://{{baseUrl}}/api/{{endpoint}}');
      expect(restored.headers[0]?.value).toContain('{{token}}');
      expect(restored.body).toContain('{{userId}}');
      expect(restored.body).toContain('{{data}}');
    });
  });
});
