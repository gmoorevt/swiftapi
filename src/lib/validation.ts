/**
 * Validation Functions
 *
 * Provides validation for user input (URLs, JSON, headers, timeouts).
 * All functions return consistent ValidationResult objects.
 *
 * @see specs/001-basic-request-builder/data-model.md
 */

import type { Header } from '../types/request.types';

export interface ValidationResult {
  valid: boolean;
  url?: string;
  error?: string;
}

/**
 * Validate URL format and auto-prepend https:// if missing protocol
 *
 * @param input - URL string to validate
 * @returns Validation result with normalized URL if valid
 *
 * @example
 * validateUrl('example.com') // { valid: true, url: 'https://example.com' }
 * validateUrl('https://api.test.com') // { valid: true, url: 'https://api.test.com/' }
 * validateUrl('') // { valid: false, error: 'URL cannot be empty' }
 */
export function validateUrl(input: string): ValidationResult {
  const trimmed = input.trim();

  // Check for empty input
  if (!trimmed) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  // Auto-prepend https:// if no protocol specified
  const urlWithProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  // Validate using native URL API
  try {
    const parsedUrl = new URL(urlWithProtocol);
    return { valid: true, url: parsedUrl.toString() };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validate timeout value is within acceptable range
 *
 * @param timeout - Timeout in milliseconds
 * @returns Validation result
 *
 * Business rule: Timeout must be between 1 second and 5 minutes
 *
 * @example
 * validateTimeout(30000) // { valid: true }
 * validateTimeout(500) // { valid: false, error: 'Timeout must be between...' }
 */
export function validateTimeout(timeout: number): ValidationResult {
  const MIN_TIMEOUT = 1000; // 1 second
  const MAX_TIMEOUT = 300000; // 5 minutes

  if (timeout < MIN_TIMEOUT || timeout > MAX_TIMEOUT) {
    return {
      valid: false,
      error: `Timeout must be between ${MIN_TIMEOUT}ms and ${MAX_TIMEOUT}ms`,
    };
  }

  return { valid: true };
}

/**
 * Validate JSON string
 *
 * @param input - JSON string to validate
 * @returns Validation result
 *
 * Uses native JSON.parse for validation (Simplicity principle)
 *
 * @example
 * validateJson('{"name":"John"}') // { valid: true }
 * validateJson('{invalid}') // { valid: false, error: 'Invalid JSON: ...' }
 */
export function validateJson(input: string): ValidationResult {
  const trimmed = input.trim();

  // Check for empty input
  if (!trimmed) {
    return { valid: false, error: 'Invalid JSON: input cannot be empty' };
  }

  // Try to parse JSON using native JSON.parse
  try {
    JSON.parse(trimmed);
    return { valid: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { valid: false, error: `Invalid JSON: ${errorMessage}` };
  }
}

/**
 * Validate HTTP header for security issues
 *
 * @param header - Header object to validate
 * @returns Validation result
 *
 * Security check: Prevents CRLF injection attacks (T075)
 * Business rule: Header name cannot be empty (T074)
 *
 * @example
 * validateHeader({ name: 'Content-Type', value: 'application/json', enabled: true })
 *   // { valid: true }
 * validateHeader({ name: '', value: 'test', enabled: true })
 *   // { valid: false, error: 'Header name cannot be empty' }
 * validateHeader({ name: 'Test\r\nInjected', value: 'value', enabled: true })
 *   // { valid: false, error: 'Header contains CRLF...' }
 */
export function validateHeader(header: Header): ValidationResult {
  const trimmedName = header.name.trim();

  // Check for empty header name (T074)
  if (!trimmedName) {
    return { valid: false, error: 'Header name cannot be empty' };
  }

  // Check for CRLF injection in header name (T075)
  if (/[\r\n]/.test(header.name)) {
    return {
      valid: false,
      error: 'Header name contains CRLF characters (potential security risk)',
    };
  }

  // Check for CRLF injection in header value (T075)
  if (/[\r\n]/.test(header.value)) {
    return {
      valid: false,
      error: 'Header value contains CRLF characters (potential security risk)',
    };
  }

  return { valid: true };
}
