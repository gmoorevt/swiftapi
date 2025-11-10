/**
 * Service Interfaces for Basic HTTP Request Builder
 *
 * This file defines the contracts for service layer classes.
 * Services handle business logic and external interactions.
 *
 * @see research.md for implementation details
 */

import type { Request, Response, HttpResult, HttpError } from './types';
import type { Header, StoredSettings } from './types';

/**
 * HTTP Service Interface
 *
 * Responsible for sending HTTP requests and handling responses.
 * Uses Axios under the hood with cancel token support.
 */
export interface IHttpService {
  /**
   * Send an HTTP request
   *
   * @param request - The request to send
   * @returns Promise resolving to response or error
   * @throws Never throws - all errors returned in HttpResult
   */
  sendRequest(request: Request): Promise<HttpResult>;

  /**
   * Cancel the current in-flight request
   *
   * @returns void
   */
  cancelRequest(): void;

  /**
   * Check if a request is currently in progress
   *
   * @returns true if request is in-flight
   */
  isRequestInProgress(): boolean;
}

/**
 * Storage Service Interface
 *
 * Responsible for persisting and retrieving user settings.
 * Uses electron-store for local filesystem storage.
 */
export interface IStorageService {
  /**
   * Get all stored settings
   *
   * @returns Stored settings or defaults if none exist
   */
  getSettings(): StoredSettings;

  /**
   * Update specific setting
   *
   * @param key - Setting key to update
   * @param value - New value
   */
  updateSetting<K extends keyof StoredSettings>(
    key: K,
    value: StoredSettings[K]
  ): void;

  /**
   * Clear all stored settings
   *
   * @returns void
   */
  clearSettings(): void;
}

/**
 * Format Service Interface
 *
 * Responsible for formatting response bodies based on content type.
 */
export interface IFormatService {
  /**
   * Format response body based on content type
   *
   * @param body - Raw response body string
   * @param contentType - Content-Type header value
   * @returns Formatted string or original if formatting fails
   */
  formatResponse(body: string, contentType: string | null): string;

  /**
   * Pretty-print JSON with indentation
   *
   * @param json - JSON string
   * @param indent - Number of spaces for indentation (default: 2)
   * @returns Formatted JSON or original if invalid
   */
  formatJson(json: string, indent?: number): string;

  /**
   * Detect content type from response body
   *
   * @param body - Response body string
   * @returns Detected content type or 'text/plain'
   */
  detectContentType(body: string): string;

  /**
   * Check if string is valid JSON
   *
   * @param text - String to check
   * @returns true if valid JSON
   */
  isValidJson(text: string): boolean;
}

/**
 * Validation Service Interface
 *
 * Responsible for validating user input.
 */
export interface IValidationService {
  /**
   * Validate URL format
   *
   * @param url - URL string to validate
   * @returns Validation result with normalized URL if valid
   */
  validateUrl(url: string): {
    valid: boolean;
    url?: string;
    error?: string;
  };

  /**
   * Validate JSON syntax
   *
   * @param json - JSON string to validate
   * @returns Validation result with error message if invalid
   */
  validateJson(json: string): {
    valid: boolean;
    error?: string;
  };

  /**
   * Validate HTTP header
   *
   * @param name - Header name
   * @param value - Header value
   * @returns Validation result with error if invalid
   */
  validateHeader(name: string, value: string): {
    valid: boolean;
    error?: string;
  };

  /**
   * Validate timeout value
   *
   * @param timeout - Timeout in milliseconds
   * @returns Validation result
   */
  validateTimeout(timeout: number): {
    valid: boolean;
    error?: string;
  };
}
