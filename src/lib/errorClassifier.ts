/**
 * Error Classifier
 *
 * Classifies HTTP errors and provides user-friendly error messages
 * with suggested actions for recovery.
 */

import type { HttpError } from '../types/request.types';

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  NETWORK = 'network',
  DNS = 'dns',
  CONNECTION_REFUSED = 'connection_refused',
  TIMEOUT = 'timeout',
  SSL_ERROR = 'ssl_error',
  INVALID_URL = 'invalid_url',
  CANCELLED = 'cancelled',
  CLIENT_ERROR = 'client_error',
  SERVER_ERROR = 'server_error',
  VARIABLE_ERROR = 'variable_error',
  UNKNOWN = 'unknown',
}

/**
 * Classified error with user-friendly information
 */
export interface ClassifiedError {
  category: ErrorCategory;
  userMessage: string;
  suggestion: string;
  technicalDetails: string;
  retryable: boolean;
  originalError: HttpError;
}

/**
 * Classify an HTTP error and provide user-friendly information
 */
export function classifyError(error: HttpError): ClassifiedError {
  const category = determineErrorCategory(error);
  const userMessage = getErrorMessage(category, error.statusCode);
  const suggestion = getErrorSuggestion(category, error.statusCode);
  const technicalDetails = formatTechnicalDetails(error);
  const retryable = isRetryable(category, error.statusCode);

  return {
    category,
    userMessage,
    suggestion,
    technicalDetails,
    retryable,
    originalError: error,
  };
}

/**
 * Determine the error category from an HTTP error
 */
function determineErrorCategory(error: HttpError): ErrorCategory {
  // Check for variable resolution errors
  if (error.message.includes('Variable') && error.message.includes('not defined')) {
    return ErrorCategory.VARIABLE_ERROR;
  }

  // Check for cancelled request
  if (error.isCancelled) {
    return ErrorCategory.CANCELLED;
  }

  // Check for timeout
  if (error.isTimeout) {
    return ErrorCategory.TIMEOUT;
  }

  // Check for invalid URL
  if (error.code === 'ERR_INVALID_URL') {
    return ErrorCategory.INVALID_URL;
  }

  // Check for SSL/TLS errors
  if (isSSLError(error)) {
    return ErrorCategory.SSL_ERROR;
  }

  // Check for DNS errors
  if (error.code === 'ENOTFOUND' || error.message.includes('getaddrinfo')) {
    return ErrorCategory.DNS;
  }

  // Check for connection refused
  if (error.code === 'ECONNREFUSED') {
    return ErrorCategory.CONNECTION_REFUSED;
  }

  // Check for network errors
  if (error.isNetworkError) {
    return ErrorCategory.NETWORK;
  }

  // Check for HTTP status code errors
  if (error.statusCode) {
    if (error.statusCode >= 400 && error.statusCode < 500) {
      return ErrorCategory.CLIENT_ERROR;
    }
    if (error.statusCode >= 500) {
      return ErrorCategory.SERVER_ERROR;
    }
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * Check if error is an SSL/TLS error
 */
function isSSLError(error: HttpError): boolean {
  const sslCodes = [
    'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
    'SELF_SIGNED_CERT_IN_CHAIN',
    'DEPTH_ZERO_SELF_SIGNED_CERT',
    'CERT_HAS_EXPIRED',
    'CERT_NOT_YET_VALID',
    'UNABLE_TO_GET_ISSUER_CERT',
    'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  ];

  if (error.code && sslCodes.includes(error.code)) {
    return true;
  }

  const sslKeywords = [
    'certificate',
    'cert',
    'ssl',
    'tls',
    'self signed',
    'unable to verify',
  ];

  return sslKeywords.some((keyword) =>
    error.message.toLowerCase().includes(keyword)
  );
}

/**
 * Get user-friendly error message based on category
 */
export function getErrorMessage(category: ErrorCategory, statusCode?: number): string {
  switch (category) {
    case ErrorCategory.NETWORK:
      return 'Cannot connect to server';
    case ErrorCategory.DNS:
      return 'Could not resolve hostname';
    case ErrorCategory.CONNECTION_REFUSED:
      return 'Connection refused by server';
    case ErrorCategory.TIMEOUT:
      return 'Request timed out';
    case ErrorCategory.SSL_ERROR:
      return 'SSL certificate verification failed';
    case ErrorCategory.INVALID_URL:
      return 'Invalid URL format';
    case ErrorCategory.CANCELLED:
      return 'Request was cancelled';
    case ErrorCategory.CLIENT_ERROR:
      return `Client error (${statusCode || '4xx'}) - Check your request`;
    case ErrorCategory.SERVER_ERROR:
      return `Server error (${statusCode || '5xx'}) - Try again later`;
    case ErrorCategory.VARIABLE_ERROR:
      return 'Variable not defined';
    case ErrorCategory.UNKNOWN:
      return 'An unexpected error occurred';
    default:
      return 'An error occurred';
  }
}

/**
 * Get suggested action based on error category
 */
export function getErrorSuggestion(category: ErrorCategory, statusCode?: number): string {
  switch (category) {
    case ErrorCategory.NETWORK:
      return 'Check your internet connection and verify the server is accessible.';
    case ErrorCategory.DNS:
      return 'Verify the URL is correct and the domain exists.';
    case ErrorCategory.CONNECTION_REFUSED:
      return 'Ensure the server is running and the port is correct.';
    case ErrorCategory.TIMEOUT:
      return 'Try again or increase the timeout value in your request settings.';
    case ErrorCategory.SSL_ERROR:
      return 'The server has an invalid or expired SSL certificate. Contact the server administrator.';
    case ErrorCategory.INVALID_URL:
      return 'Enter a valid URL starting with http:// or https://';
    case ErrorCategory.CANCELLED:
      return '';
    case ErrorCategory.CLIENT_ERROR:
      return getClientErrorSuggestion(statusCode);
    case ErrorCategory.SERVER_ERROR:
      return 'Try again later or contact the API administrator if the problem persists.';
    case ErrorCategory.VARIABLE_ERROR:
      return 'Define the variable in your active environment or remove it from your request.';
    case ErrorCategory.UNKNOWN:
      return 'Review the technical details below for more information.';
    default:
      return '';
  }
}

/**
 * Get specific suggestion for client errors based on status code
 */
function getClientErrorSuggestion(statusCode?: number): string {
  switch (statusCode) {
    case 400:
      return 'Check your request parameters and body format.';
    case 401:
      return 'Authentication required. Verify your credentials or API token.';
    case 403:
      return 'You do not have permissions to access this resource.';
    case 404:
      return 'The requested endpoint was not found. Verify the URL path.';
    case 405:
      return 'This HTTP method is not allowed for this endpoint.';
    case 408:
      return 'Request timeout. Try again.';
    case 429:
      return 'Too many requests. Wait a moment before trying again.';
    default:
      return 'Review your request parameters, headers, and body.';
  }
}

/**
 * Format technical details for display
 */
function formatTechnicalDetails(error: HttpError): string {
  const parts: string[] = [];

  parts.push(`Message: ${error.message}`);

  if (error.code) {
    parts.push(`Code: ${error.code}`);
  }

  if (error.statusCode) {
    parts.push(`Status Code: ${error.statusCode}`);
  }

  return parts.join('\n');
}

/**
 * Determine if an error is retryable
 */
function isRetryable(category: ErrorCategory, statusCode?: number): boolean {
  // Network and timeout errors are retryable
  if (
    category === ErrorCategory.NETWORK ||
    category === ErrorCategory.TIMEOUT ||
    category === ErrorCategory.CONNECTION_REFUSED
  ) {
    return true;
  }

  // Some 5xx errors are retryable
  if (category === ErrorCategory.SERVER_ERROR) {
    // 501 (Not Implemented) is not retryable
    if (statusCode === 501) {
      return false;
    }
    return true;
  }

  // 408 (Request Timeout) and 429 (Too Many Requests) are retryable
  if (category === ErrorCategory.CLIENT_ERROR && (statusCode === 408 || statusCode === 429)) {
    return true;
  }

  // All other errors are not retryable
  return false;
}
