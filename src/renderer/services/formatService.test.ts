/**
 * FormatService Tests
 *
 * Tests for response formatting service
 */

import { describe, it, expect } from 'vitest';
import { FormatService } from './formatService';

describe('FormatService', () => {
  const formatService = new FormatService();

  describe('formatJson', () => {
    // T080: formatService.formatJson pretty-prints JSON with 2-space indent
    it('should pretty-print JSON with 2-space indent', () => {
      const input = '{"name":"John","age":30,"city":"New York"}';
      const result = formatService.formatJson(input);

      expect(result).toBe('{\n  "name": "John",\n  "age": 30,\n  "city": "New York"\n}');
    });

    it('should pretty-print nested JSON', () => {
      const input = '{"user":{"name":"Alice","address":{"city":"Boston","zip":"02101"}}}';
      const result = formatService.formatJson(input);

      expect(result).toContain('"user": {');
      expect(result).toContain('  "name": "Alice"');
      expect(result).toContain('  "address": {');
      expect(result).toContain('    "city": "Boston"');
    });

    it('should pretty-print JSON arrays', () => {
      const input = '[{"id":1},{"id":2},{"id":3}]';
      const result = formatService.formatJson(input);

      expect(result).toContain('[\n  {');
      expect(result).toContain('"id": 1');
      expect(result).toContain('"id": 2');
    });

    it('should handle already formatted JSON', () => {
      const input = '{\n  "name": "John"\n}';
      const result = formatService.formatJson(input);

      // Should still format correctly
      expect(result).toBe('{\n  "name": "John"\n}');
    });

    it('should return original string if invalid JSON', () => {
      const input = '{invalid json}';
      const result = formatService.formatJson(input);

      expect(result).toBe(input);
    });

    it('should handle empty JSON object', () => {
      const input = '{}';
      const result = formatService.formatJson(input);

      expect(result).toBe('{}');
    });

    it('should handle empty JSON array', () => {
      const input = '[]';
      const result = formatService.formatJson(input);

      expect(result).toBe('[]');
    });
  });

  describe('isValidJson', () => {
    // T081: formatService.isValidJson detects valid/invalid JSON
    it('should return true for valid JSON object', () => {
      expect(formatService.isValidJson('{"name":"John"}')).toBe(true);
    });

    it('should return true for valid JSON array', () => {
      expect(formatService.isValidJson('[1,2,3]')).toBe(true);
    });

    it('should return true for valid nested JSON', () => {
      expect(formatService.isValidJson('{"user":{"name":"Alice"}}')).toBe(true);
    });

    it('should return false for invalid JSON', () => {
      expect(formatService.isValidJson('{invalid}')).toBe(false);
    });

    it('should return false for malformed JSON', () => {
      expect(formatService.isValidJson('{"name":"John"')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(formatService.isValidJson('')).toBe(false);
    });

    it('should return false for plain text', () => {
      expect(formatService.isValidJson('not json at all')).toBe(false);
    });

    it('should return true for JSON with whitespace', () => {
      expect(formatService.isValidJson('  {"name":"John"}  ')).toBe(true);
    });
  });

  describe('detectContentType', () => {
    // T082: formatService.detectContentType identifies JSON, XML, HTML, plain text
    it('should detect JSON content type', () => {
      const content = '{"name":"John"}';
      expect(formatService.detectContentType(content)).toBe('json');
    });

    it('should detect JSON array content type', () => {
      const content = '[1,2,3]';
      expect(formatService.detectContentType(content)).toBe('json');
    });

    it('should detect XML content type', () => {
      const content = '<?xml version="1.0"?><root><item>test</item></root>';
      expect(formatService.detectContentType(content)).toBe('xml');
    });

    it('should detect HTML content type', () => {
      const content = '<!DOCTYPE html><html><body><h1>Test</h1></body></html>';
      expect(formatService.detectContentType(content)).toBe('html');
    });

    it('should detect HTML without DOCTYPE', () => {
      const content = '<html><body><p>Test</p></body></html>';
      expect(formatService.detectContentType(content)).toBe('html');
    });

    it('should detect plain text for non-structured content', () => {
      const content = 'This is plain text';
      expect(formatService.detectContentType(content)).toBe('text');
    });

    it('should detect plain text for empty string', () => {
      const content = '';
      expect(formatService.detectContentType(content)).toBe('text');
    });

    it('should handle content with leading whitespace', () => {
      const content = '  {"name":"John"}';
      expect(formatService.detectContentType(content)).toBe('json');
    });
  });

  describe('formatResponse', () => {
    // T083: formatService.formatResponse handles large JSON (1MB) in <500ms
    it('should format JSON response body', () => {
      const body = '{"status":"success","data":"test"}';
      const result = formatService.formatResponse(body, 'application/json');

      expect(result.formatted).toBe(true);
      expect(result.content).toContain('"status": "success"');
      expect(result.contentType).toBe('json');
    });

    it('should format XML response body', () => {
      const body = '<?xml version="1.0"?><root><item>test</item></root>';
      const result = formatService.formatResponse(body, 'application/xml');

      expect(result.formatted).toBe(true);
      expect(result.contentType).toBe('xml');
    });

    it('should format HTML response body', () => {
      const body = '<html><body><h1>Test</h1></body></html>';
      const result = formatService.formatResponse(body, 'text/html');

      expect(result.formatted).toBe(true);
      expect(result.contentType).toBe('html');
    });

    it('should handle plain text response', () => {
      const body = 'Plain text response';
      const result = formatService.formatResponse(body, 'text/plain');

      expect(result.formatted).toBe(false);
      expect(result.content).toBe(body);
      expect(result.contentType).toBe('text');
    });

    it('should auto-detect content type if not provided', () => {
      const body = '{"name":"John"}';
      const result = formatService.formatResponse(body);

      expect(result.contentType).toBe('json');
      expect(result.formatted).toBe(true);
    });

    it('should handle large JSON (performance test)', () => {
      // Generate a 1MB+ JSON object
      const largeObject: Record<string, string> = {};
      for (let i = 0; i < 10000; i++) {
        largeObject[`key_${i}`] = `value_${i}_${'x'.repeat(100)}`;
      }
      const largeJson = JSON.stringify(largeObject);

      // Should be at least 1MB
      expect(largeJson.length).toBeGreaterThan(1024 * 1024);

      const startTime = performance.now();
      const result = formatService.formatResponse(largeJson, 'application/json');
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Must complete in less than 500ms (constitutional requirement)
      expect(duration).toBeLessThan(500);
      expect(result.formatted).toBe(true);
      expect(result.contentType).toBe('json');
    });

    it('should not format invalid JSON', () => {
      const body = '{invalid json}';
      const result = formatService.formatResponse(body, 'application/json');

      expect(result.formatted).toBe(false);
      expect(result.content).toBe(body);
    });

    it('should handle empty response body', () => {
      const body = '';
      const result = formatService.formatResponse(body);

      expect(result.content).toBe('');
      expect(result.formatted).toBe(false);
    });
  });
});
