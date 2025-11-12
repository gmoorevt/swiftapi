/**
 * Response Model Tests
 *
 * Tests for the Response entity
 *
 * @see specs/001-basic-request-builder/data-model.md
 */

import { describe, it, expect } from 'vitest';
import { Response } from './Response';

describe('Response Model', () => {
  describe('creation', () => {
    it('should create a Response with all properties', () => {
      const response = new Response({
        statusCode: 200,
        statusText: 'OK',
        headers: [{ name: 'content-type', value: 'application/json', enabled: true }],
        body: '{"message": "success"}',
        responseTime: 245,
        size: 1024,
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.statusCode).toBe(200);
      expect(response.statusText).toBe('OK');
      expect(response.headers).toHaveLength(1);
      expect(response.body).toBe('{"message": "success"}');
      expect(response.responseTime).toBe(245);
      expect(response.size).toBe(1024);
      expect(response.timestamp).toBe('2025-11-07T10:15:30.123Z');
    });

    it('should extract content-type from headers', () => {
      const response = new Response({
        statusCode: 200,
        statusText: 'OK',
        headers: [
          { name: 'content-type', value: 'application/json; charset=utf-8', enabled: true },
        ],
        body: '{}',
        responseTime: 100,
        size: 2,
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.contentType).toBe('application/json; charset=utf-8');
    });

    it('should set contentType to null when no content-type header present', () => {
      const response = new Response({
        statusCode: 200,
        statusText: 'OK',
        headers: [],
        body: 'plain text',
        responseTime: 100,
        size: 10,
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.contentType).toBeNull();
    });
  });

  describe('status category', () => {
    it('should categorize 2xx as success', () => {
      const response = new Response({
        statusCode: 200,
        statusText: 'OK',
        headers: [],
        body: '',
        responseTime: 100,
        size: 0,
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.statusCategory).toBe('success');
    });

    it('should categorize 201 as success', () => {
      const response = new Response({
        statusCode: 201,
        statusText: 'Created',
        headers: [],
        body: '',
        responseTime: 100,
        size: 0,
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.statusCategory).toBe('success');
    });

    it('should categorize 3xx as redirect', () => {
      const response = new Response({
        statusCode: 301,
        statusText: 'Moved Permanently',
        headers: [],
        body: '',
        responseTime: 100,
        size: 0,
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.statusCategory).toBe('redirect');
    });

    it('should categorize 4xx as error', () => {
      const response = new Response({
        statusCode: 404,
        statusText: 'Not Found',
        headers: [],
        body: '',
        responseTime: 100,
        size: 0,
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.statusCategory).toBe('error');
    });

    it('should categorize 5xx as error', () => {
      const response = new Response({
        statusCode: 500,
        statusText: 'Internal Server Error',
        headers: [],
        body: '',
        responseTime: 100,
        size: 0,
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.statusCategory).toBe('error');
    });

    it('should categorize 1xx as info', () => {
      const response = new Response({
        statusCode: 100,
        statusText: 'Continue',
        headers: [],
        body: '',
        responseTime: 100,
        size: 0,
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.statusCategory).toBe('info');
    });
  });

  describe('formatted size', () => {
    it('should format bytes when size < 1KB', () => {
      const response = new Response({
        statusCode: 200,
        statusText: 'OK',
        headers: [],
        body: '',
        responseTime: 100,
        size: 512,
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.formattedSize).toBe('512 bytes');
    });

    it('should format KB when size >= 1KB and < 1MB', () => {
      const response = new Response({
        statusCode: 200,
        statusText: 'OK',
        headers: [],
        body: '',
        responseTime: 100,
        size: 2048, // 2 KB
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.formattedSize).toBe('2.00 KB');
    });

    it('should format MB when size >= 1MB', () => {
      const response = new Response({
        statusCode: 200,
        statusText: 'OK',
        headers: [],
        body: '',
        responseTime: 100,
        size: 1572864, // 1.5 MB
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.formattedSize).toBe('1.50 MB');
    });
  });

  describe('content type detection', () => {
    it('should detect JSON content type', () => {
      const response = new Response({
        statusCode: 200,
        statusText: 'OK',
        headers: [{ name: 'content-type', value: 'application/json', enabled: true }],
        body: '{}',
        responseTime: 100,
        size: 2,
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.isJson).toBe(true);
      expect(response.isXml).toBe(false);
      expect(response.isHtml).toBe(false);
    });

    it('should detect XML content type', () => {
      const response = new Response({
        statusCode: 200,
        statusText: 'OK',
        headers: [{ name: 'content-type', value: 'application/xml', enabled: true }],
        body: '<root></root>',
        responseTime: 100,
        size: 13,
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.isJson).toBe(false);
      expect(response.isXml).toBe(true);
      expect(response.isHtml).toBe(false);
    });

    it('should detect HTML content type', () => {
      const response = new Response({
        statusCode: 200,
        statusText: 'OK',
        headers: [{ name: 'content-type', value: 'text/html', enabled: true }],
        body: '<html></html>',
        responseTime: 100,
        size: 13,
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.isJson).toBe(false);
      expect(response.isXml).toBe(false);
      expect(response.isHtml).toBe(true);
    });

    it('should handle missing content-type header', () => {
      const response = new Response({
        statusCode: 200,
        statusText: 'OK',
        headers: [],
        body: 'plain text',
        responseTime: 100,
        size: 10,
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.isJson).toBe(false);
      expect(response.isXml).toBe(false);
      expect(response.isHtml).toBe(false);
    });
  });

  describe('cookies parsing', () => {
    it('should parse Set-Cookie headers into cookies array', () => {
      const response = new Response({
        statusCode: 200,
        statusText: 'OK',
        headers: [
          { name: 'Set-Cookie', value: 'sessionId=abc123; Path=/; Secure; HttpOnly', enabled: true },
          { name: 'Set-Cookie', value: 'token=xyz789; Domain=example.com', enabled: true },
        ],
        body: '',
        responseTime: 100,
        size: 0,
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.cookies).toHaveLength(2);
      expect(response.cookies[0]).toEqual({
        name: 'sessionId',
        value: 'abc123',
        path: '/',
        secure: true,
        httpOnly: true,
      });
      expect(response.cookies[1]).toEqual({
        name: 'token',
        value: 'xyz789',
        domain: 'example.com',
      });
    });

    it('should return empty cookies array when no Set-Cookie headers present', () => {
      const response = new Response({
        statusCode: 200,
        statusText: 'OK',
        headers: [{ name: 'content-type', value: 'application/json', enabled: true }],
        body: '{}',
        responseTime: 100,
        size: 2,
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.cookies).toEqual([]);
    });

    it('should compute hasCookies as true when cookies present', () => {
      const response = new Response({
        statusCode: 200,
        statusText: 'OK',
        headers: [
          { name: 'Set-Cookie', value: 'test=value', enabled: true },
        ],
        body: '',
        responseTime: 100,
        size: 0,
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.hasCookies).toBe(true);
    });

    it('should compute hasCookies as false when no cookies present', () => {
      const response = new Response({
        statusCode: 200,
        statusText: 'OK',
        headers: [],
        body: '',
        responseTime: 100,
        size: 0,
        timestamp: '2025-11-07T10:15:30.123Z',
      });

      expect(response.hasCookies).toBe(false);
    });
  });
});
