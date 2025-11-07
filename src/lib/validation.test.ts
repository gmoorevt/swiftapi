/**
 * Validation Tests
 *
 * Following TDD: Write failing tests first, then implement
 *
 * @see specs/001-basic-request-builder/data-model.md
 */

import { describe, it, expect } from 'vitest';
import { validateUrl, validateTimeout } from './validation';

describe('validateUrl', () => {
  it('should prepend https:// to URLs without protocol', () => {
    const result = validateUrl('example.com');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('https://example.com/');
  });

  it('should prepend https:// to URLs with path but no protocol', () => {
    const result = validateUrl('api.github.com/users');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('https://api.github.com/users');
  });

  it('should accept valid URLs with https://', () => {
    const result = validateUrl('https://api.example.com');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('https://api.example.com/');
  });

  it('should accept valid URLs with http://', () => {
    const result = validateUrl('http://localhost:3000');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('http://localhost:3000/');
  });

  it('should reject empty strings', () => {
    const result = validateUrl('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('URL cannot be empty');
  });

  it('should reject whitespace-only strings', () => {
    const result = validateUrl('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('URL cannot be empty');
  });

  it('should reject invalid URL formats', () => {
    const result = validateUrl('not a url at all');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid URL format');
  });

  it('should reject truly invalid URL formats', () => {
    const result = validateUrl('://no-protocol');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid URL format');
  });

  it('should accept URLs with query parameters', () => {
    const result = validateUrl('https://api.example.com/search?q=test');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('https://api.example.com/search?q=test');
  });

  it('should accept URLs with port numbers', () => {
    const result = validateUrl('http://localhost:8080/api');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('http://localhost:8080/api');
  });
});

describe('validateTimeout', () => {
  it('should accept timeout of 1000ms (minimum)', () => {
    const result = validateTimeout(1000);
    expect(result.valid).toBe(true);
  });

  it('should accept timeout of 30000ms (default)', () => {
    const result = validateTimeout(30000);
    expect(result.valid).toBe(true);
  });

  it('should accept timeout of 300000ms (maximum)', () => {
    const result = validateTimeout(300000);
    expect(result.valid).toBe(true);
  });

  it('should reject timeout less than 1000ms', () => {
    const result = validateTimeout(500);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Timeout must be between 1000ms and 300000ms');
  });

  it('should reject timeout greater than 300000ms', () => {
    const result = validateTimeout(400000);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Timeout must be between 1000ms and 300000ms');
  });

  it('should reject negative timeout', () => {
    const result = validateTimeout(-1000);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Timeout must be between 1000ms and 300000ms');
  });

  it('should reject zero timeout', () => {
    const result = validateTimeout(0);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Timeout must be between 1000ms and 300000ms');
  });
});
