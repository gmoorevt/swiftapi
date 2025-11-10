/**
 * Type Definitions for Basic HTTP Request Builder
 *
 * This file defines all TypeScript interfaces and types for the request builder feature.
 * These contracts ensure type safety across the application.
 *
 * @see data-model.md for detailed entity documentation
 */

import type { Response as ResponseClass } from '../models/Response';

/**
 * HTTP methods supported by the request builder
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

/**
 * Types of request body content
 */
export enum BodyType {
  JSON = 'json',
  FORM_DATA = 'formdata',
  RAW = 'raw',
}

/**
 * UI theme options
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * HTTP status code categories for color coding
 */
export type StatusCategory = 'success' | 'error' | 'redirect' | 'info';

/**
 * Generic validation result
 */
export interface ValidationResult {
  valid: boolean;
  value?: string;
  error?: string;
}

/**
 * HTTP Header (used in both requests and responses)
 *
 * @property name - Header name (case-insensitive per HTTP spec)
 * @property value - Header value (can be empty string)
 * @property enabled - Whether this header is active (default: true)
 */
export interface Header {
  name: string;
  value: string;
  enabled: boolean;
}

/**
 * HTTP Request to be sent to an API endpoint
 *
 * @property url - Target URL (auto-prepends https:// if no protocol)
 * @property method - HTTP method (GET, POST, PUT, DELETE)
 * @property headers - Custom request headers
 * @property body - Request body content (only for POST, PUT, DELETE)
 * @property bodyType - Type of request body
 * @property timeout - Request timeout in milliseconds (default: 30000)
 */
export interface Request {
  url: string;
  method: HttpMethod;
  headers: Header[];
  body: string;
  bodyType: BodyType;
  timeout: number;
}

/**
 * HTTP Response received from an API endpoint
 *
 * @property statusCode - HTTP status code (100-599)
 * @property statusText - HTTP status message (e.g., "OK", "Not Found")
 * @property headers - Response headers
 * @property body - Response body content (stored as string)
 * @property responseTime - Time taken for request in milliseconds
 * @property size - Response size in bytes
 * @property contentType - Response content-type (extracted from headers)
 * @property timestamp - ISO 8601 timestamp of when response was received
 */
export interface Response {
  statusCode: number;
  statusText: string;
  headers: Header[];
  body: string;
  responseTime: number;
  size: number;
  contentType: string | null;
  timestamp: string;
}

/**
 * Response with computed properties for UI display
 */
export interface ResponseWithMetadata extends Response {
  statusCategory: StatusCategory;
  formattedSize: string;
  isJson: boolean;
  isXml: boolean;
  isHtml: boolean;
}

/**
 * Current state of the request builder UI
 *
 * Used by Zustand store for state management
 */
export interface RequestState {
  currentRequest: Request;
  lastResponse: Response | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Settings persisted to local storage
 *
 * Only contains non-sensitive data that should be restored on app launch
 */
export interface StoredSettings {
  lastUrl: string;
  lastMethod: HttpMethod;
  theme: Theme;
}

/**
 * HTTP Service error types
 */
export interface HttpError {
  message: string;
  code?: string;
  statusCode?: number;
  isNetworkError: boolean;
  isTimeout: boolean;
  isCancelled: boolean;
}

/**
 * Options for HTTP service
 */
export interface HttpServiceOptions {
  timeout?: number;
  validateStatus?: (status: number) => boolean;
}

/**
 * Result of sending an HTTP request
 */
export type HttpResult =
  | { success: true; response: ResponseClass }
  | { success: false; error: HttpError };
